import { ChatOpenAI } from "@langchain/openai"
import { FinanceError } from "@/lib/finance-errors"

export function ollamaModel() {
  const baseURL = process.env.OLLAMA_BASE_URL
  const model = process.env.OLLAMA_MODEL
  if (!baseURL || !model) throw new FinanceError("aiNotConfigured", 503)
  return new ChatOpenAI({
    model,
    apiKey: "ollama",
    configuration: { baseURL },
    temperature: 0,
    maxTokens: 2000,
    timeout: 120_000,
    maxRetries: 0,
    streamUsage: false,
    useResponsesApi: false,
    modelKwargs: { reasoning_effort: "none" },
  })
}
