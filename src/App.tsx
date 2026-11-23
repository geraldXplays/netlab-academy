import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { applyIdentity } from '@/themes/apply'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { SmoothScroll } from '@/providers/SmoothScroll'
import { useSettings } from '@/store/settings'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { MotionConfig } from 'motion/react'
import Landing from '@/pages/Landing'
import RouteError from '@/pages/RouteError'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { useAuth } from '@/store/auth'

// Secondary routes are code-split.
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ComingSoon = lazy(() => import('@/pages/ComingSoon'))
const DesignSystem = lazy(() => import('@/pages/DesignSystem'))
const AcademyPage = lazy(() => import('@/pages/AcademyPage'))
const LessonPage = lazy(() => import('@/pages/LessonPage'))
const SignInPage = lazy(() => import('@/pages/SignInPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const AssessmentsPage = lazy(() => import('@/pages/AssessmentsPage'))
const ExamPage = lazy(() => import('@/pages/ExamPage'))
const PracticePage = lazy(() => import('@/pages/PracticePage'))
const CertificatePage = lazy(() => import('@/pages/CertificatePage'))
const LabsPage = lazy(() => import('@/pages/LabsPage'))
const LabPage = lazy(() => import('@/pages/LabPage'))
const OpsPage = lazy(() => import('@/pages/OpsPage'))
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
/** Learner-only route: lazy + signed-in. */
const p = (el: React.ReactNode) => s(<RequireAuth>{el}</RequireAuth>)

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/signin', element: s(<SignInPage />) },
      { path: '/reset', element: s(<ResetPasswordPage />) },
      { path: '/dashboard', element: p(<Dashboard />) },
      { path: '/academy', element: p(<AcademyPage />) },
      { path: '/academy/:levelId', element: p(<AcademyPage />) },
      { path: '/learn/:lessonId', element: p(<LessonPage />) },
      { path: '/assessments', element: p(<AssessmentsPage />) },
      { path: '/assessments/:id', element: p(<ExamPage />) },
      { path: '/practice/:mode', element: p(<PracticePage />) },
      { path: '/certificate/:levelId', element: p(<CertificatePage />) },
      { path: '/labs', element: p(<LabsPage />) },
      { path: '/labs/:id', element: p(<LabPage />) },
      { path: '/simulator', element: p(<OpsPage />) },
      { path: '/simulator/:id', element: p(<OpsPage />) },
      { path: '/dictionary', element: s(<ComingSoon section="dictionary" />) },
      { path: '/design-system', element: s(<DesignSystem />) },
      { path: '*', element: s(<NotFound />) },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })

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
  const initAuth = useAuth((st) => st.init)
  useEffect(() => {
    void initAuth()
  }, [initAuth])
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <SettingsSync />
      <SmoothScroll>
        <RouterProvider router={router} />
      </SmoothScroll>
    </MotionConfig>
  )
}
