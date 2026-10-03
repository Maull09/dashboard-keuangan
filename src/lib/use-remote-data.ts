"use client"

import { useCallback, useEffect, useState } from "react"
import { requestJson } from "./client-api"

type RemoteResult<T> = {
  url: string
  revision: number
  data: T | null
  error: string
}

export function useRemoteData<T>(url: string) {
  const [result, setResult] = useState<RemoteResult<T> | null>(null)
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    requestJson<T>(url, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setResult({ url, revision, data, error: "" })
      })
      .catch((reason: Error) => {
        if (!controller.signal.aborted)
          setResult({ url, revision, data: null, error: reason.message })
      })
    return () => controller.abort()
  }, [url, revision])

  useEffect(() => {
    window.addEventListener("finance-data-changed", reload)
    return () => window.removeEventListener("finance-data-changed", reload)
  }, [reload])

  const isCurrent = result?.url === url && result.revision === revision
  return {
    data: isCurrent ? result.data : null,
    loading: !isCurrent,
    error: isCurrent ? result.error : "",
    reload,
  }
}
