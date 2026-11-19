import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useVias } from '../hooks/MonitoramentoContext.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import { contagemPorFaixa } from '../domain/risco.js'
import { filtrarVias, ordenarPorRisco } from '../domain/filtros.js'
import { MapaVias } from '../components/vias/MapaVias.jsx'
import { MapaReal } from '../components/vias/MapaReal.jsx'
import { ViaCard } from '../components/vias/ViaCard.jsx'
import { FiltroVias } from '../components/vias/FiltroVias.jsx'
import { CabecalhoPagina, FonteDados } from '../components/ui/CabecalhoPagina.jsx'
import styles from './Painel.module.css'

export function Painel() {
  const { vias, carregando, erro, atualizadoEm } = useVias()
  const [faixa, setFaixa] = useState('TODAS')
  const [busca, setBusca] = useState('')
  const [destacada, setDestacada] = useState(null)
  const [modoMapa, setModoMapa] = useState('real')
  const [falhou, setFalhou] = useState(false)
  const { tema } = useOutletContext()
  const usarReal = modoMapa === 'real' && !falhou

  const contagem = useMemo(() => contagemPorFaixa(vias.map((v) => v.atual)), [vias])
  const buscaEstavel = useDebounce(busca, 200) // o campo responde na hora; a lista e o mapa, quando a digitação para
  const visiveis = useMemo(() => ordenarPorRisco(filtrarVias(vias, { faixa, busca: buscaEstavel })), [vias, faixa, buscaEstavel])

  return (
    <div className="container">
      <CabecalhoPagina
        titulo="Como estão as vias agora"
        texto="Cada ponto tem um sensor ultrassônico medindo a lâmina d'água e um pluviômetro medindo a chuva. Os dois viram um Índice de Risco de 0 a 100."
      >
        <FonteDados vias={vias} atualizadoEm={atualizadoEm} />
      </CabecalhoPagina>

      {erro && <p className={styles.erro}>Não foi possível atualizar: {erro}</p>}

      <div className={styles.grade}>
        <div className={styles.mapaCol}>
          <div className={styles.alternar} role="group" aria-label="Tipo de mapa">
            <button type="button" aria-pressed={usarReal} onClick={() => { setFalhou(false); setModoMapa('real') }}>
              Mapa real
            </button>
            <button type="button" aria-pressed={!usarReal} onClick={() => setModoMapa('esquema')}>
              Esquema
            </button>
          </div>
          {falhou && modoMapa === 'real' && (
            <p className={styles.aviso}>Não foi possível carregar o mapa real. Mostrando o esquema.</p>
          )}
          <div className="prancha">
            {carregando ? (
              <div className={styles.esqueleto} />
            ) : usarReal ? (
              <MapaReal vias={vias} destacada={destacada} onDestacar={setDestacada} tema={tema} onFalha={() => setFalhou(true)} />
            ) : (
              <MapaVias vias={vias} destacada={destacada} onDestacar={setDestacada} />
            )}
          </div>
        </div>

        <div className={styles.listaCol}>
          <FiltroVias
            contagem={contagem}
            total={vias.length}
            faixa={faixa}
            onFaixa={setFaixa}
            busca={busca}
            onBusca={setBusca}
          />

          <p className={styles.resultado} aria-live="polite">
            {visiveis.length === 0
              ? 'Nenhuma via encontrada com esse filtro.'
              : `${visiveis.length} ${visiveis.length === 1 ? 'via' : 'vias'}, mais arriscadas primeiro`}
          </p>

          <ul className={styles.lista}>
            <AnimatePresence mode="popLayout">
              {visiveis.map((v) => (
                <ViaCard key={v.id} via={v} destacada={destacada === v.id} onDestacar={setDestacada} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  )
}
