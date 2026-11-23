import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import App from './App'
import { reloadForNewVersion } from './pages/RouteError'

// Vite fires this when a lazily-loaded chunk can't be fetched (stale tab after a deploy).
window.addEventListener('vite:preloadError', (e) => {
  if (reloadForNewVersion()) e.preventDefault()
})

// Lessons offer their own "resume where you left off"; let the app manage scroll.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
