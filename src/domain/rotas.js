import { piorFaixa } from './risco.js'

/** Trajetos comuns de quem atravessa as vias monitoradas. */
export const ROTAS = [
  {
    id: 'baixada-centro',
    nome: 'Baixada → Centro',
    via: 'pela Av. Brasil',
    pontos: ['av-brasil-cordovil', 'av-brasil-mare', 'av-brasil-caju'],
  },
  {
    id: 'ilha-centro',
    nome: 'Ilha do Governador → Centro',
    via: 'pela Linha Vermelha',
    pontos: ['estrada-galeao', 'linha-vermelha-sao-cristovao'],
  },
  {
    id: 'barra-centro',
    nome: 'Jacarepaguá → Centro',
    via: 'pela Linha Amarela',
    pontos: ['linha-amarela-bonsucesso', 'av-brasil-caju'],
  },
  {
    id: 'tijuca-zonasul',
    nome: 'Tijuca → Zona Sul',
    via: 'pelo Rebouças',
    pontos: ['praca-bandeira', 'tunel-reboucas'],
  },
]

const VEREDITOS = {
  NORMAL: { titulo: 'Pode ir.', texto: 'Nenhum ponto da rota com água acumulada agora.' },
  ATENCAO: { titulo: 'Vá com atenção.', texto: 'Há água acumulando em parte do caminho. Reduza a velocidade.' },
  PERIGO: { titulo: 'Evite essa rota agora.', texto: 'Bolsão crítico no caminho. Espere ou escolha outro trajeto.' },
}

/**
 * Avalia uma rota: a situação da rota é a do PIOR ponto dela.
 */
export function avaliarRota(rota, vias) {
  const pontos = rota.pontos.map((id) => vias.find((v) => v.id === id)).filter(Boolean)
  const faixa = piorFaixa(pontos.map((p) => p.atual.faixa))
  const piorPonto = [...pontos].sort((a, b) => b.atual.risco - a.atual.risco)[0] ?? null
  return { faixa, pontos, piorPonto, ...VEREDITOS[faixa] }
}
