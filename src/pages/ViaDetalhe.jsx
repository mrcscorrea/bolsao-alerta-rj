import { Link, useParams } from 'react-router-dom'
import { useVia } from '../hooks/MonitoramentoContext.jsx'
import { FAIXAS } from '../domain/config.js'
import { FaixaBadge, Tendencia } from '../components/ui/FaixaBadge.jsx'
import { ReguaRisco } from '../components/ui/ReguaRisco.jsx'
import { Sparkline } from '../components/ui/Sparkline.jsx'
import { INTERVALO_MS } from '../services/leiturasService.js'
import styles from './ViaDetalhe.module.css'

const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function ViaDetalhe() {
  const { id } = useParams()
  const { via, carregando } = useVia(id)

  if (carregando) return <div className="container" style={{ minHeight: '60vh' }} />
  if (!via) {
    return (
      <div className={`container ${styles.vazio}`}>
        <h1>Ponto não encontrado.</h1>
        <Link to="/painel">Voltar ao painel</Link>
      </div>
    )
  }

  const { atual, leituras } = via
  const faixa = FAIXAS[atual.faixa]
  const ultimas = leituras.slice(-8).reverse()

  return (
    <article className={`container ${styles.detalhe}`} data-faixa={atual.faixa}>
      <Link to="/painel" className={styles.voltar}>
        ← Painel
      </Link>

      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>{via.via}</h1>
        <p className={styles.referencia}>
          {via.trecho}. {via.referencia}
        </p>
      </header>

      <section className={styles.status} aria-labelledby="status-titulo">
        <h2 id="status-titulo" className={styles.statusTitulo}>
          {faixa.titulo}
        </h2>
        <p className={styles.statusTexto}>
          {faixa.texto} Nas últimas leituras, <Tendencia valor={via.tendencia} />.
        </p>

        <div className={styles.numeros}>
          <div>
            <span className={styles.rotulo}>Índice de risco</span>
            <strong className="mono">{atual.risco.toFixed(1)}</strong>
          </div>
          <div>
            <span className={styles.rotulo}>Lâmina d&apos;água</span>
            <strong className="mono">
              {atual.medidas.laminaCm.toFixed(1)}
              <small> cm</small>
            </strong>
          </div>
          <div>
            <span className={styles.rotulo}>Chuva</span>
            <strong className="mono">
              {atual.medidas.chuvaMmH.toFixed(1)}
              <small> mm/h</small>
            </strong>
          </div>
        </div>
        <ReguaRisco risco={atual.risco} faixa={atual.faixa} />
      </section>

      <section className={styles.bloco} aria-labelledby="hist-titulo">
        <h2 id="hist-titulo" className={styles.blocoTitulo}>
          Últimas {leituras.length} leituras
        </h2>
        <p className={styles.blocoSub}>
          {via.fonte === 'thingspeak' ? 'Sensor real, pelo ThingSpeak, a cada 15 s.' : `Simuladas, uma a cada ${INTERVALO_MS / 1000} s.`}
        </p>
        <div className={styles.grafico}>
          <Sparkline leituras={leituras} altura={110} detalhado />
        </div>
        <div className={styles.eixo}>
          <span className="mono">{hora(leituras[0].horario)}</span>
          <span className="mono">{hora(atual.horario)}</span>
        </div>
        <div className={styles.tabelaWrap}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Lâmina</th>
                <th>Chuva</th>
                <th>Risco</th>
                <th>Faixa</th>
              </tr>
            </thead>
            <tbody>
              {ultimas.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{hora(l.horario)}</td>
                  <td className="mono">{l.medidas.laminaCm.toFixed(1)} cm</td>
                  <td className="mono">{l.medidas.chuvaMmH.toFixed(1)} mm/h</td>
                  <td className="mono">{l.risco.toFixed(1)}</td>
                  <td>
                    <FaixaBadge faixa={l.faixa} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className={styles.cta}>
        <p>Está passando por aqui e viu água acumulada?</p>
        <Link to={`/relatos?via=${via.id}`} className={styles.ctaBotao}>
          Relatar bolsão neste ponto
        </Link>
      </aside>
    </article>
  )
}
