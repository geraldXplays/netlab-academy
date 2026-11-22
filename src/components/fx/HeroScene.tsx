import { Suspense } from 'react'
import { useSettings } from '@/store/settings'
import { identityById } from '@/themes/identities'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { SCENES } from './scenes'
import { cn } from '@/lib/cn'

/**
 * The hero's animated world. Chooses the scene of the active identity and
 * remounts it whenever identity or light/dark mode changes so it re-reads colours.
 */
export function HeroScene() {
  const identityId = useSettings((s) => s.identity)
  const theme = useSettings((s) => s.theme)
  const reduced = useReducedMotionPref()
  const identity = identityById(identityId)
  const Scene = SCENES[identity.scene]
  const full = identity.layout === 'full'

  return (
    <>
      <div
        data-hero-globe
        className={cn(
          'absolute',
          full ? 'inset-0' : 'inset-y-0 right-[-14%] w-[78%] max-md:inset-x-[-30%] max-md:right-auto max-md:w-auto max-md:opacity-50',
        )}
      >
        <Suspense fallback={null}>
          <Scene key={`${identity.id}-${theme}`} reduced={reduced} variant={identity.variant} theme={theme} className="h-full w-full" />
        </Suspense>
      </div>
      {/* Readability veil: keeps the headline legible over full-bleed scenes */}
      {full && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--bg)_0%,rgb(var(--bg-rgb)/0.82)_32%,rgb(var(--bg-rgb)/0.15)_62%,transparent_80%)] max-md:bg-[linear-gradient(180deg,rgb(var(--bg-rgb)/0.55),rgb(var(--bg-rgb)/0.85))]"
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
    </>
  )
}
