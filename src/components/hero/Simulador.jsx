import { useEffect, useRef, useState } from 'react'
import { FAIXAS, SENSORES } from '../../domain/config.js'
import { Leds } from '../ui/Leds.jsx'
import { ReguaRisco } from '../ui/ReguaRisco.jsx'
import styles from './Simulador.module.css'

const CENARIOS = [
  { nome: 'Pista seca', medidas: { laminaCm: 0, chuvaMmH: 0 } },
  { nome: 'Garoa', medidas: { laminaCm: 4, chuvaMmH: 8 } },
  { nome: 'Temporal', medidas: { laminaCm: 16, chuvaMmH: 45 } },
  { nome: 'Bolsão crítico', medidas: { laminaCm: 38, chuvaMmH: 58 } },
]

const MENSAGENS_LOG = {
  NORMAL: 'Via limpa. LED verde.',
  ATENCAO: 'Acúmulo de água iniciado. LED amarelo.',
  PERIGO: 'ALERTA: bolsão ativo, risco de calço hidráulico. LED vermelho + buzzer.',
}

/**
 * O circuito na tela: dois sliders fazem o papel do sensor ultrassônico e do
 * pluviômetro. A cada mudança de faixa, uma linha nova entra no log.
 */
export function Simulador({ simulador }) {
  const { medidas, risco, faixa, alterar, definir, somAtivo, setSomAtivo } = simulador
  const [log, setLog] = useState([])
  const ultimaFaixa = useRef(null)

  useEffect(() => {
    if (ultimaFaixa.current === faixa) return
    ultimaFaixa.current = faixa
    const hora = new Date().toLocaleTimeString('pt-BR')
    setLog((l) => [{ id: Date.now(), hora, faixa, risco, texto: MENSAGENS_LOG[faixa] }, ...l].slice(0, 4))
  }, [faixa, risco])

  return (
    <section className={styles.sim} data-faixa={faixa} aria-labelledby="sim-titulo">
      <div className={styles.topo}>
        <h2 id="sim-titulo" className="eyebrow">
          Simulador do sensor
        </h2>
        <button
          type="button"
          className={styles.som}
          aria-pressed={somAtivo}
          onClick={() => setSomAtivo(!somAtivo)}
        >
          {somAtivo ? 'Buzzer ligado' : 'Buzzer desligado'}
        </button>
      </div>

      <div className={styles.leitura}>
        <div>
          <p className={styles.risco}>
            <span className="mono">{risco.toFixed(1)}</span>
          </p>
          <p className={styles.riscoRotulo}>Índice de risco</p>
        </div>
        <div className={styles.estado}>
          <Leds faixa={faixa} />
          <p className={styles.faixaTitulo} aria-live="polite">
            {FAIXAS[faixa].titulo}
          </p>
        </div>
      </div>

      <ReguaRisco risco={risco} faixa={faixa} />

      {Object.entries(SENSORES).map(([chave, s]) => (
        <div key={chave} className={styles.controle}>
          <label htmlFor={`sim-${chave}`}>
            {s.rotulo}
            <output className="mono">
              {medidas[chave]} {s.unidade}
            </output>
          </label>
          <input
            id={`sim-${chave}`}
            type="range"
            min="0"
            max={chave === 'laminaCm' ? 60 : 80}
            step="1"
            value={medidas[chave]}
            onChange={(e) => alterar(chave, e.target.value)}
          />
        </div>
      ))}

      <div className={styles.cenarios} role="group" aria-label="Cenários prontos">
        {CENARIOS.map((c) => (
          <button key={c.nome} type="button" onClick={() => definir(c.medidas)}>
            {c.nome}
          </button>
        ))}
      </div>

      <ol className={styles.log} aria-label="Registro de eventos">
        {log.map((e) => (
          <li key={e.id} data-faixa={e.faixa}>
            <span className="mono">[{e.hora}]</span> <b>{FAIXAS[e.faixa].rotulo.toUpperCase()}</b> · risco{' '}
            {e.risco.toFixed(1)} · {e.texto}
          </li>
        ))}
      </ol>
    </section>
  )
}
