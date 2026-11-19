import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { MANCHETES } from '../../data/manchetes.js'
import { FOTOS } from '../../data/fotos.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import styles from './Manchetes.module.css'

function mesAno(iso) {
  const [a, m] = iso.split('-').map(Number)
  return new Date(a, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ')
}

/**
 * Recortes reais: a mesma cena se repete a cada temporal. No desktop a seção
 * "gruda" na tela e a rolagem vertical empurra as manchetes para o lado.
 */
export function Manchetes({ titulo }) {
  const secao = useRef(null)
  const trilho = useRef(null)
  const reduzir = usePrefersReducedMotion()
  const [distancia, setDistancia] = useState(0)

  useLayoutEffect(() => {
    function medir() {
      const largo = window.matchMedia('(min-width: 900px)').matches
      setDistancia(largo ? Math.max(0, trilho.current.scrollWidth - document.documentElement.clientWidth) : 0)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  const { scrollYProgress } = useScroll({ target: secao, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distancia])
  const fixar = !reduzir && distancia > 0

  return (
    <section
      ref={secao}
      className={styles.secao}
      style={fixar ? { height: `calc(100vh + ${distancia}px)` } : undefined}
      aria-labelledby="manchetes-titulo"
    >
      <div className={fixar ? styles.fixo : styles.solto}>
        <h2 id="manchetes-titulo" className={styles.titulo}>
          {titulo}
        </h2>
        <motion.ol ref={trilho} className={styles.trilho} style={fixar ? { x } : undefined}>
          {MANCHETES.map((m, i) => {
            const foto = FOTOS[m.foto]
            return (
              <li key={m.url} className={i === 0 ? styles.primeira : undefined}>
                <a href={m.url} target="_blank" rel="noreferrer" className={styles.cartao}>
                  <img src={foto.src} alt="" loading="lazy" decoding="async" className={styles.foto} />
                  <time dateTime={m.data} className={styles.data}>
                    {mesAno(m.data)}
                  </time>
                  <h3>{m.titulo}</h3>
                  <p className={styles.fonte}>
                    {m.veiculo} <span>{m.local}</span>
                  </p>
                </a>
                <a href={foto.pagina} target="_blank" rel="noreferrer" className={styles.credito}>
                  Foto ilustrativa: {foto.legenda} {foto.autor}, {foto.licenca}
                </a>
              </li>
            )
          })}
        </motion.ol>
      </div>
    </section>
  )
}
