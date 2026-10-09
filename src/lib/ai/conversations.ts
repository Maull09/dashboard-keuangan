import { and, count, desc, eq, gt, isNull, or, sql } from "drizzle-orm"
import { aiConversations, aiDrafts, aiMessages, aiReceipts } from "@/db/schema"
import { FinanceError } from "@/lib/finance-errors"
import { userDatabase } from "./server"
import type { AiDraftInput } from "./validation"

export async function readConversation(userId: string, conversationId: string) {
  return userDatabase(userId, async (connection) => {
    const [conversation] = await connection.select({ id: aiConversations.id }).from(aiConversations)
      .where(eq(aiConversations.id, conversationId))
    if (!conversation) throw new FinanceError("recordMissing", 404)
    const [messages, drafts] = await Promise.all([
      connection.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId))
        .orderBy(desc(aiMessages.createdAt), desc(aiMessages.id)).limit(100),
      connection.select().from(aiDrafts).where(eq(aiDrafts.conversationId, conversationId))
        .orderBy(desc(aiDrafts.createdAt)).limit(100),
    ])
    return { messages: messages.reverse(), drafts }
  })
}

export async function claimConversation(userId: string, conversationId: string, content: string) {
  return userDatabase(userId, async (connection) => {
    // Serialize short request admission per user, across all conversations and workers.
    await connection.execute(sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`)
    const [recent] = await connection.select({ count: count() }).from(aiMessages)
      .where(and(eq(aiMessages.role, "user"), gt(aiMessages.createdAt, sql`now() - interval '1 minute'`)))
    if (recent.count >= 6) throw new FinanceError("aiRateLimited", 429)
    const [conversation] = await connection.select().from(aiConversations)
      .where(eq(aiConversations.id, conversationId))
    if (!conversation) throw new FinanceError("recordMissing", 404)
    const busyUntil = new Date(Date.now() + 150_000)
    const [claimed] = await connection.update(aiConversations).set({ busyUntil })
      .where(and(eq(aiConversations.id, conversationId), or(
        isNull(aiConversations.busyUntil), sql`${aiConversations.busyUntil} < now()`,
      ))).returning({ id: aiConversations.id })
    if (!claimed) throw new FinanceError("aiBusy", 409)
    const history = await connection.select({ role: aiMessages.role, content: aiMessages.content })
      .from(aiMessages).where(eq(aiMessages.conversationId, conversationId))
      .orderBy(desc(aiMessages.createdAt), desc(aiMessages.id)).limit(30)
    if (!history.length) await connection.update(aiConversations).set({ title: content.slice(0, 80) })
      .where(eq(aiConversations.id, conversationId))
    await connection.insert(aiMessages).values({ conversationId, role: "user", content })
    const pending = await connection.select({ data: aiDrafts.data, status: aiDrafts.status })
      .from(aiDrafts).where(eq(aiDrafts.conversationId, conversationId)).orderBy(desc(aiDrafts.createdAt)).limit(10)
    return {
      busyUntil,
      history: [...history.reverse(), { role: "user", content }],
      draftContext: pending,
    }
  })
}

export function releaseConversation(userId: string, conversationId: string, busyUntil: Date) {
  return userDatabase(userId, async (connection) => {
    await connection.update(aiConversations).set({ busyUntil: null }).where(and(
      eq(aiConversations.id, conversationId), eq(aiConversations.busyUntil, busyUntil),
    ))
  })
}

export async function saveReply(userId: string, conversationId: string, content: string,
  drafts: AiDraftInput[], receipt?: { storagePath: string; mimeType: string }) {
  return userDatabase(userId, async (connection) => {
    const [message] = await connection.insert(aiMessages).values({ conversationId, role: "assistant", content }).returning()
    let receiptId: string | null = null
    if (receipt) {
      const [saved] = await connection.insert(aiReceipts).values({ conversationId, ...receipt }).returning({ id: aiReceipts.id })
      receiptId = saved.id
    }
    if (drafts.length) await connection.insert(aiDrafts).values(drafts.map((data) => ({
      conversationId, messageId: message.id, receiptId, data,
    })))
  })
}
