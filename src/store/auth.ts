import { create } from 'zustand'
import type { AuthError as SbAuthError, Session } from '@supabase/supabase-js'
import { supabase, setRemember } from '@/lib/supabase'
import type { AuthError, PublicUser } from '@/auth/types'
import { isEmail } from '@/auth/types'
import { anonymousProgress, clearAnonymousProgress, legacyProgressFor } from '@/auth/legacy'
import { bindProgressToUser, useProgress } from './progress'
import { mergeProgress, pullRemote, pushRemote, snapshot, startAutoSync, stopAutoSync } from './sync'

interface AuthState {
  user: PublicUser | null
  ready: boolean
  /** True while the user is completing a password-reset link. */
  recovery: boolean
  syncing: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  /** Resolves 'signed-in', or 'confirm-email' when the project requires email confirmation. */
  signUp: (name: string, email: string, password: string, remember: boolean) => Promise<'signed-in' | 'confirm-email'>
  signOut: () => Promise<void>
  rename: (name: string) => Promise<void>
  sendReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

function mapError(e: unknown): AuthError {
  const err = e as Partial<SbAuthError> & { message?: string; code?: string; status?: number }
  const code = err?.code ?? ''
  const msg = (err?.message ?? '').toLowerCase()
  if (code === 'invalid_credentials' || msg.includes('invalid login')) return 'invalid-credentials'
  if (code === 'user_already_exists' || msg.includes('already registered')) return 'email-taken'
  if (code === 'email_not_confirmed' || msg.includes('not confirmed')) return 'email-not-confirmed'
  if (code === 'weak_password' || msg.includes('password should')) return 'weak-password'
  if (code === 'email_address_invalid' || msg.includes('invalid email')) return 'invalid-email'
  if (code.startsWith('over_') || err?.status === 429) return 'rate-limited'
  if (msg.includes('fetch') || msg.includes('network')) return 'network'
  return 'unknown'
}

async function toPublic(session: Session): Promise<PublicUser> {
  const u = session.user
  const { data } = await supabase.from('profiles').select('name, color, created_at').eq('id', u.id).maybeSingle()
  return {
    id: u.id,
    email: u.email ?? '',
    name: data?.name || (u.user_metadata?.name as string) || (u.email ?? '').split('@')[0],
    color: data?.color ?? 200,
    createdAt: data?.created_at ?? u.created_at,
  }
}

let hydrating: Promise<void> | null = null
let hydratedFor: string | null = null

/** Load this user's progress: device cache ⊕ cloud ⊕ legacy local account ⊕ pre-account progress. */
async function hydrate(user: PublicUser) {
  if (hydratedFor === user.id) return
  if (hydrating) return hydrating
  hydrating = (async () => {
    useAuth.setState({ syncing: true })
    await bindProgressToUser(user.id)
    let merged = snapshot()
    try {
      const remote = await pullRemote(user.id)
      if (remote) merged = mergeProgress(merged, remote)
    } catch (e) {
      console.warn('[sync] pull failed — working from the device copy', e)
    }
    const legacy = legacyProgressFor(user.email)
    if (legacy) merged = mergeProgress(merged, legacy)
    const anon = anonymousProgress()
    if (anon) {
      merged = mergeProgress(merged, anon)
      clearAnonymousProgress()
    }
    useProgress.setState(merged)
    pushRemote(user.id, snapshot()).catch((e) => console.warn('[sync] initial push failed', e))
    startAutoSync(user.id)
    hydratedFor = user.id
    useAuth.setState({ syncing: false })
  })().finally(() => {
    hydrating = null
  })
  return hydrating
}

/** Accounts and sessions via Supabase Auth; progress syncs to Postgres. */
export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  ready: false,
  recovery: false,
  syncing: false,

  init: async () => {
    if (get().ready) return
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') set({ recovery: true })
      if (event === 'SIGNED_OUT') {
        stopAutoSync()
        hydratedFor = null
        set({ user: null })
      }
      // Sessions arriving from an email link (confirmation / recovery).
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session && get().user?.id !== session.user.id && get().ready) {
        setTimeout(async () => {
          const user = await toPublic(session)
          await hydrate(user)
          set({ user })
        })
      }
    })
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      const user = await toPublic(data.session)
      await hydrate(user)
      set({ user, ready: true })
    } else {
      await bindProgressToUser(null)
      set({ ready: true })
    }
  },

  signIn: async (email, password, remember) => {
    setRemember(remember)
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error || !data.session) throw mapError(error)
    const user = await toPublic(data.session)
    await hydrate(user)
    set({ user })
  },

  signUp: async (name, email, password, remember) => {
    const n = name.trim()
    const e = email.trim().toLowerCase()
    if (!n) throw 'name-required' as AuthError
    if (!isEmail(e)) throw 'invalid-email' as AuthError
    if (password.length < 8) throw 'weak-password' as AuthError
    setRemember(remember)
    const { data, error } = await supabase.auth.signUp({
      email: e,
      password,
      options: { data: { name: n.slice(0, 40) }, emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}dashboard` },
    })
    if (error) throw mapError(error)
    // With email confirmation on, Supabase returns a user without a session.
    if (!data.session) return 'confirm-email'
    const user = await toPublic(data.session)
    await hydrate(user)
    set({ user })
    return 'signed-in'
  },

  signOut: async () => {
    stopAutoSync()
    hydratedFor = null
    await supabase.auth.signOut()
    await bindProgressToUser(null)
    set({ user: null })
  },

  rename: async (name) => {
    const u = get().user
    const n = name.trim().slice(0, 40)
    if (!u || !n) return
    set({ user: { ...u, name: n } })
    await supabase.from('profiles').update({ name: n, updated_at: new Date().toISOString() }).eq('id', u.id)
    await supabase.auth.updateUser({ data: { name: n } })
  },

  sendReset: async (email) => {
    if (!isEmail(email.trim())) throw 'invalid-email' as AuthError
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset` })
    if (error) throw mapError(error)
  },

  updatePassword: async (password) => {
    if (password.length < 8) throw 'weak-password' as AuthError
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw mapError(error)
    set({ recovery: false })
  },
}))
