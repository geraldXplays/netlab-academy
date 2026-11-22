import { lazy, type ComponentType } from 'react'
import type { SceneKey } from '@/themes/identities'
import { makeCanvasScene } from './CanvasScene'
import type { SceneFactory } from './engine'

export interface SceneProps {
  reduced: boolean
  variant?: string
  className?: string
  theme?: 'dark' | 'light'
}

const canvas = (load: () => Promise<{ default: SceneFactory }>) =>
  lazy(async () => ({ default: makeCanvasScene((await load()).default) as ComponentType<SceneProps> }))

/** Every hero scene, code-split so only the active identity's scene downloads. */
export const SCENES: Record<SceneKey, ComponentType<SceneProps>> = {
  globe: lazy(() => import('../NetworkGlobe') as Promise<{ default: ComponentType<SceneProps> }>),
  voxel: lazy(() => import('./VoxelScene') as Promise<{ default: ComponentType<SceneProps> }>),
  bubbles: canvas(() => import('./bubbles')),
  city: canvas(() => import('./city')),
  gummies: canvas(() => import('./gummies')),
  silk: canvas(() => import('./silk')),
  synthwave: canvas(() => import('./synthwave')),
  academia: canvas(() => import('./academia')),
  sakura: canvas(() => import('./sakura')),
  solarpunk: canvas(() => import('./solarpunk')),
  space: canvas(() => import('./space')),
}
