import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useI18n } from '@/i18n'
import { NAV_LINKS } from './navLinks'

export function Footer() {
  const { d } = useI18n()
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 font-display text-lg text-text">{d.brand.tagline}</p>
          <p className="mt-1 text-sm text-muted">{d.footer.rights}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {NAV_LINKS.map(({ to, key }) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-cyan">{d.nav[key]}</Link>
              </li>
            ))}
            <li>
              <Link to="/design-system" className="transition-colors hover:text-cyan">{d.nav.designSystem}</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 font-mono text-[0.68rem] tracking-widest text-dim uppercase sm:px-8">
          <span>© {new Date().getFullYear()} NetLab Academy</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            {d.footer.phase}
          </span>
        </div>
      </div>
    </footer>
  )
}
