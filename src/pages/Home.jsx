import { useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { useSimulador } from '../hooks/useSimulador.js'
import { useSitePronto } from '../hooks/useSitePronto.js'
import { useVias } from '../hooks/MonitoramentoContext.jsx'
import { SENSORES } from '../domain/config.js'
import { Regua, SimuladorControles } from '../components/hero/Simulador.jsx'
import { ChecarRota } from '../components/rotas/ChecarRota.jsx'
import { Chuva } from '../components/home/Chuva.jsx'
import { Manchetes } from '../components/home/Manchetes.jsx'
import { DiagramaSensor } from '../components/home/DiagramaSensor.jsx'
import { FOTOS } from '../data/fotos.js'
import styles from './Home.module.css'

/** Faixa com as ondas do calçadão de Copacabana, que correm com a rolagem. */
function Calcadao() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0px', '-480px'])
  return (
    <div ref={ref} className={styles.calcadao} aria-hidden="true">
      <motion.div style={{ '--x': x }} />
    </div>
  )
}

/** Foto em tela cheia que "abre" conforme a rolagem. */
function FotoFinal() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const recorte = useTransform(scrollYProgress, [0, 1], ['inset(18% 12% 0% 12%)', 'inset(0% 0% 0% 0%)'])
  const zoom = useTransform(scrollYProgress, [0, 1], [1.2, 1])
  const foto = FOTOS.avBrasil
  return (
    <section ref={ref} className={styles.final} aria-labelledby="final-titulo">
      <motion.div className={styles.finalFoto} style={{ clipPath: recorte }}>
        <motion.img src={foto.src} alt={foto.alt} loading="lazy" style={{ scale: zoom }} />
      </motion.div>
      <div className={`container ${styles.finalTexto}`}>
        <h2 id="final-titulo">Antes de sair, olhe a via.</h2>
        <Link to="/painel" className={styles.primario}>
          Abrir o painel
        </Link>
        <a href={foto.pagina} target="_blank" rel="noreferrer" className={styles.credito}>
          {foto.legenda} Foto: {foto.autor}, {foto.licenca}
        </a>
      </div>
    </section>
  )
}

export function Home() {
  const { tema } = useOutletContext()
  const simulador = useSimulador()
  const pronto = useSitePronto()
  const { vias } = useVias()
  const { laminaCm, chuvaMmH } = simulador.medidas

  // 0 a 1: quanto do título e da régua está "debaixo d'água"
  const nivel = pronto ? Math.min(1, laminaCm / SENSORES.laminaCm.max) : 0
  const chuva = chuvaMmH / SENSORES.chuvaMmH.max

  return (
    <>
      <Chuva intensidade={chuva} som={simulador.somAtivo} />
      <section className={styles.hero} data-faixa={simulador.faixa} style={{ '--n': nivel, '--chuva': chuva }}>
        <div className={`container ${styles.heroGrade}`}>
          <div className={styles.heroTexto}>
            <h1 className={styles.titulo}>
              <span className={styles.linha} style={{ '--i': 0 }}>
                <span>Dá pra</span>
              </span>
              <span className={styles.linha} style={{ '--i': 1 }}>
                <span>passar?</span>
              </span>
            </h1>
            <p className={styles.sub}>
              Sensores medem a água nos pontos que mais alagam no Rio. Arraste os controles e veja a via encher.
            </p>
            <div className={styles.acoes}>
              <Link to="/painel" className={styles.primario}>
                Ver as vias agora
              </Link>
              <Link to="/relatos" className={styles.secundario}>
                Relatar um bolsão
              </Link>
            </div>
          </div>
          <Regua simulador={simulador} />
          <div className={styles.heroControles}>
            <SimuladorControles simulador={simulador} />
          </div>
        </div>
      </section>

      <Manchetes titulo="Toda chuva forte, a mesma manchete." />

      <Calcadao />

      <section className={`container ${styles.secao}`} aria-labelledby="rota-titulo">
        <h2 id="rota-titulo" className={styles.secaoTitulo}>
          Posso sair agora?
        </h2>
        <ChecarRota vias={vias} tema={tema} />
      </section>

      <section className={`container ${styles.secao}`} aria-labelledby="como-titulo">
        <h2 id="como-titulo" className={styles.secaoTitulo}>
          Um sensor no poste mede a água da pista.
        </h2>
        <p className={styles.secaoTexto}>
          Quando a água sobe, a distância até o chão encurta. A diferença é a lâmina d&apos;água, que, somada à chuva,
          vira um índice de risco de 0 a 100.
        </p>
        <DiagramaSensor />
      </section>

      <FotoFinal />
    </>
  )
}
