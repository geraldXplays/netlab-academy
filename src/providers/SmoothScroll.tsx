import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

const LenisContext = createContext<Lenis | null>(null)
export const useLenis = () => useContext(LenisContext)

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so Lenis and ScrollTrigger
 * read the same frame. Disabled entirely under reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionPref()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), autoRaf: false })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

/** Scroll helper that works with or without Lenis. */
export function useScrollTo() {
  const lenis = useLenis()
  return (target: string | number | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) => {
    if (lenis) lenis.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.6 })
    else if (typeof target === 'number') window.scrollTo({ top: target })
    else {
      const el = typeof target === 'string' ? document.querySelector(target) : target
      el?.scrollIntoView()
    }
  }
}
