import { useCallback, useEffect, useState } from 'react'
import { relatosService, modoApi, RELATOS_POR_PAGINA } from '../services/relatosService.js'

/**
 * Estado + CRUD dos relatos. As mudanças aparecem na hora (otimista) e são
 * desfeitas se a API recusar.
 */
export function useRelatos() {
  const [relatos, setRelatos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [temMais, setTemMais] = useState(false)

  /** Recomeça da primeira página. */
  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const itens = await relatosService.listar(1)
      setRelatos(itens)
      setPagina(1)
      setTemMais(itens.length === RELATOS_POR_PAGINA)
      setErro(null)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  /** Busca a próxima página e junta no fim (sem repetir o que já está na tela). */
  const carregarMais = useCallback(async () => {
    setCarregando(true)
    try {
      const itens = await relatosService.listar(pagina + 1)
      setRelatos((lista) => [...lista, ...itens.filter((n) => !lista.some((r) => r.id === n.id))])
      setPagina(pagina + 1)
      setTemMais(itens.length === RELATOS_POR_PAGINA)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [pagina])

  useEffect(() => {
    carregar()
  }, [carregar])

  const criar = useCallback(async (dados) => {
    const temporario = { ...dados, id: `tmp-${Date.now()}`, pendente: true }
    setRelatos((lista) => [temporario, ...lista])
    try {
      const salvo = await relatosService.criar(dados)
      // mantém a chave do provisório: o item é o mesmo na tela, só ganha o id real
      setRelatos((lista) => lista.map((r) => (r.id === temporario.id ? { ...salvo, chave: temporario.id } : r)))
      return salvo
    } catch (e) {
      setRelatos((lista) => lista.filter((r) => r.id !== temporario.id))
      throw e
    }
  }, [])

  const atualizar = useCallback(async (id, dados) => {
    let anterior
    setRelatos((lista) =>
      lista.map((r) => {
        if (r.id !== id) return r
        anterior = r
        return { ...r, ...dados, pendente: true }
      }),
    )
    try {
      const salvo = await relatosService.atualizar(id, dados)
      setRelatos((lista) => lista.map((r) => (r.id === id ? { ...salvo, chave: r.chave } : r)))
      return salvo
    } catch (e) {
      setRelatos((lista) => lista.map((r) => (r.id === id ? anterior : r)))
      throw e
    }
  }, [])

  const remover = useCallback(async (id) => {
    let removido
    let posicao
    setRelatos((lista) => {
      posicao = lista.findIndex((r) => r.id === id)
      removido = lista[posicao]
      return lista.filter((r) => r.id !== id)
    })
    try {
      await relatosService.remover(id)
    } catch (e) {
      setRelatos((lista) => [...lista.slice(0, posicao), removido, ...lista.slice(posicao)])
      throw e
    }
  }, [])

  return { relatos, carregando, erro, modoApi, temMais, carregar, carregarMais, criar, atualizar, remover }
}
