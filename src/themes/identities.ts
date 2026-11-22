import type { L } from '@/content/types'

/**
 * Visual identities. Each one is pure data: two palettes (dark/light),
 * a font pairing, the hero scene to render and the cursor-trail style.
 * Colour roles keep their historical token names:
 *   a1 → --cyan  (primary accent, buttons, links)
 *   a2 → --blue  (secondary accent)
 *   a3 → --purple (tertiary / gradient end)
 */

export type Mode = 'dark' | 'light'
export type SceneKey = 'globe' | 'bubbles' | 'city' | 'gummies' | 'silk' | 'synthwave' | 'academia' | 'voxel' | 'sakura' | 'solarpunk' | 'space'
export type CursorStyle = 'spark' | 'bubble' | 'neon' | 'candy' | 'minimal' | 'retro' | 'ink' | 'pixel' | 'petal' | 'leaf' | 'star'

export interface Palette {
  bg: string
  bg2: string
  bg3: string
  /** rgba surface for glass panels */
  surface: string
  text: string
  muted: string
  dim: string
  a1: string
  a2: string
  a3: string
  success?: string
  warning?: string
  danger?: string
}

export interface Identity {
  id: IdentityId
  group: 'core' | 'identity' | 'fusion'
  name: L
  feeling: L
  native: Mode
  fonts: { display: string; body: string }
  scene: SceneKey
  /** Scene-specific variant flag (e.g. fusions reuse a scene with a twist). */
  variant?: string
  /** 'side' = scene sits to the right of the headline; 'full' = full-bleed backdrop. */
  layout: 'side' | 'full'
  cursor: CursorStyle
  palettes: Record<Mode, Palette>
}

export type IdentityId =
  | 'netlab' | 'aero' | 'cyberpunk' | 'candy' | 'apple' | 'synthwave' | 'academia' | 'voxel' | 'anime' | 'solarpunk' | 'space'
  | 'aero-apple' | 'cyber-space' | 'candy-3d' | 'solar-aero' | 'academia-apple'

const F = {
  grotesk: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif",
  inter: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
  nunito: "'Nunito Variable', ui-rounded, system-ui, sans-serif",
  orbitron: "'Orbitron Variable', 'Space Grotesk Variable', sans-serif",
  fredoka: "'Fredoka Variable', ui-rounded, system-ui, sans-serif",
  audiowide: "'Audiowide', 'Orbitron Variable', sans-serif",
  cormorant: "'Cormorant Garamond Variable', Georgia, serif",
  garamond: "'EB Garamond Variable', Georgia, serif",
  silkscreen: "'Silkscreen', 'JetBrains Mono Variable', monospace",
  zendots: "'Zen Dots', 'Orbitron Variable', sans-serif",
  outfit: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif",
  exo: "'Exo 2 Variable', ui-sans-serif, system-ui, sans-serif",
}

