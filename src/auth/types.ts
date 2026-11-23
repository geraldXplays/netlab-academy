export interface PublicUser {
  id: string
  name: string
  email: string
  createdAt: string
  color: number
}

export type AuthError =
  | 'invalid-email'
  | 'weak-password'
  | 'email-taken'
  | 'invalid-credentials'
  | 'name-required'
  | 'email-not-confirmed'
  | 'rate-limited'
  | 'network'
  | 'unknown'

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
