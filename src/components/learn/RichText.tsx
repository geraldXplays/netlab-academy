import { Fragment, type ReactNode } from 'react'

/** Inline: **bold** and `code`. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) out.push(<strong key={k++} className="font-semibold text-text">{tok.slice(2, -2)}</strong>)
    else out.push(<code key={k++} className="rounded-md border border-line bg-bg-2 px-1.5 py-0.5 font-mono text-[0.86em] text-cyan">{tok.slice(1, -1)}</code>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type Run = { kind: 'ul' | 'ol' | 'p'; lines: string[] }

/** Group consecutive lines of the same kind so lists can follow a sentence directly. */
function runs(block: string): Run[] {
  const out: Run[] = []
  for (const line of block.split('\n')) {
    const kind: Run['kind'] = line.startsWith('- ') ? 'ul' : /^\d+\. /.test(line) ? 'ol' : 'p'
    const last = out[out.length - 1]
    if (last && last.kind === kind) last.lines.push(line)
    else out.push({ kind, lines: [line] })
  }
  return out
}

/**
 * Tiny markdown subset for lesson content: paragraphs (blank line),
 * "- " bullets, "1. " numbered steps, **bold**, `code`.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const all = text.split(/\n{2,}/).flatMap(runs)
  return (
    <div className={className}>
      {all.map((run, bi) => {
        if (run.kind === 'ul') {
          return (
            <ul key={bi} className="my-3 space-y-2">
              {run.lines.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                  <span>{inline(l.slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (run.kind === 'ol') {
          return (
            <ol key={bi} className="my-3 space-y-2">
              {run.lines.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cyan/40 bg-cyan-soft font-mono text-[0.7rem] text-cyan">{l.match(/^(\d+)\./)?.[1]}</span>
                  <span>{inline(l.replace(/^\d+\. /, ''))}</span>
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={bi} className="my-3">
            {run.lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
