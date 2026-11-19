import { useState } from 'react'
import { forum } from '../../services/forumService.js'
import styles from './Forum.module.css'

const MOTIVOS = ['Ofensivo ou discurso de ódio', 'Golpe ou propaganda', 'Informação falsa', 'Foto imprópria']

/** Botão "Denunciar" que abre a escolha do motivo no próprio lugar. */
export function Denunciar({ tipo, id, avisar }) {
  const [aberto, setAberto] = useState(false)

  async function enviar(motivo) {
    setAberto(false)
    try {
      await forum.denunciar(tipo, id, motivo)
      avisar('Denúncia enviada. Com 3 denúncias o conteúdo some até a revisão.')
    } catch (e) {
      avisar(e.message, 'erro')
    }
  }

  if (!aberto) {
    return (
      <button type="button" className={styles.acaoLeve} onClick={() => setAberto(true)}>
        Denunciar
      </button>
    )
  }
  return (
    <div className={styles.motivos} role="group" aria-label="Motivo da denúncia">
      {MOTIVOS.map((m) => (
        <button key={m} type="button" onClick={() => enviar(m)}>
          {m}
        </button>
      ))}
      <button type="button" className={styles.acaoLeve} onClick={() => setAberto(false)}>
        Cancelar
      </button>
    </div>
  )
}
