import { FAIXAS } from '../../domain/config.js'
import styles from './FaixaBadge.module.css'

export function FaixaBadge({ faixa, grande = false }) {
  return (
    <span className={`${styles.badge} ${grande ? styles.grande : ''}`} data-faixa={faixa}>
      <span className={styles.ponto} aria-hidden="true" />
      {FAIXAS[faixa].rotulo}
    </span>
  )
}

const SETAS = { PIORANDO: '↗', MELHORANDO: '↘', ESTAVEL: '→' }
const ROTULOS = { PIORANDO: 'Piorando', MELHORANDO: 'Melhorando', ESTAVEL: 'Estável' }

export function Tendencia({ valor }) {
  return (
    <span className={styles.tendencia} data-tendencia={valor}>
      <span aria-hidden="true">{SETAS[valor]}</span> {ROTULOS[valor]}
    </span>
  )
}
