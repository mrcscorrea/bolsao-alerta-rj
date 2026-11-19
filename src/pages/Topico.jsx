import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSessao } from '../hooks/SessaoContext.jsx'
import { useCarregar } from '../hooks/useCarregar.js'
import { useAviso } from '../hooks/useAviso.js'
import { forum, moderacao, urlFoto } from '../services/forumService.js'
import { buscarVia } from '../domain/vias.js'
import { classificarProfundidade, tempoRelativo } from '../domain/relatos.js'
import { verificarMensagem } from '../domain/filtroMensagens.js'
import { Aviso } from '../components/ui/Aviso.jsx'
import { Denunciar } from '../components/forum/Denunciar.jsx'
import { ForumNaoConfigurado } from '../components/forum/ForumNaoConfigurado.jsx'
import campos from '../components/relatos/RelatoForm.module.css'
import styles from '../components/forum/Forum.module.css'

/** Botões de moderação sobre o AUTOR do conteúdo (silenciar / banir). */
function AcoesAutor({ autor, executar }) {
  const { perfil } = useSessao()
  if (!autor || autor.id === perfil?.id || autor.papel !== 'usuario') return null
  return (
    <>
      <button type="button" className={styles.acaoMod} onClick={() => executar(() => moderacao.usuario(autor.id, 'silenciar', 24), `${autor.apelido} silenciado por 24 h.`)}>
        Silenciar 24 h
      </button>
      <button type="button" className={styles.acaoMod} onClick={() => executar(() => moderacao.usuario(autor.id, 'banir'), `${autor.apelido} banido.`)}>
        Banir autor
      </button>
    </>
  )
}

