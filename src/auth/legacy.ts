import type { ProgressData } from '@/store/progress'

/**
 * Before cloud accounts, accounts lived only in this browser. When someone
 * signs in to the cloud with the same email, we fold that old progress in.
 */
export function legacyProgressFor(email: string): Partial<ProgressData> | null {
  try {
    const accounts = JSON.parse(localStorage.getItem('netlab:accounts') || '[]') as { id: string; email: string }[]
    const acc = accounts.find((a) => a.email === email.toLowerCase())
    if (!acc) return null
    const raw = localStorage.getItem(`netlab:progress:${acc.id}`)
    return raw ? (JSON.parse(raw).state as Partial<ProgressData>) : null
  } catch {
    return null
  }
}

export function anonymousProgress(): Partial<ProgressData> | null {
  try {
    const raw = localStorage.getItem('netlab:progress')
    return raw ? (JSON.parse(raw).state as Partial<ProgressData>) : null
  } catch {
    return null
  }
}

export function clearAnonymousProgress() {
  try {
    localStorage.removeItem('netlab:progress')
  } catch {
    /* ignore */
  }
}
