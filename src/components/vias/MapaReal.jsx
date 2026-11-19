import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAIXAS } from '../../domain/config.js'
import { buscarEstacoes } from '../../services/estacoesService.js'
import styles from './MapaReal.module.css'

/* Tiles vetoriais gratuitos (OpenFreeMap, dados © OpenStreetMap). */
const ESTILOS = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
}

/* Vias expressas destacadas sobre a geometria real do OpenStreetMap. */
const VIAS_EXPRESSAS = ['Avenida Brasil', 'Linha Vermelha', 'Linha Amarela', 'Túnel Rebouças', 'Túnel André Rebouças', 'Estrada do Galeão']

const CORES = {
  dark: { fundo: '#001d6e', agua: '#00134d', predio: '#0a2f96', via: '#fd701c', estacao: '#8fd3ff' },
  light: { fundo: '#f1f4fb', agua: '#bcd6f5', predio: '#d5dcef', via: '#f0640f', estacao: '#1f5fd6' },
}

/** Ajusta cores do estilo base para combinar com os tokens do site. */
function personalizar(mapa, cores) {
  for (const camada of mapa.getStyle().layers) {
    try {
      if (camada.type === 'background') mapa.setPaintProperty(camada.id, 'background-color', cores.fundo)
      if (camada.id.includes('water') && camada.type === 'fill') mapa.setPaintProperty(camada.id, 'fill-color', cores.agua)
    } catch {
      // camada sem essa propriedade: ignora
    }
  }
}

function adicionarCamadas(mapa, cores, estacoes) {
  const fonte = Object.entries(mapa.getStyle().sources).find(([, s]) => s.type === 'vector')?.[0]
  if (fonte) {
    mapa.addLayer({
      id: 'predios-3d',
      type: 'fill-extrusion',
      source: fonte,
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': cores.predio,
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
        'fill-extrusion-opacity': 0.85,
      },
    })
    const filtro = ['match', ['get', 'name'], VIAS_EXPRESSAS, true, false]
    mapa.addLayer({
      id: 'expressas-brilho',
      type: 'line',
      source: fonte,
      'source-layer': 'transportation_name',
      filter: filtro,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': cores.via, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 14], 'line-opacity': 0.18, 'line-blur': 4 },
    })
    mapa.addLayer({
      id: 'expressas',
      type: 'line',
      source: fonte,
      'source-layer': 'transportation_name',
      filter: filtro,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': cores.via, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 15, 4], 'line-opacity': 0.85 },
    })
  }

  mapa.addSource('estacoes', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: estacoes.map((e) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [e.lng, e.lat] },
        properties: { nome: e.nome },
      })),
    },
  })
  mapa.addLayer({
    id: 'estacoes',
    type: 'circle',
    source: 'estacoes',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 14, 5],
      'circle-color': cores.estacao,
      'circle-stroke-color': cores.fundo,
      'circle-stroke-width': 1,
      'circle-opacity': 0.9,
    },
  })
}

/**
 * Mapa real do Rio (MapLibre + OpenFreeMap) com:
 * - vias expressas destacadas sobre a geometria do OpenStreetMap
 * - estações pluviométricas oficiais do Alerta Rio (API Geo-Rio)
 * - os pontos monitorados do projeto, coloridos pela faixa de risco
 */
