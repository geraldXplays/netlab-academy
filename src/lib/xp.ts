/**
 * XP curve: reaching level L requires 50·L·(L−1) total XP.
 * L2 = 100, L3 = 300, L4 = 600, L5 = 1000 … gentle early, steeper later.
 */
export const xpForLevel = (level: number) => 50 * level * (level - 1)

export function levelFromXp(xp: number) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  return {
    level,
    intoLevel: xp - floor,
    needed: ceil - floor,
    progress: (xp - floor) / (ceil - floor),
    toNext: ceil - xp,
  }
}

/** Rank title keys (translated in i18n under `ranks`). */
const RANKS = ['trainee', 'apprentice', 'technician', 'specialist', 'administrator', 'engineer', 'architect'] as const
export type RankKey = (typeof RANKS)[number]
export const rankForLevel = (level: number): RankKey =>
  RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))]
