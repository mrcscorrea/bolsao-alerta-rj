/** Remove acentos e deixa minúsculo, para a busca achar "praca" em "Praça". */
export function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Filtra as vias pela faixa escolhida e pelo texto digitado. */
export function filtrarVias(vias, { faixa = 'TODAS', busca = '' } = {}) {
  const termo = normalizarTexto(busca.trim())
  return vias.filter((v) => {
    const passaFaixa = faixa === 'TODAS' || v.atual.faixa === faixa
    const passaBusca = termo === '' || normalizarTexto(`${v.via} ${v.trecho} ${v.referencia}`).includes(termo)
    return passaFaixa && passaBusca
  })
}

/** Mais arriscadas primeiro. */
export function ordenarPorRisco(vias) {
  return [...vias].sort((a, b) => b.atual.risco - a.atual.risco)
}
