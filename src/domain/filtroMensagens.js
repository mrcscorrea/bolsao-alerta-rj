/**
 * Filtro de mensagens do fórum. A MESMA regra roda no banco
 * (supabase/forum.sql); aqui ela só avisa a pessoa antes de enviar.
 *
 * Normalizar derruba os disfarces mais comuns:
 *   "P0rr@"  -> "pora"   (números/símbolos viram letras)
 *   "m.e.r.d.a" -> "merda" (some a pontuação no meio)
 *   "merdaaaa" -> "merda"  (letras repetidas viram uma só)
 */
const LISTA = [
  'porra', 'caralho', 'merda', 'bosta', 'puta', 'puto', 'foda', 'foder', 'fodase', 'buceta',
  'arrombado', 'arrombada', 'desgracado', 'desgracada', 'otario', 'otaria', 'babaca', 'imbecil',
  'retardado', 'retardada', 'vagabundo', 'vagabunda', 'piranha', 'corno', 'cuzao', 'viado', 'escroto',
]

const TROCAS = { 4: 'a', '@': 'a', 3: 'e', 1: 'i', 0: 'o', 5: 's', $: 's', 7: 't' }

export function normalizarParaFiltro(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos
    .toLowerCase()
    .replace(/[4@3105$7]/g, (c) => TROCAS[c])
    .replace(/[^a-z\s]/g, '')
    .replace(/(.)\1+/g, '$1')
}

const BLOQUEADAS = new Set(LISTA.map(normalizarParaFiltro))
const LINK_OU_TELEFONE = /(https?:\/\/|www\.|\.com\b|\.br\b|\d{4,5}-?\d{4})/i

/**
 * Confere um texto antes de publicar.
 * @returns {{ ok: boolean, motivo?: string, revisao?: boolean }}
 */
export function verificarMensagem(texto) {
  const palavras = normalizarParaFiltro(texto).split(/\s+/)
  if (palavras.some((p) => BLOQUEADAS.has(p))) {
    return { ok: false, motivo: 'A mensagem tem palavras que não são permitidas no fórum. Reescreva sem ofensas.' }
  }
  if (LINK_OU_TELEFONE.test(texto)) {
    return { ok: true, revisao: true, motivo: 'Links e telefones passam por um moderador antes de aparecer.' }
  }
  return { ok: true, revisao: false }
}
