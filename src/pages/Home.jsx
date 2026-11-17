import { lazy, Suspense } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSimulador } from '../hooks/useSimulador.js'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import { useVias } from '../hooks/MonitoramentoContext.jsx'
import { FAIXAS } from '../domain/config.js'
import { Simulador } from '../components/hero/Simulador.jsx'
import { HeroFallback } from '../components/hero/HeroFallback.jsx'
import styles from './Home.module.css'

// o 3D (three.js) só é baixado quando for usado: fica num arquivo separado
const HeroScene = lazy(() => import('../components/hero/HeroScene.jsx'))

function suportaWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
const TEM_WEBGL = suportaWebGL()

const DADOS = [
  {
    numero: '84',
    texto: 'pontos de bolsão registrados pela Prefeitura em um único temporal.',
    fonte: 'Monitor Mercantil',
  },
  {
    numero: '16',
    texto: 'bolsões em uma só chuva de fevereiro de 2026, na Zona Oeste e na Barra.',
    fonte: 'SBT News',
  },
  {
    numero: '40 cm',
    texto: 'de água bastam para a entrada de ar de um carro comum puxar água: calço hidráulico.',
    fonte: 'referência técnica do projeto',
  },
]

const ETAPAS = [
  { n: '01', titulo: 'Sensor', texto: 'Ultrassônico mede a distância até o asfalto; o pluviômetro mede a chuva.' },
  { n: '02', titulo: 'ESP32', texto: 'Calcula o risco na hora e acende o LED verde, amarelo ou vermelho com buzzer.' },
  { n: '03', titulo: 'ThingSpeak', texto: 'Recebe as leituras pela internet e guarda o histórico na nuvem.' },
  { n: '04', titulo: 'Python', texto: 'Cruza as duas medidas no Índice de Risco, detecta tendência e gera alertas.' },
  { n: '05', titulo: 'Este site', texto: 'Mostra ao motorista, antes de sair, quais vias evitar agora.' },
]

const surgir = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

export function Home() {
  const { tema } = useOutletContext()
  const simulador = useSimulador()
  const reduzirMovimento = usePrefersReducedMotion()
  const { vias, pior } = useVias()
  const usar3D = TEM_WEBGL && !reduzirMovimento
  const emAlerta = vias.filter((v) => v.atual.faixa !== 'NORMAL').length

  // o título "aperta" conforme o risco sobe (eixo de largura da fonte variável)
  const largura = Math.round(125 - simulador.risco * 0.5)

  return (
    <>
      <section className={styles.hero} data-faixa={simulador.faixa}>
        <div className={styles.cena}>
          {usar3D ? (
            <Suspense fallback={<HeroFallback laminaCm={simulador.medidas.laminaCm} />}>
              <HeroScene
                laminaCm={simulador.medidas.laminaCm}
                chuvaMmH={simulador.medidas.chuvaMmH}
                tema={tema}
              />
            </Suspense>
          ) : (
            <HeroFallback laminaCm={simulador.medidas.laminaCm} />
          )}
        </div>

        <div className={`container ${styles.heroGrade}`}>
          <div className={styles.heroTexto}>
            <p className="eyebrow">Rio de Janeiro · vias expressas</p>
            <h1 className={styles.titulo} style={{ fontVariationSettings: `'wdth' ${largura}` }}>
              A água sobe antes do aviso chegar.
            </h1>
            <p className={styles.sub}>
              Sensores nos pontos que mais alagam medem a lâmina d&apos;água e a chuva em tempo real. Você confere a
              via <strong>antes</strong> de entrar no bolsão.
            </p>
            <div className={styles.acoes}>
              <Link to="/painel" className={styles.primario}>
                Ver vias agora
              </Link>
              <Link to="/relatos" className={styles.secundario}>
                Relatar bolsão
              </Link>
            </div>
            {vias.length > 0 && (
              <p className={styles.agora} data-faixa={pior}>
                <span className={styles.ponto} aria-hidden="true" />
                {emAlerta === 0
                  ? 'Agora: nenhuma via monitorada com acúmulo de água.'
                  : `Agora: ${emAlerta} de ${vias.length} pontos com água acumulada · pior situação: ${FAIXAS[pior].rotulo}.`}
              </p>
            )}
          </div>

          <div className={styles.heroSim}>
            <Simulador simulador={simulador} />
          </div>
        </div>
      </section>

      <section className={`container ${styles.secao}`} aria-labelledby="problema-titulo">
        <motion.div {...surgir} className={styles.secaoCabecalho}>
          <p className="eyebrow">O problema</p>
          <h2 id="problema-titulo" className={styles.secaoTitulo}>
            Toda chuva forte, a mesma cena: carro parado com água na porta.
          </h2>
          <p className={styles.secaoTexto}>
            Av. Brasil, Linha Vermelha, Praça da Bandeira, acesso ao Rebouças. O motorista só descobre o bolsão
            quando já está dentro dele. Os alertas oficiais falam da cidade; quem dirige precisa saber da{' '}
            <em>via</em>.
          </p>
        </motion.div>

        <ol className={styles.dados}>
          {DADOS.map((d, i) => (
            <motion.li key={d.numero} {...surgir} transition={{ ...surgir.transition, delay: i * 0.08 }}>
              <span className={styles.numero}>{d.numero}</span>
              <p>{d.texto}</p>
              <small className="mono">Fonte: {d.fonte}</small>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.secao}`} aria-labelledby="como-titulo">
        <motion.div {...surgir} className={styles.secaoCabecalho}>
          <p className="eyebrow">Como funciona</p>
          <h2 id="como-titulo" className={styles.secaoTitulo}>
            Do asfalto à sua tela em cinco passos.
          </h2>
        </motion.div>

        <ol className={styles.etapas}>
          {ETAPAS.map((e, i) => (
            <motion.li key={e.n} {...surgir} transition={{ ...surgir.transition, delay: i * 0.07 }}>
              <span className={`mono ${styles.etapaN}`}>{e.n}</span>
              <h3>{e.titulo}</h3>
              <p>{e.texto}</p>
            </motion.li>
          ))}
        </ol>

        <motion.div {...surgir} className={styles.faixas}>
          {Object.values(FAIXAS).map((f, i) => (
            <div key={f.id} data-faixa={f.id} className={styles.faixaItem}>
              <span className="mono">{['0 a 39', '40 a 69', '70 a 100'][i]}</span>
              <strong>{f.rotulo}</strong>
              <p>{f.texto}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className={`container ${styles.secao}`}>
        <motion.div {...surgir} className={styles.chamada}>
          <h2>Antes de sair de casa, olhe a via.</h2>
          <Link to="/painel" className={styles.primario}>
            Abrir o painel
          </Link>
        </motion.div>
      </section>
    </>
  )
}
