import { NavLink, Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle.jsx'
import { Marca } from '../ui/Marca.jsx'
import styles from './Header.module.css'

const LINKS = [
  { to: '/', rotulo: 'Início', icone: 'M3 11 12 4l9 7v9h-6v-6H9v6H3Z' },
  { to: '/painel', rotulo: 'Painel', icone: 'M4 4h7v7H4Zm9 0h7v7h-7ZM4 13h7v7H4Zm9 0h7v7h-7Z' },
  { to: '/relatos', rotulo: 'Relatos', icone: 'M4 4h16v12H8l-4 4Z' },
  { to: '/forum', rotulo: 'Fórum', icone: 'M3 5h12v9H7l-4 3Zm6 11h8l4 3V8h-4v6a2 2 0 0 1-2 2Z' },
]

export function Header({ tema, alternarTema }) {
  return (
    <header className={styles.header}>
      <div className={styles.barra}>
        <Link to="/" className={styles.logo} aria-label="Bolsão Alerta RJ, início">
          <Marca />
          <span className={styles.nome}>
            Bolsão<b>Alerta</b>
          </span>
          <span className={styles.rj}>RJ</span>
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? styles.ativo : undefined)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={l.icone} />
              </svg>
              <span>{l.rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <ThemeToggle tema={tema} alternarTema={alternarTema} />
      </div>
    </header>
  )
}
