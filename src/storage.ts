import { useEffect, useState } from 'react'
import type { Expense } from './types'

const KEY = 'gastos.v1'
const CURRENCY_KEY = 'gastos.currency'

function parse(raw: string | null): Expense[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.flatMap((item): Expense[] => {
      if (typeof item !== 'object' || item === null) return []
      const e = item as Partial<Expense>
      if (
        typeof e.id !== 'string' ||
        typeof e.amount !== 'number' ||
        !Number.isFinite(e.amount) ||
        typeof e.category !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(String(e.date))
      ) {
        return []
      }
      return [
        {
          id: e.id,
          amount: e.amount,
          category: e.category,
          date: e.date as string,
          note: typeof e.note === 'string' ? e.note : '',
        },
      ]
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
