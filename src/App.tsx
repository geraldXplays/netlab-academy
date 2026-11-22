import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { applyIdentity } from '@/themes/apply'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { SmoothScroll } from '@/providers/SmoothScroll'
import { useSettings } from '@/store/settings'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { MotionConfig } from 'motion/react'
import Landing from '@/pages/Landing'

// Secondary routes are code-split.
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ComingSoon = lazy(() => import('@/pages/ComingSoon'))
const DesignSystem = lazy(() => import('@/pages/DesignSystem'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const Loading = () => (
  <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
    <div className="skeleton h-12 w-72 rounded-xl" />
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-52 rounded-3xl" />)}
    </div>
  </div>
)

const s = (el: React.ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/dashboard', element: s(<Dashboard />) },
      { path: '/academy', element: s(<ComingSoon section="academy" />) },
      { path: '/labs', element: s(<ComingSoon section="labs" />) },
      { path: '/simulator', element: s(<ComingSoon section="simulator" />) },
      { path: '/dictionary', element: s(<ComingSoon section="dictionary" />) },
      { path: '/design-system', element: s(<DesignSystem />) },
      { path: '*', element: s(<NotFound />) },
    ],
  },
])

/** Mirrors settings onto <html> so CSS tokens and the motion guard follow them. */
function SettingsSync() {
  const theme = useSettings((st) => st.theme)
  const lang = useSettings((st) => st.lang)
  const identity = useSettings((st) => st.identity)
  const reduced = useReducedMotionPref()
  useLayoutEffect(() => applyIdentity(identity, theme), [identity, theme])
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dataset.motion = reduced ? 'reduced' : 'full'
  }, [lang, reduced])
  return null
}

export default function App() {
  const reduced = useReducedMotionPref()
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <SettingsSync />
      <SmoothScroll>
        <RouterProvider router={router} />
      </SmoothScroll>
    </MotionConfig>
  )
}
