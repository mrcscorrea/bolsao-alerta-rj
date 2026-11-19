import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { tocarTrovao } from '../../services/buzzer.js'
import styles from './Chuva.module.css'

const RAIO = 90 // raio do "guarda-chuva" em volta do cursor, em px
const VENTO = -0.8 // inclinação da chuva (px por quadro)
const CHUVA_COM_RAIOS = 0.45 // abaixo disso não tem relâmpago

/** Caminho em zigue-zague do relâmpago, com alguns galhos. */
function gerarRelampago(largura, altura) {
  const linhas = []
  function galho(x, y, fimY, espessura, chanceGalho) {
    const pontos = [[x, y]]
    while (y < fimY) {
      x += (Math.random() - 0.5) * 36
      y += 14 + Math.random() * 22
      pontos.push([x, y])
      if (Math.random() < chanceGalho) galho(x, y, y + (fimY - y) * 0.4, espessura * 0.5, 0)
    }
    linhas.push({ pontos, espessura })
  }
  galho(largura * (0.12 + Math.random() * 0.76), 0, altura * (0.4 + Math.random() * 0.35), 2.4, 0.14)
  return linhas
}

/** Brilho do relâmpago ao longo do tempo: pisca, apaga, pisca de novo e some. */
function brilhoNoTempo(t) {
  if (t < 0.05) return 1
  if (t < 0.11) return 0.25
  if (t < 0.18) return 0.85
  return Math.max(0, 0.85 * Math.exp(-(t - 0.18) * 7))
}

/** Desenha as nuvens uma vez numa faixa que emenda nas pontas (para rolar sem costura). */
function desenharNuvens(largura, altura, escuro) {
  const faixa = document.createElement('canvas')
  const w = Math.max(900, largura + 400)
  const h = Math.round(altura * 0.38)
  faixa.width = w
  faixa.height = h
  const c = faixa.getContext('2d')
  const tom = escuro ? '150, 180, 195' : '10, 28, 36'
  const forca = escuro ? 0.11 : 0.09
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * w
    const y = Math.random() * h * 0.45 - 20
    const r = 60 + Math.random() * 120
    for (const dx of [-w, 0, w]) {
      const g = c.createRadialGradient(x + dx, y, 0, x + dx, y, r)
      g.addColorStop(0, `rgba(${tom}, ${forca})`)
      g.addColorStop(1, `rgba(${tom}, 0)`)
      c.fillStyle = g
      c.fillRect(x + dx - r, y - r, r * 2, r * 2)
    }
  }
  return faixa
}

/**
 * Tempestade em <canvas> atrás da página: nuvens que passam, chuva e
 * relâmpagos programados (mais frequentes quanto mais forte a chuva).
 * O cursor (ou o dedo) vira um guarda-chuva: a gota que bate na cúpula
 * escorre para o lado e respinga. Com o som ligado, cada relâmpago traz
 * um trovão, atrasado como na vida real (a luz chega antes do som).
 * `intensidade` vai de 0 a 1 (vem do slider de chuva do simulador).
 */
