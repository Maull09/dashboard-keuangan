import { NextResponse } from "next/server"
import { FinanceError } from "./finance-errors"

export async function financeResponse(action: () => Promise<Response>) {
  try {
    return await action()
  } catch (error) {
    if (error instanceof FinanceError)
      return NextResponse.json({ code: error.code }, { status: error.status })
    if (error instanceof SyntaxError)
      return NextResponse.json({ code: "invalidInput" }, { status: 400 })
    const cause = error as { code?: string; cause?: { code?: string } }
    const code = cause.code ?? cause.cause?.code
    if (["23503", "23505", "40001", "40P01"].includes(code ?? ""))
      return NextResponse.json({ code: "recordConflict" }, { status: 409 })
    console.error("Financial request failed", error)
    return NextResponse.json({ code: "serviceUnavailable" }, { status: 500 })
  }
}
