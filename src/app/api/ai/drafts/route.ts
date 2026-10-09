import { desc, eq } from "drizzle-orm"
import { aiDrafts } from "@/db/schema"
import { aiResponse, userDatabase } from "@/lib/ai/server"

export async function GET(request: Request) {
  return aiResponse(request, async ({ userId }) => Response.json(await userDatabase(userId, (connection) =>
    connection.select({
      id: aiDrafts.id,
      messageId: aiDrafts.messageId,
      receiptId: aiDrafts.receiptId,
      data: aiDrafts.data,
      status: aiDrafts.status,
      transactionId: aiDrafts.transactionId,
    }).from(aiDrafts).where(eq(aiDrafts.status, "pending"))
      .orderBy(desc(aiDrafts.createdAt), desc(aiDrafts.id)).limit(50))))
}
