import { useEffect, useState } from 'react'

/** Devolve o valor só depois que ele para de mudar por `atraso` ms (ex.: busca enquanto digita). */
export function useDebounce(valor, atraso = 300) {
  const [estavel, setEstavel] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setEstavel(valor), atraso)
    return () => clearTimeout(id)
  }, [valor, atraso])
  return estavel
}
