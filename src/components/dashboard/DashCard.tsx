import type { ReactNode } from 'react'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { RevealItem } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

/** Standard dashboard tile: spotlight glass card with a HUD header. */
export function DashCard({ title, icon, action, children, className, glow, bodyClass }: {
  title?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
  glow?: 'cyan' | 'purple' | 'blue'
}) {
  return (
    <RevealItem className={cn('min-w-0', className)}>
      <SpotlightCard glow={glow} className="h-full rounded-3xl">
        <div className={cn('flex h-full flex-col p-5 sm:p-6', bodyClass)}>
          {(title || action) && (
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="hud-label flex items-center gap-2 !text-muted">
                {icon && <span className="text-cyan">{icon}</span>}
                {title}
              </h2>
              {action}
            </div>
          )}
          {children}
        </div>
      </SpotlightCard>
    </RevealItem>
  )
}
