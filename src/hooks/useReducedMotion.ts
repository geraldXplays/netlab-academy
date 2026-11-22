import { useSyncExternalStore } from 'react'
import { useSettings } from '@/store/settings'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getSnapshot = () => window.matchMedia(query).matches

/** True when the user (OS or in-app setting) prefers reduced motion. */
export function useReducedMotionPref() {
  const pref = useSettings((s) => s.motion)
  const system = useSyncExternalStore(subscribe, getSnapshot, () => false)
  return pref === 'reduced' || (pref === 'system' && system)
}
