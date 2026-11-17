/** Marca: placa de advertência (losango) com a lâmina de água. */
export function Marca({ tamanho = 30 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 1.5 30.5 16 16 30.5 1.5 16Z" fill="var(--signal)" />
      <path d="M16 4.5 27.5 16 16 27.5 4.5 16Z" fill="none" stroke="var(--signal-ink)" strokeWidth="1.2" />
      <path
        d="M9 17.5c2.3-1.6 4.7 1.6 7 0s4.7 1.6 7 0v3.2c-2.3 1.6-4.7-1.6-7 0s-4.7-1.6-7 0Z"
        fill="var(--signal-ink)"
      />
      <rect x="14.8" y="9" width="2.4" height="6" fill="var(--signal-ink)" />
    </svg>
  )
}
