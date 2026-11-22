import { useSyncExternalStore } from 'react'

export function useMediaQuery(q: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(q)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(q).matches,
    () => false,
  )
}
