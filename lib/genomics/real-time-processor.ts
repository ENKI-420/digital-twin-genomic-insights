import { Redis } from "@upstash/redis"
import { AdvancedGenomicProcessor, type ProcessingResult } from "./advanced-processor"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface ProcessingJob {
  id: string
  patientId: string
  status: "queued" | "processing" | "completed" | "failed"
  progress: number
  startTime: number
  endTime?: number
  result?: ProcessingResult
  error?: string
}

export class RealTimeGenomicProcessor {
  private redis: Redis
  private processor: AdvancedGenomicProcessor
  private activeJobs: Map<string, ProcessingJob>

  constructor() {
    this.redis = redis
    this.processor = new AdvancedGenomicProcessor()
    this.activeJobs = new Map()
  }

  async submitProcessingJob(patientId: string, genomicData: any, options: any = {}): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const job: ProcessingJob = {
      id: jobId,
      patientId,
      status: "queued",
      progress: 0,
      startTime: Date.now(),
    }

    // Store job in Redis and local cache
    await this.redis.setex(`genomic_job:${jobId}`, 3600, JSON.stringify(job))
    this.activeJobs.set(jobId, job)

    // Start processing asynchronously
    this.processJobAsync(jobId, genomicData, options)

    return jobId
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    // Check local cache first
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId)!
    }

    // Check Redis
    const cached = await this.redis.get(`genomic_job:${jobId}`)
    if (cached) {
      const job = cached as ProcessingJob
      this.activeJobs.set(jobId, job)
      return job
    }

    return null
  }

  async getJobResult(jobId: string): Promise<ProcessingResult | null> {
    const job = await this.getJobStatus(jobId)
    return job?.result || null
  }

  private async processJobAsync(jobId: string, genomicData: any, options: any) {
    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, "processing", 10)

      // Process genomic data with progress updates
      const result = await this.processWithProgress(jobId, genomicData, options)

      // Update job as completed
      await this.updateJobStatus(jobId, "completed", 100, result)
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error)
      await this.updateJobStatus(
        jobId,
        "failed",
        0,
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  private async processWithProgress(jobId: string, genomicData: any, options: any): Promise<ProcessingResult> {
    // Simulate processing steps with progress updates
    await this.updateJobStatus(jobId, "processing", 20)

    // Parse data
    await new Promise((resolve) => setTimeout(resolve, 500))
    await this.updateJobStatus(jobId, "processing", 40)

    // Analyze variants
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await this.updateJobStatus(jobId, "processing", 60)

    // Generate annotations
    await new Promise((resolve) => setTimeout(resolve, 800))
    await this.updateJobStatus(jobId, "processing", 80)

    // Calculate risk assessment
    const result = await this.processor.processGenomicData(
      jobId, // Use jobId as patientId for this demo
      genomicData,
      options,
    )

    await this.updateJobStatus(jobId, "processing", 95)

    return result
  }

  private async updateJobStatus(
    jobId: string,
    status: ProcessingJob["status"],
    progress: number,
    result?: ProcessingResult,
    error?: string,
  ) {
    const job = this.activeJobs.get(jobId)
    if (!job) return

    job.status = status
    job.progress = progress
    if (result) job.result = result
    if (error) job.error = error
    if (status === "completed" || status === "failed") {
      job.endTime = Date.now()
    }

    // Update both local cache and Redis
    this.activeJobs.set(jobId, job)
    await this.redis.setex(`genomic_job:${jobId}`, 3600, JSON.stringify(job))

    // Publish progress update for real-time updates
    await this.redis.publish(
      `genomic_progress:${jobId}`,
      JSON.stringify({
        jobId,
        status,
        progress,
        timestamp: Date.now(),
      }),
    )
  }

  async subscribeToJobUpdates(jobId: string, callback: (update: any) => void) {
    // In a real implementation, you would use Redis pub/sub
    // For this demo, we'll simulate with polling
    const pollInterval = setInterval(async () => {
      const job = await this.getJobStatus(jobId)
      if (job) {
        callback({
          jobId: job.id,
          status: job.status,
          progress: job.progress,
          timestamp: Date.now(),
        })

        if (job.status === "completed" || job.status === "failed") {
          clearInterval(pollInterval)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }

  async getActiveJobs(): Promise<ProcessingJob[]> {
    const jobs: ProcessingJob[] = []

    // Get all active job keys from Redis
    const keys = await this.redis.keys("genomic_job:*")

    for (const key of keys) {
      const job = await this.redis.get(key)
      if (job) {
        jobs.push(job as ProcessingJob)
      }
    }

    return jobs.filter((job) => job.status === "processing" || job.status === "queued")
  }

  async cleanupCompletedJobs(olderThanHours = 24) {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000
    const keys = await this.redis.keys("genomic_job:*")

    for (const key of keys) {
      const job = (await this.redis.get(key)) as ProcessingJob
      if (job && job.endTime && job.endTime < cutoffTime) {
        await this.redis.del(key)
        this.activeJobs.delete(job.id)
      }
    }
  }
}
