import styles from './CabecalhoPagina.module.css'

export function CabecalhoPagina({ titulo, texto, children }) {
  return (
    <header className={styles.cabecalho}>
      <h1 className={styles.titulo}>{titulo}</h1>
      {texto && <p className={styles.texto}>{texto}</p>}
      {children}
    </header>
  )
}

/** De onde vêm os dados e a hora da última leitura, numa frase. */
export function FonteDados({ vias, atualizadoEm }) {
  const real = vias.some((v) => v.fonte === 'thingspeak')
  const hora = atualizadoEm?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    <p className={styles.fonte}>
      {real ? 'Av. Brasil (Maré) com sensor real; demais pontos simulados.' : 'Dados simulados.'}
      {hora && <> Última leitura às {hora}.</>}
    </p>
  )
}
