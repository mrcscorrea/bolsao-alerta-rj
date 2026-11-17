import styles from './CabecalhoPagina.module.css'

export function CabecalhoPagina({ eyebrow, titulo, texto, children }) {
  return (
    <header className={styles.cabecalho}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className={styles.titulo}>{titulo}</h1>
      {texto && <p className={styles.texto}>{texto}</p>}
      {children}
    </header>
  )
}

/** Mostra de onde vêm os dados e o horário da última atualização. */
export function FonteDados({ vias, atualizadoEm }) {
  const real = vias.some((v) => v.fonte === 'thingspeak')
  const hora = atualizadoEm?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <p className={styles.fonte}>
      <span className={styles.aoVivo} aria-hidden="true" />
      {real ? 'ThingSpeak + simulação' : 'Dados simulados'}
      {hora && <> · atualizado às {hora}</>}
    </p>
  )
}
