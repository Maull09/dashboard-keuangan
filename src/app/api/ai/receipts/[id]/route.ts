import { eq } from "drizzle-orm"
import { z } from "zod"
import { aiReceipts } from "@/db/schema"
import { aiResponse, userDatabase } from "@/lib/ai/server"
import { RECEIPT_BUCKET } from "@/lib/ai/validation"
import { FinanceError } from "@/lib/finance-errors"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return aiResponse(request, async ({ userId, supabase }) => {
    const id = z.uuid().parse((await context.params).id)
    const [receipt] = await userDatabase(userId, (connection) => connection.select().from(aiReceipts).where(eq(aiReceipts.id, id)))
    if (!receipt) throw new FinanceError("recordMissing", 404)
    const { data, error } = await supabase.storage.from(RECEIPT_BUCKET).download(receipt.storagePath)
    if (error || !data) throw new FinanceError("aiStorageUnavailable", 503)
    return new Response(data, { headers: {
      "Content-Type": receipt.mimeType,
      "Content-Disposition": `inline; filename="receipt.${receipt.mimeType === "image/jpeg" ? "jpg" : receipt.mimeType === "image/png" ? "png" : "webp"}"`,
      "X-Content-Type-Options": "nosniff",
    } })
  })
}
