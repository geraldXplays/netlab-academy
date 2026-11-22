import { create } from 'zustand'
import type { L } from '@/content/types'

export type Toast =
  | { id: number; type: 'xp'; amount: number; reason: L }
  | { id: number; type: 'achievement'; achievementId: string }
  | { id: number; type: 'info'; title: string; body?: string }
  | { id: number; type: 'levelup'; level: number }

type NewToast = Toast extends infer T ? (T extends Toast ? Omit<T, 'id'> : never) : never

interface NotificationState {
  toasts: Toast[]
  push: (t: NewToast) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useNotifications = create<NotificationState>()((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id } as Toast] }))
    const ttl = t.type === 'achievement' || t.type === 'levelup' ? 5200 : 3200
    window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), ttl)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))
