import { supabase } from '@/lib/supabase'
import { useProgress, fresh, type ProgressData } from './progress'

/* ------------------------------------------------------------------
   Cloud sync for learner progress.
   The whole progress document lives in public.progress (one row per user,
   protected by row-level security). Devices merge instead of overwriting,
   so working on a laptop and a phone never loses anything.
------------------------------------------------------------------- */

const later = (a?: string | null, b?: string | null) => ((a ?? '') > (b ?? '') ? a : b)
const maxRec = (a: Record<string, number> = {}, b: Record<string, number> = {}) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v)
  return out
}
const earliest = (a: Record<string, string> = {}, b: Record<string, string> = {}) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = out[k] && out[k] < v ? out[k] : v
  return out
}

/** Union-style merge: nothing earned on either side is ever lost. */
export function mergeProgress(a: Partial<ProgressData>, b: Partial<ProgressData>): ProgressData {
  const base = fresh()
  const A = { ...base, ...a } as ProgressData
  const B = { ...base, ...b } as ProgressData

  const activity: ProgressData['activity'] = { ...A.activity }
  for (const [day, counts] of Object.entries(B.activity)) {
    const cur = { ...activity[day] }
    for (const [k, v] of Object.entries(counts)) cur[k as keyof typeof cur] = Math.max(cur[k as keyof typeof cur] ?? 0, v ?? 0)
    activity[day] = cur
  }
  const claimed: ProgressData['claimedMissions'] = { ...A.claimedMissions }
  for (const [day, ids] of Object.entries(B.claimedMissions)) claimed[day] = [...new Set([...(claimed[day] ?? []), ...ids])]

  const lessonState: ProgressData['lessonState'] = { ...A.lessonState }
  for (const [id, st] of Object.entries(B.lessonState)) {
    const cur = lessonState[id]
    if (!cur) lessonState[id] = st
    else {
      const newer = st.updated > cur.updated ? st : cur
      lessonState[id] = { ...newer, best: Math.max(cur.best, st.best), attempts: Math.max(cur.attempts, st.attempts), checks: { ...cur.checks, ...st.checks } }
    }
  }

  const assessments: ProgressData['assessments'] = { ...A.assessments }
  for (const [id, r] of Object.entries(B.assessments)) {
    const cur = assessments[id]
    if (!cur) assessments[id] = r
    else {
      const history = [...cur.history, ...r.history].sort((x, y) => x.at.localeCompare(y.at)).filter((h, i, arr) => i === 0 || h.at !== arr[i - 1].at).slice(-20)
      assessments[id] = {
        best: Math.max(cur.best, r.best),
        last: r.lastAt > cur.lastAt ? r.last : cur.last,
        attempts: Math.max(cur.attempts, r.attempts),
        passed: cur.passed || r.passed,
        lastAt: later(cur.lastAt, r.lastAt)!,
        history,
      }
    }
  }

  const topicStats: ProgressData['topicStats'] = { ...A.topicStats }
  for (const [k, v] of Object.entries(B.topicStats)) {
    const cur = topicStats[k]
    topicStats[k] = !cur || v.seen > cur.seen ? v : cur
  }

  const streakA = A.streak
  const streakB = B.streak
  const streak = (streakB.last ?? '') > (streakA.last ?? '') ? { ...streakB, best: Math.max(streakA.best, streakB.best) } : { ...streakA, best: Math.max(streakA.best, streakB.best) }

  return {
    ...A,
    callsign: A.callsign || B.callsign,
    createdAt: A.createdAt < B.createdAt ? A.createdAt : B.createdAt,
    xp: Math.max(A.xp, B.xp),
    completedLessons: earliest(A.completedLessons, B.completedLessons),
    achievements: earliest(A.achievements, B.achievements),
    skills: maxRec(A.skills, B.skills),
    activity,
    claimedMissions: claimed,
    streak,
    isDemo: A.isDemo && B.isDemo,
    lessonState,
    lastLesson: A.lastLesson ?? B.lastLesson,
    bookmarks: [...new Set([...A.bookmarks, ...B.bookmarks])],
    assessments,
    topicStats,
    tagCounts: maxRec(A.tagCounts, B.tagCounts),
    certificates: { ...B.certificates, ...A.certificates },
  }
}

/** Strip action functions: only plain data goes to the database. */
export function snapshot(): ProgressData {
  const s = useProgress.getState() as unknown as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(fresh())) out[k] = s[k]
  return out as unknown as ProgressData
}

export async function pullRemote(userId: string): Promise<ProgressData | null> {
  const { data, error } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return (data?.data as ProgressData) ?? null
}

export async function pushRemote(userId: string, data: ProgressData) {
  const { error } = await supabase.from('progress').upsert({ user_id: userId, data, updated_at: new Date().toISOString() })
  if (error) throw error
}

let unsubscribe: (() => void) | null = null
let timer = 0
let activeUser: string | null = null

/** Push local changes to the cloud, debounced; flush when the tab is hidden. */
export function startAutoSync(userId: string) {
  stopAutoSync()
  activeUser = userId
  const flush = () => {
    window.clearTimeout(timer)
    timer = 0
    if (activeUser) pushRemote(activeUser, snapshot()).catch((e) => console.warn('[sync] push failed', e))
  }
  unsubscribe = useProgress.subscribe(() => {
    window.clearTimeout(timer)
    timer = window.setTimeout(flush, 1500)
  })
  const onHide = () => document.visibilityState === 'hidden' && timer && flush()
  document.addEventListener('visibilitychange', onHide)
  const prev = unsubscribe
  unsubscribe = () => {
    prev()
    document.removeEventListener('visibilitychange', onHide)
    if (timer) flush()
  }
}

export function stopAutoSync() {
  unsubscribe?.()
  unsubscribe = null
  activeUser = null
}
