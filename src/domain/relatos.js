import { buscarVia } from './vias.js'

export const PROFUNDIDADE_MAX = 100

/** Traduz a profundidade em algo que o motorista entende de olho. */
export function classificarProfundidade(cm) {
  if (cm >= 30) return { faixa: 'PERIGO', texto: 'Acima do meio da roda: risco de calço hidráulico' }
  if (cm >= 15) return { faixa: 'ATENCAO', texto: 'Cobre o meio-fio: passe devagar ou desvie' }
  return { faixa: 'NORMAL', texto: 'Lâmina rasa: atenção à aquaplanagem' }
}

/**
 * Valida os campos do formulário. Retorna um objeto de erros
 * (vazio quando está tudo certo).
 */
export function validarRelato({ viaId, referencia, profundidadeCm, observacao }) {
  const erros = {}
  if (!viaId || !buscarVia(viaId)) erros.viaId = 'Escolha o ponto monitorado mais próximo.'

  const ref = (referencia ?? '').trim()
  if (ref.length < 3) erros.referencia = 'Descreva o local com pelo menos 3 letras.'
  else if (ref.length > 80) erros.referencia = 'Use no máximo 80 caracteres.'

  const prof = Number(profundidadeCm)
  if (profundidadeCm === '' || Number.isNaN(prof)) erros.profundidadeCm = 'Informe a profundidade estimada.'
  else if (prof < 1 || prof > PROFUNDIDADE_MAX) erros.profundidadeCm = `Use um valor entre 1 e ${PROFUNDIDADE_MAX} cm.`

  if ((observacao ?? '').length > 200) erros.observacao = 'Use no máximo 200 caracteres.'
  return erros
}

/** Prepara o objeto que vai para a API (sem nenhum dado pessoal). */
export function montarRelato(dados, criadoEm = new Date().toISOString()) {
  return {
    viaId: dados.viaId,
    referencia: dados.referencia.trim(),
    profundidadeCm: Number(dados.profundidadeCm),
    observacao: (dados.observacao ?? '').trim(),
    criadoEm,
  }
}

/** "há 5 min", "há 2 h"... */
export function tempoRelativo(iso, agora = Date.now()) {
  const minutos = Math.round((agora - new Date(iso).getTime()) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  return `há ${Math.round(horas / 24)} d`
}
