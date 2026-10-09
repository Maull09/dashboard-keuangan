import { z } from "zod"
import { readConversation } from "@/lib/ai/conversations"
import { aiResponse } from "@/lib/ai/server"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return aiResponse(request, async ({ userId }) => {
    const id = z.uuid().parse((await context.params).id)
    return Response.json(await readConversation(userId, id))
  })
}
