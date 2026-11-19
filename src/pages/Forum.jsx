import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSessao } from '../hooks/SessaoContext.jsx'
import { useCarregar } from '../hooks/useCarregar.js'
import { useAviso } from '../hooks/useAviso.js'
import { forum, urlFoto, TOPICOS_POR_PAGINA } from '../services/forumService.js'
import { VIAS, buscarVia } from '../domain/vias.js'
import { classificarProfundidade, tempoRelativo } from '../domain/relatos.js'
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina.jsx'
import { Aviso } from '../components/ui/Aviso.jsx'
import { Conta } from '../components/forum/Conta.jsx'
import { NovoTopico } from '../components/forum/NovoTopico.jsx'
import { ForumNaoConfigurado } from '../components/forum/ForumNaoConfigurado.jsx'
import styles from '../components/forum/Forum.module.css'

const MOTIVO_OCULTO = { revisao: 'Em revisão', denuncias: 'Escondido por denúncias', moderacao: 'Escondido pela moderação' }

function TopicoCard({ topico }) {
  const via = buscarVia(topico.via_id)
  const prof = topico.profundidade_cm != null ? classificarProfundidade(topico.profundidade_cm) : null
  const foto = urlFoto(topico.foto_path)
  return (
    <li aria-busy={topico.pendente || undefined}>
      <Link to={topico.pendente ? '#' : `/forum/${topico.id}`} className={styles.topico} data-pendente={topico.pendente || undefined}>
        {foto && <img src={foto} alt="" loading="lazy" decoding="async" width="84" height="84" className={styles.miniatura} />}
        <div className={styles.topicoCorpo}>
          <p className={styles.meta}>
            {via ? `${via.via} · ${via.trecho}` : topico.via_id}
            {topico.oculto && <span className={styles.tag}>{MOTIVO_OCULTO[topico.motivo_oculto] ?? 'Escondido'}</span>}
          </p>
          <h3>{topico.titulo}</h3>
          <p className={styles.meta}>
            {topico.pendente ? (
              'Publicando…'
            ) : (
              <>
                {topico.autor?.apelido} · {tempoRelativo(topico.criado_em)} · {topico.totalComentarios}{' '}
                {topico.totalComentarios === 1 ? 'comentário' : 'comentários'}
              </>
            )}
          </p>
        </div>
        {prof && (
          <span className={styles.profundidade} data-faixa={prof.faixa}>
            {topico.profundidade_cm}
            <small>cm</small>
          </span>
        )}
      </Link>
    </li>
  )
}

export function Forum() {
  const sessao = useSessao()
  const [params, setParams] = useSearchParams()
  const viaId = params.get('via') ?? ''
  const { aviso, avisar, fechar } = useAviso()
  const [pagina, setPagina] = useState(0)
  const [temMais, setTemMais] = useState(false)
  const [buscandoMais, setBuscandoMais] = useState(false)
  const lista = useCarregar(async () => {
    if (!sessao.configurado) return []
    const itens = await forum.listarTopicos(viaId, 0)
    setPagina(0)
    setTemMais(itens.length === TOPICOS_POR_PAGINA)
    return itens
  }, [viaId, sessao.configurado])

  async function carregarMais() {
    setBuscandoMais(true)
    try {
      const itens = await forum.listarTopicos(viaId, pagina + 1)
      // ignora repetidos (alguém pode ter publicado e empurrado a lista)
      lista.setDados((atual) => [...atual, ...itens.filter((n) => !atual.some((t) => t.id === n.id))])
      setPagina(pagina + 1)
      setTemMais(itens.length === TOPICOS_POR_PAGINA)
    } catch (e) {
      avisar(e.message, 'erro')
    } finally {
      setBuscandoMais(false)
    }
  }

  /** Aparece na lista na hora; se o servidor recusar, sai e a pessoa vê o motivo. */
  async function publicar(dados) {
    const temporario = {
      id: `tmp-${Date.now()}`,
      pendente: true,
      via_id: dados.viaId,
      titulo: dados.titulo,
      profundidade_cm: dados.profundidadeCm,
      totalComentarios: 0,
    }
    lista.setDados((atual) => [temporario, ...(atual ?? [])])
    try {
      const novo = await forum.criarTopico(dados, sessao.usuario.id)
      lista.setDados((atual) => atual.map((t) => (t.id === temporario.id ? { ...novo, totalComentarios: 0 } : t)))
      avisar(novo.oculto ? 'Publicado. Como tem link ou telefone, aparece depois da revisão.' : 'Tópico publicado.')
      return true
    } catch (e) {
      lista.setDados((atual) => atual.filter((t) => t.id !== temporario.id))
      avisar(e.message, 'erro')
      return false
    }
  }

  return (
    <div className="container">
      <CabecalhoPagina
        titulo="Quem passou por lá conta como está"
        texto="Cada tópico fica ligado a um ponto monitorado. Comente, mande foto e denuncie o que fugir do assunto: moderadores revisam."
      />

      {!sessao.configurado ? (
        <ForumNaoConfigurado />
      ) : (
        <div className={styles.grade}>
          <aside className={styles.lateral}>
            <Conta avisar={avisar} />
            {sessao.usuario && sessao.podePostar && (
              <div className="prancha">
                <NovoTopico viaInicial={viaId} onPublicar={publicar} />
              </div>
            )}
          </aside>

          <section aria-labelledby="topicos-titulo">
            <div className={styles.listaTopo}>
              <h2 id="topicos-titulo" className="sr-only">
                Tópicos
              </h2>
              <label className={styles.filtro}>
                <span className="sr-only">Filtrar por ponto</span>
                <select value={viaId} onChange={(e) => setParams(e.target.value ? { via: e.target.value } : {})}>
                  <option value="">Todos os pontos</option>
                  {VIAS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.via} · {v.trecho}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {lista.erro && (
              <p className={styles.alerta}>
                {lista.erro}{' '}
                <button type="button" className={styles.acaoLeve} onClick={lista.recarregar}>
                  Tentar de novo
                </button>
              </p>
            )}
            {lista.carregando && !lista.dados ? (
              <ul className={styles.lista} aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className={styles.esqueleto} />
                ))}
              </ul>
            ) : lista.dados?.length === 0 ? (
              <p className={styles.vazio}>
                Nenhum tópico {viaId ? 'neste ponto' : 'ainda'}. {sessao.usuario ? 'Abra o primeiro.' : 'Entre para abrir o primeiro.'}
              </p>
            ) : (
              <>
                <ul className={styles.lista}>
                  {lista.dados?.map((t) => (
                    <TopicoCard key={t.id} topico={t} />
                  ))}
                </ul>
                {temMais && (
                  <button type="button" className={styles.botaoLeve} onClick={carregarMais} disabled={buscandoMais}>
                    {buscandoMais ? 'Carregando…' : 'Carregar mais tópicos'}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <Aviso aviso={aviso} onFechar={fechar} />
    </div>
  )
}
