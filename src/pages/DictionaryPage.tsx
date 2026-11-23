import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, BookOpen, Copy, Search, Sparkles, Terminal, X } from 'lucide-react'
import { DICT_CATS, TERMS, TERM_BY_ID, type DictCat, type Term } from '@/content/dictionary'
import { LESSONS } from '@/content/lessons'
import { Animation } from '@/components/anim'
import { Chip } from '@/components/ui/Chip'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const CAT_TONE: Record<DictCat, 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  networking: 'cyan',
  addressing: 'purple',
  hardware: 'warning',
  systems: 'neutral',
  cisco: 'cyan',
  security: 'danger',
  services: 'success',
}

export default function DictionaryPage() {
  const { l, lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<DictCat | 'all'>('all')
  const sel = params.get('t') && TERM_BY_ID[params.get('t')!] ? TERM_BY_ID[params.get('t')!] : null
  const inputRef = useRef<HTMLInputElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = `${tr('Technical Dictionary', 'Dictionnaire technique')} · NetLab Academy`
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const name = (t: Term) => (lang === 'fr' && t.fr ? t.fr : t.term)
  const filtered = useMemo(() => {
    const n = norm(q.trim())
    return TERMS.filter((t) => (cat === 'all' || t.cat === cat) && (!n || [t.term, t.fr ?? '', t.full ?? '', t.def[lang], t.cmd ?? ''].some((s) => norm(s).includes(n))))
      .map((t) => ({ t, key: name(t) }))
      .sort((a, b) => {
        // exact/prefix matches on the name first when searching
        if (n) {
          const pa = norm(a.key).startsWith(n) || norm(a.t.term).startsWith(n) ? 0 : 1
          const pb = norm(b.key).startsWith(n) || norm(b.t.term).startsWith(n) ? 0 : 1
          if (pa !== pb) return pa - pb
        }
        return a.key.localeCompare(b.key, lang, { sensitivity: 'base' })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, lang])

  const groups = useMemo(() => {
    if (q.trim()) return [{ letter: '', items: filtered }]
    const m = new Map<string, typeof filtered>()
    for (const it of filtered) {
      const c = norm(it.key)[0]
      const letter = /[a-z]/.test(c) ? c.toUpperCase() : '#'
      m.set(letter, [...(m.get(letter) ?? []), it])
    }
    return [...m.entries()].map(([letter, items]) => ({ letter, items })).sort((a, b) => (a.letter === '#' ? -1 : b.letter === '#' ? 1 : a.letter.localeCompare(b.letter)))
  }, [filtered, q])

  const open = (id: string | null) => {
    const p = new URLSearchParams(params)
    if (id) p.set('t', id)
    else p.delete('t')
    setParams(p, { replace: !!sel })
    if (id && window.innerWidth < 1024) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: TERMS.length }
    for (const t of TERMS) c[t.cat] = (c[t.cat] ?? 0) + 1
    return c
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <p className="hud-label">{tr('Reference', 'Référence')}</p>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]">{tr('Technical Dictionary', 'Dictionnaire technique')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {tr(`${TERMS.length} networking, systems, Cisco and security terms — each linked to its lesson, its animation and the commands you will actually type.`, `${TERMS.length} termes réseau, systèmes, Cisco et sécurité — chacun relié à sa leçon, son animation et aux commandes que vous taperez vraiment.`)}
      </p>

      {/* search + filters */}
      <div className="sticky top-20 z-20 -mx-4 mt-10 bg-bg/80 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <label className="glass flex items-center gap-3 rounded-2xl px-4 py-3 focus-within:border-cyan/50">
          <Search className="size-5 text-dim" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr('Search a term, an acronym, a command…', 'Rechercher un terme, un sigle, une commande…')}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-dim"
            aria-label={tr('Search the dictionary', 'Rechercher dans le dictionnaire')}
          />
          {q ? (
            <button onClick={() => setQ('')} aria-label={tr('Clear', 'Effacer')} className="text-dim hover:text-text">
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden rounded-md border border-line px-1.5 font-mono text-xs text-dim sm:block">/</kbd>
          )}
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(['all', ...Object.keys(DICT_CATS)] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c as DictCat | 'all')}
              aria-pressed={cat === c}
              className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors', cat === c ? 'border-cyan bg-cyan text-on-accent' : 'border-line text-muted hover:text-text')}
            >
              {c === 'all' ? tr('All', 'Tout') : l(DICT_CATS[c as DictCat])} <span className="font-mono text-xs opacity-70">{counts[c]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* detail (first on mobile when a term is open) */}
        <div ref={detailRef} className={cn('scroll-mt-48 lg:order-2', !sel && 'hidden lg:block')}>
          <div className="lg:sticky lg:top-56 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto lg:rounded-3xl [scrollbar-width:thin]">
            <AnimatePresence mode="wait">
              {sel ? <Detail key={sel.id} t={sel} open={open} /> : <Empty key="empty" pick={() => open(TERMS[Math.floor(Math.random() * TERMS.length)].id)} />}
            </AnimatePresence>
          </div>
        </div>

        {/* list */}
        <div className="lg:order-1">
          {!q && (
            <div className="mb-5 flex flex-wrap gap-1 font-mono text-xs">
              {groups.map((g) => (
                <a key={g.letter} href={`#dict-${g.letter}`} onClick={(e) => { e.preventDefault(); document.getElementById(`dict-${g.letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="grid size-7 place-items-center rounded-md border border-line text-muted hover:border-cyan/50 hover:text-cyan">
                  {g.letter}
                </a>
              ))}
            </div>
          )}
          {filtered.length === 0 && <p className="glass rounded-2xl p-6 text-muted">{tr('No term matches. Try an acronym (DHCP) or a command (show vlan).', 'Aucun terme ne correspond. Essayez un sigle (DHCP) ou une commande (show vlan).')}</p>}
          {groups.map((g) => (
            <section key={g.letter} id={`dict-${g.letter}`} className="scroll-mt-56">
              {g.letter && <h2 className="mt-6 mb-2 font-display text-2xl font-semibold text-cyan first:mt-0">{g.letter}</h2>}
              <ul className="grid gap-2">
                {g.items.map(({ t, key }) => (
                  <li key={t.id}>
                    <button
                      onClick={() => open(t.id)}
                      className={cn('group w-full rounded-2xl border px-4 py-3 text-left transition-colors', sel?.id === t.id ? 'border-cyan/50 bg-cyan-soft' : 'border-line bg-surface/40 hover:border-line-strong')}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold group-hover:text-cyan">
                          {key}
                          {t.full && <span className="ml-2 text-sm font-normal text-dim">{t.full}</span>}
                        </span>
                        <Chip tone={CAT_TONE[t.cat]} className="shrink-0">{l(DICT_CATS[t.cat])}</Chip>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{t.def[lang]}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function Empty({ pick }: { pick: () => void }) {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass rounded-3xl p-8 text-center">
      <BookOpen className="mx-auto size-10 text-cyan" />
      <p className="mt-4 font-display text-xl font-semibold">{tr('Pick a term', 'Choisissez un terme')}</p>
      <p className="mt-2 text-muted">{tr('Definitions in English and French, real commands, and animated examples.', 'Définitions en anglais et en français, vraies commandes et exemples animés.')}</p>
      <button onClick={pick} className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan/40 px-4 py-2 text-sm text-cyan hover:bg-cyan-soft">
        <Sparkles className="size-4" /> {tr('Surprise me', 'Au hasard')}
      </button>
    </motion.div>
  )
}

function Detail({ t, open }: { t: Term; open: (id: string | null) => void }) {
  const { l, lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const other = lang === 'fr' ? 'en' : 'fr'
  const [copied, setCopied] = useState(false)
  const lesson = t.lesson ? LESSONS[t.lesson] : undefined
  const related = (t.see ?? []).map((id) => TERM_BY_ID[id]).filter(Boolean)
  const title = lang === 'fr' && t.fr ? t.fr : t.term
  const alt = lang === 'fr' ? (t.fr ? t.term : null) : t.fr ?? null

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Chip tone={CAT_TONE[t.cat]}>{l(DICT_CATS[t.cat])}</Chip>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {(t.full || alt) && (
            <p className="mt-1 text-dim">
              {t.full}
              {t.full && alt && ' · '}
              {alt && <span>{other.toUpperCase()} : {alt}</span>}
            </p>
          )}
        </div>
        <button onClick={() => open(null)} aria-label={tr('Close', 'Fermer')} className="rounded-full p-2 text-dim hover:bg-surface hover:text-text">
          <X className="size-5" />
        </button>
      </div>

      <p className="mt-5 text-lg leading-relaxed">{t.def[lang]}</p>
      <p className="mt-3 border-l-2 border-line pl-3 text-sm text-dim italic">{t.def[other]}</p>

      {t.ex && (
        <div className="mt-5 rounded-2xl border border-purple/25 bg-purple-soft p-4">
          <p className="hud-label text-purple">{tr('Example', 'Exemple')}</p>
          <p className="mt-1">{t.ex[lang]}</p>
        </div>
      )}

      {t.cmd && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-[#05080d] px-4 py-3 font-mono text-sm">
          <Terminal className="size-4 shrink-0 text-cyan" />
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-success">{t.cmd}</code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(t.cmd!).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
            className="shrink-0 text-dim hover:text-text"
            aria-label={tr('Copy command', 'Copier la commande')}
          >
            {copied ? <span className="text-xs text-success">✓</span> : <Copy className="size-4" />}
          </button>
        </div>
      )}

      {t.anim && (
        <div className="mt-6">
          <p className="hud-label mb-2">{tr('See it in motion', 'Voir en animation')}</p>
          <Animation anim={t.anim} />
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-6">
          <p className="hud-label mb-2">{tr('Related terms', 'Termes liés')}</p>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <button key={r.id} onClick={() => open(r.id)} className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:border-cyan/50 hover:text-cyan">
                {lang === 'fr' && r.fr ? r.fr : r.term}
              </button>
            ))}
          </div>
        </div>
      )}

      {lesson && (
        <Link to={`/learn/${lesson.id}`} className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-cyan/30 bg-cyan-soft px-4 py-3 text-cyan hover:border-cyan/60">
          <span className="flex items-center gap-2 text-sm">
            <BookOpen className="size-4" /> {tr('Learn it in the lesson', 'L’apprendre dans la leçon')} : <strong className="font-semibold">{l(lesson.title)}</strong>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      )}
    </motion.article>
  )
}
