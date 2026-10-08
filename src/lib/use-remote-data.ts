"use client"

import { useCallback, useEffect, useState } from "react"
import { requestJson } from "./client-api"
import {
  clearRemoteResourceCache,
  loadRemoteResource,
} from "./remote-resource-cache"

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
    let active = true
    loadRemoteResource(url, () => requestJson<T>(url))
      .then((data) => {
        if (active)
          setResult({ url, revision, data, error: "" })
      })
      .catch((reason: Error) => {
        if (active)
          setResult((previous) => ({
            url,
            revision,
            data: previous?.url === url ? previous.data : null,
            error: reason.message,
          }))
      })
    return () => {
      active = false
    }
  }, [url, revision])

  useEffect(() => {
    const invalidate = () => {
      clearRemoteResourceCache()
      reload()
    }
    window.addEventListener("finance-data-changed", invalidate)
    return () => window.removeEventListener("finance-data-changed", invalidate)
  }, [reload])

  const isCurrent = result?.url === url && result.revision === revision
  const sameResource = result?.url === url
  return {
    data: sameResource ? result.data : null,
    loading: !isCurrent && !(sameResource && result.data !== null),
    refreshing: !isCurrent && sameResource && result.data !== null,
    error: isCurrent ? result.error : "",
    reload,
  }
}
