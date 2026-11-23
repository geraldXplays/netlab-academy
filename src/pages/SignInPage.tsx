import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Eye, EyeOff, Lock, Loader2, ShieldCheck } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap'
import { useAuth } from '@/store/auth'
import { passwordStrength, type AuthError } from '@/auth/types'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { DecryptText } from '@/components/ui/DecryptText'
import { LogoMark } from '@/components/ui/Logo'
import { Device, DeviceDefs } from '@/components/devices/Device'
import { cn } from '@/lib/cn'

type Mode = 'in' | 'up' | 'reset'

export default function SignInPage() {
  const { d, f } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const raw = params.get('next') || '/dashboard'
  // Only same-site paths, and never back to the sign-in page.
  const next = raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/signin') ? raw : '/dashboard'
  const { user, signIn, signUp, sendReset } = useAuth()
  const [notice, setNotice] = useState<string | null>(null)
  const reduced = useReducedMotionPref()
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('netlab:remember') || localStorage.getItem('netlab:accounts') ? 'in' : 'up'))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [granted, setGranted] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const submitting = useRef(false)

  useEffect(() => {
    document.title = `${mode === 'in' ? d.auth.tabIn : d.auth.tabUp} · NetLab Academy`
  }, [mode, d])

  // Already signed in (and not mid-celebration) → straight through.
  useEffect(() => {
    if (user && !submitting.current) navigate(next, { replace: true })
  }, [user, navigate, next])

  // Entrance: a line of light opens into the card, then fields rise in.
  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo('[data-auth-card]', { clipPath: 'inset(49.5% 0% 49.5% 0% round 24px)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.1, ease: 'expo.inOut' }, 0.15)
        .fromTo('[data-auth-scan]', { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to('[data-auth-scan]', { opacity: 0, duration: 0.4 }, 0.9)
        .fromTo('[data-auth-in]', { y: 18, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.06 }, 0.75)
        .fromTo('[data-auth-ring]', { scale: 0.6, opacity: 0, rotate: -40 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.8, stagger: 0.12 }, 0)
        .fromTo('[data-hs-node]', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(2)' }, 0.4)

      // Looping TCP three-way handshake + TLS lock.
      const hs = gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 1.4 })
      const pkt = (sel: string, from: number, to: number, at: number) => {
        hs.fromTo(sel, { x: from, opacity: 0 }, { x: to, opacity: 1, duration: 0.9, ease: 'power2.inOut' }, at).to(sel, { opacity: 0, duration: 0.2 }, at + 0.9)
      }
      pkt('[data-hs-syn]', 0, 230, 0)
      pkt('[data-hs-synack]', 0, -230, 1.1)
      pkt('[data-hs-ack]', 0, 230, 2.2)
      hs.fromTo('[data-hs-lock]', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' }, 3.2)
        .fromTo('[data-hs-ok]', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 3.4)
        .fromTo('[data-hs-wire]', { strokeDashoffset: 0 }, { strokeDashoffset: -60, duration: 2, ease: 'none' }, 3.2)
        .to(['[data-hs-lock]', '[data-hs-ok]'], { opacity: 0, duration: 0.4 }, 5.4)
      return () => hs.kill()
    },
    { scope: root, dependencies: [reduced] },
  )

  const shake = () => {
    if (!reduced && card.current) gsap.fromTo(card.current, { x: 0 }, { keyframes: { x: [-10, 10, -6, 6, -2, 0] }, duration: 0.45, ease: 'power2.out' })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    submitting.current = true
    try {
      if (mode === 'reset') {
        await sendReset(email)
        setNotice(f(d.auth.linkSent, { email: email.trim() }))
        submitting.current = false
        setBusy(false)
        return
      }
      if (mode === 'in') await signIn(email, password, remember)
      else if ((await signUp(name, email, password, remember)) === 'confirm-email') {
        setNotice(f(d.auth.confirmBody, { email: email.trim() }))
        setMode('in')
        setPassword('')
        submitting.current = false
        setBusy(false)
        return
      }
      const who = useAuth.getState().user?.name ?? ''
      setGranted(who)
      window.setTimeout(() => navigate(next, { replace: true }), reduced ? 300 : 1700)
    } catch (err) {
      submitting.current = false
      setError(err as AuthError)
      shake()
      setBusy(false)
    }
  }

  const strength = passwordStrength(password)
  const field = 'peer h-12 w-full rounded-xl border border-line bg-bg-2/60 px-4 text-sm text-text placeholder-transparent transition-[border-color,box-shadow] focus:border-cyan focus:shadow-[0_0_0_4px_rgb(var(--cyan-rgb)/0.15)] focus:outline-none'
  const floatLabel = 'pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-dim transition-all peer-focus:top-0 peer-focus:bg-bg-2 peer-focus:px-1 peer-focus:text-[0.7rem] peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:bg-bg-2 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[0.7rem]'

  return (
    <div ref={root} className="relative min-h-[100svh] overflow-hidden">
      {/* Rotating aperture rings */}
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[760, 560, 380].map((s, i) => (
          <div key={s} data-auth-ring className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: s, height: s }}>
            <div
              className={cn('h-full w-full rounded-full', i === 1 ? 'animate-spin-slow border border-dashed border-purple/20' : 'border border-cyan/10')}
              style={i === 0 ? { background: 'conic-gradient(from 0deg, transparent, rgb(var(--cyan-rgb)/0.08), transparent 30%)', animation: 'spin-slow 14s linear infinite' } : undefined}
            />
          </div>
        ))}
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-5 pt-24 pb-12 lg:grid-cols-2">
        {/* Handshake visual */}
        <div className="hidden lg:block">
          <p data-auth-in className="hud-label flex items-center gap-2"><ShieldCheck size={14} className="text-cyan" /> {d.auth.eyebrow}</p>
          <svg viewBox="0 0 420 260" className="mt-6 w-full overflow-visible" aria-hidden>
            <DeviceDefs />
            <line x1="80" y1="110" x2="340" y2="110" stroke="var(--line-strong)" strokeWidth="2" />
            <line data-hs-wire x1="80" y1="110" x2="340" y2="110" stroke="var(--cyan)" strokeWidth="2" strokeDasharray="6 14" opacity="0.7" />
            <g data-hs-node style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <Device kind="laptop" x={60} y={110} scale={1.3} name={d.auth.handshake.client} animate={false} />
            </g>
            <g data-hs-node style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <Device kind="server" x={360} y={104} scale={1.2} name={d.auth.handshake.server} animate={false} />
            </g>
            <g data-hs-syn opacity="0"><Pkt x={95} y={84} label="SYN" color="var(--cyan)" /></g>
            <g data-hs-synack opacity="0"><Pkt x={325} y={138} label="SYN-ACK" color="var(--purple)" /></g>
            <g data-hs-ack opacity="0"><Pkt x={95} y={84} label="ACK" color="var(--success)" /></g>
            <g data-hs-lock opacity="0" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <circle cx="210" cy="110" r="20" fill="var(--bg-2)" stroke="var(--success)" strokeWidth="2" />
              <path d="M203 109 v-5 a7 7 0 0 1 14 0 v5" fill="none" stroke="var(--success)" strokeWidth="2.2" />
              <rect x="200" y="108" width="20" height="13" rx="2.5" fill="var(--success)" />
            </g>
            <text data-hs-ok opacity="0" x="210" y="160" textAnchor="middle" fontSize="12" fill="var(--success)" style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>
              TLS · {d.auth.handshake.established}
            </text>
          </svg>
          <h2 data-auth-in className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight">{d.brand.tagline}</h2>
          <p data-auth-in className="mt-3 max-w-md text-muted">{mode === 'up' ? d.auth.subUp : d.auth.subIn}</p>
        </div>

        {/* Card */}
        <div className="relative mx-auto w-full max-w-md">
          <div data-auth-scan aria-hidden className="absolute top-1/2 right-0 left-0 h-px origin-center bg-cyan opacity-0 shadow-[0_0_20px_var(--cyan)]" />
          <div ref={card} data-auth-card className="glass-strong glow-border relative overflow-hidden rounded-3xl p-7 shadow-[var(--shadow)] sm:p-8">
            <div data-auth-in className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />
              <div>
                <p className="hud-label">{d.auth.eyebrow}</p>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  <DecryptText key={mode} text={mode === 'in' ? d.auth.titleIn : mode === 'up' ? d.auth.titleUp : d.auth.resetTitle} speed={22} />
                </h1>
              </div>
            </div>

            {mode === 'reset' ? (
              <p className="mt-4 text-sm text-muted">{d.auth.resetSub}</p>
            ) : (
            <div data-auth-in role="tablist" className="glass mt-6 grid grid-cols-2 rounded-full p-1">
              {(['in', 'up'] as Mode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m)
                    setError(null)
                  }}
                  className={cn('relative rounded-full py-2 text-sm font-medium transition-colors', mode === m ? 'text-on-accent' : 'text-muted hover:text-text')}
                >
                  {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-cyan" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="relative">{m === 'in' ? d.auth.tabIn : d.auth.tabUp}</span>
                </button>
              ))}
            </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <AnimatePresence initial={false}>
                {mode === 'up' && (
                  <motion.div key="name" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="relative pt-1">
                      <input id="name" className={field} placeholder=" " value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                      <label htmlFor="name" className={floatLabel}>{d.auth.name}</label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div data-auth-in className="relative">
                <input id="email" type="email" className={field} placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <label htmlFor="email" className={floatLabel}>{d.auth.email}</label>
              </div>
              {mode !== 'reset' && (
              <div data-auth-in className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  className={cn(field, 'pr-12')}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                />
                <label htmlFor="password" className={floatLabel}>{d.auth.password}</label>
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? d.auth.hide : d.auth.show} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-dim hover:text-text">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              )}

              <AnimatePresence initial={false}>
                {mode === 'up' && password.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 flex-1 rounded-full"
                          animate={{ backgroundColor: i < strength ? ['var(--danger)', 'var(--warning)', 'var(--cyan)', 'var(--success)'][strength - 1] : 'var(--line-strong)' }}
                        />
                      ))}
                    </div>
                    <p className="mt-1 font-mono text-[0.68rem] text-dim">{d.auth.strength[password.length < 8 ? 0 : strength]}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode !== 'reset' && (
              <div className="flex flex-wrap items-center justify-between gap-2">
              <label data-auth-in className="flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
                <span className="grid h-5 w-5 place-items-center rounded-md border border-line-strong transition-colors peer-checked:border-cyan peer-checked:bg-cyan peer-focus-visible:ring-2 peer-focus-visible:ring-cyan">
                  {remember && <Check size={13} className="text-on-accent" />}
                </span>
                {d.auth.remember}
              </label>
              {mode === 'in' && (
                <button type="button" onClick={() => { setMode('reset'); setError(null); setNotice(null) }} className="text-xs text-cyan hover:underline">
                  {d.auth.forgot}
                </button>
              )}
              </div>
              )}

              <AnimatePresence>
                {notice && (
                  <motion.p role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                    {notice}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {d.auth.errors[error]}
                  </motion.p>
                )}
              </AnimatePresence>

              <div data-auth-in>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-cyan font-semibold text-on-accent shadow-[0_8px_30px_-6px_rgb(var(--cyan-rgb)/0.6)] transition-transform active:scale-[0.98]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {granted !== null ? (
                      <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={20} /></motion.span>
                    ) : busy ? (
                      <motion.span key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Loader2 size={18} className="animate-spin" /></motion.span>
                    ) : (
                      <motion.span key="label" className="flex items-center gap-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        {mode === 'in' ? d.auth.submitIn : mode === 'up' ? d.auth.submitUp : d.auth.sendLink}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </form>

            {mode === 'reset' && (
              <button type="button" onClick={() => { setMode('in'); setError(null); setNotice(null) }} className="mt-4 text-sm text-muted hover:text-cyan">
                ← {d.auth.backToSignIn}
              </button>
            )}
            <p data-auth-in className="mt-5 flex gap-2 text-[0.72rem] leading-relaxed text-dim">
              <Lock size={12} className="mt-0.5 shrink-0" /> {d.auth.deviceNote}
            </p>
          </div>
        </div>
      </div>

      {/* Access granted: iris wipe */}
      <AnimatePresence>
        {granted !== null && (
          <motion.div
            className="fixed inset-0 z-[95] grid place-items-center bg-bg"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.85, 0, 0.15, 1], delay: reduced ? 0 : 0.35 }}
          >
            <div className="bg-grid mask-radial absolute inset-0" />
            <div className="relative text-center">
              <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.8, type: 'spring', stiffness: 220, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-success/15 text-success">
                <ShieldCheck size={40} />
              </motion.div>
              <p className="hud-label mt-6 !text-success">{d.auth.granted}</p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-tight">
                <DecryptText text={f(d.auth.welcome, { name: granted })} delay={0.9} speed={30} />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Pkt({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  const w = label.length * 7.5 + 16
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y="-11" width={w} height="22" rx="11" fill="var(--bg-2)" stroke={color} strokeWidth="1.5" />
      <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill={color} style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>{label}</text>
    </g>
  )
}
