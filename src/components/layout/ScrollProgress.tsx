import { motion, useScroll, useSpring } from 'motion/react'

/** Thin luminous bar showing page scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-cyan via-blue to-purple shadow-[0_0_12px_rgb(34_211_238/0.7)]"
    />
  )
}
