import { identityById, type IdentityId, type Mode, type Palette } from './identities'

export const VARS_KEY = 'netlab:vars'

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
}
const triplet = (hex: string) => hexToRgb(hex).join(' ')
const rgba = (hex: string, a: number) => `rgb(${triplet(hex)} / ${a})`
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Expand a compact palette into every CSS custom property the UI reads. */
export function buildVars(p: Palette, mode: Mode, fonts: { display: string; body: string }): Record<string, string> {
  const dark = mode === 'dark'
  const success = p.success ?? (dark ? '#34d399' : '#059669')
  const warning = p.warning ?? (dark ? '#fbbf24' : '#b45309')
  const danger = p.danger ?? (dark ? '#f43f5e' : '#e11d48')
  const lineBase = dark ? p.a1 : p.text
  return {
    '--bg': p.bg,
    '--bg-2': p.bg2,
    '--bg-3': p.bg3,
    '--surface': p.surface,
    '--surface-strong': p.surface.replace(/\/\s*[\d.]+\)/, `/ ${dark ? 0.85 : 0.9})`),
    '--line': rgba(lineBase, dark ? 0.12 : 0.1),
    '--line-strong': rgba(lineBase, dark ? 0.24 : 0.2),
    '--text': p.text,
    '--text-muted': p.muted,
    '--text-dim': p.dim,
    '--cyan': p.a1,
    '--blue': p.a2,
    '--purple': p.a3,
    '--cyan-soft': rgba(p.a1, dark ? 0.14 : 0.1),
    '--purple-soft': rgba(p.a3, dark ? 0.14 : 0.1),
    '--success': success,
    '--warning': warning,
    '--danger': danger,
    '--on-accent': luminance(p.a1) > 0.42 ? (dark ? p.bg : p.text) : '#ffffff',
    '--grid': rgba(lineBase, dark ? 0.055 : 0.06),
    '--shadow': dark ? '0 20px 60px -20px rgb(0 0 0 / 0.7)' : `0 20px 50px -24px ${rgba(p.text, 0.28)}`,
    '--cyan-rgb': triplet(p.a1),
    '--blue-rgb': triplet(p.a2),
    '--purple-rgb': triplet(p.a3),
    '--danger-rgb': triplet(danger),
    '--text-rgb': triplet(p.text),
    '--bg-rgb': triplet(p.bg),
    '--id-font-display': fonts.display,
    '--id-font-body': fonts.body,
  }
}

/** Apply identity + mode to <html> immediately (also caches vars for the no-flash boot script). */
export function applyIdentity(id: IdentityId, mode: Mode) {
  const identity = identityById(id)
  const vars = buildVars(identity.palettes[mode], mode, identity.fonts)
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  root.dataset.theme = mode
  root.dataset.identity = identity.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', vars['--bg'])
  try {
    localStorage.setItem(VARS_KEY, JSON.stringify({ id: identity.id, mode, vars }))
  } catch {
    /* storage unavailable */
  }
}
