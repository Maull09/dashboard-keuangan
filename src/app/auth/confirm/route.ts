import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeNextPath } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const client = await createClient()
  const tokenHash = params.get("token_hash")
  const code = params.get("code")
  const result =
    tokenHash && params.get("type") === "email"
      ? await client.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      : code
        ? await client.auth.exchangeCodeForSession(code)
        : null
  const target =
    result && !result.error
      ? safeNextPath(params.get("next"))
      : "/sign-in?error=confirmation"
  const response = NextResponse.redirect(new URL(target, request.url))
  response.headers.set("Cache-Control", "private, no-store")
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}
