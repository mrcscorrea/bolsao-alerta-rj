import { requisitar } from './http.js'
import copiaLocal from '../data/estacoesAlertaRio.json'

/**
 * Estações pluviométricas oficiais do Alerta Rio, servidas pela Prefeitura
 * (Geo-Rio, ArcGIS REST, GeoJSON em WGS84). Se a API cair, usa a cópia local
 * salva no projeto (plano B, mesma ideia do backup.json do Python).
 */
const URL_ESTACOES =
  'https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Geotecnia/Estacoes_AlertaRio/MapServer/0/query?where=1%3D1&outFields=est,cod&outSR=4326&f=geojson'

let emCache = null

/** As estações não mudam: busca uma vez por visita e reaproveita em todos os mapas. */
export function buscarEstacoes() {
  emCache ??= carregarEstacoes()
  return emCache
}

async function carregarEstacoes() {
  try {
    const dados = await requisitar(URL_ESTACOES, { timeout: 6000 })
    const estacoes = dados.features.map((f) => ({
      cod: f.properties.cod,
      nome: f.properties.est,
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
    }))
    if (estacoes.length) return { estacoes, fonte: 'api' }
  } catch {
    // plano B
  }
  return { estacoes: copiaLocal.estacoes, fonte: 'copia-local' }
}