export function MapaReal({ vias, destacada, onDestacar, tema, onFalha, foco = null, compacto = false }) {
  const caixa = useRef(null)
  const mapaRef = useRef(null)
  const marcadores = useRef(new Map())
  const [pronto, setPronto] = useState(false)
  const [visivel, setVisivel] = useState(false)
  const navegar = useNavigate()
  const viasRef = useRef(vias)
  viasRef.current = vias

  // o MapLibre pesa ~1,6 MB: só baixa quando o mapa está chegando perto da tela
  useEffect(() => {
    const observador = new IntersectionObserver(([e]) => e.isIntersecting && setVisivel(true), { rootMargin: '600px' })
    observador.observe(caixa.current)
    return () => observador.disconnect()
  }, [])

  // cria o mapa (e recria quando o tema muda)
  useEffect(() => {
    if (!visivel) return
    let cancelado = false
    let mapa = null
    const cores = CORES[tema] ?? CORES.dark
    setPronto(false)

    // se o mapa não carregar em 12 s (rede ruim, sem WebGL), usa o esquema
    const limite = setTimeout(() => !cancelado && onFalha?.(), 12000)

    Promise.all([
      import('maplibre-gl'),
      // o Vite empacota o worker do MapLibre num arquivo próprio e devolve a URL
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
      import('maplibre-gl/dist/maplibre-gl.css'),
      buscarEstacoes(),
    ])
      .then(([modulo, { default: urlWorker }, , { estacoes }]) => {
        const maplibregl = modulo.default ?? modulo // v6 só tem exports nomeados
        maplibregl.setWorkerUrl(urlWorker)
        if (cancelado) return
        mapa = new maplibregl.Map({
          container: caixa.current,
          style: ESTILOS[tema] ?? ESTILOS.dark,
          center: [-43.236, -22.872],
          zoom: 11.3,
          pitch: compacto ? 40 : 50,
          bearing: -18,
          interactive: !compacto,
          attributionControl: { compact: true },
          cooperativeGestures: true, // no celular, rolar a página não "prende" no mapa
          locale: {
            'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + rolagem para dar zoom no mapa',
            'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + rolagem para dar zoom no mapa',
            'CooperativeGesturesHandler.MobileHelpText': 'Use dois dedos para mover o mapa',
          },
        })
        mapaRef.current = mapa
        if (!compacto) mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

        mapa.on('load', () => {
          clearTimeout(limite)
          personalizar(mapa, cores)
          adicionarCamadas(mapa, cores, estacoes)

          const popup = new maplibregl.Popup({ closeButton: false, offset: 8, className: styles.popup })
          mapa.on('mouseenter', 'estacoes', (e) => {
            mapa.getCanvas().style.cursor = 'help'
            popup.setLngLat(e.features[0].geometry.coordinates).setText(`Pluviômetro Alerta Rio · ${e.features[0].properties.nome}`).addTo(mapa)
          })
          mapa.on('mouseleave', 'estacoes', () => {
            mapa.getCanvas().style.cursor = ''
            popup.remove()
          })

          // marcadores HTML dos pontos monitorados
          for (const v of viasRef.current) {
            const el = document.createElement('button')
            el.type = 'button'
            el.className = styles.marcador
            el.innerHTML = `<span class="${styles.onda}"></span><span class="${styles.nucleo}"></span><span class="${styles.rotulo}">${v.trecho.split(' · ')[0]}</span>`
            el.addEventListener('click', () => navegar(`/via/${v.id}`))
            el.addEventListener('mouseenter', () => onDestacar?.(v.id))
            el.addEventListener('mouseleave', () => onDestacar?.(null))
            el.addEventListener('focus', () => onDestacar?.(v.id))
            el.addEventListener('blur', () => onDestacar?.(null))
            new maplibregl.Marker({ element: el }).setLngLat([v.lng, v.lat]).addTo(mapa)
            marcadores.current.set(v.id, el)
          }
          setPronto(true)
        })
        mapa.on('error', (e) => {
          // falha ao carregar o estilo inteiro: troca para o esquema
          if (!mapa.isStyleLoaded() && e?.error?.status !== 404) onFalha?.()
        })
      })
      .catch(() => {
        if (!cancelado) onFalha?.()
      })

    return () => {
      cancelado = true
      clearTimeout(limite)
      marcadores.current.clear()
      mapa?.remove()
      mapaRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema, visivel])

  // atualiza cor/estado dos marcadores a cada nova leitura
  useEffect(() => {
    for (const v of vias) {
      const el = marcadores.current.get(v.id)
      if (!el) continue
      el.dataset.faixa = v.atual.faixa
      el.dataset.ativo = String(destacada === v.id)
      el.setAttribute('aria-label', `${v.via}, ${v.trecho}: ${FAIXAS[v.atual.faixa].rotulo}, risco ${v.atual.risco}`)
    }
  }, [vias, destacada, pronto])

  // modo foco: enquadra só os pontos escolhidos (ex.: a rota da landing)
  useEffect(() => {
    const mapa = mapaRef.current
    if (!pronto || !mapa || !foco?.length) return
    for (const [id, el] of marcadores.current) el.dataset.fora = String(!foco.includes(id))
    const pontos = foco.map((id) => viasRef.current.find((x) => x.id === id)).filter(Boolean)
    const lngs = pontos.map((p) => p.lng)
    const lats = pontos.map((p) => p.lat)
    mapa.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: compacto ? 80 : 100, maxZoom: 13, duration: 1400 },
    )
  }, [foco, pronto, compacto])

  return (
    <figure className={`${styles.mapa} ${compacto ? styles.compacto : ''}`}>
      <div ref={caixa} className={styles.caixa} data-lenis-prevent={compacto ? undefined : true} />
      {!pronto && <div className={styles.carregando}>Carregando mapa do Rio…</div>}
      {!compacto && <figcaption className={styles.legenda}>
        <span>
          <i className={styles.legVia} /> Vias expressas
        </span>
        <span>
          <i className={styles.legEstacao} /> Pluviômetros Alerta Rio (dados oficiais)
        </span>
        <span>
          <i className={styles.legSensor} /> Sensores do projeto (simulados)
        </span>
      </figcaption>}
    </figure>
  )
}
