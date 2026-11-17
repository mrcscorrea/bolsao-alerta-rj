import styles from './Leds.module.css'

const LEDS = [
  { faixa: 'NORMAL', nome: 'verde' },
  { faixa: 'ATENCAO', nome: 'amarelo' },
  { faixa: 'PERIGO', nome: 'vermelho' },
]

/** Os três LEDs do circuito: só o da faixa atual acende. */
export function Leds({ faixa }) {
  return (
    <div className={styles.leds} role="img" aria-label={`LED aceso: ${LEDS.find((l) => l.faixa === faixa).nome}`}>
      {LEDS.map((l) => (
        <span key={l.faixa} className={styles.led} data-cor={l.faixa} data-aceso={l.faixa === faixa} />
      ))}
    </div>
  )
}
