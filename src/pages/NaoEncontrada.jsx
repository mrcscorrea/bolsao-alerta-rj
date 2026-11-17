import { Link } from 'react-router-dom'

export function NaoEncontrada() {
  return (
    <section className="container" style={{ padding: '96px 0' }}>
      <p className="eyebrow">Erro 404</p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', margin: '12px 0 24px' }}>Via interditada.</h1>
      <p>Esta página não existe. <Link to="/">Voltar ao início</Link>.</p>
    </section>
  )
}
