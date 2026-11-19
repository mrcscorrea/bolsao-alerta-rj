import styles from './DiagramaSensor.module.css'

/**
 * Corte técnico da rua: como o sensor ultrassônico mede a lâmina d'água e
 * como a leitura chega até o site. Desenho em SVG, sem bibliotecas.
 */
export function DiagramaSensor() {
  return (
    <figure className={styles.figura}>
      <div className={styles.rolagem}>
        <svg viewBox="0 0 1200 500" className={styles.svg} role="img" aria-labelledby="diag-titulo diag-desc">
          <title id="diag-titulo">Como o Bolsão Alerta mede a água</title>
          <desc id="diag-desc">
            Um sensor ultrassônico preso a um poste mede a distância até o chão. Quando a água sobe, a distância
            diminui; a diferença é a lâmina d&apos;água. O ESP32 calcula o risco, acende os LEDs e envia a leitura
            pela internet ao ThingSpeak. Um programa em Python analisa os dados e o site mostra o resultado.
          </desc>

          {/* chuva */}
          <g className={styles.chuva}>
            {Array.from({ length: 34 }, (_, i) => (
              <line key={i} x1={40 + i * 34} y1={20 + (i % 5) * 14} x2={34 + i * 34} y2={44 + (i % 5) * 14} />
            ))}
          </g>

          {/* asfalto e meio-fio */}
          <rect x="0" y="440" width="1200" height="40" className={styles.asfalto} />
          <rect x="0" y="420" width="200" height="60" className={styles.calcada} />
          <path d="M240 458 H330 M380 458 H470 M520 458 H610 M660 458 H750 M800 458 H890 M940 458 H1030" className={styles.faixaPista} />

          {/* água acumulada (lâmina) */}
          <path
            d="M200 400 Q260 392 320 400 T440 400 T560 400 T680 400 T800 400 T920 400 T1040 400 T1160 400 L1200 400 L1200 440 L200 440 Z"
            className={styles.agua}
          />

          {/* táxi parcialmente submerso */}
          <g className={styles.carro} transform="translate(800 330)">
            <path d="M0 80 L10 46 L70 40 L104 10 H196 L236 40 L292 48 L300 80 Z" />
            <rect x="8" y="62" width="290" height="8" className={styles.faixaAzul} />
            <path d="M114 18 H190 L218 40 H96 Z" className={styles.vidro} />
            <circle cx="70" cy="86" r="26" className={styles.roda} />
            <circle cx="236" cy="86" r="26" className={styles.roda} />
          </g>

          {/* poste + braço + sensor */}
          <rect x="226" y="120" width="10" height="320" className={styles.poste} />
          <rect x="226" y="120" width="230" height="8" className={styles.poste} />
          <g transform="translate(410 128)">
            <rect x="0" y="0" width="64" height="26" rx="2" className={styles.sensor} />
            <circle cx="18" cy="26" r="9" className={styles.olho} />
            <circle cx="46" cy="26" r="9" className={styles.olho} />
          </g>
          <text x="488" y="146" className={styles.rotulo}>HC-SR04 · sensor ultrassônico</text>

          {/* pulsos */}
          <g className={styles.pulsos}>
            <path d="M420 196 Q442 206 464 196" />
            <path d="M414 236 Q442 250 470 236" />
            <path d="M408 276 Q442 294 476 276" />
          </g>

          {/* cota: distância lida (sensor → água) */}
          <g className={styles.cota}>
            <line x1="520" y1="166" x2="520" y2="396" />
            <path d="M514 176 L520 164 L526 176 M514 386 L520 398 L526 386" />
            <text x="532" y="290">distância lida</text>
          </g>

          {/* cota: distância base (sensor → asfalto seco) */}
          <g className={styles.cotaBase}>
            <line x1="380" y1="166" x2="380" y2="436" />
            <path d="M374 176 L380 164 L386 176 M374 426 L380 438 L386 426" />
            <text x="368" y="300" textAnchor="end">distância base</text>
            <text x="368" y="318" textAnchor="end" className={styles.sub}>(asfalto seco)</text>
          </g>

          {/* lâmina = base − lida */}
          <g className={styles.lamina}>
            <path d="M560 400 H600 M560 440 H600 M590 400 V440" />
            <text x="608" y="416">lâmina d&apos;água</text>
            <text x="608" y="434" className={styles.sub}>= base − lida</text>
          </g>

          {/* ESP32 + LEDs no poste */}
          <g transform="translate(146 250)">
            <rect x="0" y="0" width="80" height="52" rx="2" className={styles.esp} />
            <text x="40" y="22" textAnchor="middle" className={styles.espTexto}>ESP32</text>
            <circle cx="22" cy="38" r="5" className={styles.ledVerde} />
            <circle cx="40" cy="38" r="5" className={styles.ledAmarelo} />
            <circle cx="58" cy="38" r="5" className={styles.ledVermelho} />
          </g>
          <text x="140" y="325" textAnchor="end" className={styles.rotulo}>
            calcula o risco
          </text>
          <text x="140" y="343" textAnchor="end" className={styles.rotulo}>
            e acende o LED
          </text>

          {/* caminho dos dados: ESP32 → nuvem → Python → site */}
          <path d="M186 250 C186 160 560 70 820 96" className={styles.dados} />
          <g transform="translate(820 70)">
            <path
              d="M18 52 H112 A24 24 0 0 0 108 6 A34 34 0 0 0 46 4 A26 26 0 0 0 18 52 Z"
              className={styles.nuvem}
            />
            <text x="64" y="38" textAnchor="middle" className={styles.caixaTexto}>ThingSpeak</text>
          </g>
          <path d="M954 100 H990" className={styles.dados} />
          <g transform="translate(1010 74)">
            <rect x="-20" y="0" width="160" height="52" rx="2" className={styles.caixa} />
            <text x="60" y="24" textAnchor="middle" className={styles.caixaTexto}>Python</text>
            <text x="60" y="42" textAnchor="middle" className={styles.sub}>índice + tendência</text>
          </g>
          <path d="M1070 126 V180" className={styles.dados} />
          <g transform="translate(1040 180)">
            <rect x="0" y="0" width="60" height="104" rx="10" className={styles.celular} />
            <rect x="8" y="14" width="44" height="70" className={styles.tela} />
            <text x="30" y="56" textAnchor="middle" className={styles.telaTexto}>54</text>
          </g>
          <text x="1070" y="306" textAnchor="middle" className={styles.rotulo}>este site</text>
        </svg>
      </div>
      <figcaption className={styles.legenda}>
        Esquema simplificado, fora de escala. A cada 15 s o ESP32 publica as duas medidas (lâmina e chuva) no
        ThingSpeak.
      </figcaption>
    </figure>
  )
}