export function Chuva({ intensidade, som = false }) {
  const canvasRef = useRef(null)
  const intensidadeRef = useRef(intensidade)
  const somRef = useRef(som)
  const reduzir = usePrefersReducedMotion()
  intensidadeRef.current = intensidade
  somRef.current = som

  useEffect(() => {
    if (reduzir) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const mouse = { x: -9999, y: -9999 }
    let largura = 0
    let altura = 0
    let gotas = []
    let respingos = []
    let cor = '#e4eef0'
    let escuro = document.documentElement.dataset.theme !== 'light'
    let nuvens = null
    let quadro = 0
    let id = 0
    let relampago = null // { linhas, inicio }
    let proximoRaio = performance.now() + 4500 // o primeiro vem logo depois da tela de carregamento

    function novaGota(noTopo) {
      return {
        x: Math.random() * (largura + 200),
        y: noTopo ? -20 - Math.random() * altura * 0.3 : Math.random() * altura,
        vx: VENTO,
        vy: 9 + Math.random() * 7,
        comprimento: 10 + Math.random() * 14,
      }
    }

    function redimensionar() {
      largura = window.innerWidth
      altura = window.innerHeight
      canvas.width = largura * dpr
      canvas.height = altura * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // quantidade proporcional à área da tela
      const total = Math.round((largura * altura) / 4500)
      gotas = Array.from({ length: total }, () => novaGota(false))
      nuvens = desenharNuvens(largura, altura, escuro)
    }

    function lerTema() {
      const raiz = document.documentElement
      cor = getComputedStyle(raiz).getPropertyValue('--ink').trim() || cor
      const agoraEscuro = raiz.dataset.theme !== 'light'
      if (agoraEscuro !== escuro) {
        escuro = agoraEscuro
        nuvens = desenharNuvens(largura, altura, escuro)
      }
    }

    /** Agenda o próximo relâmpago: com chuva forte, a espera é menor. */
    function agendarRaio(agora) {
      const forca = Math.max(intensidadeRef.current, 0.01)
      proximoRaio = agora + (3500 + Math.random() * 7000) / forca
    }

    function disparar(agora) {
      relampago = { linhas: gerarRelampago(largura, altura), inicio: agora }
      if (somRef.current) {
        const forca = 0.6 + Math.random() * 0.4
        setTimeout(() => tocarTrovao(forca), 300 + Math.random() * 1400)
      }
      agendarRaio(agora)
    }

    function passo(agora) {
      id = requestAnimationFrame(passo)
      if (document.hidden) return
      if (quadro++ % 60 === 0) lerTema()
      ctx.clearRect(0, 0, largura, altura)
      const forca = intensidadeRef.current

      // ---- relâmpago: decide se é hora e calcula o brilho deste quadro ----
      if (agora >= proximoRaio) {
        if (forca >= CHUVA_COM_RAIOS) disparar(agora)
        else agendarRaio(agora)
      }
      let brilho = 0
      if (relampago) {
        brilho = brilhoNoTempo((agora - relampago.inicio) / 1000)
        if (agora - relampago.inicio > 900) relampago = null
      }

      // clarão na tela inteira
      if (brilho > 0) {
        ctx.fillStyle = escuro ? `rgba(200, 225, 255, ${brilho * 0.16})` : `rgba(255, 255, 255, ${brilho * 0.5})`
        ctx.fillRect(0, 0, largura, altura)
      }

      // ---- nuvens passando devagar (acendem no clarão) ----
      if (nuvens) {
        const w = nuvens.width
        const deslocamento = (agora * 0.012) % w
        ctx.globalAlpha = 0.35 + 0.65 * forca
        ctx.drawImage(nuvens, -deslocamento, 0)
        ctx.drawImage(nuvens, w - deslocamento, 0)
        if (brilho > 0 && escuro) {
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(1, brilho * 1.6)
          ctx.drawImage(nuvens, -deslocamento, 0)
          ctx.drawImage(nuvens, w - deslocamento, 0)
          ctx.globalCompositeOperation = 'source-over'
        }
        ctx.globalAlpha = 1
      }

      // ---- o raio em si ----
      if (relampago && brilho > 0.05) {
        ctx.save()
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.strokeStyle = escuro ? '#f2f8ff' : '#002893'
        ctx.shadowColor = escuro ? '#9fd4ff' : '#1f5fd6'
        ctx.shadowBlur = 18
        ctx.globalAlpha = brilho
        for (const { pontos, espessura } of relampago.linhas) {
          ctx.lineWidth = espessura
          ctx.beginPath()
          pontos.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
          ctx.stroke()
        }
        ctx.restore()
      }

      // ---- chuva ----
      const ativas = Math.round(gotas.length * Math.max(0.2, forca))
      ctx.strokeStyle = cor
      ctx.lineCap = 'round'
      ctx.globalAlpha = 0.28 + brilho * 0.4 // as gotas brilham no clarão
      ctx.lineWidth = 1.1
      ctx.beginPath()
      for (let i = 0; i < ativas; i++) {
        const g = gotas[i]
        g.x += g.vx
        g.y += g.vy

        // colisão com a cúpula do guarda-chuva (só a metade de cima)
        const dx = g.x - mouse.x
        const dy = g.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < RAIO && dy < 0) {
          const nx = dx / dist
          const ny = dy / dist
          g.x = mouse.x + nx * RAIO // empurra a gota para a borda da cúpula
          g.y = mouse.y + ny * RAIO
          g.vx = nx * 5 + VENTO // e faz ela escorrer para o lado
          g.vy = 3
          if (Math.random() < 0.3) respingos.push({ x: g.x, y: g.y, vx: nx * 2 + (Math.random() - 0.5), vy: -2 - Math.random() * 2, vida: 1 })
        } else {
          g.vx += (VENTO - g.vx) * 0.05 // volta aos poucos para a queda normal
          g.vy = Math.min(g.vy + 0.4, 16)
        }

        if (g.y > altura + 20 || g.x < -40) Object.assign(g, novaGota(true))
        ctx.moveTo(g.x, g.y)
        ctx.lineTo(g.x - g.vx * 1.5, g.y - g.comprimento)
      }
      ctx.stroke()

      // respingos: pontinhos que pulam e caem
      ctx.fillStyle = cor
      respingos = respingos.filter((r) => r.vida > 0)
      for (const r of respingos) {
        r.x += r.vx
        r.y += r.vy
        r.vy += 0.25
        r.vida -= 0.04
        ctx.globalAlpha = r.vida * 0.5
        ctx.fillRect(r.x, r.y, 1.6, 1.6)
      }
      ctx.globalAlpha = 1
    }

    const mover = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const sair = (e) => {
      if (e.type === 'pointerup' && e.pointerType === 'mouse') return
      mouse.x = -9999
      mouse.y = -9999
    }

    redimensionar()
    lerTema()
    id = requestAnimationFrame(passo)
    window.addEventListener('resize', redimensionar)
    window.addEventListener('pointermove', mover, { passive: true })
    window.addEventListener('pointerdown', mover, { passive: true })
    document.documentElement.addEventListener('pointerleave', sair)
    window.addEventListener('pointerup', sair)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', redimensionar)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerdown', mover)
      document.documentElement.removeEventListener('pointerleave', sair)
      window.removeEventListener('pointerup', sair)
    }
  }, [reduzir])

  if (reduzir) return null
  return <canvas ref={canvasRef} className={styles.chuva} aria-hidden="true" />
}
