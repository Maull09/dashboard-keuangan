import type { AiDraftInput } from "./validation"

export type AiConversation = { id: string; title: string; createdAt: string }
export type AiMessage = { id: string; role: string; content: string; createdAt: string }
export type AiDraft = {
  id: string
  messageId: string
  receiptId: string | null
  data: AiDraftInput
  status: string
  transactionId: number | null
}
export type AiConversationDetail = { messages: AiMessage[]; drafts: AiDraft[] }
