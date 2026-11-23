import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'

/** Gate for learner pages: unauthenticated visitors are sent to sign in, then returned. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const loc = useLocation()
  if (!ready) return null
  if (!user) {
    // During route transitions the exiting page can briefly see the new location; never bounce to /signin itself.
    const back = loc.pathname.startsWith('/signin') ? '/dashboard' : loc.pathname
    return <Navigate to={`/signin?next=${encodeURIComponent(back)}`} replace />
  }
  return <>{children}</>
}
