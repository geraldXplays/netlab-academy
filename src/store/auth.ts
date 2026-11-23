import { create } from 'zustand'
import * as local from '@/auth/local'
import type { PublicUser } from '@/auth/local'
import { bindProgressToUser } from './progress'

interface AuthState {
  user: PublicUser | null
  ready: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  signUp: (name: string, email: string, password: string, remember: boolean) => Promise<void>
  signOut: () => Promise<void>
  rename: (name: string) => void
}

/** Session + account state. Each account's learning progress is stored separately. */
export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  ready: false,

  init: async () => {
    if (get().ready) return
    const user = local.loadSession()
    await bindProgressToUser(user?.id ?? null)
    set({ user, ready: true })
  },

  signIn: async (email, password, remember) => {
    const user = await local.signIn(email, password)
    local.saveSession(user.id, remember)
    await bindProgressToUser(user.id)
    set({ user })
  },

  signUp: async (name, email, password, remember) => {
    const first = !local.hasAccounts()
    const user = await local.signUp({ name, email, password })
    local.saveSession(user.id, remember)
    // The very first account on this device inherits any progress made before accounts existed.
    await bindProgressToUser(user.id, first)
    set({ user })
  },

  signOut: async () => {
    local.clearSession()
    await bindProgressToUser(null)
    set({ user: null })
  },

  rename: (name) => {
    const u = get().user
    if (!u) return
    const next = local.renameAccount(u.id, name)
    if (next) set({ user: next })
  },
}))
