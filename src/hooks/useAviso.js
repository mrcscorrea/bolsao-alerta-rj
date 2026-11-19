import { useCallback, useEffect, useState } from 'react'

/** Mensagem curta de retorno ("Publicado.") que some sozinha em 4 s. */
export function useAviso() {
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(id)
  }, [aviso])

  const avisar = useCallback((texto, tipo = 'ok') => setAviso({ id: Date.now(), texto, tipo }), [])
  return { aviso, avisar, fechar: () => setAviso(null) }
}
