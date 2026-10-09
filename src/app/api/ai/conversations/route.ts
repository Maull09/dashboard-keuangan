import { desc } from "drizzle-orm"
import { z } from "zod"
import { aiConversations } from "@/db/schema"
import { aiResponse, readAiJson, userDatabase } from "@/lib/ai/server"

export async function GET(request: Request) {
  return aiResponse(request, async ({ userId }) => Response.json(await userDatabase(userId, (connection) =>
    connection.select({ id: aiConversations.id, title: aiConversations.title, createdAt: aiConversations.createdAt })
      .from(aiConversations).orderBy(desc(aiConversations.createdAt)).limit(50))))
}

export async function POST(request: Request) {
  return aiResponse(request, async ({ userId }) => {
    const { title } = z.object({ title: z.string().trim().min(1).max(80) }).strict().parse(await readAiJson(request))
    const [conversation] = await userDatabase(userId, (connection) => connection.insert(aiConversations)
      .values({ title }).returning({ id: aiConversations.id, title: aiConversations.title, createdAt: aiConversations.createdAt }))
    return Response.json(conversation, { status: 201 })
  })
}
