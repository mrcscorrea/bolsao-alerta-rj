import { FAIXAS, SENSORES } from '../../domain/config.js'
import { Leds } from '../ui/Leds.jsx'
import styles from './Simulador.module.css'

const CENARIOS = [
  { nome: 'Pista seca', medidas: { laminaCm: 0, chuvaMmH: 0 } },
  { nome: 'Garoa', medidas: { laminaCm: 4, chuvaMmH: 8 } },
  { nome: 'Temporal', medidas: { laminaCm: 16, chuvaMmH: 45 } },
  { nome: 'Bolsão', medidas: { laminaCm: 38, chuvaMmH: 58 } },
]

const MARCAS = [40, 30, 20, 10, 0]

/**
 * Régua linimétrica: a mesma régua de nível que se vê pintada em pilares de
 * ponte e margens de rio. A água sobe até a lâmina medida pelo sensor.
 */
export function Regua({ simulador }) {
  const { medidas, risco, faixa } = simulador
  // a altura da água vem de --n, definida no hero (0 a 1)
  return (
    <div className={styles.regua} data-faixa={faixa}>
      <div className={styles.haste} aria-hidden="true">
        {MARCAS.map((cm) => (
          <span key={cm} style={{ bottom: `${(cm / 40) * 100}%` }}>
            {cm}
          </span>
        ))}
        <div className={styles.aguaRegua} />
      </div>
      <div className={styles.leitura} aria-live="polite">
        <p className={styles.cm}>
          {medidas.laminaCm}
          <small>cm</small>
        </p>
        <p className={styles.estado}>{FAIXAS[faixa].titulo}</p>
        <p className={styles.detalhe}>
          Índice de risco <b>{risco.toFixed(1)}</b>
        </p>
        <Leds faixa={faixa} />
      </div>
    </div>
  )
}

/** Os dois "sensores" do circuito viram sliders; os cenários são atalhos. */
export function SimuladorControles({ simulador }) {
  const { medidas, faixa, alterar, definir, somAtivo, setSomAtivo } = simulador

  return (
    <section className={styles.controles} data-faixa={faixa} aria-label="Simule o sensor">
      {Object.entries(SENSORES).map(([chave, s]) => (
        <div key={chave} className={styles.controle}>
          <label htmlFor={`sim-${chave}`}>
            {s.rotulo}
            <output>
              {medidas[chave]} {s.unidade}
            </output>
          </label>
          <input
            id={`sim-${chave}`}
            type="range"
            min={s.min}
            max={s.max}
            step="1"
            value={medidas[chave]}
            onChange={(e) => alterar(chave, e.target.value)}
            style={{ '--p': `${(medidas[chave] / s.max) * 100}%` }}
          />
        </div>
      ))}

      <div className={styles.cenarios} role="group" aria-label="Cenários prontos">
        {CENARIOS.map((c) => (
          <button key={c.nome} type="button" className="onda" onClick={() => definir(c.medidas)}>
            {c.nome}
          </button>
        ))}
        <button type="button" className={`${styles.som} onda`} aria-pressed={somAtivo} onClick={() => setSomAtivo(!somAtivo)}>
          {somAtivo ? 'Som ligado' : 'Ligar som'}
        </button>
      </div>
    </section>
  )
}
