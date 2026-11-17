import { useCallback, useEffect, useState } from 'react'
import { relatosService, modoApi } from '../services/relatosService.js'

/**
 * Estado + CRUD dos relatos. As mudanças aparecem na hora (otimista) e são
 * desfeitas se a API recusar.
 */
export function useRelatos() {
  const [relatos, setRelatos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      setRelatos(await relatosService.listar())
      setErro(null)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const criar = useCallback(async (dados) => {
    const temporario = { ...dados, id: `tmp-${Date.now()}`, pendente: true }
    setRelatos((lista) => [temporario, ...lista])
    try {
      const salvo = await relatosService.criar(dados)
      setRelatos((lista) => lista.map((r) => (r.id === temporario.id ? salvo : r)))
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
      setRelatos((lista) => lista.map((r) => (r.id === id ? salvo : r)))
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

  return { relatos, carregando, erro, modoApi, carregar, criar, atualizar, remover }
}
