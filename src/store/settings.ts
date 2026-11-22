import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { localAdapter, STORAGE_KEYS } from '@/lib/storage'
import type { Lang } from '@/content/types'
import type { IdentityId } from '@/themes/identities'
import { applyIdentity } from '@/themes/apply'

export type Theme = 'dark' | 'light'
export type MotionPref = 'system' | 'full' | 'reduced'

interface SettingsState {
  theme: Theme
  lang: Lang
  motion: MotionPref
  identity: IdentityId
  /** Switch identity, keeping the current light/dark mode. */
  setIdentity: (id: IdentityId) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setLang: (l: Lang) => void
  setMotion: (m: MotionPref) => void
}

const initialLang = (): Lang =>
  typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: initialLang(),
      motion: 'system',
      identity: 'netlab',
      setIdentity: (identity) => {
        // Keep the learner's own dark/light choice across identities.
        applyIdentity(identity, get().theme)
        set({ identity })
      },
      setTheme: (theme) => {
        applyIdentity(get().identity, theme)
        set({ theme })
      },
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setLang: (lang) => set({ lang }),
      setMotion: (motion) => set({ motion }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => localAdapter),
      partialize: ({ theme, lang, motion, identity }) => ({ theme, lang, motion, identity }),
    },
  ),
)
