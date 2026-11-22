import { forwardRef, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/cn'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Common {
  variant?: Variant
  size?: Size
  magnetic?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  className?: string
  children?: ReactNode
}

type AsButton = Common & Omit<ComponentPropsWithoutRef<'button'>, keyof Common> & { to?: undefined; href?: undefined }
type AsLink = Common & { to: string; href?: undefined; onClick?: () => void }
type AsAnchor = Common & { href: string; to?: undefined; onClick?: () => void }
export type ButtonProps = AsButton | AsLink | AsAnchor

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight whitespace-nowrap transition-[background,color,box-shadow,border-color,transform] duration-300 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]'

const variants: Record<Variant, string> = {
  primary:
    'bg-cyan text-bg shadow-[0_0_0_1px_rgb(34_211_238/0.4),0_8px_30px_-6px_rgb(34_211_238/0.55)] hover:shadow-[0_0_0_1px_rgb(34_211_238/0.7),0_10px_44px_-4px_rgb(34_211_238/0.75)]',
  secondary: 'glass text-text hover:border-line-strong hover:bg-surface-strong',
  ghost: 'text-muted hover:text-text hover:bg-cyan-soft',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-14 px-7 text-base',
}

/**
 * Primary interactive element. Variants share a light-sweep on hover and an
 * optional magnetic pull (disabled for touch and reduced motion).
 */
export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(props, _ref) {
  const { variant = 'primary', size = 'md', magnetic, icon, iconRight, className, children, ...rest } = props
  const wrap = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotionPref()
  const active = magnetic && !reduced

  const onMove = (e: React.PointerEvent) => {
    if (!active || e.pointerType !== 'mouse' || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.28
    const y = (e.clientY - r.top - r.height / 2) * 0.4
    gsap.to(wrap.current, { x, y, duration: 0.6, ease: 'power3.out' })
  }
  const onLeave = () => {
    if (!active || !wrap.current) return
    gsap.to(wrap.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
  }

  const content = (
    <>
      {variant === 'primary' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
        />
      )}
      {icon && <span className="relative -ml-0.5 flex">{icon}</span>}
      <span className="relative">{children}</span>
      {iconRight && (
        <span className="relative -mr-0.5 flex transition-transform duration-300 group-hover/btn:translate-x-0.5">{iconRight}</span>
      )}
    </>
  )

  const cls = cn(base, variants[variant], sizes[size], className)

  let el: ReactNode
  if ('to' in rest && rest.to !== undefined) {
    const { to, onClick } = rest as AsLink
    el = <Link to={to} onClick={onClick} className={cls}>{content}</Link>
  } else if ('href' in rest && rest.href !== undefined) {
    const { href, onClick } = rest as AsAnchor
    el = <a href={href} onClick={onClick} className={cls}>{content}</a>
  } else {
    el = <button type="button" {...(rest as ComponentPropsWithoutRef<'button'>)} className={cls}>{content}</button>
  }

  return (
    <span ref={wrap} onPointerMove={onMove} onPointerLeave={onLeave} className="inline-flex will-change-transform">
      {el}
    </span>
  )
})
