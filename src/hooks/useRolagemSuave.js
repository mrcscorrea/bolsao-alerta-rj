import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'

/**
 * Rolagem suave (Lenis) para a página inteira, desligada com reduced-motion.
 * Também volta ao topo a cada troca de página.
 */
export function useRolagemSuave() {
  const reduzir = usePrefersReducedMotion()
  const { pathname } = useLocation()
  const lenisRef = useRef(null)

  useEffect(() => {
    if (reduzir) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 })
    lenisRef.current = lenis
    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduzir])

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])
}
