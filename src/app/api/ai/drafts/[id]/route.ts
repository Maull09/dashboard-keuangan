import { z } from "zod"
import { decideDraft } from "@/lib/ai/confirmation"
import { aiResponse, readAiJson, userDatabase } from "@/lib/ai/server"
import { draftDecisionSchema } from "@/lib/ai/validation"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return aiResponse(request, async ({ userId }) => {
    const id = z.uuid().parse((await context.params).id)
    const decision = draftDecisionSchema.parse(await readAiJson(request))
    const result = await userDatabase(userId, (connection) => decideDraft(connection, id, decision))
    return Response.json({ transactionId: result.transactionId, status: decision.action === "confirm" ? "confirmed" : "rejected" })
  })
}
