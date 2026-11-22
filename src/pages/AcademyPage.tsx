import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, BookmarkCheck, CheckCircle2, ChevronRight, Circle, CircleDot, Clock, Lock, PenTool, Search } from 'lucide-react'
import { LEVELS, ALL_LESSON_IDS, type Level } from '@/content/curriculum'
import { LESSONS, isModulePublished, locateLesson, searchLessons } from '@/content/lessons'
import { useProgress, levelProgress, isLevelUnlocked, nextLesson } from '@/store/progress'
import { useI18n } from '@/i18n'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Chip, SectionLabel } from '@/components/ui/Chip'
import { cn } from '@/lib/cn'

const accentText = { cyan: 'text-cyan', blue: 'text-blue', purple: 'text-purple' }

/** First lesson to open: last visited (if not finished) or the next incomplete one. */
function useContinueTarget() {
  const state = useProgress()
  if (state.lastLesson && LESSONS[state.lastLesson] && !state.completedLessons[state.lastLesson]) return state.lastLesson
  const n = nextLesson(state)
  return n && LESSONS[n.id] ? n.id : null
}

export default function AcademyPage() {
  const { levelId } = useParams()
  return levelId ? <LevelView levelId={levelId} /> : <Overview />
}

function Overview() {
  const { d, f, l, lang } = useI18n()
  const state = useProgress()
  const [q, setQ] = useState('')
  const results = useMemo(() => searchLessons(q, lang), [q, lang])
  const target = useContinueTarget()
  const done = Object.keys(state.completedLessons).length

  useEffect(() => {
    document.title = `${d.learn.academy} · NetLab Academy`
  }, [d])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <SectionLabel>{d.nav.academy}</SectionLabel>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]">{d.learn.academy}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{d.learn.academySub}</p>
        </div>
        <div className="glass hud-corners flex items-center gap-5 rounded-3xl p-5">
          <ProgressRing value={done / ALL_LESSON_IDS.length} size={88} stroke={7}>
            <span className="font-display text-lg font-semibold">{Math.round((done / ALL_LESSON_IDS.length) * 100)}%</span>
          </ProgressRing>
          <div>
            <p className="hud-label">{d.learn.overall}</p>
            <p className="mt-1 font-mono text-sm text-muted">{f(d.dash.lessonsDone, { d: done, t: ALL_LESSON_IDS.length })}</p>
            {target && (
              <div className="mt-3">
                <Button to={`/learn/${target}`} size="sm" iconRight={<ArrowRight size={14} />}>{d.learn.continue}</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="relative mt-10 max-w-xl">
        <Search size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-dim" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={d.learn.search}
          aria-label={d.learn.search}
          className="glass h-12 w-full rounded-full pr-4 pl-11 text-sm text-text placeholder:text-dim focus:border-cyan/50 focus:outline-none"
        />
      </div>
      <AnimatePresence>
        {q.trim().length >= 2 && (
          <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="glass-strong mt-3 max-w-xl divide-y divide-line overflow-hidden rounded-2xl">
            {results.length === 0 && <li className="px-4 py-3 text-sm text-dim">{f(d.learn.noResults, { q })}</li>}
            {results.slice(0, 8).map((ls) => {
              const loc = locateLesson(ls.id)
              return (
                <li key={ls.id}>
                  <Link to={`/learn/${ls.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-cyan-soft">
                    <span>
                      <span className="block font-medium">{l(ls.title)}</span>
                      {loc && <span className="font-mono text-[0.68rem] text-dim">L{loc.level.number} · {l(loc.module.title)}</span>}
                    </span>
                    <ChevronRight size={15} className="text-dim" />
                  </Link>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Bookmarks */}
      {state.bookmarks.filter((b) => LESSONS[b]).length > 0 && (
        <section className="mt-12">
          <p className="hud-label mb-3 flex items-center gap-2"><BookmarkCheck size={14} className="text-cyan" /> {d.learn.bookmarks}</p>
          <div className="flex flex-wrap gap-2">
            {state.bookmarks.filter((b) => LESSONS[b]).map((b) => (
              <Link key={b} to={`/learn/${b}`} className="glass rounded-full px-4 py-2 text-sm transition-colors hover:border-cyan/40 hover:text-cyan">
                {l(LESSONS[b].title)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Levels */}
      <Reveal className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {LEVELS.map((lvl, i) => (
          <RevealItem key={lvl.id}>
            <LevelCard level={lvl} index={i} />
          </RevealItem>
        ))}
      </Reveal>
    </div>
  )
}

function LevelCard({ level, index }: { level: Level; index: number }) {
  const { d, f, l } = useI18n()
  const state = useProgress()
  const p = levelProgress(state, level.id)
  const unlocked = isLevelUnlocked(state, index)
  const published = level.modules.some(isModulePublished)
  return (
    <Link to={`/academy/${level.id}`} className="block h-full rounded-3xl">
      <SpotlightCard tilt glow={level.accent} className={cn('h-full rounded-3xl', !unlocked && 'opacity-75')}>
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <span className={cn('font-display text-6xl leading-none font-bold tracking-tighter', accentText[level.accent])} style={{ WebkitTextStroke: `1.5px var(--${level.accent})`, color: 'transparent' }}>
              0{level.number}
            </span>
            {!unlocked ? (
              <Chip><Lock size={11} /> {d.learn.locked}</Chip>
            ) : !published ? (
              <Chip tone="warning"><PenTool size={11} /> {d.learn.inProduction}</Chip>
            ) : p.ratio >= 1 ? (
              <Chip tone="success">{d.learn.complete}</Chip>
            ) : (
              <Chip tone="cyan" dot>{p.done ? d.learn.inProgress : d.learn.notStarted}</Chip>
            )}
          </div>
          <p className="hud-label mt-5">{d.learn.level} {level.number} · {l(level.role)}</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">{l(level.title)}</h2>
          <p className="mt-2 text-sm text-muted">{l(level.summary)}</p>
          <div className="mt-auto pt-6">
            <div className="mb-2 flex justify-between font-mono text-[0.68rem] text-dim">
              <span>{level.modules.length} {d.learn.modules} · {p.total} {d.learn.lessons}</span>
              <span>{Math.round(p.ratio * 100)}%</span>
            </div>
            <ProgressBar value={p.ratio} tone={level.accent === 'purple' ? 'purple' : 'cyan'} />
            {!unlocked && <p className="mt-3 text-xs text-dim">{f(d.learn.lockedHint, { n: level.number - 1 })}</p>}
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}

function LevelView({ levelId }: { levelId: string }) {
  const { d, f, l, lang } = useI18n()
  const state = useProgress()
  const index = LEVELS.findIndex((x) => x.id === levelId)
  const level = LEVELS[index]

  useEffect(() => {
    if (level) document.title = `${l(level.title)} · NetLab Academy`
  }, [level, l])

  if (!level) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-36 pb-24 text-center">
        <Button to="/academy" variant="secondary">{d.learn.academy}</Button>
      </div>
    )
  }
  const p = levelProgress(state, level.id)
  const unlocked = isLevelUnlocked(state, index)
  const anyPublished = level.modules.some(isModulePublished)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs text-dim">
        <Link to="/academy" className="hover:text-cyan">{d.learn.academy}</Link> / <span className="text-muted">{d.learn.level} {level.number}</span>
      </nav>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={cn('font-mono text-sm', accentText[level.accent])}>{d.learn.level} {level.number} · {l(level.role)}</p>
          <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] font-semibold tracking-[-0.04em]">{l(level.title)}</h1>
          <p className="mt-3 max-w-2xl text-muted">{l(level.summary)}</p>
        </div>
        <ProgressRing value={p.ratio} size={110} stroke={8}>
          <div>
            <p className="font-display text-2xl font-semibold">{Math.round(p.ratio * 100)}%</p>
            <p className="font-mono text-[0.6rem] text-dim">{p.done}/{p.total}</p>
          </div>
        </ProgressRing>
      </header>

      {!unlocked && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-bg-2/50 px-5 py-4 text-sm text-muted">
          <Lock size={16} className="text-dim" /> {f(d.learn.lockedHint, { n: level.number - 1 })}
        </div>
      )}
      {!anyPublished && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-5 py-4 text-sm text-warning">
          <PenTool size={16} /> {d.learn.inProductionHint}
        </div>
      )}

      <Reveal className="mt-10 space-y-4" stagger={0.05}>
        {level.modules.map((mod, mi) => {
          const published = isModulePublished(mod)
          const ids = Array.from({ length: mod.lessonCount }, (_, i) => `${mod.id}.${i + 1}`)
          const doneCount = ids.filter((id) => state.completedLessons[id]).length
          return (
            <RevealItem key={mod.id}>
              <section className="glass overflow-hidden rounded-3xl">
                <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-dim">{String(mi + 1).padStart(2, '0')}</span>
                    <h2 className="font-display text-lg font-semibold">{l(mod.title)}</h2>
                  </div>
                  {published ? (
                    <span className="font-mono text-xs text-dim">{doneCount}/{mod.lessonCount}</span>
                  ) : (
                    <Chip tone="warning">{d.learn.inProduction}</Chip>
                  )}
                </div>
                <ul className="divide-y divide-line">
                  {ids.map((id, i) => {
                    const ls = LESSONS[id]
                    const st = state.lessonState[id]
                    const isDone = !!state.completedLessons[id]
                    const started = !!st && !isDone
                    const row = (
                      <div className={cn('flex items-center gap-4 px-5 py-3.5 transition-colors', ls && unlocked ? 'hover:bg-cyan-soft' : 'opacity-55')}>
                        <span className="shrink-0">
                          {isDone ? <CheckCircle2 size={18} className="text-success" /> : started ? <CircleDot size={18} className="text-cyan" /> : <Circle size={18} className="text-dim" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{ls ? ls.title[lang] : `${d.learn.lessons} ${i + 1}`}</p>
                          <p className="flex items-center gap-2 font-mono text-[0.66rem] text-dim">
                            {ls && <span className="flex items-center gap-1"><Clock size={10} /> {f(d.learn.minutes, { n: ls.minutes })}</span>}
                            {st && st.best > 0 && <span>· {f(d.learn.best, { n: Math.round(st.best * 100) })}</span>}
                          </p>
                        </div>
                        {ls && unlocked && (
                          <span className="font-mono text-[0.68rem] tracking-wider text-cyan uppercase">
                            {isDone ? d.learn.review : started ? d.learn.resumeLesson : d.learn.start}
                          </span>
                        )}
                      </div>
                    )
                    return <li key={id}>{ls && unlocked ? <Link to={`/learn/${id}`}>{row}</Link> : row}</li>
                  })}
                </ul>
              </section>
            </RevealItem>
          )
        })}
      </Reveal>
    </div>
  )
}
