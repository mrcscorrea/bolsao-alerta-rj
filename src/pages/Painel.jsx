import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useVias } from '../hooks/MonitoramentoContext.jsx'
import { contagemPorFaixa } from '../domain/risco.js'
import { filtrarVias, ordenarPorRisco } from '../domain/filtros.js'
import { MapaVias } from '../components/vias/MapaVias.jsx'
import { ViaCard } from '../components/vias/ViaCard.jsx'
import { FiltroVias } from '../components/vias/FiltroVias.jsx'
import { CabecalhoPagina, FonteDados } from '../components/ui/CabecalhoPagina.jsx'
import styles from './Painel.module.css'

export function Painel() {
  const { vias, carregando, erro, atualizadoEm } = useVias()
  const [faixa, setFaixa] = useState('TODAS')
  const [busca, setBusca] = useState('')
  const [destacada, setDestacada] = useState(null)

  const contagem = useMemo(() => contagemPorFaixa(vias.map((v) => v.atual)), [vias])
  const visiveis = useMemo(() => ordenarPorRisco(filtrarVias(vias, { faixa, busca })), [vias, faixa, busca])

  return (
    <div className="container">
      <CabecalhoPagina
        eyebrow="Painel ao vivo"
        titulo="Como estão as vias agora"
        texto="Cada ponto tem um sensor ultrassônico medindo a lâmina d'água e um pluviômetro medindo a chuva. Os dois viram um Índice de Risco de 0 a 100."
      >
        <FonteDados vias={vias} atualizadoEm={atualizadoEm} />
      </CabecalhoPagina>

      {erro && <p className={styles.erro}>Não foi possível atualizar: {erro}</p>}

      <div className={styles.grade}>
        <div className={styles.mapaCol}>
          {carregando ? <div className={styles.esqueleto} /> : <MapaVias vias={vias} destacada={destacada} onDestacar={setDestacada} />}
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
