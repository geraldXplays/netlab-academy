import { AnimatePresence, motion } from 'motion/react'
import { LogOut, LayoutDashboard, Award } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { levelFromXp } from '@/lib/xp'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?'

export function Avatar({ name, color, size = 36 }: { name: string; color: number; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-bg"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${color} 80% 55%), hsl(${(color + 50) % 360} 80% 45%))` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

/** Signed-in: avatar + dropdown. Signed-out: "Sign in" button. */
export function UserMenu({ up = false }: { up?: boolean }) {
  const { d } = useI18n()
  const { user, signOut } = useAuth()
  const xp = useProgress((s) => s.xp)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  if (!user) return <Button to="/signin" size="sm" variant="secondary">{d.auth.tabIn}</Button>
  const { level } = levelFromXp(xp)

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 transition-colors hover:border-cyan/40" aria-label={user.name}>
        <Avatar name={user.name} color={user.color} size={30} />
        <span className="hidden font-mono text-xs text-muted md:inline">LVL {String(level).padStart(2, '0')}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-strong absolute right-0 z-50 w-64 rounded-2xl p-2 shadow-[var(--shadow)] ${up ? 'bottom-12 origin-bottom-right' : 'top-12 origin-top-right'}`}
          >
            <div className="flex items-center gap-3 p-3">
              <Avatar name={user.name} color={user.color} size={40} />
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-dim">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted hover:bg-cyan-soft hover:text-text"><LayoutDashboard size={15} /> {d.nav.dashboard}</Link>
            <Link to="/assessments" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted hover:bg-cyan-soft hover:text-text"><Award size={15} /> {d.nav.assessments}</Link>
            <button
              onClick={async () => {
                setOpen(false)
                await signOut()
                navigate('/')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/10"
            >
              <LogOut size={15} /> {d.auth.signOut}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
