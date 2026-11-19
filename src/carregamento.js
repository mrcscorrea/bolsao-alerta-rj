/**
 * Tela de carregamento (o HTML dela está no index.html).
 * Conta de 0 a 40 cm enquanto a água sobe; quando as fontes terminam de
 * carregar e a contagem chega ao fim, a tela sobe e libera o site.
 */
const MAXIMO_CM = 40
const DURACAO_MS = 1700
const TOPO_REGUA = 88 // a marca de 40 cm fica a 88% da altura da tela (ver .regua no index.html)
const FAIXAS = [
  [30, 'PERIGO', 'Evite a via'],
  [15, 'ATENCAO', 'Atenção'],
  [0, 'NORMAL', 'Pista livre'],
]

export function iniciarCarregamento() {
  const tela = document.getElementById('carregando')
  const raiz = document.documentElement
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!tela || semMovimento) {
    tela?.remove()
    raiz.classList.add('pronto')
    window.dispatchEvent(new Event('site-pronto'))
    return
  }

  const numero = tela.querySelector('b')
  const faixa = tela.querySelector('.faixa')
  const inicio = performance.now()
  // fontes prontas, com limite de 3 s para conexões lentas
  const fontes = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))])

  function quadro(agora) {
    // o 1º quadro do rAF pode vir com horário anterior a "inicio": limita a 0..1
    const progresso = Math.min(1, Math.max(0, (agora - inicio) / DURACAO_MS))
    const suave = 1 - Math.pow(1 - progresso, 3) // desacelera no fim
    const cm = Math.round(suave * MAXIMO_CM)
    numero.textContent = String(cm).padStart(2, '0')
    tela.style.setProperty('--n', (cm / MAXIMO_CM) * TOPO_REGUA)
    // mesma régua de faixas dos relatos: 15 cm atenção, 30 cm perigo
    const [, nome, texto] = FAIXAS.find(([minimo]) => cm >= minimo)
    if (faixa.dataset.faixa !== nome) {
      faixa.dataset.faixa = nome
      faixa.textContent = texto
    }
    if (progresso < 1) requestAnimationFrame(quadro)
    else fontes.then(relampejar)
  }

  // no fim, um relâmpago clareia a tela e ela sobe
  function relampejar() {
    tela.classList.add('raio')
    setTimeout(sair, 420)
  }

  function sair() {
    tela.classList.add('saiu')
    raiz.classList.add('pronto') // dispara a entrada do hero (CSS)
    window.dispatchEvent(new Event('site-pronto'))
    tela.addEventListener('transitionend', () => tela.remove(), { once: true })
  }

  requestAnimationFrame(quadro)
}
