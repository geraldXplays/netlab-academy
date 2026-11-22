/** Local calendar day as YYYY-MM-DD (streaks and missions use local days). */
export const dayKey = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + n))
}

/** Last `n` day keys, oldest first, ending today. */
export const lastDays = (n: number, today = dayKey()) =>
  Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)))
