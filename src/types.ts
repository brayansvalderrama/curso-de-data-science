export type Expense = {
  id: string
  amount: number
  category: string
  date: string
  note: string
}

export type Period = 'day' | 'week' | 'month'

export const CURRENCIES = [
  { code: 'COP', label: 'COP $' },
  { code: 'USD', label: 'USD $' },
  { code: 'EUR', label: 'EUR €' },
  { code: 'MXN', label: 'MXN $' },
  { code: 'ARS', label: 'ARS $' },
  { code: 'CLP', label: 'CLP $' },
  { code: 'PEN', label: 'PEN S/' },
  { code: 'BRL', label: 'BRL R$' },
  { code: 'GBP', label: 'GBP £' },
] as const

export const CATEGORIES = [
  'Comida',
  'Transporte',
  'Hogar',
  'Salud',
  'Ocio',
  'Compras',
  'Servicios',
  'Otros',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  Comida: '#0ea5e9',
  Transporte: '#8b5cf6',
  Hogar: '#f59e0b',
  Salud: '#ef4444',
  Ocio: '#ec4899',
  Compras: '#10b981',
  Servicios: '#6366f1',
  Otros: '#64748b',
}
