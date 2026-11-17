import { LIMITE_ATENCAO, LIMITE_PERIGO } from '../../domain/config.js'
import styles from './ReguaRisco.module.css'

/**
 * Régua do Índice de Risco (0 a 100), inspirada nas réguas de nível de
 * enchente: três zonas de cor e um marcador na leitura atual.
 */
export function ReguaRisco({ risco, faixa, compacta = false }) {
  return (
    <div
      className={`${styles.regua} ${compacta ? styles.compacta : ''}`}
      data-faixa={faixa}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={risco}
      aria-label="Índice de risco"
    >
      <div className={styles.zonas} aria-hidden="true">
        <span style={{ width: `${LIMITE_ATENCAO}%` }} data-zona="NORMAL" />
        <span style={{ width: `${LIMITE_PERIGO - LIMITE_ATENCAO}%` }} data-zona="ATENCAO" />
        <span style={{ width: `${100 - LIMITE_PERIGO}%` }} data-zona="PERIGO" />
      </div>
      <div className={styles.preenchido} style={{ transform: `scaleX(${risco / 100})` }} aria-hidden="true" />
      <div className={styles.marcador} style={{ left: `${risco}%` }} aria-hidden="true" />
      {!compacta && (
        <div className={styles.escala} aria-hidden="true">
          <span style={{ left: 0 }}>0</span>
          <span style={{ left: `${LIMITE_ATENCAO}%` }}>{LIMITE_ATENCAO}</span>
          <span style={{ left: `${LIMITE_PERIGO}%` }}>{LIMITE_PERIGO}</span>
          <span style={{ left: '100%' }}>100</span>
        </div>
      )}
    </div>
  )
}
