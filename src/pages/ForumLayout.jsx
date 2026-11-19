import { Outlet, useOutletContext } from 'react-router-dom'
import { SessaoProvider } from '../hooks/SessaoContext.jsx'

/**
 * Envolve só as telas do fórum com a sessão do Supabase. Assim o cliente do
 * Supabase (pesado) só é baixado quando alguém abre o fórum.
 */
export function ForumLayout() {
  return (
    <SessaoProvider>
      <Outlet context={useOutletContext()} />
    </SessaoProvider>
  )
}
