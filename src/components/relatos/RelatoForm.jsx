import { useEffect, useState } from 'react'
import { VIAS } from '../../domain/vias.js'
import { classificarProfundidade, validarRelato, PROFUNDIDADE_MAX } from '../../domain/relatos.js'
import styles from './RelatoForm.module.css'

const VAZIO = { viaId: '', referencia: '', profundidadeCm: 10, observacao: '' }

/** Formulário de criar/editar relato, com validação antes de enviar. */
export function RelatoForm({ emEdicao, viaInicial, onSalvar, onCancelar }) {
  const [dados, setDados] = useState({ ...VAZIO, viaId: viaInicial ?? '' })
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  // ao clicar em "Editar", preenche o formulário com o relato escolhido
  useEffect(() => {
    if (emEdicao) setDados({ ...VAZIO, ...emEdicao, observacao: emEdicao.observacao ?? '' })
    else setDados({ ...VAZIO, viaId: viaInicial ?? '' })
    setErros({})
  }, [emEdicao, viaInicial])

  function alterar(evento) {
    const { name, value } = evento.target
    setDados((d) => ({ ...d, [name]: value }))
    if (erros[name]) setErros((e) => ({ ...e, [name]: undefined }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    const encontrados = validarRelato(dados)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) {
      evento.target.querySelector(`[name="${Object.keys(encontrados)[0]}"]`)?.focus()
      return
    }
    setEnviando(true)
    const ok = await onSalvar(dados)
    setEnviando(false)
    if (ok && !emEdicao) setDados({ ...VAZIO, viaId: dados.viaId })
  }

  const prof = classificarProfundidade(Number(dados.profundidadeCm) || 0)

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <h2 className={styles.titulo}>{emEdicao ? 'Editar relato' : 'Novo relato'}</h2>

      <div className={styles.campo}>
        <label htmlFor="viaId">Ponto mais próximo</label>
        <select id="viaId" name="viaId" value={dados.viaId} onChange={alterar} aria-invalid={!!erros.viaId}>
          <option value="">Selecione…</option>
          {VIAS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.via} · {v.trecho}
            </option>
          ))}
        </select>
        {erros.viaId && <p className={styles.erro}>{erros.viaId}</p>}
      </div>

      <div className={styles.campo}>
        <label htmlFor="referencia">Onde exatamente?</label>
        <input
          id="referencia"
          name="referencia"
          type="text"
          placeholder="Ex.: pista lateral, perto da passarela"
          value={dados.referencia}
          onChange={alterar}
          maxLength={80}
          aria-invalid={!!erros.referencia}
        />
        {erros.referencia && <p className={styles.erro}>{erros.referencia}</p>}
      </div>

      <div className={styles.campo}>
        <label htmlFor="profundidadeCm">
          Profundidade estimada <output className="mono">{dados.profundidadeCm} cm</output>
        </label>
        <input
          id="profundidadeCm"
          name="profundidadeCm"
          type="range"
          min="1"
          max={PROFUNDIDADE_MAX}
          value={dados.profundidadeCm}
          onChange={alterar}
          className={styles.slider}
          data-faixa={prof.faixa}
        />
        <p className={styles.dica} data-faixa={prof.faixa}>
          {prof.texto}
        </p>
        {erros.profundidadeCm && <p className={styles.erro}>{erros.profundidadeCm}</p>}
      </div>

      <div className={styles.campo}>
        <label htmlFor="observacao">
          Observação <span className={styles.opcional}>(opcional)</span>
        </label>
        <textarea
          id="observacao"
          name="observacao"
          rows="3"
          placeholder="Ex.: carros parados na faixa da direita"
          value={dados.observacao}
          onChange={alterar}
          maxLength={200}
        />
        <p className={styles.contador}>{dados.observacao.length}/200</p>
      </div>

      <p className={styles.privacidade}>Não pedimos nome, placa nem localização. Só o que ajuda outros motoristas.</p>

      <div className={styles.acoes}>
        <button type="submit" className={styles.primario} disabled={enviando}>
          {enviando ? 'Enviando…' : emEdicao ? 'Salvar alterações' : 'Publicar relato'}
        </button>
        {emEdicao && (
          <button type="button" className={styles.secundario} onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
