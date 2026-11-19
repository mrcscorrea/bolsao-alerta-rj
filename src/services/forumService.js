import { supabase, checar } from './supabase.js'
import { comprimirImagem } from './imagem.js'

/**
 * Acesso a dados do fórum (Supabase). As permissões NÃO são decididas aqui:
 * o banco recusa o que a pessoa não pode fazer (RLS + funções de moderação).
 */
const BUCKET = 'fotos-forum'
const AUTOR = 'autor:perfis(id, apelido, bairro, papel)'
const CAMPOS_TOPICO = `id, via_id, titulo, texto, profundidade_cm, foto_path, oculto, motivo_oculto, criado_em, ${AUTOR}`
const CAMPOS_COMENTARIO = `id, texto, oculto, motivo_oculto, criado_em, ${AUTOR}`
export const TOPICOS_POR_PAGINA = 15

export function urlFoto(caminho) {
  return caminho ? supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl : null
}

// ------------------------------- conta -------------------------------
export const conta = {
  aoMudar(callback) {
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => callback(sessao))
    return () => data.subscription.unsubscribe()
  },
  async perfil(id) {
    return checar(await supabase.from('perfis').select('*').eq('id', id).maybeSingle())
  },
  async apelidoLivre(apelido) {
    const achado = checar(await supabase.from('perfis').select('id').eq('apelido', apelido).maybeSingle())
    return !achado
  },
  async cadastrar({ email, senha, apelido, bairro }) {
    if (!(await this.apelidoLivre(apelido))) throw new Error('Esse apelido já está em uso.')
    return checar(await supabase.auth.signUp({ email, password: senha, options: { data: { apelido, bairro } } }))
  },
  async entrar({ email, senha }) {
    return checar(await supabase.auth.signInWithPassword({ email, password: senha }))
  },
  async sair() {
    checar(await supabase.auth.signOut())
  },
}

// ------------------------------- tópicos -------------------------------
export const forum = {
  /** Uma página de tópicos (mais novos primeiro), já com o total de comentários de cada um. */
  async listarTopicos(viaId, pagina = 0) {
    const inicio = pagina * TOPICOS_POR_PAGINA
    let consulta = supabase
      .from('topicos')
      .select(`${CAMPOS_TOPICO}, comentarios(count)`)
      .order('criado_em', { ascending: false })
      .range(inicio, inicio + TOPICOS_POR_PAGINA - 1)
    if (viaId) consulta = consulta.eq('via_id', viaId)
    return checar(await consulta).map((t) => ({ ...t, totalComentarios: t.comentarios?.[0]?.count ?? 0 }))
  },

  /** Tópico e comentários (com autores) numa consulta só. */
  async buscarTopico(id) {
    return checar(
      await supabase
        .from('topicos')
        .select(`${CAMPOS_TOPICO}, comentarios(${CAMPOS_COMENTARIO})`)
        .eq('id', id)
        .order('criado_em', { referencedTable: 'comentarios' })
        .maybeSingle(),
    )
  },

  async criarTopico({ viaId, titulo, texto, profundidadeCm, arquivo }, autorId) {
    let foto_path = null
    if (arquivo) {
      const blob = await comprimirImagem(arquivo)
      const extensao = blob.type === 'image/webp' ? 'webp' : 'jpg'
      foto_path = `${autorId}/${Date.now()}.${extensao}` // a pasta tem que ser o id do autor (regra do Storage)
      checar(await supabase.storage.from(BUCKET).upload(foto_path, blob, { contentType: blob.type }))
    }
    try {
      return checar(
        await supabase
          .from('topicos')
          .insert({ via_id: viaId, titulo, texto, profundidade_cm: profundidadeCm, foto_path })
          .select(CAMPOS_TOPICO)
          .single(),
      )
    } catch (e) {
      if (foto_path) await supabase.storage.from(BUCKET).remove([foto_path]) // não deixa foto órfã
      throw e
    }
  },

  async editarTopico(id, { titulo, texto, profundidadeCm }) {
    return checar(
      await supabase
        .from('topicos')
        .update({ titulo, texto, profundidade_cm: profundidadeCm })
        .eq('id', id)
        .select(CAMPOS_TOPICO)
        .single(),
    )
  },

  async apagarTopico(topico) {
    checar(await supabase.from('topicos').delete().eq('id', topico.id))
    if (topico.foto_path) await supabase.storage.from(BUCKET).remove([topico.foto_path])
  },

  async comentar(topicoId, texto) {
    return checar(
      await supabase
        .from('comentarios')
        .insert({ topico_id: topicoId, texto })
        .select(CAMPOS_COMENTARIO)
        .single(),
    )
  },

  async apagarComentario(id) {
    checar(await supabase.from('comentarios').delete().eq('id', id))
  },

  async denunciar(tipo, id, motivo) {
    const { error } = await supabase.from('denuncias').insert({ alvo_tipo: tipo, alvo_id: id, motivo })
    if (error?.code === '23505') throw new Error('Você já denunciou isso. Um moderador vai olhar.')
    checar({ error })
  },
}

