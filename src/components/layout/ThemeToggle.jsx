import styles from './ThemeToggle.module.css'

export function ThemeToggle({ tema, alternarTema }) {
  const escuro = tema === 'dark'
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={alternarTema}
      aria-label={escuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={escuro ? 'Modo claro' : 'Modo escuro'}
    >
      <span className={styles.trilho} data-escuro={escuro}>
        <span className={styles.botao}>
          {escuro ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" fill="currentColor" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </span>
    </button>
  )
}
