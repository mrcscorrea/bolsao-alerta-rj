/**
 * Reduz a foto no próprio navegador antes de enviar (lado maior até 1280 px).
 * Tenta WebP (bem mais leve); navegador que não gera WebP cai para JPEG.
 * Uma foto de celular de 4 MB costuma cair para ~150 KB.
 */
export async function comprimirImagem(arquivo, ladoMaximo = 1280) {
  if (!arquivo.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.')
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const gerar = (tipo, qualidade) => new Promise((resolver) => canvas.toBlob(resolver, tipo, qualidade))
  let blob = await gerar('image/webp', 0.78)
  // sem suporte, o navegador devolve PNG (pesado): nesse caso usa JPEG
  if (!blob || blob.type !== 'image/webp') blob = await gerar('image/jpeg', 0.8)
  if (!blob) throw new Error('Não deu para ler a imagem.')
  return blob
}
