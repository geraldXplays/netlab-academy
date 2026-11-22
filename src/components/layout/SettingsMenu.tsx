import { AnimatePresence, motion } from 'motion/react'
import { Moon, Settings2, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Segmented } from '@/components/ui/Segmented'
import { useSettings, type MotionPref, type Theme } from '@/store/settings'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/** Theme quick-toggle + popover with appearance & motion preferences. */
export function SettingsMenu({ up = false }: { up?: boolean }) {
  const { d } = useI18n()
  const { theme, setTheme, toggleTheme, motion: motionPref, setMotion } = useSettings()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const iconBtn = 'grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-cyan-soft hover:text-text'

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <button onClick={toggleTheme} className={iconBtn} aria-label={`${d.nav.theme}: ${theme === 'dark' ? d.nav.themeLight : d.nav.themeDark}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
          </motion.span>
        </AnimatePresence>
      </button>
      <button onClick={() => setOpen((v) => !v)} className={cn(iconBtn, open && 'bg-cyan-soft text-text')} aria-expanded={open} aria-label="Settings">
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          <Settings2 size={17} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.97, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn('glass-strong hud-corners absolute z-50 w-64 rounded-2xl p-4 shadow-[var(--shadow)]', up ? 'bottom-12 left-0 origin-bottom-left' : 'top-12 right-0 origin-top-right')}
          >
            <p className="hud-label mb-2">{d.nav.theme}</p>
            <Segmented<Theme>
              label={d.nav.theme}
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'dark', label: d.nav.themeDark },
                { value: 'light', label: d.nav.themeLight },
              ]}
            />
            <p className="hud-label mt-4 mb-2">{d.nav.motion}</p>
            <Segmented<MotionPref>
              label={d.nav.motion}
              value={motionPref}
              onChange={setMotion}
              options={[
                { value: 'system', label: d.nav.motionSystem },
                { value: 'full', label: d.nav.motionFull },
                { value: 'reduced', label: d.nav.motionReduced },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
