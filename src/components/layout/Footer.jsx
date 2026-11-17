import styles from './Footer.module.css'

const FONTES = [
  {
    nome: 'SBT News: chuva forte provoca 16 bolsões no Rio (fev/2026)',
    url: 'https://sbtnews.sbt.com.br/noticia/brasil/chuva-forte-atinge-rio-de-janeiro-e-provoca-alagamentos',
  },
  {
    nome: 'Super Rádio Tupi: bolsões de água afetam o trânsito após temporal',
    url: 'https://www.tupi.fm/rio/bolsoes-de-agua-afetam-transito-no-rio-apos-temporal/',
  },
  {
    nome: 'Jovem Pan: chuva intensa bloqueia a Avenida Brasil',
    url: 'https://jovempan.com.br/brasil/chuva-intensa-causa-alagamentos-e-bloqueia-avenida-brasil-no-rio-de-janeiro/',
  },
  {
    nome: 'Monitor Mercantil: Rio permanece em estágio de atenção',
    url: 'https://monitormercantil.com.br/rio-permanece-em-estagio-de-atencao-por-causa-da-chuva/',
  },
  {
    nome: 'Portal Tela: temporal arrasta veículos na Ilha do Governador (jul/2025)',
    url: 'https://www.portaltela.com/noticias/ultimas-noticias/2025/07/25/temporal-provoca-destruicao-e-arrasta-veiculos-na-ilha-do-governador/',
  },
  {
    nome: 'Canaltech: como o Centro de Operações Rio usa dados',
    url: 'https://canaltech.com.br/apps/ia-e-dados-para-evitar-acidentes-e-enchentes-no-rj-saiba-como-funciona-o-cor/',
  },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grade}`}>
        <div>
          <p className={styles.titulo}>Bolsão Alerta RJ</p>
          <p className={styles.texto}>
            Protótipo CitizenTech da Global Solution 2026.2 · FIAP, Engenharia de Software, 1º ano. As
            leituras exibidas são <strong>simuladas</strong> enquanto o sensor não publica no ThingSpeak.
            Nenhum dado pessoal é coletado.
          </p>
          <ul className={styles.ods}>
            <li>
              <span>ODS 11</span> Cidades e comunidades sustentáveis
            </li>
            <li>
              <span>ODS 13</span> Ação contra a mudança global do clima
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Fontes</p>
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
