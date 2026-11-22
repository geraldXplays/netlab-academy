import { create } from 'zustand'

/** Ephemeral UI state (not persisted). */
interface UIState {
  /** True once the boot preloader has finished (or was skipped). */
  introDone: boolean
  setIntroDone: () => void
  mobileMenu: boolean
  setMobileMenu: (v: boolean) => void
}

export const useUI = create<UIState>()((set) => ({
  introDone: false,
  setIntroDone: () => set({ introDone: true }),
  mobileMenu: false,
  setMobileMenu: (mobileMenu) => set({ mobileMenu }),
}))
