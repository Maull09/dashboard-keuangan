export function safeNextPath(value: string | null | undefined) {
  if (!value || /[\\\x00-\x20]/.test(value)) return "/dashboard"
  try {
    const url = new URL(value, "https://finance.invalid")
    if (
      url.origin !== "https://finance.invalid" ||
      (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/"))
    )
      return "/dashboard"
    return url.pathname + url.search + url.hash
  } catch {
    return "/dashboard"
  }
}

export function authErrorKey(code?: string) {
  if (code === "invalid_credentials") return "authInvalidCredentials"
  if (code === "email_not_confirmed") return "authEmailNotConfirmed"
  if (code === "weak_password") return "authPasswordHint"
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit"
  )
    return "authRateLimited"
  return "authFailed"
}
