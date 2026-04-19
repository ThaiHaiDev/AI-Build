export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function debounce<T extends (...args: never[]) => unknown>(fn: T, wait = 250) {
  let id: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (id) clearTimeout(id)
    id = setTimeout(() => fn(...args), wait)
  }
}

export function throttle<T extends (...args: never[]) => unknown>(fn: T, wait = 250) {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn(...args)
    }
  }
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const set = new Set<keyof T>(keys)
  const out = {} as Omit<T, K>
  for (const k of Object.keys(obj) as (keyof T)[]) {
    if (!set.has(k)) (out as Record<string, unknown>)[k as string] = obj[k]
  }
  return out
}

export function groupBy<T, K extends string | number>(arr: T[], key: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>
  for (const item of arr) {
    const k = key(item)
    ;(out[k] ??= []).push(item)
  }
  return out
}

export function uniqBy<T, K>(arr: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()
  const out: T[] = []
  for (const item of arr) {
    const k = key(item)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(item)
    }
  }
  return out
}

export const noop = () => {}
