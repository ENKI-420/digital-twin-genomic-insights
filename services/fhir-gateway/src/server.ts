import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from 'redis';
import crypto from 'node:crypto';
import client from 'prom-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const EPIC_FHIR_BASE = process.env.EPIC_FHIR_BASE || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpDuration = new client.Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

function cacheKey(url: string) {
  return `fhir:${crypto.createHash('sha1').update(url).digest('hex')}`;
}

app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });
  res.once('finish', () => end({ status_code: res.statusCode }));
  next();
});

app.get('/fhir/*', async (req, res) => {
  const fhirPath = (req.params as any)[0];
  const targetUrl = `${EPIC_FHIR_BASE}/${fhirPath}${req.originalUrl.split(fhirPath)[1] || ''}`;
  const key = cacheKey(targetUrl);

  try {
    const cached = await redis.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    const token = req.headers['authorization']; // bearer token passed through gateway
    const resp = await axios.get(targetUrl, {
      headers: { Authorization: token as string },
    });

    await redis.set(key, JSON.stringify(resp.data), { EX: 60 }); // 1-minute TTL
    res.setHeader('X-Cache', 'MISS');
    res.json(resp.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'FHIR proxy error' });
  }
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`FHIR gateway listening on ${PORT}`);
});