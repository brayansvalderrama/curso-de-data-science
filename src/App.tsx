import { useMemo, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { parseExpenses, useCurrency, useExpenses } from './storage'
import { CATEGORIES, CATEGORY_COLORS, CURRENCIES, type Expense, type Period } from './types'
import {
  download,
  formatMoney,
  inPeriod,
  periodLabel,
  shiftPeriod,
  startOfPeriod,
  toCSV,
  todayISO,
} from './utils'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'day', label: 'Diario' },
  { id: 'week', label: 'Semanal' },
  { id: 'month', label: 'Mensual' },
]

export default function App() {
  const { expenses, setExpenses } = useExpenses()
  const { currency, setCurrency } = useCurrency()
  const [period, setPeriod] = useState<Period>('day')
  const [anchor, setAnchor] = useState<Date>(() => startOfPeriod(new Date(), 'day'))
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const visible = useMemo(
    () =>
      expenses
        .filter((e) => inPeriod(e, anchor, period))
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [expenses, anchor, period],
  )

  const total = visible.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of visible) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [visible])

  function changePeriod(next: Period) {
    setPeriod(next)
    setAnchor(startOfPeriod(anchor, next))
  }

  function addExpense(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: value,
      category,
      date,
      note: note.trim(),
    }
    setExpenses([expense, ...expenses])
    setAmount('')
    setNote('')
  }

  function importJSON(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    file.text().then((raw) => {
      const imported = parseExpenses(raw)
      const ids = new Set(expenses.map((e) => e.id))
      setExpenses([...expenses, ...imported.filter((e) => !ids.has(e.id))])
    })
    event.target.value = ''
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Gastos</h1>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <select
            className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs outline-none focus:border-neutral-900"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Moneda"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            className="hover:text-neutral-900"
            onClick={() => download('gastos.json', JSON.stringify(expenses, null, 2), 'application/json')}
          >
            Exportar JSON
          </button>
          <button
            className="hover:text-neutral-900"
            onClick={() => download('gastos.csv', toCSV(expenses), 'text/csv')}
          >
            Exportar CSV
          </button>
          <button className="hover:text-neutral-900" onClick={() => fileInput.current?.click()}>
            Importar
          </button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={importJSON} />
        </div>
      </header>

      <form
        onSubmit={addExpense}
        className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <input
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          type="number"
          min="0"
          step="any"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
          Agregar
        </button>
        <input
          className="col-span-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 sm:col-span-4"
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex rounded-lg bg-neutral-200/60 p-1 text-sm">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => changePeriod(p.id)}
              className={`rounded-md px-3 py-1 ${
                period === p.id ? 'bg-white font-medium shadow-sm' : 'text-neutral-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-200"
            onClick={() => setAnchor(shiftPeriod(anchor, period, -1))}
            aria-label="Periodo anterior"
          >
            ←
          </button>
          <span className="min-w-40 text-center capitalize text-neutral-600">
            {periodLabel(anchor, period)}
          </span>
          <button
            className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-200"
            onClick={() => setAnchor(shiftPeriod(anchor, period, 1))}
            aria-label="Periodo siguiente"
          >
            →
          </button>
        </div>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-[1fr_260px]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Total del periodo</p>
          <p className="mt-1 text-3xl font-semibold">{formatMoney(total, currency)}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {visible.length} {visible.length === 1 ? 'gasto' : 'gastos'}
          </p>
          <ul className="mt-4 space-y-1 text-sm">
            {byCategory.map((c) => (
              <li key={c.name} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[c.name] ?? '#64748b' }}
                />
                <span className="text-neutral-600">{c.name}</span>
                <span className="ml-auto tabular-nums">{formatMoney(c.value, currency)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex h-56 items-center justify-center rounded-2xl border border-neutral-200 bg-white p-2">
          {byCategory.length === 0 ? (
            <p className="text-sm text-neutral-400">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {byCategory.map((c) => (
                    <Cell key={c.name} fill={CATEGORY_COLORS[c.name] ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(Number(v), currency)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {visible.length === 0 && (
          <p className="p-6 text-center text-sm text-neutral-400">
            No hay gastos en este periodo.
          </p>
        )}
        {visible.map((e) => (
          <div key={e.id} className="group flex items-center gap-3 px-5 py-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: CATEGORY_COLORS[e.category] ?? '#64748b' }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{e.note || e.category}</p>
              <p className="text-xs text-neutral-400">
                {e.category} · {e.date}
              </p>
            </div>
            <span className="ml-auto text-sm tabular-nums">{formatMoney(e.amount, currency)}</span>
            <button
              className="text-xs text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
              onClick={() => setExpenses(expenses.filter((x) => x.id !== e.id))}
              aria-label="Eliminar gasto"
            >
              ✕
            </button>
          </div>
        ))}
      </section>

      <p className="mt-6 text-center text-xs text-neutral-400">
        Los datos se guardan en tu navegador (localStorage). Exporta para respaldar.
      </p>
    </div>
  )
}