export const IDENTITIES: Identity[] = [
  {
    id: 'netlab', group: 'core', native: 'dark', scene: 'globe', layout: 'side', cursor: 'spark',
    name: { en: 'NetLab Core', fr: 'NetLab Core' },
    feeling: { en: 'The original cyber-futuristic control centre.', fr: 'Le centre de contrôle cyber-futuriste original.' },
    fonts: { display: F.grotesk, body: F.inter },
    palettes: {
      dark: { bg: '#03060d', bg2: '#060b18', bg3: '#0a1224', surface: 'rgb(13 22 43 / 0.55)', text: '#eef4ff', muted: '#9fb0cc', dim: '#62728f', a1: '#22d3ee', a2: '#3b82f6', a3: '#a855f7' },
      light: { bg: '#f3f6fb', bg2: '#e9eef7', bg3: '#dde5f2', surface: 'rgb(255 255 255 / 0.68)', text: '#0a1428', muted: '#44546f', dim: '#7a879d', a1: '#0891b2', a2: '#2563eb', a3: '#7c3aed' },
    },
  },
  {
    id: 'aero', group: 'identity', native: 'light', scene: 'bubbles', layout: 'full', cursor: 'bubble',
    name: { en: 'Frutiger Aero', fr: 'Frutiger Aero' },
    feeling: { en: 'Blue skies, glossy bubbles, glass and green hills. Optimistic, refreshing, nostalgic.', fr: 'Ciel bleu, bulles brillantes, verre et collines vertes. Optimiste, frais, nostalgique.' },
    fonts: { display: F.nunito, body: F.nunito },
    palettes: {
      light: { bg: '#e6f5ff', bg2: '#d4eefc', bg3: '#bfe4f8', surface: 'rgb(255 255 255 / 0.55)', text: '#0b3550', muted: '#3a6a86', dim: '#6f97ad', a1: '#0284c7', a2: '#16a34a', a3: '#06b6d4' },
      dark: { bg: '#031a2b', bg2: '#052438', bg3: '#0a3350', surface: 'rgb(10 60 95 / 0.45)', text: '#e6f7ff', muted: '#9cc9e2', dim: '#5f8ba5', a1: '#38bdf8', a2: '#4ade80', a3: '#22d3ee' },
    },
  },
  {
    id: 'cyberpunk', group: 'identity', native: 'dark', scene: 'city', layout: 'full', cursor: 'neon',
    name: { en: 'Cyberpunk 2077', fr: 'Cyberpunk 2077' },
    feeling: { en: 'Neon pink, electric blue, holograms. An underground tech lab.', fr: 'Rose néon, bleu électrique, hologrammes. Un labo tech clandestin.' },
    fonts: { display: F.orbitron, body: F.inter },
    palettes: {
      dark: { bg: '#07040d', bg2: '#0d0618', bg3: '#160a26', surface: 'rgb(30 10 45 / 0.55)', text: '#f5f0ff', muted: '#b7a6cf', dim: '#76668f', a1: '#00e5ff', a2: '#b026ff', a3: '#ff2a6d' },
      light: { bg: '#f6f1ff', bg2: '#ede3fb', bg3: '#e0d2f5', surface: 'rgb(255 255 255 / 0.6)', text: '#1a0b2e', muted: '#4f3d6b', dim: '#8574a0', a1: '#0090b0', a2: '#8a1fd6', a3: '#e0115a' },
    },
  },
  {
    id: 'candy', group: 'identity', native: 'light', scene: 'gummies', layout: 'side', cursor: 'candy',
    name: { en: 'Candy Land', fr: 'Candy Land' },
    feeling: { en: 'Pastels, gummy buttons, playful bounce. Learning that feels like a game.', fr: 'Pastels, boutons gummy, rebonds ludiques. Apprendre comme on joue.' },
    fonts: { display: F.fredoka, body: F.nunito },
    palettes: {
      light: { bg: '#fff5fa', bg2: '#fde8f3', bg3: '#f8dcef', surface: 'rgb(255 255 255 / 0.7)', text: '#4a2340', muted: '#8a5c7d', dim: '#b893ad', a1: '#ff5fae', a2: '#a78bfa', a3: '#2fcf9f' },
      dark: { bg: '#1e1027', bg2: '#281535', bg3: '#341c45', surface: 'rgb(60 30 80 / 0.55)', text: '#ffeefa', muted: '#d8b4d0', dim: '#9a7a96', a1: '#ff8fc8', a2: '#c4b5fd', a3: '#6ee7c5' },
    },
  },
  {
    id: 'apple', group: 'identity', native: 'light', scene: 'silk', layout: 'full', cursor: 'minimal',
    name: { en: 'Apple Minimalism', fr: 'Minimalisme Apple' },
    feeling: { en: 'White, silver, big type, cinematic calm. Premium attention to detail.', fr: 'Blanc, argent, grande typo, calme cinématique. Le soin du détail.' },
    fonts: { display: F.inter, body: F.inter },
    palettes: {
      light: { bg: '#fbfbfd', bg2: '#f5f5f7', bg3: '#e8e8ed', surface: 'rgb(255 255 255 / 0.78)', text: '#1d1d1f', muted: '#515154', dim: '#86868b', a1: '#0071e3', a2: '#2997ff', a3: '#6e6e73' },
      dark: { bg: '#000000', bg2: '#0a0a0b', bg3: '#1d1d1f', surface: 'rgb(29 29 31 / 0.72)', text: '#f5f5f7', muted: '#a1a1a6', dim: '#6e6e73', a1: '#2997ff', a2: '#64d2ff', a3: '#a1a1a6' },
    },
  },
  {
    id: 'synthwave', group: 'identity', native: 'dark', scene: 'synthwave', layout: 'full', cursor: 'retro',
    name: { en: 'Synthwave', fr: 'Synthwave' },
    feeling: { en: 'Purple sunsets, retro grids, chrome type. The future imagined in the 80s.', fr: 'Couchers violets, grilles rétro, typo chrome. Le futur rêvé dans les années 80.' },
    fonts: { display: F.audiowide, body: F.inter },
    palettes: {
      dark: { bg: '#120326', bg2: '#1b0638', bg3: '#260a4a', surface: 'rgb(45 12 80 / 0.5)', text: '#fff0f8', muted: '#d9a8d6', dim: '#9070a0', a1: '#ffb347', a2: '#ff3cac', a3: '#7b2ff7' },
      light: { bg: '#fff3e8', bg2: '#ffe4d1', bg3: '#fdd0c0', surface: 'rgb(255 255 255 / 0.6)', text: '#2b0b3f', muted: '#6b3b73', dim: '#a07aa6', a1: '#ea580c', a2: '#db2777', a3: '#7c3aed' },
    },
  },
  {
    id: 'academia', group: 'identity', native: 'dark', scene: 'academia', layout: 'side', cursor: 'ink',
    name: { en: 'Dark Academia', fr: 'Dark Academia' },
    feeling: { en: 'Burgundy, cream, antique gold, editorial serif. An exclusive academy.', fr: 'Bordeaux, crème, or antique, serif éditorial. Une académie d’exception.' },
    fonts: { display: F.cormorant, body: F.garamond },
    palettes: {
      dark: { bg: '#1a1210', bg2: '#221714', bg3: '#2d1f1a', surface: 'rgb(50 34 28 / 0.6)', text: '#f1e6d2', muted: '#c9b79a', dim: '#8c7a62', a1: '#c9a14a', a2: '#a33a48', a3: '#e0c27a' },
      light: { bg: '#f4ecdc', bg2: '#ebdfc8', bg3: '#dfcfb1', surface: 'rgb(255 250 240 / 0.7)', text: '#2a1a14', muted: '#5c4636', dim: '#8f7a66', a1: '#8b2635', a2: '#a67c2e', a3: '#5a3e2b' },
    },
  },
  {
    id: 'voxel', group: 'identity', native: 'light', scene: 'voxel', layout: 'side', cursor: 'pixel',
    name: { en: 'Voxel World', fr: 'Monde Voxel' },
    feeling: { en: 'Blocky islands, tiny servers, pixels. Build your IT universe block by block.', fr: 'Îles en cubes, mini-serveurs, pixels. Construisez votre univers IT bloc par bloc.' },
    fonts: { display: F.silkscreen, body: F.inter },
    palettes: {
      light: { bg: '#dff1ff', bg2: '#cfe8fb', bg3: '#bcdcf5', surface: 'rgb(255 255 255 / 0.8)', text: '#1b2433', muted: '#44506a', dim: '#7a859b', a1: '#2f9e44', a2: '#1c7ed6', a3: '#e67700' },
      dark: { bg: '#0b1020', bg2: '#121a30', bg3: '#1a2542', surface: 'rgb(25 35 60 / 0.78)', text: '#eef2ff', muted: '#a5b0cc', dim: '#6b7690', a1: '#5ee05e', a2: '#4cc9f0', a3: '#ffb703' },
    },
  },
  {
    id: 'anime', group: 'identity', native: 'dark', scene: 'sakura', layout: 'full', cursor: 'petal',
    name: { en: 'Neo-Tokyo Anime', fr: 'Néo-Tokyo Anime' },
    feeling: { en: 'Electric blue, violet, cherry blossoms. A dramatic animated universe.', fr: 'Bleu électrique, violet, cerisiers. Un univers animé spectaculaire.' },
    fonts: { display: F.zendots, body: F.nunito },
    palettes: {
      dark: { bg: '#070b1f', bg2: '#0c1230', bg3: '#141b45', surface: 'rgb(20 28 70 / 0.55)', text: '#f2f4ff', muted: '#aeb6e0', dim: '#6c74a0', a1: '#3d8bff', a2: '#8b5cf6', a3: '#ff8fb7' },
      light: { bg: '#fff6fa', bg2: '#f3eefe', bg3: '#e6e2fb', surface: 'rgb(255 255 255 / 0.65)', text: '#141838', muted: '#4a4f7a', dim: '#8a8eb0', a1: '#2563eb', a2: '#7c3aed', a3: '#ec4899' },
    },
  },
  {
    id: 'solarpunk', group: 'identity', native: 'light', scene: 'solarpunk', layout: 'full', cursor: 'leaf',
    name: { en: 'Solarpunk', fr: 'Solarpunk' },
    feeling: { en: 'Emerald, sunlight, organic shapes. Technology and nature together.', fr: 'Émeraude, soleil, formes organiques. Technologie et nature réunies.' },
    fonts: { display: F.outfit, body: F.outfit },
    palettes: {
      light: { bg: '#fbf8ec', bg2: '#f1f0da', bg3: '#e3e8c8', surface: 'rgb(255 255 245 / 0.7)', text: '#1f3324', muted: '#4b6650', dim: '#82977f', a1: '#0f9d58', a2: '#d99a00', a3: '#2bb3a3' },
      dark: { bg: '#0c1a12', bg2: '#11241a', bg3: '#183222', surface: 'rgb(20 45 30 / 0.55)', text: '#f3f7e6', muted: '#b9cca8', dim: '#7a8f70', a1: '#34d399', a2: '#facc15', a3: '#5eead4' },
    },
  },
  {
    id: 'space', group: 'identity', native: 'dark', scene: 'space', layout: 'side', cursor: 'star',
    name: { en: 'Space Exploration', fr: 'Exploration spatiale' },
    feeling: { en: 'Deep space, planets, orbits. Every level is a new world to explore.', fr: 'Espace profond, planètes, orbites. Chaque niveau est un monde à explorer.' },
    fonts: { display: F.exo, body: F.inter },
    palettes: {
      dark: { bg: '#02030a', bg2: '#070a18', bg3: '#0d1226', surface: 'rgb(15 20 40 / 0.55)', text: '#eef3ff', muted: '#a3add0', dim: '#646f94', a1: '#ff8a3d', a2: '#3da5ff', a3: '#9b7bff' },
      light: { bg: '#eef3fb', bg2: '#e1e9f6', bg3: '#d2dcee', surface: 'rgb(255 255 255 / 0.65)', text: '#0b1530', muted: '#3e4c6e', dim: '#7b88a6', a1: '#ea580c', a2: '#2563eb', a3: '#7c3aed' },
    },
  },

  /* ------------------------------ Fusions ------------------------------ */
  {
    id: 'aero-apple', group: 'fusion', native: 'light', scene: 'bubbles', variant: 'clean', layout: 'full', cursor: 'bubble',
    name: { en: 'Aero × Apple', fr: 'Aero × Apple' },
    feeling: { en: 'Clean, glossy, premium.', fr: 'Épuré, brillant, premium.' },
    fonts: { display: F.inter, body: F.inter },
    palettes: {
      light: { bg: '#f7fbff', bg2: '#eef5fb', bg3: '#e2ecf6', surface: 'rgb(255 255 255 / 0.72)', text: '#0d2235', muted: '#4b6175', dim: '#8798aa', a1: '#0a84ff', a2: '#30c48d', a3: '#5ac8fa' },
      dark: { bg: '#050d16', bg2: '#0b1622', bg3: '#13212f', surface: 'rgb(20 35 52 / 0.6)', text: '#f2f8ff', muted: '#a9bacb', dim: '#6c7d8f', a1: '#3aa0ff', a2: '#4fd8a5', a3: '#7dd8ff' },
    },
  },
  {
    id: 'cyber-space', group: 'fusion', native: 'dark', scene: 'space', variant: 'neon', layout: 'side', cursor: 'neon',
    name: { en: 'Cyberpunk × Space', fr: 'Cyberpunk × Espace' },
    feeling: { en: 'Immersive, futuristic.', fr: 'Immersif, futuriste.' },
    fonts: { display: F.orbitron, body: F.inter },
    palettes: {
      dark: { bg: '#03020a', bg2: '#090620', bg3: '#120a30', surface: 'rgb(25 12 55 / 0.55)', text: '#f4f0ff', muted: '#b5a9d8', dim: '#6f6494', a1: '#00e5ff', a2: '#ff2a6d', a3: '#b026ff' },
      light: { bg: '#f4f1ff', bg2: '#e9e3fb', bg3: '#dcd2f5', surface: 'rgb(255 255 255 / 0.6)', text: '#140a2e', muted: '#4a3d6b', dim: '#8274a0', a1: '#0090b0', a2: '#e0115a', a3: '#8a1fd6' },
    },
  },
  {
    id: 'candy-3d', group: 'fusion', native: 'light', scene: 'gummies', variant: '3d', layout: 'side', cursor: 'candy',
    name: { en: 'Candy × 3D', fr: 'Candy × 3D' },
    feeling: { en: 'Playful, colourful, memorable.', fr: 'Ludique, coloré, mémorable.' },
    fonts: { display: F.fredoka, body: F.nunito },
    palettes: {
      light: { bg: '#fff0f7', bg2: '#ffe2f0', bg3: '#fbd3e9', surface: 'rgb(255 255 255 / 0.75)', text: '#3d1736', muted: '#7d4b70', dim: '#b08aa6', a1: '#ff3d9a', a2: '#7c6cff', a3: '#14c79a' },
      dark: { bg: '#1a0b24', bg2: '#251033', bg3: '#321645', surface: 'rgb(60 25 85 / 0.55)', text: '#ffeefa', muted: '#dcb0d6', dim: '#9a7596', a1: '#ff6ab5', a2: '#a99bff', a3: '#3fe0b5' },
    },
  },
  {
    id: 'solar-aero', group: 'fusion', native: 'light', scene: 'solarpunk', variant: 'bubbles', layout: 'full', cursor: 'leaf',
    name: { en: 'Solarpunk × Aero', fr: 'Solarpunk × Aero' },
    feeling: { en: 'Bright, natural, futuristic.', fr: 'Lumineux, naturel, futuriste.' },
    fonts: { display: F.nunito, body: F.nunito },
    palettes: {
      light: { bg: '#f2fbf4', bg2: '#e3f5ea', bg3: '#d0ecdc', surface: 'rgb(255 255 255 / 0.62)', text: '#0e3324', muted: '#3f6655', dim: '#789a89', a1: '#0d9f6e', a2: '#0ea5e9', a3: '#d99a00' },
      dark: { bg: '#04150f', bg2: '#082019', bg3: '#0e2d22', surface: 'rgb(15 50 38 / 0.5)', text: '#eefcf3', muted: '#a6d3bd', dim: '#6c9483', a1: '#34d399', a2: '#38bdf8', a3: '#facc15' },
    },
  },
  {
    id: 'academia-apple', group: 'fusion', native: 'light', scene: 'academia', variant: 'minimal', layout: 'side', cursor: 'minimal',
    name: { en: 'Academia × Apple', fr: 'Academia × Apple' },
    feeling: { en: 'Sophisticated, professional.', fr: 'Sophistiqué, professionnel.' },
    fonts: { display: F.cormorant, body: F.inter },
    palettes: {
      light: { bg: '#faf7f2', bg2: '#f2ece2', bg3: '#e7ded0', surface: 'rgb(255 255 255 / 0.75)', text: '#1c1714', muted: '#5a4f47', dim: '#948a80', a1: '#7a1f2b', a2: '#9c7a3c', a3: '#3b322c' },
      dark: { bg: '#0f0c0b', bg2: '#171311', bg3: '#221c19', surface: 'rgb(34 28 25 / 0.65)', text: '#f3ece2', muted: '#bfb3a3', dim: '#7d7268', a1: '#d4b06a', a2: '#a33a48', a3: '#e8dcc7' },
    },
  },
]

export const identityById = (id: string) => IDENTITIES.find((i) => i.id === id) ?? IDENTITIES[0]
