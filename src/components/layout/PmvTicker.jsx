import { useVias } from '../../hooks/MonitoramentoContext.jsx'
import styles from './PmvTicker.module.css'

/** Monta as mensagens do letreiro a partir das vias em alerta. */
export function montarMensagens(vias) {
  const mensagens = []
  for (const v of vias) {
    if (v.atual.faixa === 'PERIGO') mensagens.push(`Bolsão ativo · ${v.via} ${v.trecho} · evite a via`)
  }
  for (const v of vias) {
    if (v.atual.faixa === 'ATENCAO') mensagens.push(`Acúmulo de água · ${v.via} ${v.trecho} · reduza`)
  }
  if (mensagens.length === 0) mensagens.push('Vias monitoradas sem bolsões', 'Boa viagem')
  return mensagens
}

export function PmvTicker() {
  const { vias, pior, carregando } = useVias()
  if (carregando && vias.length === 0) return <div className={styles.pmv} aria-hidden="true" />

  const mensagens = montarMensagens(vias)
  const texto = mensagens.join('   /   ').toUpperCase() + '   /   '
  const duracao = Math.max(16, texto.length * 0.2)

  return (
    <div className={styles.pmv} data-faixa={pior}>
      <p className="sr-only" role="status">
        {mensagens.join('. ')}
      </p>
      <div className={styles.janela} aria-hidden="true">
        <div className={styles.faixa} style={{ animationDuration: `${duracao}s` }}>
          <span>{texto}</span>
          <span>{texto}</span>
        </div>
      </div>
    </div>
  )
}
