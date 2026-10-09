import { randomUUID } from "node:crypto"
import { Queue, Worker } from "bullmq"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import type IORedis from "ioredis"
import { enqueueInsight, insightConnection, readInsightStatus, type InsightJob, type InsightJobData, type InsightQueue } from "@/lib/ai/insight-queue"
import type { InsightResult } from "@/lib/ai/insight-contract"

const testUrl = process.env.INSIGHTS_REDIS_TEST_URL
describe.skipIf(!testUrl)("BullMQ insight integration", () => {
  const queueName = "finance-insights-test-" + randomUUID()
  const userId = randomUUID()
  const request = { context: { page: "dashboard" as const }, locale: "id" as const, refresh: false }
  let queue: InsightQueue
  let workers: Worker[] = []
  const connections: IORedis[] = []
  let runs = 0, active = 0, peak = 0
  beforeAll(async () => {
    if (!["localhost", "127.0.0.1"].includes(new URL(testUrl!).hostname)) throw new Error("Use a local Redis test server")
    vi.stubEnv("INSIGHTS_REDIS_URL", testUrl!)
    const connection = insightConnection()
    connections.push(connection)
    queue = new Queue<InsightJobData, InsightResult | null>(queueName, { connection })
    await queue.setGlobalConcurrency(1)
    workers = [0, 1].map(() => {
      const workerConnection = insightConnection(true)
      connections.push(workerConnection)
      return new Worker(queueName, async () => {
        runs++; active++; peak = Math.max(peak, active)
        await new Promise((resolve) => setTimeout(resolve, 40))
        active--
        return { text: "Synthetic summary", generatedAt: new Date().toISOString(), conversationId: randomUUID() }
      }, { connection: workerConnection, concurrency: 2 })
    })
    await Promise.all(workers.map((worker) => worker.waitUntilReady()))
  })
  afterAll(async () => {
    await Promise.all(workers.map((worker) => worker.close()))
    if (!queue) return
    await queue.obliterate({ force: true })
    await (await queue.getBackend().client).del(`finance:insight-rate:${userId}`)
    await queue.close()
    connections.forEach((connection) => connection.disconnect())
    vi.unstubAllEnvs()
  })
  async function completed(job: InsightJob) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const current = await queue.getJob(job.id!)
      if (current && await current.getState() === "completed") return current
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
    throw new Error("Test job did not finish")
  }
  it("deduplicates concurrent opens, caches results and keeps global concurrency across workers", async () => {
    const duplicates = await Promise.all(Array.from({ length: 5 }, () => enqueueInsight(queue, userId, request, "r1")))
    expect(new Set(duplicates.map((job) => job.id)).size).toBe(1)
    const first = await completed(duplicates[0])
    expect(await readInsightStatus(first, userId, "r1", queue)).toMatchObject({ status: "completed", result: { text: "Synthetic summary" } })
    const again = await enqueueInsight(queue, userId, request, "r1")
    expect(again.id).toBe(first.id)
    expect(runs).toBe(1)
    const next = await enqueueInsight(queue, userId, { ...request, context: { page: "investments" } }, "r1")
    const changed = await enqueueInsight(queue, userId, request, "r2")
    await Promise.all([completed(next), completed(changed)])
    expect(peak).toBe(1)
    await expect(readInsightStatus(first, randomUUID(), "r1", queue)).rejects.toMatchObject({ code: "recordMissing" })
    expect(await readInsightStatus(first, userId, "r2", queue)).toEqual({ jobId: first.id, status: "stale" })
  })
  it("reanalyses an existing completed job without duplicating its queue identity", async () => {
    const previousRuns = runs
    const original = await enqueueInsight(queue, userId, request, "r1")
    const [retry, duplicate] = await Promise.all([
      enqueueInsight(queue, userId, { ...request, refresh: true }, "r1"),
      enqueueInsight(queue, userId, { ...request, refresh: true }, "r1"),
    ])
    expect(duplicate.id).toBe(retry.id)
    expect(retry.id).toBe(original.id)
    await completed(retry)
    expect(runs).toBe(previousRuns + 1)
  })
  it("enforces per-user admission limits without blocking cached reads", async () => {
    const client = await queue.getBackend().client
    await client.set(`finance:insight-rate:${userId}`, 20, { EX: 60 })
    await expect(enqueueInsight(queue, userId, request, "not-cached")).rejects.toMatchObject({ code: "aiRateLimited", status: 429 })
    expect(await enqueueInsight(queue, userId, request, "r1")).toBeDefined()
  })
})
