import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import querystring from 'node:querystring';
import { EPIC_AUTH_URL, EPIC_TOKEN_URL } from './config/epic';
import admin from 'firebase-admin';
import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import client from 'prom-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

// middleware to time
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.once('finish', () => {
    end({ status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.get('/oauth/authorize', (req, res) => {
  const { client_id } = req.query;
  const redirect_uri = req.query.redirect_uri ?? `${req.protocol}://${req.get('host')}/oauth/callback`;
  const scope = req.query.scope ?? 'launch openid fhirUser';
  const state = req.query.state ?? 'static';

  const authUrl = `${EPIC_AUTH_URL}?${querystring.stringify({
    response_type: 'code',
    client_id,
    redirect_uri,
    scope,
    state,
    aud: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  })}`;

  res.redirect(authUrl);
});

app.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    const tokenResp = await axios.post(
      EPIC_TOKEN_URL,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.NEXT_PUBLIC_EPIC_CLIENT_ID,
        redirect_uri: `${req.protocol}://${req.get('host')}/oauth/callback`,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, refresh_token, expires_in, patient } = tokenResp.data;
    const tenantId = req.query.client_id as string;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('tokens')
      .doc(patient || 'unknown')
      .set({ access_token, refresh_token, expires_in, updated: admin.firestore.FieldValue.serverTimestamp() });

    // sign JWT
    const jwtSecret = process.env.JWT_SECRET || 'dev_secret';
    const sessionToken = jwt.sign({ sub: patient, tenant: tenantId }, jwtSecret, { expiresIn: '1h' });
    res.cookie('gt_session', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    res.redirect(`http://localhost:3000?authorized=true`);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Token exchange failed');
  }
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Auth service listening on port ${PORT}`);
});