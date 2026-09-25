import type { Expense, Period } from './types'

export function todayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function startOfPeriod(date: Date, period: Period): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (period === 'week') {
    const weekday = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - weekday)
  }
  if (period === 'month') d.setDate(1)
  return d
}

export function shiftPeriod(date: Date, period: Period, delta: number): Date {
  const d = new Date(date)
  if (period === 'day') d.setDate(d.getDate() + delta)
  if (period === 'week') d.setDate(d.getDate() + delta * 7)
  if (period === 'month') d.setMonth(d.getMonth() + delta)
  return startOfPeriod(d, period)
}

export function endOfPeriod(date: Date, period: Period): Date {
  const start = startOfPeriod(date, period)
  const end = new Date(start)
  if (period === 'day') end.setDate(end.getDate() + 1)
  if (period === 'week') end.setDate(end.getDate() + 7)
  if (period === 'month') end.setMonth(end.getMonth() + 1)
  return end
}

export function inPeriod(expense: Expense, anchor: Date, period: Period): boolean {
  const [y, m, d] = expense.date.split('-').map(Number)
  const value = new Date(y, (m ?? 1) - 1, d ?? 1).getTime()
  return value >= startOfPeriod(anchor, period).getTime() && value < endOfPeriod(anchor, period).getTime()
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function periodLabel(anchor: Date, period: Period): string {
  const start = startOfPeriod(anchor, period)
  if (period === 'day') {
    return start.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
  }
  if (period === 'month') {
    return start.toLocaleDateString('es', { month: 'long', year: 'numeric' })
  }
  const end = new Date(endOfPeriod(anchor, period).getTime() - 86400000)
  const fmt = (d: Date) => d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

export function toCSV(expenses: Expense[]): string {
  const head = 'fecha,categoria,monto,nota'
  const rows = expenses.map((e) =>
    [e.date, e.category, String(e.amount), `"${(e.note ?? '').replace(/"/g, '""')}"`].join(','),
  )
  return [head, ...rows].join('\n')
}

export function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
