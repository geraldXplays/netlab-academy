import { flushSync } from 'react-dom'

/**
 * Run a theme/identity change inside a View Transition with a circular
 * reveal expanding from (x, y). Falls back to a short colour crossfade.
 */
export function transitionTheme(update: () => void, origin?: { x: number; y: number }, reduced = false) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
  if (reduced) {
    update()
    return
  }
  if (!doc.startViewTransition) {
    const root = document.documentElement
    root.classList.add('theme-fade')
    update()
    window.setTimeout(() => root.classList.remove('theme-fade'), 500)
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const vt = doc.startViewTransition(() => flushSync(update))
  vt.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
}
