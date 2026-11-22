import { useRef } from 'react'
import { useCanvasScene, type SceneFactory } from './engine'

/** Turns a canvas SceneFactory into a React component. */
export function makeCanvasScene(factory: SceneFactory) {
  return function CanvasScene({ reduced, variant, className }: { reduced: boolean; variant?: string; className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null)
    useCanvasScene(ref, factory, { reduced, variant })
    return <canvas ref={ref} aria-hidden className={className} style={{ width: '100%', height: '100%', display: 'block' }} />
  }
}
