import { useNavigate } from 'react-router-dom'
import { TRACADOS } from '../../domain/vias.js'
import { FAIXAS } from '../../domain/config.js'
import styles from './MapaVias.module.css'

const POS_ROTULO = {
  acima: { dx: 0, dy: -18, anchor: 'middle' },
  abaixo: { dx: 0, dy: 28, anchor: 'middle' },
  esquerda: { dx: -16, dy: 5, anchor: 'end' },
  direita: { dx: 16, dy: 5, anchor: 'start' },
}

/** Diagrama esquemático das vias expressas, no estilo de mapa de metrô. */
export function MapaVias({ vias, destacada, onDestacar }) {
  const navegar = useNavigate()

  return (
    <figure className={styles.mapa}>
      <svg viewBox="80 30 760 480" role="group" aria-label="Mapa esquemático das vias monitoradas">
        {/* Baía de Guanabara */}
        <path d="M760 30 H840 V510 H770 L770 420 L800 360 L760 300 L790 220 L740 150 Z" className={styles.baia} />
        <text x="812" y="160" className={styles.baiaRotulo} transform="rotate(90 812 160)">
          BAÍA DE GUANABARA
        </text>

        {TRACADOS.map((t) => (
          <g key={t.id}>
            <path d={t.d} className={styles.via} />
            <path d={t.d} className={styles.viaFaixa} />
          </g>
        ))}

        <text x="150" y="190" className={styles.nomeVia}>AV. BRASIL</text>
        <text x="634" y="200" textAnchor="end" className={styles.nomeVia}>L. VERMELHA</text>
        <text x="300" y="470" className={styles.nomeVia}>L. AMARELA</text>
        <text x="760" y="347" className={styles.nomeCentro}>CENTRO</text>

        {vias.map((v) => {
          const pos = POS_ROTULO[v.rotulo]
          const faixa = v.atual.faixa
          const ativo = destacada === v.id
          return (
            <g
              key={v.id}
              className={styles.ponto}
              data-faixa={faixa}
              data-ativo={ativo}
              transform={`translate(${v.x} ${v.y})`}
              tabIndex={0}
              role="link"
              aria-label={`${v.via}, ${v.trecho}: ${FAIXAS[faixa].rotulo}, risco ${v.atual.risco}`}
              onClick={() => navegar(`/via/${v.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navegar(`/via/${v.id}`)}
              onMouseEnter={() => onDestacar?.(v.id)}
              onMouseLeave={() => onDestacar?.(null)}
              onFocus={() => onDestacar?.(v.id)}
              onBlur={() => onDestacar?.(null)}
            >
              {faixa === 'PERIGO' && <circle r="10" className={styles.onda} />}
              <circle r="16" className={styles.alvo} />
              <circle r="9" className={styles.estacao} />
              <circle r="4" className={styles.miolo} />
              <text x={pos.dx} y={pos.dy} textAnchor={pos.anchor} className={styles.rotulo}>
                {v.trecho.split(' · ')[0]}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className={styles.legenda}>
        Esquema fora de escala. Toque em um ponto para ver o histórico.
      </figcaption>
    </figure>
  )
}
