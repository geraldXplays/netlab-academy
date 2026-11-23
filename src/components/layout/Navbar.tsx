import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n'
import { useUI } from '@/store/ui'
import { cn } from '@/lib/cn'
import { NAV_LINKS } from './navLinks'
import { LangToggle } from './LangToggle'
import { SettingsMenu } from './SettingsMenu'
import { IdentityPickerButton } from './IdentityPicker'
import { UserMenu } from './UserMenu'
import { useAuth } from '@/store/auth'

export function Navbar() {
  const { d } = useI18n()
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileMenu = useUI((s) => s.mobileMenu)
  const setMobileMenu = useUI((s) => s.setMobileMenu)
  const introDone = useUI((s) => s.introDone)
  const user = useAuth((s) => s.user)

  // Hide on scroll down, reveal on scroll up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    setHidden(y > 240 && y > prev && !mobileMenu)
  })

  useEffect(() => setMobileMenu(false), [pathname, setMobileMenu])

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-full bg-cyan px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {d.nav.skip}
      </a>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: introDone || !isLanding ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          aria-label="Main"
          className={cn(
            'mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full pr-2 pl-4 transition-[background,border-color,box-shadow] duration-500',
            scrolled || !isLanding ? 'glass-strong shadow-[var(--shadow)]' : 'border border-transparent',
          )}
        >
          <Link to="/" aria-label="NetLab Academy — home" className="rounded-full">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {NAV_LINKS.map(({ to, key }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn('relative block rounded-full px-3 py-2 text-sm transition-colors duration-300', isActive ? 'text-text' : 'text-muted hover:text-text')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full border border-cyan/30 bg-cyan-soft"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{d.nav[key]}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block">
              <LangToggle />
            </div>
            <div className="hidden items-center sm:flex">
              <IdentityPickerButton />
              <SettingsMenu />
            </div>
            {isLanding && !user ? (
              <div className="hidden md:block">
                <Button to="/dashboard" size="sm" iconRight={<ArrowRight size={15} />}>
                  {d.nav.start}
                </Button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <UserMenu />
              </div>
            )}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="grid h-10 w-10 place-items-center rounded-full text-text hover:bg-cyan-soft xl:hidden"
              aria-expanded={mobileMenu}
              aria-label={mobileMenu ? d.nav.close : d.nav.menu}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={String(mobileMenu)} initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>
      <MobileMenu />
    </>
  )
}

function MobileMenu() {
  const { d } = useI18n()
  const open = useUI((s) => s.mobileMenu)

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
          transition={{ duration: 0.7, ease: [0.85, 0, 0.15, 1] }}
          className="fixed inset-0 z-40 flex flex-col bg-bg/95 px-6 pt-28 pb-10 backdrop-blur-xl xl:hidden"
          data-lenis-prevent
        >
          <div className="bg-grid mask-radial pointer-events-none absolute inset-0" />
          <motion.ul
            className="relative flex flex-col gap-1"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
          >
            {NAV_LINKS.map(({ to, key, icon: Icon }, i) => (
              <motion.li key={to} variants={{ hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn('flex items-center gap-4 border-b border-line py-4 font-display text-3xl font-medium tracking-tight', isActive ? 'text-cyan' : 'text-text')
                  }
                >
                  <span className="font-mono text-xs text-dim">0{i + 1}</span>
                  <Icon size={22} className="text-muted" />
                  {d.nav[key]}
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            className="relative mt-auto flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
          >
            <LangToggle size="md" />
            <IdentityPickerButton />
            <SettingsMenu up />
            <div className="ml-auto"><UserMenu up /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
