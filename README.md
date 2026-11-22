# NetLab Academy

**Build. Connect. Configure. Master.**

An immersive networking and IT-infrastructure training platform, from absolute beginner to professional infrastructure engineer.

## Status: Phase 2 (learning platform)

| Phase | Scope | Status |
|---|---|---|
| 1 | Design system, landing page, navigation, motion system, dashboard | ✅ Done |
| 2 | Learning paths, modules, lessons, progress tracking | ✅ Level 1 complete (20 lessons, EN/FR) |
| 3 | Quizzes, exams, XP and achievements, skill progression | Next |
| 4 | Practical labs | — |
| 5 | IT Operations Simulator | — |
| 6 | AI tutor, technical dictionary, interactive topology explorer | — |

## Stack

- **Vite + React 19 + TypeScript**, **Tailwind CSS v4**
- **GSAP + ScrollTrigger** for scroll storytelling (pinning, horizontal scroll, scrubbed timelines)
- **Lenis** for smooth scrolling, driven by GSAP's ticker so it stays in sync with ScrollTrigger
- **Motion** for UI-level animation (page transitions, panels, modals, toasts, progress)
- **Three.js** for the hero network globe (lazy-loaded, paused when off-screen)
- **Zustand** stores, persisted through a swappable storage adapter (`src/lib/storage.ts`)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and build for production
```

## Project structure

```
src/
  content/       Learning content and data (curriculum, achievements, missions…) — no UI code
  i18n/          en.ts / fr.ts UI dictionaries + useI18n() hook (fr is type-checked against en)
  store/         settings (theme, language, motion), progress (XP, lessons, streaks), notifications
  lib/           gsap setup, storage adapter, XP curve, date helpers
  providers/     SmoothScroll (Lenis ↔ ScrollTrigger)
  components/
    ui/          Design-system primitives: Button, SpotlightCard, ProgressRing, Segmented…
    fx/          NetworkGlobe (Three.js), ParticleField (canvas), Backdrop
    layout/      Navbar, settings menu, EN/FR toggle, preloader, toasts, footer
    dashboard/   Dashboard widgets
  sections/      Landing-page sections
  pages/         Route components
```

## Learning content

- Lessons are pure data in `src/content/lessons/l1/*.ts` (bilingual `{ en, fr }` via the `t()` helper).
  Each lesson: objectives, blocks (text, callout, diagram, example, code, table, knowledge check), vocabulary, "on the job" practice and a final quiz.
- A lesson is completed only by passing its final quiz (≥ 75 %). That awards XP and raises the matching skill's mastery.
- Diagrams: `src/components/diagrams/` — animated SVGs keyed by name (`DiagramKey`).
- Adding a lesson: write it in a content file, add it to `src/content/lessons/index.ts`, and make sure the module's `lessonCount` in `curriculum.ts` matches.
- Progress (reading position, checks, best score, bookmarks, last lesson) is saved per lesson so learners resume where they left off.

## Visual identities

16 switchable looks (palette button in the navbar), each with dark and light palettes, its own fonts,
shapes, an animated hero scene and a cursor-trail style:

| Identity | Hero scene |
|---|---|
| NetLab Core (default) | Three.js network globe |
| Frutiger Aero | Sky, aurora ribbons, glossy hills, rising bubbles |
| Cyberpunk 2077 | Neon skyline, signs, rain, hologram, glitch |
| Candy Land | Bouncing jelly gummies with faces, sprinkles |
| Apple Minimalism | Soft orb and hairline silk waves |
| Synthwave | Striped sunset, wireframe mountains, neon grid |
| Dark Academia | Gold astrolabe with levels I–VI and an inked network |
| Voxel World | Three.js block island with server racks, LEDs, packets |
| Neo-Tokyo Anime | Moon, lattice tower, light streaks, sakura petals |
| Solarpunk | Sun rays, plant-covered towers, turbines, growing vines |
| Space Exploration | Six planets (L1–L6) orbiting a star |
| Fusions | Aero×Apple, Cyberpunk×Space, Candy×3D, Solarpunk×Aero, Academia×Apple |

- Definitions: `src/themes/identities.ts` (pure data). Variables: `src/themes/apply.ts`. Shapes/textures: `src/styles/identities.css`.
- Scenes: `src/components/fx/scenes/` — each is lazy-loaded, paused off-screen and static under reduced motion.
- Theme / identity switches use a View Transition circular reveal from the click point.
- Cursor layer (`CursorFX`): ring cursor, themed trail and click sparks; fine pointers only.

## Key decisions

- **Progress is saved in the browser** (localStorage), behind a `StateStorage` adapter, so a backend such as Supabase can be added later without changing components.
- **Language:** the EN/FR toggle in the navbar switches every UI string and content field instantly. Content uses `{ en, fr }` objects.
- **Reduced motion:** honours the OS setting, overridable in Settings → Motion. When reduced, Lenis, pinning and scrubbing are disabled and every section renders fully static.
- **Mastery is earned:** XP, badges and skill mastery only come from activity (lessons, quizzes, labs, incidents), never from opening a page. The dashboard offers a demo profile so you can preview it populated.
- **Pinning caveat:** `<main>` animates opacity only during route transitions. A transform or filter on an ancestor would break ScrollTrigger pins.

Visit `/design-system` to see every token and component.
