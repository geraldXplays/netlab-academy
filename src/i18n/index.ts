import { useCallback, useMemo } from 'react'
import { useSettings } from '@/store/settings'
import type { L } from '@/content/types'
import { en } from './en'
import { fr } from './fr'

const DICTS = { en, fr }

/** Replace {name} placeholders. */
export const fmt = (s: string, vars: Record<string, string | number> = {}) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))

/**
 * Usage:
 *   const { d, f, l, lang } = useI18n()
 *   d.hero.sub                       → UI string
 *   f(d.dash.toNext, { n: 40, l: 3 }) → interpolated
 *   l(level.title)                   → bilingual content field
 */
export function useI18n() {
  const lang = useSettings((s) => s.lang)
  const d = DICTS[lang]
  const l = useCallback((v: L) => v[lang], [lang])
  return useMemo(() => ({ d, f: fmt, l, lang }), [d, l, lang])
}
