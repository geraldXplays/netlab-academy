import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Briefcase, CheckCircle2, Circle, Clock, History, Target } from 'lucide-react'
import { adjacentLessons, getLesson, locateLesson, LESSONS, PASS_RATIO } from '@/content/lessons'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { useScrollTo } from '@/providers/SmoothScroll'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { BlockView } from '@/components/learn/BlockView'
import { QuizRunner } from '@/components/learn/QuizRunner'
import { RichText } from '@/components/learn/RichText'
import { txt } from '@/components/learn/QuestionCard'
import { cn } from '@/lib/cn'

export default function LessonPage() {
  const { lessonId = '' } = useParams()
  const { d, f, l, lang } = useI18n()
  const lesson = getLesson(lessonId)
  const loc = locateLesson(lessonId)
  const openLesson = useProgress((s) => s.openLesson)
  const saveScroll = useProgress((s) => s.saveLessonScroll)
  const toggleBookmark = useProgress((s) => s.toggleBookmark)
  const bookmarked = useProgress((s) => s.bookmarks.includes(lessonId))
  const done = useProgress((s) => !!s.completedLessons[lessonId])
  const completed = useProgress((s) => s.completedLessons)
  const savedScroll = useProgress.getState().lessonState[lessonId]?.scroll ?? 0
  const scrollTo = useScrollTo()
  const article = useRef<HTMLDivElement>(null)
  const [resume, setResume] = useState<number | null>(null)
  const resumeRef = useRef<number | null>(null)
  resumeRef.current = resume

  useEffect(() => {
    if (!lesson) return
    document.title = `${l(lesson.title)} · NetLab Academy`
    openLesson(lessonId)
    setResume(savedScroll > 0.08 && savedScroll < 0.97 ? savedScroll : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  // Persist reading position (throttled).
  useEffect(() => {
    if (!lesson) return
    let t = 0
    const onScroll = () => {
      if (t) return
      t = window.setTimeout(() => {
        t = 0
        const el = article.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const ratio = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)))
        saveScroll(lessonId, ratio)
        // Dismiss the resume prompt once the learner is back near their saved spot.
        if (resumeRef.current !== null && ratio >= resumeRef.current - 0.05) setResume(null)
      }, 800)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [lesson, lessonId, saveScroll])

  if (!lesson || !loc) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-36 pb-24 text-center">
        <p className="text-lg text-muted">{d.learn.notFound}</p>
        <div className="mt-6"><Button to="/academy" variant="secondary">{d.learn.academy}</Button></div>
      </div>
    )
  }

  const { level, module: mod, index } = loc
  const { prev, next } = adjacentLessons(lessonId)
  const jump = () => {
    const el = article.current
    if (!el || resume === null) return
    const top = el.getBoundingClientRect().top + window.scrollY
    scrollTo(top + (el.offsetHeight - window.innerHeight) * resume)
    setResume(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-dim">
        <Link to="/academy" className="hover:text-cyan">{d.learn.academy}</Link>
        <span>/</span>
        <Link to={`/academy/${level.id}`} className="hover:text-cyan">{d.learn.level} {level.number}</Link>
        <span>/</span>
        <span className="text-muted">{l(mod.title)}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar: lessons of this module */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <p className="hud-label mb-3">{d.learn.onThisPage}</p>
            <ol className="space-y-1">
              {Array.from({ length: mod.lessonCount }, (_, i) => {
                const id = `${mod.id}.${i + 1}`
                const ls = LESSONS[id]
                const active = id === lessonId
                return (
                  <li key={id}>
                    <Link
                      to={`/learn/${id}`}
                      className={cn('relative flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors', active ? 'text-text' : 'text-muted hover:bg-cyan-soft hover:text-text')}
                    >
                      {active && <motion.span layoutId="lesson-active" className="absolute inset-0 rounded-xl border border-cyan/30 bg-cyan-soft" />}
                      <span className="relative mt-0.5">{completed[id] ? <CheckCircle2 size={15} className="text-success" /> : <Circle size={15} className="text-dim" />}</span>
                      <span className="relative">{ls ? txt(ls.title, lang) : `${d.learn.lessons} ${i + 1}`}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
            <Link to={`/academy/${level.id}`} className="mt-6 flex items-center gap-2 text-sm text-dim hover:text-cyan">
              <ArrowLeft size={14} /> {d.learn.backToLevel}
            </Link>
          </div>
        </aside>

        <div ref={article} className="min-w-0 max-w-3xl">
          {/* Header */}
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="cyan">{l(mod.title)}</Chip>
              <span className="flex items-center gap-1.5 font-mono text-xs text-dim"><Clock size={12} /> {f(d.learn.minutes, { n: lesson.minutes })}</span>
              <span className="font-mono text-xs text-dim">· {f(d.learn.lessonOf, { i: index, n: mod.lessonCount })}</span>
              {done && <Chip tone="success" dot>{d.learn.complete}</Chip>}
            </div>
            <motion.h1
              key={lessonId}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-display text-[clamp(2rem,4.6vw,3.3rem)] leading-[1.05] font-semibold tracking-[-0.035em]"
            >
              {l(lesson.title)}
            </motion.h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => toggleBookmark(lessonId)}
                aria-pressed={bookmarked}
                className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors', bookmarked ? 'border-cyan/40 bg-cyan-soft text-cyan' : 'border-line text-muted hover:text-text')}
              >
                <motion.span key={String(bookmarked)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                  {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </motion.span>
                {bookmarked ? d.learn.bookmarked : d.learn.bookmark}
              </button>
            </div>
          </header>

          <AnimatePresence>
            {resume !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-cyan/30 bg-cyan-soft px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-text"><History size={15} className="text-cyan" /> {f(d.learn.resumeBanner, { p: Math.round(resume * 100) })}</span>
                  <button onClick={jump} className="rounded-full bg-cyan px-3 py-1 text-xs font-semibold text-on-accent">{d.learn.jump}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Objectives */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="glass hud-corners mt-8 rounded-3xl p-6"
          >
            <p className="hud-label mb-3 flex items-center gap-2"><Target size={14} className="text-cyan" /> {d.learn.objectives}</p>
            <ul className="space-y-2.5">
              {lesson.objectives.map((o, i) => (
                <motion.li key={i} className="flex gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}>
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-cyan/40 font-mono text-[0.65rem] text-cyan">{i + 1}</span>
                  <span className="text-text">{l(o)}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* Content */}
          <Reveal className="mt-10 space-y-8" stagger={0.04}>
            {lesson.blocks.map((b, i) => (
              <RevealItem key={`${lessonId}-${i}`}>
                <BlockView block={b} lessonId={lessonId} index={i} />
              </RevealItem>
            ))}
          </Reveal>

          {/* Vocabulary */}
          <section className="mt-14">
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">{d.learn.vocabulary}</h2>
            <Reveal className="grid gap-3 sm:grid-cols-2" stagger={0.05}>
              {lesson.vocabulary.map((v, i) => (
                <RevealItem key={i}>
                  <div className="group h-full rounded-2xl border border-line bg-bg-2/40 p-4 transition-colors hover:border-cyan/40">
                    <p className="font-mono text-sm font-semibold text-cyan">{txt(v.term, lang)}</p>
                    <p className="mt-1 text-sm text-muted">{l(v.def)}</p>
                  </div>
                </RevealItem>
              ))}
            </Reveal>
          </section>

          {/* On the job */}
          <section className="mt-10 flex gap-4 rounded-3xl border border-purple/30 bg-purple-soft p-6">
            <Briefcase size={22} className="mt-0.5 shrink-0 text-purple" />
            <div>
              <p className="font-display text-lg font-semibold">{d.learn.practice}</p>
              <RichText text={l(lesson.practice)} className="text-muted [&_p]:my-1.5" />
            </div>
          </section>

          {/* Final assessment */}
          <div className="mt-10">
            <QuizRunner key={lessonId} lessonId={lessonId} questions={lesson.quiz} passRatio={PASS_RATIO} />
          </div>

          {/* Prev / next */}
          <nav className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link to={`/learn/${prev}`} className="group glass rounded-2xl p-4 transition-colors hover:border-line-strong">
                <span className="flex items-center gap-1.5 font-mono text-xs text-dim"><ArrowLeft size={12} /> {d.learn.prev}</span>
                <span className="mt-1 block font-medium group-hover:text-cyan">{l(LESSONS[prev].title)}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link to={`/learn/${next}`} className="group glass rounded-2xl p-4 text-right transition-colors hover:border-line-strong">
                <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-dim">{d.learn.nextLesson} <ArrowRight size={12} /></span>
                <span className="mt-1 block font-medium group-hover:text-cyan">{l(LESSONS[next].title)}</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
