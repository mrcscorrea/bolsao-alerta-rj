import { SENSORES, LIMITE_ATENCAO, LIMITE_PERIGO } from './config.js'

/** Limita um número entre mínimo e máximo. */
export function limitar(valor, min = 0, max = 100) {
  return Math.min(max, Math.max(min, valor))
}

/** nivel = (valor - min) / (max - min) * 100, limitado entre 0 e 100. */
export function normalizar(valor, min, max) {
  if (min >= max) throw new Error('Configuração inválida: mínimo deve ser menor que o máximo')
  return limitar(((valor - min) / (max - min)) * 100)
}

/** Confere se os pesos somam 1 (mesma regra do Python, que dispara ValueError). */
export function validarConfig(sensores = SENSORES) {
  const soma = Object.values(sensores).reduce((total, s) => total + s.peso, 0)
  if (Math.abs(soma - 1) > 1e-9) throw new Error('Configuração inválida: os pesos devem somar 1')
  return true
}

/**
 * Índice de Risco (0–100): risco = peso1 * nivel1 + peso2 * nivel2
 * @param {{laminaCm:number, chuvaMmH:number}} medidas
 */
export function calcularRisco(medidas, sensores = SENSORES) {
  validarConfig(sensores)
  let risco = 0
  for (const [chave, s] of Object.entries(sensores)) {
    risco += s.peso * normalizar(medidas[chave] ?? 0, s.min, s.max)
  }
  return Math.round(risco * 10) / 10
}

/** NORMAL abaixo de 40 · ATENCAO de 40 a 70 · PERIGO a partir de 70. */
export function classificarFaixa(risco) {
  if (risco >= LIMITE_PERIGO) return 'PERIGO'
  if (risco >= LIMITE_ATENCAO) return 'ATENCAO'
  return 'NORMAL'
}

/** Monta a leitura no mesmo formato de dicionário do Python. */
export function criarLeitura({ id, horario, viaId, medidas }) {
  const risco = calcularRisco(medidas)
  return { id, horario, viaId, medidas, risco, faixa: classificarFaixa(risco) }
}

/** 3 altas seguidas do risco nas últimas leituras = PIORANDO. */
export function tendencia(leituras) {
  const ultimas = leituras.slice(-4)
  if (ultimas.length < 4) return 'ESTAVEL'
  let altas = 0
  let quedas = 0
  for (let i = 1; i < ultimas.length; i++) {
    if (ultimas[i].risco > ultimas[i - 1].risco) altas++
    else if (ultimas[i].risco < ultimas[i - 1].risco) quedas++
  }
  if (altas === 3) return 'PIORANDO'
  if (quedas === 3) return 'MELHORANDO'
  return 'ESTAVEL'
}

/** Maior sequência contínua de leituras em PERIGO: {inicio, fim, leituras}. */
export function maiorEpisodioPerigo(leituras) {
  let melhor = null
  let atual = null
  for (const l of leituras) {
    if (l.faixa === 'PERIGO') {
      atual = atual ? { ...atual, fim: l.horario, leituras: atual.leituras + 1 } : { inicio: l.horario, fim: l.horario, leituras: 1 }
      if (!melhor || atual.leituras > melhor.leituras) melhor = atual
    } else {
      atual = null
    }
  }
  return melhor
}

/** Quantas leituras em cada faixa. */
export function contagemPorFaixa(leituras) {
  const contagem = { NORMAL: 0, ATENCAO: 0, PERIGO: 0 }
  for (const l of leituras) contagem[l.faixa]++
  return contagem
}

/** A pior faixa entre várias (usada no letreiro do topo). */
export function piorFaixa(faixas) {
  if (faixas.includes('PERIGO')) return 'PERIGO'
  if (faixas.includes('ATENCAO')) return 'ATENCAO'
  return 'NORMAL'
}
