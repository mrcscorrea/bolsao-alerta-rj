import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { useTheme } from './hooks/useTheme.js'
import { useRolagemSuave } from './hooks/useRolagemSuave.js'
import { MonitoramentoProvider } from './hooks/MonitoramentoContext.jsx'
import { Header } from './components/layout/Header.jsx'
import { PmvTicker } from './components/layout/PmvTicker.jsx'
import { Footer } from './components/layout/Footer.jsx'
import { Home } from './pages/Home.jsx'
import { NaoEncontrada } from './pages/NaoEncontrada.jsx'

// Só a página inicial vem no primeiro download; as outras chegam quando a pessoa abre
const pagina = (carregar, nome) => lazy(() => carregar().then((m) => ({ default: m[nome] })))
const Painel = pagina(() => import('./pages/Painel.jsx'), 'Painel')
const ViaDetalhe = pagina(() => import('./pages/ViaDetalhe.jsx'), 'ViaDetalhe')
const Relatos = pagina(() => import('./pages/Relatos.jsx'), 'Relatos')
const Forum = pagina(() => import('./pages/Forum.jsx'), 'Forum')
const Topico = pagina(() => import('./pages/Topico.jsx'), 'Topico')
const Moderacao = pagina(() => import('./pages/Moderacao.jsx'), 'Moderacao')
const ForumLayout = pagina(() => import('./pages/ForumLayout.jsx'), 'ForumLayout')
import { ErroGeral } from './components/layout/ErroGeral.jsx'

function Layout() {
  const { tema, alternarTema } = useTheme()
  useRolagemSuave()
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header tema={tema} alternarTema={alternarTema} />
      <PmvTicker />
      <main id="conteudo">
        <ErroGeral>
          <Suspense fallback={<div className="container" style={{ minHeight: '70vh' }} aria-busy="true" />}>
            <Outlet context={{ tema }} />
          </Suspense>
        </ErroGeral>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <MonitoramentoProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="painel" element={<Painel />} />
            <Route path="via/:id" element={<ViaDetalhe />} />
            <Route path="relatos" element={<Relatos />} />
            <Route element={<ForumLayout />}>
              <Route path="forum" element={<Forum />} />
              <Route path="forum/:id" element={<Topico />} />
              <Route path="moderacao" element={<Moderacao />} />
            </Route>
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </MonitoramentoProvider>
    </HashRouter>
  )
}
