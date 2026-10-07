import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { supabaseConfig } from "@/lib/supabase/config"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, key } = supabaseConfig()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const target = request.nextUrl.clone()
    target.pathname = "/sign-in"
    target.search = ""
    target.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    )
    const redirect = NextResponse.redirect(target)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    response = redirect
  }
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/auth/:path*",
    "/api/((?!jobs/).*)",
  ],
}
