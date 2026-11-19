import { createClient } from '@supabase/supabase-js'

/**
 * Cliente do Supabase (fórum: contas, tópicos, comentários e fotos).
 * A chave "anon" é pública por definição; quem protege os dados são as
 * regras RLS do banco (supabase/forum.sql).
 */
const URL = import.meta.env.VITE_SUPABASE_URL
const CHAVE = import.meta.env.VITE_SUPABASE_ANON_KEY

export const forumConfigurado = Boolean(URL && CHAVE)
const TEMPO_LIMITE_MS = 12_000

/** fetch com tempo limite: rede ruim não deixa a tela esperando para sempre. */
function fetchComLimite(url, opcoes = {}) {
  const limite = AbortSignal.timeout(TEMPO_LIMITE_MS)
  const sinal = opcoes.signal ? AbortSignal.any([opcoes.signal, limite]) : limite
  return fetch(url, { ...opcoes, signal: sinal })
}

export const supabase = forumConfigurado ? createClient(URL, CHAVE, { global: { fetch: fetchComLimite } }) : null

const TRADUCOES = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/user already registered/i, 'Esse e-mail já tem conta. Entre com ele.'],
  [/email not confirmed/i, 'Confirme o e-mail pelo link que enviamos antes de entrar.'],
  [/password should be at least/i, 'A senha precisa ter pelo menos 6 caracteres.'],
  [/database error saving new user/i, 'Não deu para criar o perfil. Tente outro apelido.'],
  [/row-level security/i, 'Sua conta não pode publicar agora (silenciada ou banida).'],
  [/rate limit/i, 'Muitas tentativas seguidas. Espere um pouco e tente de novo.'],
  [/failed to fetch|network/i, 'Sem conexão com o servidor do fórum.'],
  [/timeout|aborted/i, 'O servidor do fórum demorou demais. Tente de novo.'],
]

/** Transforma o erro do Supabase numa frase que a pessoa entende. */
export function traduzirErro(erro) {
  const texto = erro?.message ?? String(erro)
  if (texto.startsWith('BLOQUEADO:')) return texto.replace('BLOQUEADO: ', '')
  const achado = TRADUCOES.find(([padrao]) => padrao.test(texto))
  return achado ? achado[1] : texto
}

/** Lança um Error já traduzido quando a resposta do Supabase trouxer erro. */
export function checar({ data, error }) {
  if (error) throw new Error(traduzirErro(error))
  return data
}
