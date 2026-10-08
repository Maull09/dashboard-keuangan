type CacheEntry = {
  value?: unknown
  request?: Promise<unknown>
}

const entries = new Map<string, CacheEntry>()

export function loadRemoteResource<T>(
  url: string,
  load: () => Promise<T>,
): Promise<T> {
  const existing = entries.get(url)
  if (existing && "value" in existing) return Promise.resolve(existing.value as T)
  if (existing?.request) return existing.request as Promise<T>

  const request = load()
    .then((value) => {
      if (entries.get(url)?.request === request) entries.set(url, { value })
      return value
    })
    .catch((error) => {
      if (entries.get(url)?.request === request) entries.delete(url)
      throw error
    })
  entries.set(url, { request })
  return request
}

export function clearRemoteResourceCache() {
  entries.clear()
}
