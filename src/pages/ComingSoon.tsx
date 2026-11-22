import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, BookOpen, ChevronDown, FlaskConical, LibraryBig, MonitorCog, type LucideIcon } from 'lucide-react'
import { LEVELS } from '@/content/curriculum'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { ParticleField } from '@/components/fx/ParticleField'
import { cn } from '@/lib/cn'

type Section = 'academy' | 'labs' | 'simulator' | 'dictionary'

const META: Record<Section, { icon: LucideIcon; phase: number }> = {
  academy: { icon: BookOpen, phase: 2 },
  labs: { icon: FlaskConical, phase: 4 },
  simulator: { icon: MonitorCog, phase: 5 },
  dictionary: { icon: LibraryBig, phase: 6 },
}

/** Placeholder for sections built in later phases — still on-brand and useful. */
export default function ComingSoon({ section }: { section: Section }) {
  const { d, f } = useI18n()
  const { icon: Icon, phase } = META[section]
  const copy = d.soon[section]

  useEffect(() => {
    document.title = `${copy.title} · NetLab Academy`
  }, [copy.title])

  return (
    <div className="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8">
      <section className="glass hud-corners relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12">
        <ParticleField density={0.00005} />
        <motion.div
          className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-cyan/30 bg-cyan-soft text-cyan shadow-[0_0_40px_rgb(34_211_238/0.25)]"
          initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
        >
          <Icon size={34} strokeWidth={1.5} />
        </motion.div>
        <div className="relative mt-6 flex justify-center gap-2">
          <Chip tone="warning" dot>{d.soon.label}</Chip>
          <Chip tone="cyan">{f(d.soon.phase, { n: phase })}</Chip>
        </div>
        <h1 className="relative mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-none font-semibold tracking-[-0.04em]">{copy.title}</h1>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted">{copy.body}</p>
        <div className="relative mt-8">
          <Button to="/dashboard" variant="secondary" icon={<ArrowLeft size={16} />}>
            {d.soon.back}
          </Button>
        </div>
      </section>

      {section === 'academy' && <CurriculumPreview />}
    </div>
  )
}

function CurriculumPreview() {
  const { d, l } = useI18n()
  const [open, setOpen] = useState<string | null>(LEVELS[0].id)
  return (
    <section className="mt-14">
      <p className="hud-label mb-5">{d.soon.curriculum}</p>
      <Reveal className="space-y-3" stagger={0.06}>
        {LEVELS.map((lvl) => {
          const isOpen = open === lvl.id
          return (
            <RevealItem key={lvl.id}>
              <div className={cn('glass overflow-hidden rounded-2xl transition-colors', isOpen && 'border-line-strong')}>
                <button
                  onClick={() => setOpen(isOpen ? null : lvl.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <span className="font-mono text-sm text-cyan">0{lvl.number}</span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-medium">{l(lvl.title)}</span>
                    <span className="block text-sm text-dim">{lvl.modules.length} {d.levels.modules} · {l(lvl.role)}</span>
                  </span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.35 }}>
                    <ChevronDown size={18} className="text-muted" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="px-5 text-muted">{l(lvl.summary)}</p>
                      <ul className="grid gap-2 p-5 sm:grid-cols-2">
                        {lvl.modules.map((m, i) => (
                          <motion.li
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + i * 0.03 }}
                            className="flex items-center justify-between rounded-xl border border-line bg-bg-2/40 px-3 py-2.5 text-sm"
                          >
                            <span>{l(m.title)}</span>
                            <span className="font-mono text-[0.65rem] text-dim">{m.lessonCount} {d.levels.lessons}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </RevealItem>
          )
        })}
      </Reveal>
    </section>
  )
}
