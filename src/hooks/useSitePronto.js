import { useEffect, useState } from 'react'

/** true depois que a tela de carregamento sai (src/carregamento.js). */
export function useSitePronto() {
  const [pronto, setPronto] = useState(() => document.documentElement.classList.contains('pronto'))
  useEffect(() => {
    if (pronto) return
    const marcar = () => setPronto(true)
    window.addEventListener('site-pronto', marcar, { once: true })
    return () => window.removeEventListener('site-pronto', marcar)
  }, [pronto])
  return pronto
}
