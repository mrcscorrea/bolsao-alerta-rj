import styles from './Forum.module.css'

/** Mostrado enquanto o .env não tem as chaves do Supabase. */
export function ForumNaoConfigurado() {
  return (
    <div className={styles.painel}>
      <h2 className={styles.painelTitulo}>O fórum ainda não está ligado</h2>
      <p className={styles.meta}>
        Ele precisa de um projeto Supabase: rode <code>supabase/forum.sql</code> no SQL Editor e preencha{' '}
        <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code>.
      </p>
    </div>
  )
}
