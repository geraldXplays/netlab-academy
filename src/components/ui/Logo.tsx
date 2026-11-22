import { cn } from '@/lib/cn'

/** NetLab mark: a hexagonal chassis with a three-way network junction. */
export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('shrink-0', className)} aria-hidden data-logo>
      <defs>
        <linearGradient id="nl-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--purple)" />
        </linearGradient>
      </defs>
      <path
        data-logo-hex
        d="M32 6 54.5 19v26L32 58 9.5 45V19Z"
        fill="none"
        stroke="url(#nl-g)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={animated ? 1 : undefined}
        strokeDashoffset={animated ? 1 : undefined}
      />
      <g data-logo-links stroke="url(#nl-g)" strokeWidth="3" strokeLinecap="round">
        <path d="M32 32 20 25" pathLength={1} />
        <path d="M32 32 44 25" pathLength={1} />
        <path d="M32 32v14" pathLength={1} />
      </g>
      <g data-logo-nodes>
        <circle cx="32" cy="32" r="5.5" fill="var(--cyan)" />
        <circle cx="20" cy="25" r="3.2" fill="var(--blue)" />
        <circle cx="44" cy="25" r="3.2" fill="var(--blue)" />
        <circle cx="32" cy="46" r="3.2" fill="var(--purple)" />
      </g>
    </svg>
  )
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-8 w-8" />
      {!compact && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          NetLab<span className="text-cyan">.</span>
          <span className="ml-1 font-normal text-muted">Academy</span>
        </span>
      )}
    </span>
  )
}
