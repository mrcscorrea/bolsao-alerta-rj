import { useCallback, useEffect, useState } from 'react'

const CORES_BARRA = { dark: '#0E0F0C', light: '#EEEBE3' }

/** Modo claro/escuro: lê o tema aplicado no <html>, troca e salva a escolha. */
export function useTheme() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CORES_BARRA[tema])
    try {
      localStorage.setItem('tema', tema)
    } catch {
      // navegação privada: só não lembra a escolha
    }
  }, [tema])

  const alternarTema = useCallback(() => {
    setTema((atual) => (atual === 'dark' ? 'light' : 'dark'))
  }, [])

  return { tema, alternarTema }
}
