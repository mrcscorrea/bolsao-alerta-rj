import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme.js'
import { MonitoramentoProvider } from './hooks/MonitoramentoContext.jsx'
import { Header } from './components/layout/Header.jsx'
import { PmvTicker } from './components/layout/PmvTicker.jsx'
import { Footer } from './components/layout/Footer.jsx'
import { Home } from './pages/Home.jsx'
import { Painel } from './pages/Painel.jsx'
import { ViaDetalhe } from './pages/ViaDetalhe.jsx'
import { Relatos } from './pages/Relatos.jsx'
import { NaoEncontrada } from './pages/NaoEncontrada.jsx'

/** Volta ao topo a cada troca de página. */
function RolarAoTopo() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function Layout() {
  const { tema, alternarTema } = useTheme()
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header tema={tema} alternarTema={alternarTema} />
      <PmvTicker />
      <main id="conteudo">
        <Outlet context={{ tema }} />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <RolarAoTopo />
      <MonitoramentoProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="painel" element={<Painel />} />
            <Route path="via/:id" element={<ViaDetalhe />} />
            <Route path="relatos" element={<Relatos />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </MonitoramentoProvider>
    </HashRouter>
  )
}
