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
