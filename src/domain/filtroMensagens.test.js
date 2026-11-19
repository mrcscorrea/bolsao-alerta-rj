import { describe, expect, it } from 'vitest'
import { normalizarParaFiltro, verificarMensagem } from './filtroMensagens.js'

describe('filtro de mensagens', () => {
  it('normaliza acento, símbolos, pontuação e letras repetidas', () => {
    expect(normalizarParaFiltro('Água NA PISTÃÃÃO')).toBe('agua na pistao')
    expect(normalizarParaFiltro('m.e.r.d.a')).toBe(normalizarParaFiltro('merda'))
    expect(normalizarParaFiltro('P0rr@')).toBe(normalizarParaFiltro('porra'))
  })

  it('bloqueia palavrão mesmo disfarçado', () => {
    expect(verificarMensagem('que m3rdaaa de bolsão').ok).toBe(false)
    expect(verificarMensagem('CARALHO, alagou tudo').ok).toBe(false)
  })

  it('não bloqueia palavra que só contém o trecho (disputa, computador)', () => {
    expect(verificarMensagem('disputa por espaço na pista').ok).toBe(true)
    expect(verificarMensagem('o computador do ônibus apagou').ok).toBe(true)
  })

  it('manda link e telefone para revisão', () => {
    expect(verificarMensagem('veja www.golpe.com').revisao).toBe(true)
    expect(verificarMensagem('liga 99999-1234').revisao).toBe(true)
    expect(verificarMensagem('água a 40 cm desde 2024').revisao).toBe(false)
  })
})
