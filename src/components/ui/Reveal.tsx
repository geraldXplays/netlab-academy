import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

const container: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

/** Staggered entrance for children wrapped in <RevealItem>. */
export function Reveal({ children, className, stagger = 0.08, as = 'div', once = true }: {
  children: ReactNode
  className?: string
  stagger?: number
  as?: 'div' | 'ul' | 'section'
  once?: boolean
}) {
  const reduced = useReducedMotionPref()
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      variants={container}
      custom={stagger}
      initial={reduced ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </Comp>
  )
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const Comp = motion[as]
  return (
    <Comp className={className} variants={revealItem}>
      {children}
    </Comp>
  )
}
