import { useCallback, useEffect, useState } from 'react'
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
    const id = setInterval(atualizar, INTERVALO_MS)
    return () => clearInterval(id)
  }, [atualizar])

  const pior = piorFaixa(estado.vias.map((v) => v.atual.faixa))
  return { ...estado, pior, atualizar }
}
