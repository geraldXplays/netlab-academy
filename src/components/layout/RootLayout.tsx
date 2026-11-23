import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Toaster } from './Toaster'
import { ScrollProgress } from './ScrollProgress'
import { Preloader } from './Preloader'
import { Backdrop } from '@/components/fx/Backdrop'
import { CursorFX } from '@/components/fx/CursorFX'
import { AchievementCelebration } from './AchievementCelebration'
import { useLenis } from '@/providers/SmoothScroll'
import { ScrollTrigger } from '@/lib/gsap'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

/**
 * App frame: navbar, animated route transitions, toasts.
 * Route changes play a scan-line sweep, reset scroll and refresh ScrollTrigger.
 */
export function RootLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const lenis = useLenis()
  const reduced = useReducedMotionPref()
  const onExitComplete = () => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  return (
    <>
      <Backdrop />
      <ScrollProgress />
      <Preloader />
      <Navbar />
      {/* Opacity only on <main>: a transform or filter here would break ScrollTrigger pins. */}
      <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="relative"
        >
          {!reduced && <RouteSweep />}
          {outlet}
        </motion.main>
      </AnimatePresence>
      {/* Lab workspaces are full-screen apps: no footer under the simulator. */}
      {!/^\/(labs|simulator)\/.+/.test(location.pathname) && <Footer />}
      <Toaster />
      <CursorFX />
      <AchievementCelebration />
    </>
  )
}

/** A luminous scan line that sweeps the viewport when a page enters. */
function RouteSweep() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[30vh] bg-gradient-to-b from-transparent via-cyan/10 to-transparent"
      initial={{ y: '-30vh', opacity: 1 }}
      animate={{ y: '110vh', opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-cyan/60 shadow-[0_0_14px_rgb(var(--cyan-rgb))]" />
    </motion.div>
  )
}
