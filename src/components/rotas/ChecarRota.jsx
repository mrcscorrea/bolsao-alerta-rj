import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ROTAS, avaliarRota } from '../../domain/rotas.js'
import { FaixaBadge } from '../ui/FaixaBadge.jsx'
import { MapaReal } from '../vias/MapaReal.jsx'
import styles from './ChecarRota.module.css'

/** "Posso sair agora?" — escolha um trajeto e veja o veredito na hora. */
export function ChecarRota({ vias, tema }) {
  const [rotaId, setRotaId] = useState(ROTAS[0].id)
  const [semMapa, setSemMapa] = useState(false)
  const rota = ROTAS.find((r) => r.id === rotaId)
  const resultado = vias.length ? avaliarRota(rota, vias) : null

  return (
    <div className={styles.checar}>
      <div className={styles.rotas} role="radiogroup" aria-label="Escolha seu trajeto">
        {ROTAS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={r.id === rotaId}
            className={styles.rota}
            onClick={() => setRotaId(r.id)}
          >
            <strong>{r.nome}</strong>
            <span>{r.via}</span>
          </button>
        ))}
      </div>

      {resultado && (
        <div className={styles.resultado} data-faixa={resultado.faixa} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${rotaId}-${resultado.faixa}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className={styles.veredito}>{resultado.titulo}</h3>
              <p className={styles.texto}>{resultado.texto}</p>
            </motion.div>
          </AnimatePresence>

          <ol className={styles.trajeto}>
            {resultado.pontos.map((p) => (
              <li key={p.id} data-faixa={p.atual.faixa}>
                <span className={styles.marco} aria-hidden="true" />
                <Link to={`/via/${p.id}`}>
                  <b>{p.via}</b> · {p.trecho}
                </Link>
                <span className="mono">{Math.round(p.atual.risco)}</span>
                <FaixaBadge faixa={p.atual.faixa} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {vias.length > 0 && !semMapa && (
        <div className={styles.mapa}>
          <MapaReal vias={vias} tema={tema} foco={rota.pontos} compacto onFalha={() => setSemMapa(true)} />
        </div>
      )}
    </div>
  )
}
