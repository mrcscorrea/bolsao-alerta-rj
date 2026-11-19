import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSessao } from '../hooks/SessaoContext.jsx'
import { useCarregar } from '../hooks/useCarregar.js'
import { useAviso } from '../hooks/useAviso.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { forum, moderacao, urlFoto } from '../services/forumService.js'
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina.jsx'
import { Aviso } from '../components/ui/Aviso.jsx'
import styles from '../components/forum/Forum.module.css'

const ABAS = [
  ['denuncias', 'Denúncias'],
  ['revisao', 'Em revisão'],
  ['usuarios', 'Usuários'],
]

/** Um item denunciado ou em revisão, com as ações possíveis. */
function ItemFila({ item, executar }) {
  const c = item.conteudo
  // aprovar, esconder e apagar resolvem o item: ele sai da fila sem esperar o servidor
  const resolver = (acao, mensagem) => executar(acao, mensagem, undefined, item.chave)
  const link = `/forum/${item.tipo === 'topico' ? c.id : c.topico_id}`
  return (
    <li className={styles.itemFila}>
      <p className={styles.meta}>
        {item.tipo === 'topico' ? 'Tópico' : 'Comentário'} de <b>{c.autor?.apelido}</b> ·{' '}
        <Link to={link}>abrir</Link>
      </p>
      {c.titulo && <h3>{c.titulo}</h3>}
      <p>{c.texto}</p>
      {c.foto_path && <img src={urlFoto(c.foto_path)} alt="" loading="lazy" decoding="async" width="84" height="84" className={styles.miniatura} />}
      {item.motivos && (
        <p className={styles.motivosLista}>
          {item.motivos.length} {item.motivos.length === 1 ? 'denúncia' : 'denúncias'}: {[...new Set(item.motivos)].join(', ')}
        </p>
      )}
      <div className={styles.linhaAcoes}>
        <button type="button" className={styles.botao} onClick={() => resolver(() => moderacao.conteudo(item.tipo, item.id, 'restaurar'), 'Mantido no ar.')}>
          {item.motivos ? 'Ignorar denúncias' : 'Aprovar'}
        </button>
        <button type="button" className={styles.acaoMod} onClick={() => resolver(() => moderacao.conteudo(item.tipo, item.id, 'ocultar'), 'Escondido.')}>
          Esconder
        </button>
        <button
          type="button"
          className={styles.acaoPerigo}
          onClick={() =>
            resolver(
              () => (item.tipo === 'topico' ? forum.apagarTopico(c) : forum.apagarComentario(c.id)),
              'Apagado.',
            )
          }
        >
          Apagar
        </button>
        {c.autor?.papel === 'usuario' && (
          <button type="button" className={styles.acaoMod} onClick={() => executar(() => moderacao.usuario(c.autor.id, 'silenciar', 24), 'Autor silenciado por 24 h.')}>
            Silenciar autor
          </button>
        )}
      </div>
    </li>
  )
}

function Usuarios({ executar }) {
  const { admin, perfil: eu } = useSessao()
  const [busca, setBusca] = useState('')
  const buscaEstavel = useDebounce(busca.trim()) // uma consulta quando a pessoa para de digitar, não uma por letra
  const { dados, recarregar } = useCarregar(() => moderacao.listarPerfis(buscaEstavel), [buscaEstavel])
  const agir = (fn, msg) => executar(fn, msg, recarregar)

  return (
    <>
      <label className={styles.filtro}>
        <span className="sr-only">Buscar apelido</span>
        <input type="search" placeholder="Buscar apelido…" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>
      <ul className={styles.lista}>
        {dados?.map((p) => {
          const silenciado = p.silenciado_ate && new Date(p.silenciado_ate) > new Date()
          const podeAgir = p.id !== eu?.id && (p.papel === 'usuario' || (admin && p.papel === 'moderador'))
          return (
            <li key={p.id} className={styles.itemFila}>
              <p>
                <b>{p.apelido}</b> <span className={styles.tag}>{p.papel}</span>
                {p.banido && <span className={styles.tag}>banido</span>}
                {silenciado && <span className={styles.tag}>silenciado</span>}
              </p>
              {podeAgir && (
                <div className={styles.linhaAcoes}>
                  {silenciado ? (
                    <button type="button" className={styles.acaoMod} onClick={() => agir(() => moderacao.usuario(p.id, 'liberar'), 'Silêncio removido.')}>
                      Tirar silêncio
                    </button>
                  ) : (
                    <>
                      <button type="button" className={styles.acaoMod} onClick={() => agir(() => moderacao.usuario(p.id, 'silenciar', 24), 'Silenciado por 24 h.')}>
                        Silenciar 24 h
                      </button>
                      <button type="button" className={styles.acaoMod} onClick={() => agir(() => moderacao.usuario(p.id, 'silenciar', 24 * 7), 'Silenciado por 7 dias.')}>
                        7 dias
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className={styles.acaoPerigo}
                    onClick={() => agir(() => moderacao.usuario(p.id, p.banido ? 'desbanir' : 'banir'), p.banido ? 'Banimento retirado.' : 'Conta banida.')}
                  >
                    {p.banido ? 'Desbanir' : 'Banir'}
                  </button>
                  {admin && (
                    <button
                      type="button"
                      className={styles.botao}
                      onClick={() => agir(() => moderacao.papel(p.id, p.papel === 'moderador' ? 'usuario' : 'moderador'), 'Papel atualizado.')}
                    >
                      {p.papel === 'moderador' ? 'Tirar moderador' : 'Tornar moderador'}
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export function Moderacao() {
  const sessao = useSessao()
  const [aba, setAba] = useState('denuncias')
  const { aviso, avisar, fechar } = useAviso()
  const fila = useCarregar(
    () => (sessao.moderador ? (aba === 'revisao' ? moderacao.emRevisao() : moderacao.fila()) : []),
    [aba, sessao.moderador],
  )

  /** Roda a ação; com `sai`, o item deixa a fila na hora e volta (recarregando) se o servidor recusar. */
  async function executar(acao, mensagem, depois = fila.recarregar, sai = null) {
    if (sai) fila.setDados((itens) => itens.filter((i) => i.chave !== sai))
    try {
      await acao()
      avisar(mensagem)
      if (!sai) await depois()
    } catch (e) {
      avisar(e.message, 'erro')
      if (sai) fila.recarregar()
    }
  }

  if (!sessao.carregando && !sessao.moderador) {
    return (
      <div className={`container ${styles.naoAchou}`}>
        <h1 className={styles.painelTitulo}>Área só para moderadores.</h1>
        <Link to="/forum">Voltar ao fórum</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <CabecalhoPagina titulo="Fila de revisão" texto="Denúncias, conteúdos com link ou telefone e as contas do fórum." />
      <div className={styles.abas} role="tablist">
        {ABAS.map(([id, rotulo]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)}>
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'usuarios' ? (
        <Usuarios executar={executar} />
      ) : fila.erro ? (
        <p className={styles.alerta}>{fila.erro}</p>
      ) : fila.dados?.length === 0 ? (
        <p className={styles.vazio}>Nada na fila. Tudo em dia.</p>
      ) : (
        <ul className={styles.lista}>
          {fila.dados?.map((item) => (
            <ItemFila key={item.chave} item={item} executar={executar} />
          ))}
        </ul>
      )}

      <Aviso aviso={aviso} onFechar={fechar} />
    </div>
  )
}
