import { createClient, type SupportedStorage } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const REMEMBER = 'netlab:remember'

/** "Keep me signed in": session in localStorage (survives restarts) or sessionStorage (ends with the tab). */
export function setRemember(remember: boolean) {
  try {
    localStorage.setItem(REMEMBER, remember ? '1' : '0')
  } catch {
    /* ignore */
  }
}
const remembering = () => {
  try {
    return localStorage.getItem(REMEMBER) !== '0'
  } catch {
    return true
  }
}

const sessionStorageAdapter: SupportedStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k) ?? sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      if (remembering()) {
        localStorage.setItem(k, v)
        sessionStorage.removeItem(k)
      } else {
        sessionStorage.setItem(k, v)
        localStorage.removeItem(k)
      }
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export const supabase = createClient(url, key, {
  auth: { storage: sessionStorageAdapter, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
