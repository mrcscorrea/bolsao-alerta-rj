import { criarLeitura, limitar } from '../domain/risco.js'
import { VIAS, buscarVia } from '../domain/vias.js'
import { requisitar } from './http.js'

/** Uma leitura nova a cada 10 s; um temporal simulado a cada 6 min. */
export const INTERVALO_MS = 10_000
const CICLO_MS = 6 * 60_000

const TS_CANAL = import.meta.env.VITE_THINGSPEAK_CHANNEL
const TS_VIA = import.meta.env.VITE_THINGSPEAK_VIA || 'av-brasil-mare'

const arred = (n) => Math.round(n * 10) / 10

/** Ruído pseudoaleatório determinístico: mesma entrada → mesmo valor (0 a 1). */
function ruido(semente) {
  const x = Math.sin(semente * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function hashTexto(texto) {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h
}

/** Intensidade do temporal (0 a 1): chove em 60% do ciclo, pico no meio. */
function intensidade(fase) {
  if (fase > 0.6) return 0
  return Math.sin((Math.PI * fase) / 0.6) ** 2
}

/** Leitura simulada de uma via num instante — a água sobe com atraso em relação à chuva. */
export function simularLeitura(via, tempoMs) {
  const indice = Math.floor(tempoMs / INTERVALO_MS)
  const fase = (indice * INTERVALO_MS / CICLO_MS + via.fase) % 1
  const r = ruido(indice + hashTexto(via.id))
  const chuvaMmH = arred(limitar(62 * intensidade(fase) + (r - 0.5) * 6, 0, 80))
  const laminaCm = arred(limitar(44 * via.sensibilidade * intensidade((fase + 0.94) % 1) + (r - 0.5) * 2, 0, 60))
  return criarLeitura({
    id: indice,
    horario: new Date(indice * INTERVALO_MS).toISOString(),
    viaId: via.id,
    medidas: { laminaCm, chuvaMmH },
  })
}

export function simularHistorico(via, agora = Date.now(), quantidade = 36) {
  const leituras = []
  for (let i = quantidade - 1; i >= 0; i--) leituras.push(simularLeitura(via, agora - i * INTERVALO_MS))
  return leituras
}

/** Leitura real do canal ThingSpeak: field1 = lâmina (cm), field2 = chuva (mm/h). */
async function buscarThingSpeak(quantidade) {
  const dados = await requisitar(`https://api.thingspeak.com/channels/${TS_CANAL}/feeds.json?results=${quantidade}`)
  return dados.feeds
    .filter((f) => f.field1 != null && f.field2 != null)
    .map((f) =>
      criarLeitura({
        id: f.entry_id,
        horario: f.created_at,
        viaId: TS_VIA,
        medidas: { laminaCm: Number(f.field1), chuvaMmH: Number(f.field2) },
      }),
    )
}

/**
 * Histórico de uma via. Se houver canal ThingSpeak configurado para ela, busca
 * os dados reais; se a rede falhar, usa a simulação como plano B.
 */
export async function buscarHistorico(viaId, quantidade = 36) {
  if (TS_CANAL && viaId === TS_VIA) {
    try {
      const leituras = await buscarThingSpeak(quantidade)
      if (leituras.length) return { leituras, fonte: 'thingspeak' }
    } catch {
      // plano B: segue para a simulação
    }
  }
  return { leituras: simularHistorico(buscarVia(viaId), Date.now(), quantidade), fonte: 'simulado' }
}

export async function buscarTodas(quantidade = 36) {
  const resultados = await Promise.all(VIAS.map((v) => buscarHistorico(v.id, quantidade)))
  return VIAS.map((via, i) => ({ via, ...resultados[i] }))
}
