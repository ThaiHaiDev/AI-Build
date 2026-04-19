export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)[^\s]+$/,
  PHONE_VN: /^(0|\+84)\d{9,10}$/,
}

export const isEmail = (v: string) => REGEX.EMAIL.test(v)
export const isUrl = (v: string) => REGEX.URL.test(v)
export const isPhoneVN = (v: string) => REGEX.PHONE_VN.test(v)

export function isStrongPassword(v: string): boolean {
  return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)
}

export const isEmpty = (v: unknown): boolean => {
  if (v == null) return true
  if (typeof v === 'string') return v.trim().length === 0
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}
