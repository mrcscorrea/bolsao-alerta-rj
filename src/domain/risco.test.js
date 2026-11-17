import { describe, it, expect } from 'vitest'
import {
  normalizar, calcularRisco, classificarFaixa, tendencia, maiorEpisodioPerigo,
  contagemPorFaixa, validarConfig, piorFaixa,
} from './risco.js'

describe('índice de risco', () => {
  it('reproduz o exemplo do PDF (40 °C / 70% → 71,7 PERIGO)', () => {
    const calor = {
      temp: { min: 25, max: 45, peso: 0.6 },
      umid: { min: 30, max: 90, peso: 0.4 },
    }
    const risco = calcularRisco({ temp: 40, umid: 70 }, calor)
    expect(risco).toBe(71.7)
    expect(classificarFaixa(risco)).toBe('PERIGO')
  })

  it('normaliza e limita entre 0 e 100', () => {
    expect(normalizar(20, 0, 40)).toBe(50)
    expect(normalizar(-5, 0, 40)).toBe(0)
    expect(normalizar(99, 0, 40)).toBe(100)
    expect(() => normalizar(1, 10, 10)).toThrow()
  })

  it('calcula com os sensores do bolsão', () => {
    expect(calcularRisco({ laminaCm: 0, chuvaMmH: 0 })).toBe(0)
    expect(calcularRisco({ laminaCm: 40, chuvaMmH: 60 })).toBe(100)
    expect(calcularRisco({ laminaCm: 20, chuvaMmH: 30 })).toBe(50)
  })

  it('classifica nas bordas 40 e 70', () => {
    expect(classificarFaixa(39.9)).toBe('NORMAL')
    expect(classificarFaixa(40)).toBe('ATENCAO')
    expect(classificarFaixa(69.9)).toBe('ATENCAO')
    expect(classificarFaixa(70)).toBe('PERIGO')
  })

  it('rejeita pesos que não somam 1', () => {
    expect(() => validarConfig({ a: { min: 0, max: 1, peso: 0.5 } })).toThrow()
  })
})

const serie = (riscos) => riscos.map((risco, i) => ({ horario: `t${i}`, risco, faixa: classificarFaixa(risco) }))

describe('análise do histórico', () => {
  it('detecta PIORANDO com 3 altas seguidas', () => {
    expect(tendencia(serie([10, 20, 30, 40]))).toBe('PIORANDO')
    expect(tendencia(serie([40, 30, 20, 10]))).toBe('MELHORANDO')
    expect(tendencia(serie([10, 20, 20, 30]))).toBe('ESTAVEL')
    expect(tendencia(serie([10, 20]))).toBe('ESTAVEL')
  })

  it('encontra o maior episódio contínuo em PERIGO', () => {
    const ep = maiorEpisodioPerigo(serie([80, 10, 75, 90, 71, 20]))
    expect(ep).toEqual({ inicio: 't2', fim: 't4', leituras: 3 })
    expect(maiorEpisodioPerigo(serie([10, 20]))).toBeNull()
  })

  it('conta por faixa e acha a pior', () => {
    expect(contagemPorFaixa(serie([10, 50, 80, 90]))).toEqual({ NORMAL: 1, ATENCAO: 1, PERIGO: 2 })
    expect(piorFaixa(['NORMAL', 'ATENCAO'])).toBe('ATENCAO')
  })
})

import { simularLeitura, simularHistorico } from '../services/leiturasService.js'
import { VIAS } from './vias.js'

describe('simulação de leituras', () => {
  it('é determinística e passa pelas três faixas num ciclo de temporal', () => {
    const via = VIAS[1]
    expect(simularLeitura(via, 1_000_000)).toEqual(simularLeitura(via, 1_000_000))
    const ciclo = simularHistorico(via, 6 * 60_000 * 100, 36)
    const faixas = new Set(ciclo.map((l) => l.faixa))
    expect(faixas).toEqual(new Set(['NORMAL', 'ATENCAO', 'PERIGO']))
  })
})

import { filtrarVias, normalizarTexto } from './filtros.js'

describe('filtro de vias', () => {
  const vias = [
    { via: 'Praça da Bandeira', trecho: 'Tijuca', referencia: '', atual: { faixa: 'PERIGO', risco: 80 } },
    { via: 'Av. Brasil', trecho: 'Caju', referencia: '', atual: { faixa: 'NORMAL', risco: 10 } },
  ]
  it('busca sem acento e filtra por faixa', () => {
    expect(normalizarTexto('Praça')).toBe('praca')
    expect(filtrarVias(vias, { busca: 'praca' })).toHaveLength(1)
    expect(filtrarVias(vias, { faixa: 'NORMAL' })[0].via).toBe('Av. Brasil')
    expect(filtrarVias(vias, { faixa: 'ATENCAO' })).toHaveLength(0)
  })
})

import { validarRelato, montarRelato, classificarProfundidade } from './relatos.js'

describe('relatos', () => {
  it('valida campos obrigatórios e limites', () => {
    const erros = validarRelato({ viaId: '', referencia: 'a', profundidadeCm: 500 })
    expect(Object.keys(erros).sort()).toEqual(['profundidadeCm', 'referencia', 'viaId'])
    expect(validarRelato({ viaId: 'praca-bandeira', referencia: 'Sob o viaduto', profundidadeCm: '20' })).toEqual({})
  })
  it('monta o objeto da API sem dados pessoais e classifica profundidade', () => {
    const r = montarRelato({ viaId: 'praca-bandeira', referencia: '  viaduto ', profundidadeCm: '35' }, 'X')
    expect(r).toEqual({ viaId: 'praca-bandeira', referencia: 'viaduto', profundidadeCm: 35, observacao: '', criadoEm: 'X' })
    expect(classificarProfundidade(35).faixa).toBe('PERIGO')
    expect(classificarProfundidade(5).faixa).toBe('NORMAL')
  })
})
