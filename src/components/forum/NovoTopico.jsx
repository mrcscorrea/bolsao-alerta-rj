import { useEffect, useState } from 'react'
import { VIAS } from '../../domain/vias.js'
import { classificarProfundidade } from '../../domain/relatos.js'
import { verificarMensagem } from '../../domain/filtroMensagens.js'
import campos from '../relatos/RelatoForm.module.css'
import styles from './Forum.module.css'

const VAZIO = { viaId: '', titulo: '', texto: '', profundidadeCm: 15, arquivo: null }

/** Abre um tópico sobre um bolsão: ponto, título, relato, profundidade e foto. */
export function NovoTopico({ viaInicial, onPublicar }) {
  const [dados, setDados] = useState({ ...VAZIO, viaId: viaInicial ?? '' })
  const [previa, setPrevia] = useState(null)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // pré-visualização da foto escolhida (e libera a memória ao trocar)
  useEffect(() => {
    if (!dados.arquivo) return setPrevia(null)
    const url = URL.createObjectURL(dados.arquivo)
    setPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [dados.arquivo])

  const alterar = (e) => {
    const { name, value, files } = e.target
    setDados((d) => ({ ...d, [name]: files ? files[0] ?? null : value }))
    setErro(null)
  }

  // o filtro roda enquanto a pessoa digita
  const checagem = verificarMensagem(`${dados.titulo} ${dados.texto}`)
  const prof = classificarProfundidade(Number(dados.profundidadeCm))

  async function enviar(e) {
    e.preventDefault()
    if (!dados.viaId) return setErro('Escolha o ponto mais próximo.')
    if (dados.titulo.trim().length < 4) return setErro('O título precisa ter pelo menos 4 letras.')
    if (!dados.texto.trim()) return setErro('Conte o que você viu.')
    if (!checagem.ok) return setErro(checagem.motivo)
    if (dados.arquivo && dados.arquivo.size > 15 * 1024 * 1024) return setErro('A foto passa de 15 MB.')
    setEnviando(true)
    const ok = await onPublicar({ ...dados, titulo: dados.titulo.trim(), texto: dados.texto.trim(), profundidadeCm: Number(dados.profundidadeCm) })
    setEnviando(false)
    if (ok) setDados({ ...VAZIO, viaId: dados.viaId })
  }

  return (
    <form className={styles.painel} onSubmit={enviar} noValidate>
      <h2 className={styles.painelTitulo}>Abrir um tópico</h2>

      <div className={campos.campo}>
        <label htmlFor="t-via">Ponto mais próximo</label>
        <select id="t-via" name="viaId" value={dados.viaId} onChange={alterar}>
          <option value="">Selecione…</option>
          {VIAS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.via} · {v.trecho}
            </option>
          ))}
        </select>
      </div>

      <div className={campos.campo}>
        <label htmlFor="t-titulo">Título</label>
        <input id="t-titulo" name="titulo" value={dados.titulo} onChange={alterar} maxLength={120} placeholder="Ex.: Bolsão na pista lateral depois da passarela" />
      </div>

      <div className={campos.campo}>
        <label htmlFor="t-texto">O que você viu</label>
        <textarea id="t-texto" name="texto" rows="4" value={dados.texto} onChange={alterar} maxLength={2000} />
        <p className={campos.contador}>{dados.texto.length}/2000</p>
      </div>

      <div className={campos.campo}>
        <label htmlFor="t-prof">
          Profundidade estimada <output>{dados.profundidadeCm} cm</output>
        </label>
        <input id="t-prof" name="profundidadeCm" type="range" min="0" max="100" value={dados.profundidadeCm} onChange={alterar} className={campos.slider} data-faixa={prof.faixa} />
        <p className={campos.dica} data-faixa={prof.faixa}>
          {prof.texto}
        </p>
      </div>

      <div className={campos.campo}>
        <label htmlFor="t-foto">
          Foto <span className={campos.opcional}>(opcional)</span>
        </label>
        <input id="t-foto" name="arquivo" type="file" accept="image/*" onChange={alterar} className={styles.arquivo} />
        <p className={campos.contador}>Evite placas de carro e rostos.</p>
        {previa && <img src={previa} alt="Prévia da foto escolhida" className={styles.previa} />}
      </div>

      {!checagem.ok && <p className={campos.erro}>{checagem.motivo}</p>}
      {checagem.ok && checagem.revisao && <p className={campos.dica}>{checagem.motivo}</p>}
      {erro && checagem.ok && (
        <p className={campos.erro} role="alert">
          {erro}
        </p>
      )}

      <button type="submit" className={campos.primario} disabled={enviando || !checagem.ok}>
        {enviando ? 'Publicando…' : 'Publicar tópico'}
      </button>
    </form>
  )
}
