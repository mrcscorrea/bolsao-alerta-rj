import { useCallback, useEffect, useMemo, useState } from 'react'
import { buscarTodas, INTERVALO_MS } from '../services/leiturasService.js'
import { tendencia, piorFaixa } from '../domain/risco.js'

/** Busca todas as vias e atualiza a cada nova leitura (polling). */
export function useMonitoramento() {
  const [estado, setEstado] = useState({ vias: [], carregando: true, erro: null, atualizadoEm: null })

  const atualizar = useCallback(async () => {
    try {
      const resultados = await buscarTodas()
      const vias = resultados.map(({ via, leituras, fonte }) => ({
        ...via,
        leituras,
        fonte,
        atual: leituras.at(-1),
        tendencia: tendencia(leituras),
      }))
      setEstado({ vias, carregando: false, erro: null, atualizadoEm: new Date() })
    } catch (erro) {
      setEstado((anterior) => ({ ...anterior, carregando: false, erro: erro.message }))
    }
  }, [])

  useEffect(() => {
    atualizar()
    // aba escondida não consulta a API; ao voltar, atualiza na hora
    const id = setInterval(() => !document.hidden && atualizar(), INTERVALO_MS)
    const aoVoltar = () => !document.hidden && atualizar()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [atualizar])

  return useMemo(() => {
    const pior = piorFaixa(estado.vias.map((v) => v.atual.faixa))
    return { ...estado, pior, atualizar }
  }, [estado, atualizar])
}
