import { Blocks, Flame, Layers, Link2, Lock, Radar, Server, Sparkles, Terminal, Wrench, Grid3x3, type LucideIcon } from 'lucide-react'
import type { Achievement, AchievementIcon } from '@/content/achievements'
import { cn } from '@/lib/cn'

const ICONS: Record<AchievementIcon, LucideIcon> = {
  link: Link2, radar: Radar, grid: Grid3x3, layers: Layers, terminal: Terminal,
  server: Server, wrench: Wrench, blueprint: Blocks, flame: Flame, spark: Sparkles,
}

const TIER = {
  bronze: ['#f59e0b', '#b45309'],
  silver: ['#e2e8f0', '#64748b'],
  gold: ['#22d3ee', '#a855f7'],
}

/** Hexagonal badge. Locked badges render as a dim outline. */
export function AchievementBadge({ a, unlocked, size = 64, className }: { a: Achievement; unlocked: boolean; size?: number; className?: string }) {
  const Icon = unlocked ? ICONS[a.icon] : Lock
  const [c1, c2] = TIER[a.tier]
  const gid = `ab-${a.id}`
  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <path
          d="M32 3 57 17.5v29L32 61 7 46.5v-29Z"
          fill={unlocked ? `url(#${gid})` : 'var(--surface)'}
          fillOpacity={unlocked ? 0.16 : 1}
          stroke={unlocked ? `url(#${gid})` : 'var(--line-strong)'}
          strokeWidth="2"
          strokeDasharray={unlocked ? undefined : '3 4'}
        />
      </svg>
      <Icon
        className={cn('relative', unlocked ? 'text-text' : 'text-dim')}
        style={{ width: size * 0.36, height: size * 0.36, filter: unlocked ? `drop-shadow(0 0 8px ${c1})` : undefined }}
        strokeWidth={1.75}
      />
    </div>
  )
}
