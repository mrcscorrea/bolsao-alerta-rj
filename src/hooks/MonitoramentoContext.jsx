import { createContext, useContext } from 'react'
import { useMonitoramento } from './useMonitoramento.js'

const MonitoramentoContext = createContext(null)

/** Um único polling compartilhado pelo letreiro, painel e detalhe. */
export function MonitoramentoProvider({ children }) {
  const monitoramento = useMonitoramento()
  return <MonitoramentoContext.Provider value={monitoramento}>{children}</MonitoramentoContext.Provider>
}

export function useVias() {
  const ctx = useContext(MonitoramentoContext)
  if (!ctx) throw new Error('useVias precisa estar dentro de <MonitoramentoProvider>')
  return ctx
}

/** Dados de uma única via (ou null enquanto carrega / se não existir). */
export function useVia(id) {
  const { vias, carregando } = useVias()
  return { via: vias.find((v) => v.id === id) ?? null, carregando }
}
