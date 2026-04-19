export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export function parseQueryString(search: string): Record<string, string> {
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const out: Record<string, string> = {}
  sp.forEach((v, k) => {
    out[k] = v
  })
  return out
}
