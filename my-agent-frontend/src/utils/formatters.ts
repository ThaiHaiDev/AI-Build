import dayjs from '@/lib/dayjs'

export function formatDate(input: string | number | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(input).format(format)
}

export function formatDateTime(input: string | number | Date): string {
  return dayjs(input).format('YYYY-MM-DD HH:mm')
}

export function fromNow(input: string | number | Date): string {
  return dayjs(input).fromNow()
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatCurrency(value: number, currency = 'VND', locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`
}

export function truncate(str: string, max = 80, suffix = '…'): string {
  if (str.length <= max) return str
  return str.slice(0, max - suffix.length) + suffix
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
