/**
 * Pontos monitorados (dados simulados). As vias foram escolhidas a partir de
 * ocorrências reais de bolsões noticiadas (ver Fontes no rodapé do site).
 * lng/lat = coordenadas reais (OpenStreetMap/Nominatim).
 * x/y = posição no mapa esquemático (SVG 800 x 520), usado como plano B. `sensibilidade` define
 * o quanto o ponto alaga no cenário simulado (0 a 1).
 */
export const VIAS = [
  {
    id: 'av-brasil-caju',
    lng: -43.2331, lat: -22.8869,
    via: 'Av. Brasil',
    trecho: 'Caju · km 2',
    referencia: 'Altura do Cemitério do Caju, sentido Centro',
    x: 640, y: 250, rotulo: 'acima',
    sensibilidade: 0.7, fase: 0.05,
  },
  {
    id: 'av-brasil-mare',
    lng: -43.2482, lat: -22.8457,
    via: 'Av. Brasil',
    trecho: 'Maré · km 12',
    referencia: 'Altura da Vila do João, pista central',
    x: 540, y: 250, rotulo: 'acima',
    sensibilidade: 1, fase: 0,
  },
  {
    id: 'av-brasil-cordovil',
    lng: -43.2912, lat: -22.8154,
    via: 'Av. Brasil',
    trecho: 'Cordovil · km 18',
    referencia: 'Próximo à passarela de Cordovil',
    x: 380, y: 250, rotulo: 'abaixo',
    sensibilidade: 0.85, fase: 0.12,
  },
  {
    id: 'linha-vermelha-sao-cristovao',
    lng: -43.2323, lat: -22.8782,
    via: 'Linha Vermelha',
    trecho: 'Fundão · Caju',
    referencia: 'Trecho junto ao Caju, sentido Ilha do Fundão',
    x: 720, y: 270, rotulo: 'direita',
    sensibilidade: 0.6, fase: 0.2,
  },
  {
    id: 'estrada-galeao',
    lng: -43.1998, lat: -22.8062,
    via: 'Estrada do Galeão',
    trecho: 'Ilha do Governador',
    referencia: 'Trecho que alagou e arrastou carros em jul/2025',
    x: 680, y: 100, rotulo: 'direita',
    sensibilidade: 0.9, fase: 0.3,
  },
  {
    id: 'linha-amarela-bonsucesso',
    lng: -43.2562, lat: -22.8718,
    via: 'Linha Amarela',
    trecho: 'Bonsucesso',
    referencia: 'Acesso pela Av. Brasil, sentido Barra',
    x: 455, y: 285, rotulo: 'direita',
    sensibilidade: 0.5, fase: 0.4,
  },
  {
    id: 'praca-bandeira',
    lng: -43.2132, lat: -22.9112,
    via: 'Praça da Bandeira',
    trecho: 'Tijuca · Maracanã',
    referencia: 'Rua Mariz e Barros, sob o viaduto',
    x: 680, y: 370, rotulo: 'esquerda',
    sensibilidade: 0.95, fase: 0.08,
  },
  {
    id: 'tunel-reboucas',
    lng: -43.2075, lat: -22.9285,
    via: 'Túnel Rebouças',
    trecho: 'Acesso Rio Comprido',
    referencia: 'Entrada do túnel, sentido Lagoa',
    x: 640, y: 450, rotulo: 'direita',
    sensibilidade: 0.65, fase: 0.25,
  },
]

/** Traçados das vias expressas no mapa esquemático (estilo diagrama de metrô). */
export const TRACADOS = [
  { id: 'av-brasil', nome: 'Av. Brasil', d: 'M720 330 L640 250 H260 L130 380' },
  { id: 'linha-vermelha', nome: 'Linha Vermelha', d: 'M720 330 V140 L640 60' },
  { id: 'linha-amarela', nome: 'Linha Amarela', d: 'M720 180 H560 L420 320 L300 440' },
  { id: 'reboucas', nome: 'Rebouças', d: 'M720 330 L640 410 V490' },
]

export function buscarVia(id) {
  return VIAS.find((v) => v.id === id) ?? null
}
