import { requisitar } from './http.js'

/**
 * CRUD dos relatos de bolsão na MockAPI (API REST externa).
 * Recurso: relatos { id, viaId, referencia, profundidadeCm, observacao, criadoEm }
 * Sem VITE_MOCKAPI_URL configurada, cai num modo local (localStorage) para a
 * demonstração não parar — a interface avisa quando isso acontece.
 */
const BASE = import.meta.env.VITE_MOCKAPI_URL?.replace(/\/$/, '')
const URL_RELATOS = `${BASE}/relatos`

export const modoApi = BASE ? 'mockapi' : 'local'

function normalizar(r) {
  return { ...r, id: String(r.id), profundidadeCm: Number(r.profundidadeCm) }
}

const api = {
  async listar() {
    const dados = await requisitar(`${URL_RELATOS}?sortBy=criadoEm&order=desc`)
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
  async listar() {
    return ler()
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
