import { FAIXAS, ORDEM_FAIXAS } from '../../domain/config.js'
import styles from './FiltroVias.module.css'

/** Contadores por faixa que também funcionam como filtro + campo de busca. */
export function FiltroVias({ contagem, total, faixa, onFaixa, busca, onBusca }) {
  const opcoes = [{ id: 'TODAS', rotulo: 'Todas', valor: total }, ...ORDEM_FAIXAS.map((f) => ({ id: f, rotulo: FAIXAS[f].rotulo, valor: contagem[f] }))]

  return (
    <div className={styles.filtro}>
      <div className={styles.contadores} role="group" aria-label="Filtrar por situação">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            className={styles.contador}
            data-faixa={o.id === 'TODAS' ? undefined : o.id}
            aria-pressed={faixa === o.id}
            onClick={() => onFaixa(faixa === o.id ? 'TODAS' : o.id)}
          >
            <span className={`mono ${styles.numero}`}>{String(o.valor).padStart(2, '0')}</span>
            <span className={styles.rotulo}>{o.rotulo}</span>
          </button>
        ))}
      </div>

      <label className={styles.busca}>
        <span className="sr-only">Buscar via</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </svg>
        <input
          type="search"
          placeholder="Buscar via ou bairro"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          autoComplete="off"
        />
      </label>
    </div>
  )
}
