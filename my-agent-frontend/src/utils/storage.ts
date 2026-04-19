type Area = 'local' | 'session'

function area(a: Area): Storage | null {
  try {
    return a === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export const storage = {
  get<T>(key: string, fallback: T, a: Area = 'local'): T {
    const s = area(a)
    if (!s) return fallback
    try {
      const raw = s.getItem(key)
      return raw == null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown, a: Area = 'local'): void {
    const s = area(a)
    if (!s) return
    try {
      s.setItem(key, JSON.stringify(value))
    } catch {
      /* quota / privacy mode */
    }
  },
  remove(key: string, a: Area = 'local'): void {
    area(a)?.removeItem(key)
  },
  clear(a: Area = 'local'): void {
    area(a)?.clear()
  },
}