export function Topico() {
  const { id } = useParams()
  const navegar = useNavigate()
  const sessao = useSessao()
  const { aviso, avisar, fechar } = useAviso()
  const { dados: topico, setDados, carregando, erro, recarregar } = useCarregar(
    () => (sessao.configurado ? forum.buscarTopico(id) : null),
    [id, sessao.configurado],
  )
  const [comentario, setComentario] = useState('')
  const [editando, setEditando] = useState(null)

  /** Roda uma ação, avisa o resultado e recarrega o tópico. */
  async function executar(acao, mensagem, depois = recarregar) {
    try {
      await acao()
      avisar(mensagem)
      await depois()
    } catch (e) {
      avisar(e.message, 'erro')
    }
  }

  if (!sessao.configurado) return <div className="container"><ForumNaoConfigurado /></div>
  if (carregando && !topico) return <div className="container"><div className={styles.esqueleto} /></div>
  if (erro || !topico) {
    return (
      <div className={`container ${styles.naoAchou}`}>
        <h1 className={styles.painelTitulo}>{erro ?? 'Tópico não encontrado ou removido.'}</h1>
        <Link to="/forum">Voltar ao fórum</Link>
      </div>
    )
  }

  const via = buscarVia(topico.via_id)
  const prof = topico.profundidade_cm != null ? classificarProfundidade(topico.profundidade_cm) : null
  const souAutor = sessao.usuario?.id === topico.autor?.id
  const checagem = verificarMensagem(comentario)

  /** O comentário entra na lista na hora; se o servidor recusar, sai e o texto volta para a caixa. */
  async function comentar(e) {
    e.preventDefault()
    const texto = comentario.trim()
    if (!texto || !checagem.ok) return
    const temporario = { id: `tmp-${Date.now()}`, texto, criado_em: new Date().toISOString(), autor: sessao.perfil, pendente: true }
    const trocar = (fn) => setDados((t) => ({ ...t, comentarios: fn(t.comentarios) }))
    trocar((lista) => [...lista, temporario])
    setComentario('')
    try {
      const novo = await forum.comentar(topico.id, texto)
      trocar((lista) => lista.map((c) => (c.id === temporario.id ? novo : c)))
      avisar(checagem.revisao ? 'Comentário enviado para revisão (tem link ou telefone).' : 'Comentário publicado.')
    } catch (erro) {
      trocar((lista) => lista.filter((c) => c.id !== temporario.id))
      setComentario(texto)
      avisar(erro.message, 'erro')
    }
  }

  /** Some da tela na hora; se der erro, recarrega o tópico para mostrar o estado real. */
  async function apagarComentario(id) {
    setDados((t) => ({ ...t, comentarios: t.comentarios.filter((c) => c.id !== id) }))
    try {
      await forum.apagarComentario(id)
      avisar('Comentário apagado.')
    } catch (erro) {
      avisar(erro.message, 'erro')
      recarregar()
    }
  }

  async function salvarEdicao(e) {
    e.preventDefault()
    const checar = verificarMensagem(`${editando.titulo} ${editando.texto}`)
    if (!checar.ok) return avisar(checar.motivo, 'erro')
    await executar(async () => {
      await forum.editarTopico(topico.id, { ...editando, profundidadeCm: topico.profundidade_cm })
      setEditando(null)
    }, 'Tópico atualizado.')
  }

  return (
    <div className="container">
      <Link to={`/forum${via ? `?via=${via.id}` : ''}`} className={styles.voltar}>
        ← Fórum{via ? `: ${via.via} · ${via.trecho}` : ''}
      </Link>

      <article className={styles.artigo}>
        {topico.oculto && <p className={styles.alerta}>Este tópico está escondido ({topico.motivo_oculto}). Só você e a moderação o veem.</p>}

        {editando ? (
          <form onSubmit={salvarEdicao} className={styles.painel}>
            <div className={campos.campo}>
              <label htmlFor="e-titulo">Título</label>
              <input id="e-titulo" value={editando.titulo} maxLength={120} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} />
            </div>
            <div className={campos.campo}>
              <label htmlFor="e-texto">Texto</label>
              <textarea id="e-texto" rows="5" value={editando.texto} maxLength={2000} onChange={(e) => setEditando({ ...editando, texto: e.target.value })} />
            </div>
            <div className={styles.linhaAcoes}>
              <button type="submit" className={campos.primario}>Salvar</button>
              <button type="button" className={styles.botaoLeve} onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            <h1 className={styles.artigoTitulo}>{topico.titulo}</h1>
            <p className={styles.meta}>
              {topico.autor?.apelido}
              {topico.autor?.papel !== 'usuario' && <span className={styles.tag}>{topico.autor?.papel}</span>} ·{' '}
              {tempoRelativo(topico.criado_em)}
            </p>
            {prof && (
              <p className={styles.profundidadeLinha} data-faixa={prof.faixa}>
                <b>{topico.profundidade_cm} cm</b> {prof.texto}
              </p>
            )}
            <p className={styles.artigoTexto}>{topico.texto}</p>
          </>
        )}

        {topico.foto_path && (
          <figure className={styles.fotoTopico}>
            <img src={urlFoto(topico.foto_path)} decoding="async" alt={`Foto enviada por ${topico.autor?.apelido}`} />
          </figure>
        )}

        <div className={styles.linhaAcoes}>
          {souAutor && !editando && sessao.podePostar && (
            <button type="button" className={styles.acaoLeve} onClick={() => setEditando({ titulo: topico.titulo, texto: topico.texto })}>
              Editar
            </button>
          )}
          {(souAutor || sessao.moderador) && (
            <button
              type="button"
              className={styles.acaoPerigo}
              onClick={() => executar(() => forum.apagarTopico(topico), 'Tópico apagado.', async () => navegar('/forum'))}
            >
              Apagar tópico
            </button>
          )}
          {sessao.usuario && !souAutor && <Denunciar tipo="topico" id={topico.id} avisar={avisar} />}
          {sessao.moderador && (
            <>
              <button
                type="button"
                className={styles.acaoMod}
                onClick={() => executar(() => moderacao.conteudo('topico', topico.id, topico.oculto ? 'restaurar' : 'ocultar'), topico.oculto ? 'Tópico visível de novo.' : 'Tópico escondido.')}
              >
                {topico.oculto ? 'Restaurar' : 'Esconder'}
              </button>
              {topico.foto_path && (
                <button type="button" className={styles.acaoMod} onClick={() => executar(() => moderacao.removerFoto(topico), 'Foto removida.')}>
                  Remover foto
                </button>
              )}
              <AcoesAutor autor={topico.autor} executar={executar} />
            </>
          )}
        </div>
      </article>

      <section className={styles.comentarios} aria-labelledby="comentarios-titulo">
        <h2 id="comentarios-titulo" className={styles.painelTitulo}>
          {topico.comentarios.length} {topico.comentarios.length === 1 ? 'comentário' : 'comentários'}
        </h2>
        <ol className={styles.listaComentarios}>
          {topico.comentarios.map((c) => (
            <li key={c.id} className={c.oculto || c.pendente ? styles.comentarioOculto : undefined} aria-busy={c.pendente || undefined}>
              <p className={styles.meta}>
                <b>{c.autor?.apelido}</b>
                {c.autor?.papel !== 'usuario' && <span className={styles.tag}>{c.autor?.papel}</span>} · {tempoRelativo(c.criado_em)}
                {c.oculto && <span className={styles.tag}>escondido</span>}
              </p>
              <p>{c.texto}</p>
              {!c.pendente && <div className={styles.linhaAcoes}>
                {(sessao.usuario?.id === c.autor?.id || sessao.moderador) && (
                  <button type="button" className={styles.acaoPerigo} onClick={() => apagarComentario(c.id)}>
                    Apagar
                  </button>
                )}
                {sessao.usuario && sessao.usuario.id !== c.autor?.id && <Denunciar tipo="comentario" id={c.id} avisar={avisar} />}
                {sessao.moderador && (
                  <>
                    <button type="button" className={styles.acaoMod} onClick={() => executar(() => moderacao.conteudo('comentario', c.id, c.oculto ? 'restaurar' : 'ocultar'), 'Feito.')}>
                      {c.oculto ? 'Restaurar' : 'Esconder'}
                    </button>
                    <AcoesAutor autor={c.autor} executar={executar} />
                  </>
                )}
              </div>}
            </li>
          ))}
        </ol>

        {sessao.podePostar ? (
          <form onSubmit={comentar} className={styles.formComentario}>
            <label htmlFor="comentario" className="sr-only">
              Seu comentário
            </label>
            <textarea id="comentario" rows="3" maxLength={1000} placeholder="A água já baixou? Ainda dá pra passar?" value={comentario} onChange={(e) => setComentario(e.target.value)} />
            {!checagem.ok && <p className={campos.erro}>{checagem.motivo}</p>}
            <button type="submit" className={campos.primario} disabled={!comentario.trim() || !checagem.ok}>
              Comentar
            </button>
          </form>
        ) : (
          <p className={styles.vazio}>
            {sessao.usuario ? 'Sua conta não pode comentar agora.' : <><Link to="/forum">Entre no fórum</Link> para comentar.</>}
          </p>
        )}
      </section>

      <Aviso aviso={aviso} onFechar={fechar} />
    </div>
  )
}