// ------------------------------- moderação -------------------------------
export const moderacao = {
  /** Denúncias abertas agrupadas por item, com o conteúdo denunciado. */
  async fila() {
    const denuncias = checar(
      await supabase
        .from('denuncias')
        .select('id, alvo_tipo, alvo_id, motivo, criado_em')
        .eq('resolvida', false)
        .order('criado_em'),
    )
    const grupos = new Map()
    for (const d of denuncias) {
      const chave = `${d.alvo_tipo}:${d.alvo_id}`
      if (!grupos.has(chave)) grupos.set(chave, { tipo: d.alvo_tipo, id: d.alvo_id, motivos: [] })
      grupos.get(chave).motivos.push(d.motivo)
    }
    const ids = (tipo) => [...grupos.values()].filter((g) => g.tipo === tipo).map((g) => g.id)
    const [topicos, comentarios] = await Promise.all([
      ids('topico').length
        ? supabase.from('topicos').select(`id, titulo, texto, foto_path, oculto, ${AUTOR}`).in('id', ids('topico'))
        : { data: [] },
      ids('comentario').length
        ? supabase.from('comentarios').select(`id, texto, topico_id, oculto, ${AUTOR}`).in('id', ids('comentario'))
        : { data: [] },
    ])
    const conteudo = new Map([
      ...checar(topicos).map((t) => [`topico:${t.id}`, t]),
      ...checar(comentarios).map((c) => [`comentario:${c.id}`, c]),
    ])
    return [...grupos.entries()]
      .map(([chave, g]) => ({ ...g, chave, conteudo: conteudo.get(chave) }))
      .filter((g) => g.conteudo) // item já apagado
  },

  /** Itens escondidos automaticamente (link/telefone) esperando aprovação. */
  async emRevisao() {
    const [t, c] = await Promise.all([
      supabase.from('topicos').select(`id, titulo, texto, ${AUTOR}`).eq('motivo_oculto', 'revisao'),
      supabase.from('comentarios').select(`id, texto, topico_id, ${AUTOR}`).eq('motivo_oculto', 'revisao'),
    ])
    return [
      ...checar(t).map((x) => ({ tipo: 'topico', chave: `topico:${x.id}`, id: x.id, conteudo: x })),
      ...checar(c).map((x) => ({ tipo: 'comentario', chave: `comentario:${x.id}`, id: x.id, conteudo: x })),
    ]
  },

  async conteudo(tipo, id, acao) {
    checar(await supabase.rpc('moderar_conteudo', { tipo, alvo: id, acao }))
  },

  async listarPerfis(busca = '') {
    let consulta = supabase.from('perfis').select('*').order('criado_em', { ascending: false }).limit(50)
    if (busca) consulta = consulta.ilike('apelido', `%${busca}%`)
    return checar(await consulta)
  },

  async usuario(id, acao, horas) {
    checar(await supabase.rpc('moderar_usuario', { alvo: id, acao, horas }))
  },

  async papel(id, novo) {
    checar(await supabase.rpc('definir_papel', { alvo: id, novo }))
  },

  async removerFoto(topico) {
    checar(await supabase.rpc('moderar_conteudo', { tipo: 'topico', alvo: topico.id, acao: 'remover_foto' }))
    await supabase.storage.from(BUCKET).remove([topico.foto_path])
  },
}
