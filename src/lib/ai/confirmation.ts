import { Annotation, END, START, StateGraph } from "@langchain/langgraph"
import { eq } from "drizzle-orm"
import { aiDrafts, transactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { FinanceError } from "@/lib/finance-errors"
import type { UserDatabase } from "@/lib/server/authenticated-response"
import { draftDecisionSchema } from "./validation"
import type { z } from "zod"

const DecisionState = Annotation.Root({
  decision: Annotation<z.infer<typeof draftDecisionSchema>>(),
  transactionId: Annotation<number | null>(),
})

// PostgreSQL stores the waiting state. This graph resumes only from the explicit form action.
export async function decideDraft(connection: UserDatabase, draftId: string,
  decision: z.infer<typeof draftDecisionSchema>) {
  const graph = new StateGraph(DecisionState)
    .addNode("review", async (state) => {
      const [draft] = await connection.select().from(aiDrafts).where(eq(aiDrafts.id, draftId)).for("update")
      if (!draft) throw new FinanceError("recordMissing", 404)
      if (draft.status !== "pending") throw new FinanceError("recordConflict", 409)
      if (state.decision.action === "confirm" &&
          !(await accountsExist(connection, state.decision.data.accountId, state.decision.data.destinationAccountId))) {
        throw new FinanceError("invalidInput")
      }
      return {}
    })
    .addNode("save", async (state) => {
      if (state.decision.action !== "confirm") throw new FinanceError("invalidInput")
      const [transaction] = await connection.insert(transactions).values(state.decision.data).returning({ id: transactions.id })
      await connection.update(aiDrafts).set({
        data: state.decision.data, status: "confirmed", transactionId: transaction.id,
      }).where(eq(aiDrafts.id, draftId))
      return { transactionId: transaction.id }
    })
    .addNode("reject", async () => {
      await connection.update(aiDrafts).set({ status: "rejected" }).where(eq(aiDrafts.id, draftId))
      return { transactionId: null }
    })
    .addEdge(START, "review")
    .addConditionalEdges("review", (state) => state.decision.action === "confirm" ? "save" : "reject")
    .addEdge("save", END).addEdge("reject", END).compile()
  return graph.invoke({ decision })
}
