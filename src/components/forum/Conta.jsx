import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSessao } from '../../hooks/SessaoContext.jsx'
import { conta } from '../../services/forumService.js'
import campos from '../relatos/RelatoForm.module.css'
import styles from './Forum.module.css'

const PAPEIS = { usuario: 'Motorista', moderador: 'Moderador', admin: 'Administrador' }

/** Entrar / criar conta, ou o cartão do perfil de quem já entrou. */
export function Conta({ avisar }) {
  const { usuario, perfil, silenciadoAte, moderador } = useSessao()
  const [modo, setModo] = useState('entrar')
  const [dados, setDados] = useState({ email: '', senha: '', apelido: '', bairro: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const alterar = (e) => setDados((d) => ({ ...d, [e.target.name]: e.target.value }))

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    if (modo === 'cadastrar' && !/^[A-Za-z0-9_.-]{3,24}$/.test(dados.apelido)) {
      setErro('O apelido precisa ter de 3 a 24 letras ou números, sem espaços.')
      return
    }
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await conta.entrar(dados)
      } else {
        const { session } = await conta.cadastrar(dados)
        if (!session) avisar('Conta criada. Confirme pelo link que enviamos para o seu e-mail.')
      }
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (usuario && perfil) {
    return (
      <section className={styles.painel} aria-label="Sua conta">
        <div className={styles.perfil}>
          <span className={styles.avatar} aria-hidden="true">
            {perfil.apelido.slice(0, 2)}
          </span>
          <div>
            <p className={styles.apelido}>{perfil.apelido}</p>
            <p className={styles.meta}>
              {PAPEIS[perfil.papel]}
              {perfil.bairro && ` em ${perfil.bairro}`}
            </p>
          </div>
        </div>
        {perfil.banido && <p className={styles.alerta}>Sua conta foi banida do fórum. Você ainda pode ler.</p>}
        {silenciadoAte && (
          <p className={styles.alerta}>
            Você está silenciado até {new Date(silenciadoAte).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}.
          </p>
        )}
        <div className={styles.linhaAcoes}>
          {moderador && (
            <Link to="/moderacao" className={styles.botao}>
              Moderação
            </Link>
          )}
          <button type="button" className={styles.botaoLeve} onClick={() => conta.sair()}>
            Sair
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.painel} aria-label="Entrar no fórum">
      <div className={styles.abas} role="tablist">
        {[
          ['entrar', 'Entrar'],
          ['cadastrar', 'Criar conta'],
        ].map(([id, rotulo]) => (
          <button key={id} type="button" role="tab" aria-selected={modo === id} onClick={() => setModo(id)}>
            {rotulo}
          </button>
        ))}
      </div>
      <form onSubmit={enviar} className={styles.formConta}>
        {modo === 'cadastrar' && (
          <>
            <div className={campos.campo}>
              <label htmlFor="apelido">Apelido público</label>
              <input id="apelido" name="apelido" value={dados.apelido} onChange={alterar} required maxLength={24} autoComplete="nickname" />
            </div>
            <div className={campos.campo}>
              <label htmlFor="bairro">
                Bairro <span className={campos.opcional}>(opcional)</span>
              </label>
              <input id="bairro" name="bairro" value={dados.bairro} onChange={alterar} maxLength={40} />
            </div>
          </>
        )}
        <div className={campos.campo}>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" value={dados.email} onChange={alterar} required autoComplete="email" />
        </div>
        <div className={campos.campo}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            name="senha"
            type="password"
            value={dados.senha}
            onChange={alterar}
            required
            minLength={6}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          />
        </div>
        {erro && (
          <p className={campos.erro} role="alert">
            {erro}
          </p>
        )}
        {modo === 'cadastrar' && (
          <p className={campos.privacidade}>Só o apelido aparece no fórum. O e-mail serve apenas para entrar.</p>
        )}
        <button type="submit" className={campos.primario} disabled={enviando}>
          {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </section>
  )
}
