import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { KeyRound, Loader2 } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useI18n } from '@/i18n'
import type { AuthError } from '@/auth/types'
import { Button } from '@/components/ui/Button'

/** Landing page for the password-reset email link: choose a new password. */
export default function ResetPasswordPage() {
  const { d } = useI18n()
  const navigate = useNavigate()
  const { user, ready, recovery, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.title = `${d.auth.resetTitle} · NetLab Academy`
  }, [d])

  const linkValid = recovery || !!user

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await updatePassword(password)
      setDone(true)
      window.setTimeout(() => navigate('/dashboard', { replace: true }), 1400)
    } catch (err) {
      setError(err as AuthError)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[100svh] max-w-md place-items-center px-5 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="glass-strong glow-border w-full rounded-3xl p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-soft text-cyan"><KeyRound size={22} /></span>
        <h1 className="mt-4 font-display text-2xl font-semibold">{d.auth.resetTitle}</h1>
        {!ready ? (
          <Loader2 className="mt-6 animate-spin text-dim" />
        ) : !linkValid ? (
          <>
            <p className="mt-3 text-sm text-muted">{d.auth.resetInvalid}</p>
            <div className="mt-6"><Button to="/signin" variant="secondary">{d.auth.backToSignIn}</Button></div>
          </>
        ) : done ? (
          <p className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{d.auth.passwordSaved}</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={d.auth.newPassword}
              aria-label={d.auth.newPassword}
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-line bg-bg-2/60 px-4 text-sm text-text focus:border-cyan focus:outline-none"
            />
            {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{d.auth.errors[error]}</p>}
            <Button type="submit" disabled={busy || password.length < 8} className="w-full">{d.auth.savePassword}</Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
