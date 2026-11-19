import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { FaixaBadge, Tendencia } from '../ui/FaixaBadge.jsx'
import styles from './ViaCard.module.css'

function ViaCardBase({ via, destacada, onDestacar }) {
  const { atual } = via
  return (
    // layout: quando a ordem muda (mais arriscada primeiro), o card desliza para o novo lugar
    <motion.li layout transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className={styles.item}>
      <Link
        to={`/via/${via.id}`}
        className={styles.card}
        data-faixa={atual.faixa}
        data-destacada={destacada}
        onMouseEnter={() => onDestacar?.(via.id)}
        onMouseLeave={() => onDestacar?.(null)}
      >
        <div>
          <h3 className={styles.via}>{via.via}</h3>
          <p className={styles.trecho}>{via.trecho}</p>
        </div>
        <p className={styles.risco}>
          <span className="mono">{Math.round(atual.risco)}</span>
          <FaixaBadge faixa={atual.faixa} />
        </p>
        <p className={styles.medidas}>
          {atual.medidas.laminaCm.toFixed(1)} cm de lâmina, {atual.medidas.chuvaMmH.toFixed(1)} mm/h de chuva,{' '}
          <Tendencia valor={via.tendencia} />
        </p>
      </Link>
    </motion.li>
  )
}

/** Só redesenha quando chega leitura nova ou muda o destaque (o polling recria os objetos a cada 10 s). */
export const ViaCard = memo(
  ViaCardBase,
  (a, b) =>
    a.destacada === b.destacada &&
    a.onDestacar === b.onDestacar &&
    a.via.atual.id === b.via.atual.id &&
    a.via.atual.faixa === b.via.atual.faixa &&
    a.via.tendencia === b.via.tendencia,
)
