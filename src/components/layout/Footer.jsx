import { MANCHETES, formatarData } from '../../data/manchetes.js'
import styles from './Footer.module.css'

const DADOS = [
  { nome: 'Estações pluviométricas: Alerta Rio / Geo-Rio (Prefeitura do Rio)', url: 'https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Geotecnia/Estacoes_AlertaRio/MapServer' },
  { nome: 'Mapa: OpenFreeMap · © OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' },
  { nome: 'Canaltech: como o Centro de Operações Rio usa dados', url: 'https://canaltech.com.br/apps/ia-e-dados-para-evitar-acidentes-e-enchentes-no-rj-saiba-como-funciona-o-cor/' },
]

const FONTES = [
  ...MANCHETES.map((m) => ({ nome: `${m.veiculo}, ${formatarData(m.data)}: ${m.titulo}`, url: m.url })),
  ...DADOS,
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grade}`}>
        <div>
          <p className={styles.titulo}>Bolsão Alerta RJ</p>
          <p className={styles.texto}>
            Protótipo CitizenTech da Global Solution 2026.2 · FIAP, Engenharia de Software, 1º ano. O ponto
            da Av. Brasil (Maré) lê o sensor real pelo ThingSpeak; os demais pontos são <strong>simulados</strong>.
            Nenhum dado pessoal é coletado.
          </p>
          <p className={styles.texto}>
            Conectado aos ODS 11 (cidades e comunidades sustentáveis) e 13 (ação contra a mudança global do clima).
          </p>
        </div>
        <div>
          <p className={styles.titulo}>Fontes</p>
          <ul className={styles.fontes}>
            {FONTES.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.nome}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
