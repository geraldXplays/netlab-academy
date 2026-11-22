import type { StateStorage } from 'zustand/middleware'

/**
 * Persistence boundary. Everything the app saves goes through this adapter,
 * so swapping localStorage for a backend (e.g. Supabase) later only means
 * writing another StateStorage implementation — no component changes.
 */
const memory = new Map<string, string>()

export const localAdapter: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name)
    } catch {
      return memory.get(name) ?? null
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      memory.set(name, value)
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      memory.delete(name)
    }
  },
}

export const STORAGE_KEYS = {
  settings: 'netlab:settings',
  progress: 'netlab:progress',
} as const
