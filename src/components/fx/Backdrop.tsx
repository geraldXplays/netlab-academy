import { cn } from '@/lib/cn'

/**
 * Static atmospheric layer: perspective grid, aurora glows and a faint
 * scanline. Pure CSS — no animation loop cost.
 */
export function Backdrop({ className, variant = 'page' }: { className?: string; variant?: 'page' | 'hero' }) {
  return (
    <div aria-hidden className={cn('app-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-bg" />
      <div className="bg-grid mask-radial absolute inset-0 opacity-70" />
      <div className="backdrop-extra" />
      <div className="absolute -top-[30%] left-1/2 h-[80vh] w-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--cyan-rgb)/0.13),transparent)] blur-2xl" />
      <div className="absolute -bottom-[35%] -left-[10%] h-[70vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgb(var(--purple-rgb)/0.1),transparent)] blur-2xl" />
      <div className="absolute top-[20%] -right-[15%] h-[60vh] w-[45vw] rounded-full bg-[radial-gradient(closest-side,rgb(var(--blue-rgb)/0.09),transparent)] blur-2xl" />
      {variant === 'page' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--bg)_92%)]" />
      )}
    </div>
  )
}
