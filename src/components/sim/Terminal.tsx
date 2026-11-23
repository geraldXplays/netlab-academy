import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface TerminalApi {
  prompt: string
  /** Run a line; return printed output (or clear). */
  run: (line: string) => { out: string[]; clear?: boolean }
}

/** Packet-Tracer-like console: black screen, monospace, history with ↑/↓. */
export function Terminal({ api, banner = [], className, autoFocus = true }: { api: TerminalApi; banner?: string[]; className?: string; autoFocus?: boolean }) {
  const [lines, setLines] = useState<string[]>(banner)
  const [input, setInput] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [lines])

  const submit = () => {
    const line = input
    const res = api.run(line)
    setLines((ls) => (res.clear ? [] : [...ls, `${api.prompt}${line}`, ...res.out]))
    if (line.trim()) setHist((h) => [...h.slice(-49), line])
    setHi(-1)
    setInput('')
  }

  return (
    <div
      ref={scroller}
      onClick={() => inputRef.current?.focus()}
      data-lenis-prevent
      className={cn('h-full overflow-y-auto bg-[#0b0e14] p-3 font-mono text-[0.78rem] leading-[1.45] text-[#d1e7d1]', className)}
    >
      {lines.map((l, i) => (
        <div key={i} className={cn('whitespace-pre-wrap break-words', l.startsWith('%') && 'text-[#f6c177]', l.startsWith('Reply from') && !l.includes('unreachable') && 'text-[#9ece6a]', (l.includes('timed out') || l.includes('unreachable') || l.includes('Invalid')) && 'text-[#f7768e]')}>
          {l || ' '}
        </div>
      ))}
      <div className="flex">
        <span className="whitespace-pre text-[#7dcfff]">{api.prompt}</span>
        <input
          ref={inputRef}
          value={input}
          autoFocus={autoFocus}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Command line"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            else if (e.key === 'ArrowUp' && hist.length) {
              e.preventDefault()
              const n = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1)
              setHi(n)
              setInput(hist[n])
            } else if (e.key === 'ArrowDown' && hi >= 0) {
              e.preventDefault()
              const n = hi + 1
              if (n >= hist.length) {
                setHi(-1)
                setInput('')
              } else {
                setHi(n)
                setInput(hist[n])
              }
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[#e5f2e5] caret-[#7dcfff] outline-none"
        />
      </div>
    </div>
  )
}
