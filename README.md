# NetLab Academy

**Build. Connect. Configure. Master.**

An immersive networking and IT-infrastructure training platform, from absolute beginner to professional infrastructure engineer.

## Status: Phase 1 (visual foundation)

| Phase | Scope | Status |
|---|---|---|
| 1 | Design system, landing page, navigation, motion system, dashboard | ✅ Done |
| 2 | Learning paths, modules, lessons, progress tracking | Next |
| 3 | Quizzes, exams, XP and achievements, skill progression | — |
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

## Key decisions

- **Progress is saved in the browser** (localStorage), behind a `StateStorage` adapter, so a backend such as Supabase can be added later without changing components.
- **Language:** the EN/FR toggle in the navbar switches every UI string and content field instantly. Content uses `{ en, fr }` objects.
- **Reduced motion:** honours the OS setting, overridable in Settings → Motion. When reduced, Lenis, pinning and scrubbing are disabled and every section renders fully static.
- **Mastery is earned:** XP, badges and skill mastery only come from activity (lessons, quizzes, labs, incidents), never from opening a page. The dashboard offers a demo profile so you can preview it populated.
- **Pinning caveat:** `<main>` animates opacity only during route transitions. A transform or filter on an ancestor would break ScrollTrigger pins.

Visit `/design-system` to see every token and component.
