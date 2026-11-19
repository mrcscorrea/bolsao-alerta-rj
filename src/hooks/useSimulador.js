import { useEffect, useRef, useState } from 'react'
import { calcularRisco, classificarFaixa } from '../domain/risco.js'
import { tocarAlarme } from '../services/buzzer.js'

/** Os dois "sensores" do circuito, controlados por sliders na página. */
export function useSimulador(inicial = { laminaCm: 16, chuvaMmH: 45 }) {
  const [medidas, setMedidas] = useState(inicial)
  const [somAtivo, setSomAtivo] = useState(false)
  const risco = calcularRisco(medidas)
  const faixa = classificarFaixa(risco)
  const faixaAnterior = useRef(faixa)

  // dispara o buzzer só quando ENTRA em perigo, como o circuito real
  useEffect(() => {
    if (faixa === 'PERIGO' && faixaAnterior.current !== 'PERIGO' && somAtivo) tocarAlarme()
    faixaAnterior.current = faixa
  }, [faixa, somAtivo])

  const alterar = (chave, valor) => setMedidas((m) => ({ ...m, [chave]: Number(valor) }))
  const definir = (novas) => setMedidas(novas)

  return { medidas, risco, faixa, alterar, definir, somAtivo, setSomAtivo }
}
