export async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, options)
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error
    throw new Error("networkError")
  }
  if (!response.ok) {
    const message =
      response.status === 400
        ? "invalidInput"
        : response.status === 404
          ? "recordMissing"
          : response.status === 409
            ? "recordConflict"
            : "serviceUnavailable"
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  try {
    return await response.json()
  } catch {
    throw new Error("serviceUnavailable")
  }
}

export function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
}
