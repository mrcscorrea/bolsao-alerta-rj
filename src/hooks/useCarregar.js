import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Busca assíncrona com estado de carregando/erro e função para recarregar.
 * Usado pelas telas do fórum: useCarregar(() => forum.listarTopicos(via), [via]).
 * Se as dependências mudarem no meio de uma busca (ex.: trocar o filtro rápido),
 * só a resposta da busca mais recente entra na tela.
 */
export function useCarregar(buscar, dependencias) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const ultima = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(buscar, dependencias)

  const recarregar = useCallback(async () => {
    const numero = ++ultima.current
    setCarregando(true)
    try {
      const resultado = await executar()
      if (numero !== ultima.current) return
      setDados(resultado)
      setErro(null)
    } catch (e) {
      if (numero === ultima.current) setErro(e.message)
    } finally {
      if (numero === ultima.current) setCarregando(false)
    }
  }, [executar])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { dados, setDados, carregando, erro, recarregar }
}
