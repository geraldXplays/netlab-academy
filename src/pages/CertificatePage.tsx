import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Printer } from 'lucide-react'
import { LEVELS } from '@/content/curriculum'
import { useProgress } from '@/store/progress'
import { useAuth } from '@/store/auth'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'

/** Printable certificate for a passed level exam. Print styles strip the app chrome. */
export default function CertificatePage() {
  const { levelId = '' } = useParams()
  const { d, f, l, lang } = useI18n()
  const cert = useProgress((s) => s.certificates[levelId])
  const user = useAuth((s) => s.user)
  const level = LEVELS.find((x) => x.id === levelId)

  useEffect(() => {
    document.title = `${d.exam.certificate.title} · NetLab Academy`
  }, [d])

  if (!cert || !level) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-36 pb-24 text-center">
        <p className="text-muted">{d.exam.certificate.notEarned}</p>
        <div className="mt-6"><Button to="/assessments" variant="secondary">{d.exam.back}</Button></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <div className="no-print mb-6 flex justify-end">
        <Button onClick={() => window.print()} icon={<Printer size={16} />}>{d.exam.certificate.print}</Button>
      </div>
      <motion.article
        initial={{ opacity: 0, rotateX: 18, y: 40 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1200 }}
        className="certificate relative aspect-[1.414] w-full overflow-hidden rounded-3xl border border-line-strong bg-bg-2 p-[5%] text-center shadow-[var(--shadow)]"
      >
        <div aria-hidden className="absolute inset-[2.5%] rounded-2xl border-2 border-cyan/40" />
        <div aria-hidden className="absolute inset-[3.5%] rounded-xl border border-purple/30" />
        <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />
        <div className="relative flex h-full flex-col items-center justify-center">
          <LogoMark className="h-[9%] w-auto" />
          <p className="hud-label mt-[2%] !text-[clamp(0.55rem,1.2vw,0.8rem)]">{d.exam.certificate.issuer}</p>
          <h1 className="mt-[2%] font-display text-[clamp(1.4rem,4.4vw,3.4rem)] leading-none font-semibold tracking-tight"><span className="text-gradient">{d.exam.certificate.title}</span></h1>
          <p className="mt-[3%] text-[clamp(0.7rem,1.6vw,1.05rem)] text-muted">{d.exam.certificate.presented}</p>
          <p className="mt-[1%] font-display text-[clamp(1.3rem,4vw,3rem)] font-semibold">{user?.name}</p>
          <div className="my-[1.5%] h-px w-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent" />
          <p className="text-[clamp(0.7rem,1.6vw,1.05rem)] text-muted">{d.exam.certificate.completed}</p>
          <p className="mt-[1%] font-display text-[clamp(1rem,2.8vw,2rem)] font-semibold">{d.learn.level} {level.number} — {l(level.title)}</p>
          <p className="mt-[1%] text-[clamp(0.7rem,1.6vw,1.05rem)] text-muted">{f(d.exam.certificate.score, { s: Math.round(cert.score * 100) })}</p>
          <div className="mt-[4%] grid w-3/4 grid-cols-2 gap-[4%] text-[clamp(0.55rem,1.2vw,0.8rem)]">
            <div>
              <p className="border-b border-line-strong pb-1 font-mono">{new Date(cert.date).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="mt-1 text-dim">{d.exam.certificate.date}</p>
            </div>
            <div>
              <p className="border-b border-line-strong pb-1 font-mono">{cert.code}</p>
              <p className="mt-1 text-dim">{d.exam.certificate.id}</p>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  )
}
