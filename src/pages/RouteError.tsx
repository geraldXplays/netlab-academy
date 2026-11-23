import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { RefreshCw, Home } from 'lucide-react'

const RELOAD_KEY = 'netlab:chunk-reload'

/** True for the errors browsers throw when a lazily-loaded file no longer exists (after a new deploy). */
export const isChunkError = (e: unknown) =>
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to fetch|ChunkLoadError/i.test(String((e as Error)?.message ?? e))

/** Reload once to pick up the new version; never loop. */
export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 15_000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
  window.location.reload()
  return true
}

/** Friendly replacement for React Router's default error screen. */
export default function RouteError() {
  const error = useRouteError()
  const chunk = isChunkError(error)
  const fr = typeof document !== 'undefined' && document.documentElement.lang === 'fr'

  useEffect(() => {
    if (chunk) reloadForNewVersion()
  }, [chunk])

  return (
    <div className="grid min-h-[100svh] place-items-center bg-bg px-6 text-center text-text">
      <div className="max-w-md">
        <p className="font-mono text-sm text-cyan">{chunk ? 'UPDATE' : 'ERROR'}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          {chunk ? (fr ? 'Une nouvelle version est disponible' : 'A new version is available') : fr ? 'Quelque chose s’est mal passé' : 'Something went wrong'}
        </h1>
        <p className="mt-3 text-muted">
          {chunk
            ? fr ? 'NetLab a été mis à jour pendant que la page était ouverte. Rechargez pour continuer — votre progression est enregistrée.' : 'NetLab was updated while this page was open. Reload to continue — your progress is saved.'
            : fr ? 'Rechargez la page. Si le problème persiste, revenez à l’accueil.' : 'Reload the page. If it keeps happening, go back home.'}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-full bg-cyan px-5 py-2.5 font-semibold text-on-accent">
            <RefreshCw size={16} /> {fr ? 'Recharger' : 'Reload'}
          </button>
          <a href="/" className="flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-muted hover:text-text">
            <Home size={16} /> {fr ? 'Accueil' : 'Home'}
          </a>
        </div>
      </div>
    </div>
  )
}
