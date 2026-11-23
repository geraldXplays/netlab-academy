import { AlertTriangle, Briefcase, Info, Lightbulb, HelpCircle, Terminal } from 'lucide-react'
import type { Block } from '@/content/lessons'
import { DIAGRAMS } from '@/components/diagrams'
import { Animation, WIDGETS } from '@/components/anim'
import { useI18n } from '@/i18n'
import { useProgress } from '@/store/progress'
import { cn } from '@/lib/cn'
import { RichText } from './RichText'
import { QuestionCard, txt } from './QuestionCard'

const TONES = {
  tip: { icon: Lightbulb, cls: 'border-success/30 bg-success/5', ic: 'text-success' },
  warn: { icon: AlertTriangle, cls: 'border-warning/35 bg-warning/5', ic: 'text-warning' },
  info: { icon: Info, cls: 'border-cyan/30 bg-cyan-soft', ic: 'text-cyan' },
  pro: { icon: Briefcase, cls: 'border-purple/30 bg-purple-soft', ic: 'text-purple' },
}

export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure className="my-2 overflow-hidden rounded-2xl border border-line bg-bg-2">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <Terminal size={13} className="text-cyan" />
        <span className="h-2 w-2 rounded-full bg-danger/60" />
        <span className="h-2 w-2 rounded-full bg-warning/60" />
        <span className="h-2 w-2 rounded-full bg-success/60" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-relaxed text-text" data-lenis-prevent-horizontal>
        {code.split('\n').map((line, i) => (
          <div key={i} className={cn(line.trim().startsWith('#') && 'text-dim')}>{line || ' '}</div>
        ))}
      </pre>
      {caption && <figcaption className="border-t border-line px-4 py-2 text-xs text-dim">{caption}</figcaption>}
    </figure>
  )
}

/** Renders one lesson content block. */
export function BlockView({ block, lessonId, index }: { block: Block; lessonId: string; index: number }) {
  const { d, lang } = useI18n()
  const answerCheck = useProgress((s) => s.answerCheck)
  const past = useProgress((s) => s.lessonState[lessonId]?.checks?.[index])

  switch (block.type) {
    case 'text':
      return (
        <section>
          {block.title && <h2 className="mb-2 font-display text-2xl font-semibold tracking-tight">{txt(block.title, lang)}</h2>}
          <RichText text={txt(block.body, lang)} className="text-[1.02rem] leading-relaxed text-muted" />
        </section>
      )
    case 'callout': {
      const tone = TONES[block.tone]
      const Icon = tone.icon
      return (
        <aside className={cn('flex gap-4 rounded-2xl border p-5', tone.cls)}>
          <Icon size={20} className={cn('mt-0.5 shrink-0', tone.ic)} />
          <div>
            <p className={cn('font-semibold', tone.ic)}>{block.title ? txt(block.title, lang) : d.learn.tones[block.tone]}</p>
            <RichText text={txt(block.body, lang)} className="text-[0.95rem] leading-relaxed text-muted [&_p]:my-1.5" />
          </div>
        </aside>
      )
    }
    case 'diagram': {
      const Diagram = DIAGRAMS[block.diagram]
      return (
        <figure className="glass rounded-3xl p-4 sm:p-6">
          <Diagram />
          <figcaption className="mt-3 text-center text-sm text-dim">{txt(block.caption, lang)}</figcaption>
        </figure>
      )
    }
    case 'animation':
      return <Animation anim={block.anim} title={txt(block.title, lang)} />
    case 'widget': {
      const W = WIDGETS[block.widget]
      return <W />
    }
    case 'example':
      return (
        <section className="rounded-2xl border border-line bg-bg-2/40 p-5">
          <p className="hud-label mb-1">{d.learn.example}</p>
          <h3 className="font-display text-lg font-semibold">{txt(block.title, lang)}</h3>
          <RichText text={txt(block.body, lang)} className="text-[0.97rem] leading-relaxed text-muted [&_p]:my-2" />
          {block.code && <CodeBlock code={block.code} />}
        </section>
      )
    case 'code':
      return <CodeBlock code={block.code} caption={block.caption ? txt(block.caption, lang) : undefined} />
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-line" data-lenis-prevent-horizontal>
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-bg-2">
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-mono text-[0.7rem] tracking-wider text-dim uppercase">{txt(h, lang)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={ri} className="border-t border-line transition-colors hover:bg-cyan-soft">
                  {r.map((c, ci) => (
                    <td key={ci} className={cn('px-4 py-3 align-top', ci === 0 ? 'font-medium text-text' : 'text-muted')}>
                      <RichText text={txt(c, lang)} className="[&_p]:my-0" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'check':
      return (
        <section className="rounded-2xl border border-cyan/25 bg-cyan-soft/50 p-5">
          <p className="hud-label mb-3 flex items-center gap-2 !text-cyan"><HelpCircle size={14} /> {d.learn.check}</p>
          <QuestionCard
            compact
            q={block.question}
            initial={past !== undefined ? { correct: past } : undefined}
            onAnswer={(ok) => answerCheck(lessonId, index, ok)}
          />
        </section>
      )
  }
}
