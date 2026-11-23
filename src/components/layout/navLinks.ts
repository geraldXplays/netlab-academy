import { Award, BookOpen, FlaskConical, LayoutDashboard, LibraryBig, MonitorCog } from 'lucide-react'

export const NAV_LINKS = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/academy', key: 'academy', icon: BookOpen },
  { to: '/assessments', key: 'assessments', icon: Award },
  { to: '/labs', key: 'labs', icon: FlaskConical },
  { to: '/simulator', key: 'simulator', icon: MonitorCog },
  { to: '/dictionary', key: 'dictionary', icon: LibraryBig },
] as const
