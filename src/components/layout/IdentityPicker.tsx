import { AnimatePresence, motion } from 'motion/react'
import { Check, Moon, Palette, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IDENTITIES, type Identity, type IdentityId } from '@/themes/identities'
import { transitionTheme } from '@/themes/transition'
import { useSettings } from '@/store/settings'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { useLenis } from '@/providers/SmoothScroll'
import { cn } from '@/lib/cn'

/** Mini rendered preview of an identity using its own palette and display font. */
function Swatch({ identity, mode }: { identity: Identity; mode: 'dark' | 'light' }) {
  const p = identity.palettes[mode]
  return (
    <div className="relative h-28 overflow-hidden rounded-[calc(var(--radius-2xl)-4px)]" style={{ background: p.bg }}>
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full blur-xl" style={{ background: p.a1, opacity: 0.55 }} />
      <div className="absolute -bottom-8 left-8 h-20 w-20 rounded-full blur-xl" style={{ background: p.a3, opacity: 0.5 }} />
      <div className="absolute right-10 bottom-3 h-10 w-10 rounded-full blur-lg" style={{ background: p.a2, opacity: 0.5 }} />
      <div className="relative flex h-full flex-col justify-between p-3">
        <span className="text-2xl leading-none font-semibold" style={{ fontFamily: identity.fonts.display, color: p.text }}>
          Aa
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-5 rounded-full px-2 text-[0.6rem] leading-5 font-semibold" style={{ background: p.a1, color: mode === 'dark' ? p.bg : '#fff' }}>
            Start
          </span>
          {[p.a1, p.a2, p.a3].map((col) => (
            <span key={col} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: col }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function IdentityPickerButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const { lang } = useI18n()
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn('grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-cyan-soft hover:text-text', className)}
        aria-label={lang === 'fr' ? 'Identité visuelle' : 'Visual identity'}
        title={lang === 'fr' ? 'Identité visuelle' : 'Visual identity'}
      >
        <Palette size={17} />
      </button>
      <IdentityPicker open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function IdentityPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { l, lang } = useI18n()
  const { identity, setIdentity, theme, setTheme } = useSettings()
  const reduced = useReducedMotionPref()
  const lenis = useLenis()

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, lenis])

  const choose = (id: IdentityId, e: React.MouseEvent) => {
    if (id === identity) return
    transitionTheme(() => setIdentity(id), { x: e.clientX, y: e.clientY }, reduced)
  }
  const chooseMode = (m: 'dark' | 'light', e: React.MouseEvent) => {
    if (m === theme) return
    transitionTheme(() => setTheme(m), { x: e.clientX, y: e.clientY }, reduced)
  }

  const groups: { key: Identity['group'][]; title: string }[] = [
    { key: ['core', 'identity'], title: lang === 'fr' ? 'Identités' : 'Identities' },
    { key: ['fusion'], title: lang === 'fr' ? 'Fusions' : 'Fusions' },
  ]

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-bg/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'fr' ? 'Identité visuelle' : 'Visual identity'}
            data-lenis-prevent
            className="glass-strong relative max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl p-5 shadow-[var(--shadow)] sm:rounded-3xl sm:p-8"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="hud-label">{lang === 'fr' ? 'Personnalisation' : 'Personalise'}</p>
                <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{lang === 'fr' ? 'Identité visuelle' : 'Visual identity'}</h2>
                <p className="mt-1 max-w-lg text-sm text-muted">
                  {lang === 'fr'
                    ? 'Chaque identité change les couleurs, la typographie, les formes, la scène animée et l’effet du curseur.'
                    : 'Each identity changes colours, typography, shapes, the animated hero scene and the cursor effect.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="glass flex rounded-full p-1">
                  {(['dark', 'light'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={(e) => chooseMode(m, e)}
                      aria-pressed={theme === m}
                      className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors', theme === m ? 'bg-cyan text-on-accent' : 'text-muted hover:text-text')}
                    >
                      {m === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                      {m === 'dark' ? (lang === 'fr' ? 'Sombre' : 'Dark') : lang === 'fr' ? 'Clair' : 'Light'}
                    </button>
                  ))}
                </div>
                <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-cyan-soft hover:text-text" aria-label="Close" autoFocus>
                  <X size={18} />
                </button>
              </div>
            </div>

            {groups.map((g) => (
              <section key={g.title} className="mb-8 last:mb-0">
                <p className="hud-label mb-3">{g.title}</p>
                <motion.ul
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  initial="h"
                  animate="s"
                  variants={{ s: { transition: { staggerChildren: 0.03 } } }}
                >
                  {IDENTITIES.filter((i) => g.key.includes(i.group)).map((idn) => {
                    const active = idn.id === identity
                    return (
                      <motion.li key={idn.id} variants={{ h: { opacity: 0, y: 14 }, s: { opacity: 1, y: 0 } }}>
                        <motion.button
                          onClick={(e) => choose(idn.id, e)}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.97 }}
                          aria-pressed={active}
                          className={cn(
                            'group relative w-full rounded-2xl border p-1.5 text-left transition-colors',
                            active ? 'border-cyan bg-cyan-soft shadow-[0_0_0_3px_rgb(var(--cyan-rgb)/0.2)]' : 'border-line hover:border-line-strong',
                          )}
                        >
                          <Swatch identity={idn} mode={theme} />
                          <div className="px-2 pt-2.5 pb-1.5">
                            <p className="flex items-center gap-1.5 font-medium">
                              {l(idn.name)}
                              {active && <Check size={14} className="text-cyan" />}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-dim">{l(idn.feeling)}</p>
                          </div>
                        </motion.button>
                      </motion.li>
                    )
                  })}
                </motion.ul>
              </section>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
