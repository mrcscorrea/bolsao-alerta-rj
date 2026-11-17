import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { FaixaBadge, Tendencia } from '../ui/FaixaBadge.jsx'
import { ReguaRisco } from '../ui/ReguaRisco.jsx'
import { Sparkline } from '../ui/Sparkline.jsx'
import styles from './ViaCard.module.css'

export function ViaCard({ via, destacada, onDestacar }) {
  const { atual } = via
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={styles.item}
    >
      <Link
        to={`/via/${via.id}`}
        className={styles.card}
        data-faixa={atual.faixa}
        data-destacada={destacada}
        onMouseEnter={() => onDestacar?.(via.id)}
        onMouseLeave={() => onDestacar?.(null)}
      >
        <div className={styles.topo}>
          <div>
            <h3 className={styles.via}>{via.via}</h3>
            <p className={styles.trecho}>{via.trecho}</p>
          </div>
          <FaixaBadge faixa={atual.faixa} />
        </div>

        <div className={styles.meio}>
          <p className={styles.risco}>
            <span className="mono">{Math.round(atual.risco)}</span>
            <small>/100</small>
          </p>
          <div className={styles.grafico}>
            <Sparkline leituras={via.leituras} altura={40} />
          </div>
        </div>

        <ReguaRisco risco={atual.risco} faixa={atual.faixa} compacta />

        <dl className={styles.medidas}>
          <div>
            <dt>Lâmina</dt>
            <dd className="mono">{atual.medidas.laminaCm.toFixed(1)} cm</dd>
          </div>
          <div>
            <dt>Chuva</dt>
            <dd className="mono">{atual.medidas.chuvaMmH.toFixed(1)} mm/h</dd>
          </div>
          <div>
            <dt>Tendência</dt>
            <dd>
              <Tendencia valor={via.tendencia} />
            </dd>
          </div>
        </dl>
      </Link>
    </motion.li>
  )
}
