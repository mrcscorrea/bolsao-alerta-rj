import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useRelatos } from '../hooks/useRelatos.js'
import { montarRelato } from '../domain/relatos.js'
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina.jsx'
import { RelatoForm } from '../components/relatos/RelatoForm.jsx'
import { RelatoItem } from '../components/relatos/RelatoItem.jsx'
import { Aviso } from '../components/ui/Aviso.jsx'
import styles from './Relatos.module.css'

export function Relatos() {
  const { relatos, carregando, erro, modoApi, carregar, criar, atualizar, remover } = useRelatos()
  const [params] = useSearchParams()
  const [emEdicao, setEmEdicao] = useState(null)
  const [aviso, setAviso] = useState(null)
  const formRef = useRef(null)

  // o aviso some sozinho depois de 4 segundos
  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(id)
  }, [aviso])

  const avisar = (texto, tipo = 'ok') => setAviso({ id: Date.now(), texto, tipo })

  async function salvar(dados) {
    try {
      if (emEdicao) {
        await atualizar(emEdicao.id, montarRelato(dados, emEdicao.criadoEm))
        setEmEdicao(null)
        avisar('Relato atualizado.')
      } else {
        await criar(montarRelato(dados))
        avisar('Relato publicado. Obrigado por avisar!')
      }
      return true
    } catch (e) {
      avisar(`Não foi possível salvar: ${e.message}`, 'erro')
      return false
    }
  }

  async function excluir(id) {
    if (emEdicao?.id === id) setEmEdicao(null)
    try {
      await remover(id)
      avisar('Relato removido.')
    } catch (e) {
      avisar(`Não foi possível remover: ${e.message}`, 'erro')
    }
  }

  function editar(relato) {
    setEmEdicao(relato)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="container">
      <CabecalhoPagina
        eyebrow="Relatos do cidadão"
        titulo="Viu um bolsão? Avise quem vem atrás"
        texto="Os sensores cobrem pontos fixos. Os relatos de quem está na rua completam o mapa: publique, corrija ou apague o seu a qualquer momento."
      />

      {modoApi === 'local' && (
        <p className={styles.modo}>
          Modo demonstração: a API externa não está configurada, então os relatos ficam salvos só neste navegador.
        </p>
      )}

      <div className={styles.grade}>
        <div ref={formRef} className={styles.formCol}>
          <RelatoForm
            emEdicao={emEdicao}
            viaInicial={params.get('via')}
            onSalvar={salvar}
            onCancelar={() => setEmEdicao(null)}
          />
        </div>

        <section aria-labelledby="lista-titulo">
          <div className={styles.listaTopo}>
            <h2 id="lista-titulo" className={styles.listaTitulo}>
              Relatos recentes <span className="mono">{relatos.length}</span>
            </h2>
            <button type="button" className={styles.recarregar} onClick={carregar}>
              Atualizar
            </button>
          </div>

          {erro && (
            <p className={styles.erro}>
              {erro}.{' '}
              <button type="button" onClick={carregar}>
                Tentar de novo
              </button>
            </p>
          )}

          {carregando && relatos.length === 0 ? (
            <ul className={styles.lista} aria-busy="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className={styles.esqueleto} />
              ))}
            </ul>
          ) : relatos.length === 0 && !erro ? (
            <p className={styles.vazio}>Nenhum relato por enquanto. Pista seca, ou ninguém avisou ainda.</p>
          ) : (
            <ul className={styles.lista}>
              <AnimatePresence mode="popLayout" initial={false}>
                {relatos.map((r) => (
                  <RelatoItem
                    key={r.id}
                    relato={r}
                    emEdicao={emEdicao?.id === r.id}
                    onEditar={editar}
                    onRemover={excluir}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>
      </div>

      <Aviso aviso={aviso} onFechar={() => setAviso(null)} />
    </div>
  )
}
