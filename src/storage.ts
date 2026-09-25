import { useEffect, useState } from 'react'
import type { Expense } from './types'

const KEY = 'gastos.v1'
const CURRENCY_KEY = 'gastos.currency'

function parse(raw: string | null): Expense[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter((item): item is Expense => {
      if (typeof item !== 'object' || item === null) return false
      const e = item as Partial<Expense>
      return (
        typeof e.id === 'string' &&
        typeof e.amount === 'number' &&
        typeof e.category === 'string' &&
        typeof e.date === 'string'
      )
    })
  } catch {
    return []
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    parse(localStorage.getItem(KEY)),
  )

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(expenses))
  }, [expenses])

  return { expenses, setExpenses }
}

export function useCurrency() {
  const [currency, setCurrency] = useState<string>(
    () => localStorage.getItem(CURRENCY_KEY) ?? 'COP',
  )

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency)
  }, [currency])

  return { currency, setCurrency }
}

export function parseExpenses(raw: string): Expense[] {
  return parse(raw)
}
