import { requisitar } from './http.js'

/**
 * CRUD dos relatos de bolsão na MockAPI (API REST externa).
 * Recurso: relatos { id, viaId, referencia, profundidadeCm, observacao, criadoEm }
 * Sem VITE_MOCKAPI_URL configurada, cai num modo local (localStorage) para a
 * demonstração não parar — a interface avisa quando isso acontece.
 */
// o valor de exemplo do .env (SEU_ID) conta como "não configurado"
const URL_ENV = import.meta.env.VITE_MOCKAPI_URL ?? ''
const BASE = URL_ENV.includes('SEU_ID') ? '' : URL_ENV.replace(/\/$/, '')
const URL_RELATOS = `${BASE}/relatos`

export const modoApi = BASE ? 'mockapi' : 'local'
export const RELATOS_POR_PAGINA = 10

function normalizar(r) {
  return { ...r, id: String(r.id), profundidadeCm: Number(r.profundidadeCm) }
}

const api = {
  /** Uma página de relatos, mais novos primeiro (página começa em 1, como na MockAPI). */
  async listar(pagina = 1) {
    const dados = await requisitar(`${URL_RELATOS}?sortBy=criadoEm&order=desc&page=${pagina}&limit=${RELATOS_POR_PAGINA}`)
    return dados.map(normalizar)
  },
  async criar(relato) {
    return normalizar(await requisitar(URL_RELATOS, { method: 'POST', body: relato }))
  },
  async atualizar(id, relato) {
    return normalizar(await requisitar(`${URL_RELATOS}/${id}`, { method: 'PUT', body: relato }))
  },
  async remover(id) {
    await requisitar(`${URL_RELATOS}/${id}`, { method: 'DELETE' })
  },
}

const CHAVE = 'relatos-local'
const ler = () => {
  try { return JSON.parse(localStorage.getItem(CHAVE)) ?? [] } catch { return [] }
}
const gravar = (lista) => {
  try { localStorage.setItem(CHAVE, JSON.stringify(lista)) } catch { /* sem armazenamento */ }
}

const local = {
  async listar(pagina = 1) {
    return ler().slice((pagina - 1) * RELATOS_POR_PAGINA, pagina * RELATOS_POR_PAGINA)
  },
  async criar(relato) {
    const novo = { ...relato, id: String(Date.now()) }
    gravar([novo, ...ler()])
    return novo
  },
  async atualizar(id, relato) {
    const atualizado = { ...relato, id }
    gravar(ler().map((r) => (r.id === id ? atualizado : r)))
    return atualizado
  },
  async remover(id) {
    gravar(ler().filter((r) => r.id !== id))
  },
}

export const relatosService = BASE ? api : local
