import { LIMITE_ATENCAO, LIMITE_PERIGO } from '../../domain/config.js'
import styles from './Sparkline.module.css'

/** Mini gráfico SVG do índice de risco ao longo do tempo (sem biblioteca). */
export function Sparkline({ leituras, altura = 48, detalhado = false }) {
  const largura = 240
  if (leituras.length < 2) return null

  const x = (i) => (i / (leituras.length - 1)) * largura
  const y = (risco) => altura - (risco / 100) * altura
  const pontos = leituras.map((l, i) => `${x(i).toFixed(1)},${y(l.risco).toFixed(1)}`).join(' ')
  const area = `0,${altura} ${pontos} ${largura},${altura}`
  const ultima = leituras.at(-1)

  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      data-faixa={ultima.faixa}
      role="img"
      aria-label={`Índice de risco nas últimas ${leituras.length} leituras, atual ${ultima.risco}`}
    >
      {detalhado && (
        <>
          <rect x="0" y="0" width={largura} height={y(LIMITE_PERIGO)} className={styles.zonaPerigo} />
          <rect
            x="0"
            y={y(LIMITE_PERIGO)}
            width={largura}
            height={y(LIMITE_ATENCAO) - y(LIMITE_PERIGO)}
            className={styles.zonaAtencao}
          />
        </>
      )}
      <line x1="0" x2={largura} y1={y(LIMITE_ATENCAO)} y2={y(LIMITE_ATENCAO)} className={styles.limite} />
      <line x1="0" x2={largura} y1={y(LIMITE_PERIGO)} y2={y(LIMITE_PERIGO)} className={styles.limite} />
      <polygon points={area} className={styles.area} />
      <polyline points={pontos} className={styles.linha} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
