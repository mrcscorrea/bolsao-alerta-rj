import { Component } from 'react'

/**
 * Error Boundary: se algum componente quebrar, mostra uma mensagem em vez de
 * deixar a tela vazia. (Error Boundaries ainda precisam ser classe no React.)
 */
export class ErroGeral extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('[Bolsão Alerta] erro na interface:', erro, info.componentStack)
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="container" style={{ padding: '96px 16px' }} role="alert">
        <p className="eyebrow">Algo deu errado</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', margin: '12px 0 16px', textTransform: 'uppercase' }}>
          Via temporariamente interditada.
        </h1>
        <p style={{ color: 'var(--ink-2)', marginBottom: 24 }}>{String(this.state.erro.message)}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ minHeight: 48, padding: '0 20px', border: 0, background: 'var(--signal)', color: 'var(--signal-ink)', fontWeight: 700 }}
        >
          Recarregar a página
        </button>
      </div>
    )
  }
}
