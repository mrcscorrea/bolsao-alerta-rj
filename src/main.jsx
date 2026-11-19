import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { iniciarCarregamento } from './carregamento.js'
import 'lenis/dist/lenis.css'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

iniciarCarregamento()
