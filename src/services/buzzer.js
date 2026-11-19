let contexto = null

/** Bipe de alarme (Web Audio API), como o buzzer do circuito. */
export function tocarAlarme(vezes = 3) {
  try {
    contexto ??= new AudioContext()
    const agora = contexto.currentTime
    for (let i = 0; i < vezes; i++) {
      const osc = contexto.createOscillator()
      const ganho = contexto.createGain()
      osc.type = 'square'
      osc.frequency.value = 880
      ganho.gain.setValueAtTime(0.08, agora + i * 0.32)
      ganho.gain.setValueAtTime(0, agora + i * 0.32 + 0.18)
      osc.connect(ganho).connect(contexto.destination)
      osc.start(agora + i * 0.32)
      osc.stop(agora + i * 0.32 + 0.2)
    }
  } catch {
    // navegador sem áudio: o alerta visual continua funcionando
  }
}

/** Trovão sintetizado: ruído grave filtrado, estouro curto e ronco que some. */
export function tocarTrovao(forca = 1) {
  try {
    contexto ??= new AudioContext()
    const agora = contexto.currentTime
    const duracao = 3.2
    const buffer = contexto.createBuffer(1, contexto.sampleRate * duracao, contexto.sampleRate)
    const dados = buffer.getChannelData(0)
    let ultimo = 0
    for (let i = 0; i < dados.length; i++) {
      // ruído "marrom": cada amostra puxa um pouco da anterior, fica grave
      ultimo = (ultimo + 0.02 * (Math.random() * 2 - 1)) / 1.02
      dados[i] = ultimo * 3.5
    }
    const fonte = contexto.createBufferSource()
    fonte.buffer = buffer
    const filtro = contexto.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.setValueAtTime(900, agora)
    filtro.frequency.exponentialRampToValueAtTime(110, agora + 1.2)
    const ganho = contexto.createGain()
    ganho.gain.setValueAtTime(0.0001, agora)
    ganho.gain.exponentialRampToValueAtTime(0.5 * forca, agora + 0.06)
    ganho.gain.exponentialRampToValueAtTime(0.18 * forca, agora + 0.5)
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracao)
    fonte.connect(filtro).connect(ganho).connect(contexto.destination)
    fonte.start(agora)
  } catch {
    // sem áudio: o relâmpago continua aparecendo
  }
}
