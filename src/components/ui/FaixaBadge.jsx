import { FAIXAS } from '../../domain/config.js'
import styles from './FaixaBadge.module.css'

/** Nome da faixa escrito na cor dela. Sem caixinha: a cor e a palavra bastam. */
export function FaixaBadge({ faixa }) {
  return (
    <span className={styles.faixa} data-faixa={faixa}>
      {FAIXAS[faixa].rotulo}
    </span>
  )
}

const ROTULOS = { PIORANDO: 'subindo', MELHORANDO: 'baixando', ESTAVEL: 'estável' }

/** Tendência das últimas leituras, em palavra: "água subindo", "água estável"... */
export function Tendencia({ valor }) {
  return (
    <span className={styles.tendencia} data-tendencia={valor}>
      água {ROTULOS[valor]}
    </span>
  )
}
