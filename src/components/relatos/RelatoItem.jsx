import { useState } from 'react'
import { motion } from 'motion/react'
import { buscarVia } from '../../domain/vias.js'
import { classificarProfundidade, tempoRelativo } from '../../domain/relatos.js'
import styles from './RelatoItem.module.css'

export function RelatoItem({ relato, emEdicao, onEditar, onRemover }) {
  const [confirmando, setConfirmando] = useState(false)
  const via = buscarVia(relato.viaId)
  const prof = classificarProfundidade(relato.profundidadeCm)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: relato.pendente ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={styles.item}
      data-faixa={prof.faixa}
      data-editando={emEdicao}
    >
      <div className={styles.profundidade} aria-label={`${relato.profundidadeCm} centímetros`}>
        <span className="mono">{relato.profundidadeCm}</span>
        <small>cm</small>
        <span className={styles.agua} style={{ height: `${Math.min(100, relato.profundidadeCm)}%` }} aria-hidden="true" />
      </div>

      <div className={styles.corpo}>
        <p className={styles.local}>
          {via ? `${via.via} · ${via.trecho}` : 'Ponto removido'}
        </p>
        <p className={styles.referencia}>{relato.referencia}</p>
        {relato.observacao && <p className={styles.obs}>“{relato.observacao}”</p>}
        <p className={styles.meta}>
          <span className="mono">{relato.pendente ? 'enviando…' : tempoRelativo(relato.criadoEm)}</span>
          <span>{prof.texto}</span>
        </p>
      </div>

      <div className={styles.acoes}>
        {confirmando ? (
          <>
            <button type="button" className={`${styles.perigo} onda`} onClick={() => onRemover(relato.id)}>
              Excluir
            </button>
            <button type="button" className="onda" onClick={() => setConfirmando(false)}>
              Manter
            </button>
          </>
        ) : (
          <>
            <button type="button" className="onda" onClick={() => onEditar(relato)} disabled={relato.pendente}>
              Editar
            </button>
            <button type="button" className="onda" onClick={() => setConfirmando(true)} disabled={relato.pendente}>
              Remover
            </button>
          </>
        )}
      </div>
    </motion.li>
  )
}
