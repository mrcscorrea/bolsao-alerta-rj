import { Link, useParams } from 'react-router-dom'
import { useVia } from '../hooks/MonitoramentoContext.jsx'
import { FAIXAS, ORDEM_FAIXAS } from '../domain/config.js'
import { contagemPorFaixa, maiorEpisodioPerigo } from '../domain/risco.js'
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
  const contagem = contagemPorFaixa(leituras)
  const episodio = maiorEpisodioPerigo(leituras)
  const ultimas = leituras.slice(-8).reverse()

  return (
    <article className={`container ${styles.detalhe}`} data-faixa={atual.faixa}>
      <Link to="/painel" className={styles.voltar}>
        ← Painel
      </Link>

      <header className={styles.cabecalho}>
        <p className="eyebrow">{via.trecho}</p>
        <h1 className={styles.titulo}>{via.via}</h1>
        <p className={styles.referencia}>{via.referencia}</p>
      </header>

      <section className={styles.status} aria-labelledby="status-titulo">
        <div className={styles.statusTopo}>
          <FaixaBadge faixa={atual.faixa} grande />
          <Tendencia valor={via.tendencia} />
        </div>
        <h2 id="status-titulo" className={styles.statusTitulo}>
          {faixa.titulo}
        </h2>
        <p className={styles.statusTexto}>{faixa.texto}</p>

        <div className={styles.numeros}>
          <div>
            <span className="eyebrow">Índice de risco</span>
            <strong className="mono">{atual.risco.toFixed(1)}</strong>
          </div>
          <div>
            <span className="eyebrow">Lâmina d&apos;água</span>
            <strong className="mono">
              {atual.medidas.laminaCm.toFixed(1)}
              <small> cm</small>
            </strong>
          </div>
          <div>
            <span className="eyebrow">Chuva</span>
            <strong className="mono">
              {atual.medidas.chuvaMmH.toFixed(1)}
              <small> mm/h</small>
            </strong>
          </div>
        </div>
        <ReguaRisco risco={atual.risco} faixa={atual.faixa} />
      </section>

      <div className={styles.grade}>
        <section className={styles.bloco} aria-labelledby="hist-titulo">
          <h2 id="hist-titulo" className={styles.blocoTitulo}>
            Histórico
          </h2>
          <p className={styles.blocoSub}>
            Últimas {leituras.length} leituras, uma a cada {INTERVALO_MS / 1000} s
          </p>
          <div className={styles.grafico}>
            <Sparkline leituras={leituras} altura={110} detalhado />
          </div>
          <div className={styles.eixo}>
            <span className="mono">{hora(leituras[0].horario)}</span>
            <span className="mono">{hora(atual.horario)}</span>
          </div>
        </section>

        <section className={styles.bloco} aria-labelledby="analise-titulo">
          <h2 id="analise-titulo" className={styles.blocoTitulo}>
            Análise do período
          </h2>
          <div className={styles.barraFaixas} aria-hidden="true">
            {ORDEM_FAIXAS.map((f) => (
              <span key={f} data-faixa={f} style={{ flexGrow: contagem[f] }} />
            ))}
          </div>
          <ul className={styles.contagem}>
            {ORDEM_FAIXAS.map((f) => (
              <li key={f} data-faixa={f}>
                <span className={styles.bolinha} />
                {FAIXAS[f].rotulo}
                <span className="mono">{contagem[f]}</span>
              </li>
            ))}
          </ul>
          <p className={styles.episodio}>
            {episodio
              ? `Maior episódio em PERIGO: ${episodio.leituras} leituras seguidas, das ${hora(episodio.inicio)} às ${hora(episodio.fim)}.`
              : 'Nenhum episódio em PERIGO no período.'}
          </p>
        </section>
      </div>

      <section className={styles.bloco} aria-labelledby="leituras-titulo">
        <h2 id="leituras-titulo" className={styles.blocoTitulo}>
          Últimas leituras
        </h2>
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
