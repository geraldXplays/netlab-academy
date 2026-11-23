/**
 * Local (on-device) account adapter.
 *
 * Accounts live in this browser's storage; passwords are never stored, only a
 * PBKDF2-SHA256 hash with a per-account random salt. This protects against
 * casual snooping on a shared computer — it is NOT a substitute for a server.
 * The interface (signUp / signIn / session) is what a cloud adapter
 * (e.g. Supabase) would implement later, without touching the UI.
 */

export interface Account {
  id: string
  name: string
  email: string
  salt: string
  hash: string
  createdAt: string
  color: number
}

export type PublicUser = Pick<Account, 'id' | 'name' | 'email' | 'createdAt' | 'color'>

export type AuthError = 'invalid-email' | 'weak-password' | 'email-taken' | 'invalid-credentials' | 'name-required'

const ACCOUNTS = 'netlab:accounts'
const SESSION = 'netlab:session'

const read = (): Account[] => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS) || '[]')
  } catch {
    return []
  }
}
const write = (list: Account[]) => localStorage.setItem(ACCOUNTS, JSON.stringify(list))

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: 120_000 }, key, 256)
  return b64(bits)
}

export const toPublic = ({ id, name, email, createdAt, color }: Account): PublicUser => ({ id, name, email, createdAt, color })

export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

/** 0–4 strength estimate used by the sign-up meter. */
export function passwordStrength(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++
  return s
}

export function hasAccounts() {
  return read().length > 0
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<PublicUser> {
  const name = input.name.trim().slice(0, 32)
  const email = input.email.trim().toLowerCase()
  if (!name) throw 'name-required' as AuthError
  if (!isEmail(email)) throw 'invalid-email' as AuthError
  if (input.password.length < 8) throw 'weak-password' as AuthError
  const list = read()
  if (list.some((a) => a.email === email)) throw 'email-taken' as AuthError
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const account: Account = {
    id: crypto.randomUUID(),
    name,
    email,
    salt: b64(salt),
    hash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
    color: Math.floor(Math.random() * 360),
  }
  write([...list, account])
  return toPublic(account)
}

export async function signIn(emailRaw: string, password: string): Promise<PublicUser> {
  const email = emailRaw.trim().toLowerCase()
  const account = read().find((a) => a.email === email)
  // Hash even when the account is missing so timing does not reveal which emails exist.
  const hash = await hashPassword(password, account ? unb64(account.salt) : new Uint8Array(16))
  if (!account || hash !== account.hash) throw 'invalid-credentials' as AuthError
  return toPublic(account)
}

export function renameAccount(id: string, name: string) {
  const list = read()
  const a = list.find((x) => x.id === id)
  if (!a) return null
  a.name = name.trim().slice(0, 32) || a.name
  write(list)
  return toPublic(a)
}

/* ------------------------------ Session ------------------------------ */
/** "Remember me" → localStorage (survives restarts); otherwise sessionStorage (until the tab closes). */
export function saveSession(id: string, remember: boolean) {
  clearSession()
  ;(remember ? localStorage : sessionStorage).setItem(SESSION, id)
}

export function loadSession(): PublicUser | null {
  let id: string | null = null
  try {
    id = localStorage.getItem(SESSION) ?? sessionStorage.getItem(SESSION)
  } catch {
    return null
  }
  const a = id ? read().find((x) => x.id === id) : undefined
  return a ? toPublic(a) : null
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION)
    sessionStorage.removeItem(SESSION)
  } catch {
    /* ignore */
  }
}
