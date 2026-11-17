import { AnimatePresence, motion } from 'motion/react'
import styles from './Aviso.module.css'

/** Mensagem de resposta às ações do usuário (sucesso ou erro). */
export function Aviso({ aviso, onFechar }) {
  return (
    <div className={styles.area} aria-live="polite">
      <AnimatePresence>
        {aviso && (
          <motion.div
            key={aviso.id}
            className={styles.aviso}
            data-tipo={aviso.tipo}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{aviso.texto}</p>
            <button type="button" onClick={onFechar} aria-label="Fechar aviso">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
