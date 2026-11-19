import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { forumConfigurado } from '../services/supabase.js'
import { conta } from '../services/forumService.js'

const SessaoContext = createContext(null)

/** Quem está logado no fórum + o perfil (apelido, papel, banido, silenciado). */
export function SessaoProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(forumConfigurado)
  const [versao, setVersao] = useState(0) // muda para forçar recarregar o perfil

  // O Supabase avisa a sessão inicial (INITIAL_SESSION) e cada login/logout por aqui.
  // Só guardamos o usuário quando o id muda: renovar o token não dispara nova consulta.
  useEffect(() => {
    if (!forumConfigurado) return
    return conta.aoMudar((sessao) => {
      const novo = sessao?.user ?? null
      setUsuario((atual) => (atual?.id === novo?.id ? atual : novo))
      if (!novo) setCarregando(false)
    })
  }, [])

  const usuarioId = usuario?.id
  useEffect(() => {
    if (!usuarioId) return setPerfil(null)
    let ativo = true
    conta
      .perfil(usuarioId)
      .catch(() => null)
      .then((p) => {
        if (!ativo) return
        setPerfil(p)
        setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [usuarioId, versao])

  // mesmo objeto enquanto nada muda: as telas que leem a sessão não redesenham à toa
  const valor = useMemo(() => {
    const silenciadoAte = perfil?.silenciado_ate && new Date(perfil.silenciado_ate) > new Date() ? perfil.silenciado_ate : null
    return {
      configurado: forumConfigurado,
      carregando,
      usuario,
      perfil,
      moderador: perfil?.papel === 'moderador' || perfil?.papel === 'admin',
      admin: perfil?.papel === 'admin',
      silenciadoAte,
      podePostar: Boolean(perfil && !perfil.banido && !silenciadoAte),
      recarregarPerfil: () => setVersao((v) => v + 1),
    }
  }, [carregando, usuario, perfil])
  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>
}

export function useSessao() {
  const ctx = useContext(SessaoContext)
  if (!ctx) throw new Error('useSessao precisa estar dentro de <SessaoProvider>')
  return ctx
}
