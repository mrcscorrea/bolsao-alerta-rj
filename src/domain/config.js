/**
 * Configuração do Índice de Risco — MESMOS valores usados no script Python
 * (disciplina Computational Thinking) e no ESP32 (Edge Computing).
 * Se mudar aqui, mude lá também.
 */
export const SENSORES = {
  laminaCm: {
    rotulo: "Lâmina d'água",
    unidade: 'cm',
    min: 0,
    max: 40, // ~40 cm: altura típica da entrada de ar de um carro (calço hidráulico)
    peso: 0.6,
  },
  chuvaMmH: {
    rotulo: 'Chuva',
    unidade: 'mm/h',
    min: 0,
    max: 60, // > 50 mm/h já é "chuva muito forte" na escala do Alerta Rio
    peso: 0.4,
  },
}

export const LIMITE_ATENCAO = 40
export const LIMITE_PERIGO = 70

export const FAIXAS = {
  NORMAL: {
    id: 'NORMAL',
    rotulo: 'Normal',
    titulo: 'Via livre',
    texto: 'Sem acúmulo de água relevante. Pode seguir.',
    led: 'verde',
  },
  ATENCAO: {
    id: 'ATENCAO',
    rotulo: 'Atenção',
    titulo: 'Acúmulo iniciado',
    texto: 'Água acumulando na pista. Reduza a velocidade ou considere outra rota.',
    led: 'amarelo',
  },
  PERIGO: {
    id: 'PERIGO',
    rotulo: 'Perigo',
    titulo: 'Bolsão crítico',
    texto: 'Risco de calço hidráulico. Evite a via.',
    led: 'vermelho',
  },
}

export const ORDEM_FAIXAS = ['NORMAL', 'ATENCAO', 'PERIGO']
