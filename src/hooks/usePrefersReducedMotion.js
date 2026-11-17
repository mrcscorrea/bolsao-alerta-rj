import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion() {
  const [reduzir, setReduzir] = useState(() => matchMedia(CONSULTA).matches)
  useEffect(() => {
    const mq = matchMedia(CONSULTA)
    const aoMudar = () => setReduzir(mq.matches)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])
  return reduzir
}
