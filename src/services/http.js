export class HttpError extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * fetch com tempo limite e mensagens de erro em português.
 * Nunca deixa a interface "travar" esperando a rede.
 */
export async function requisitar(url, { method = 'GET', body, timeout = 8000 } = {}) {
  const controle = new AbortController()
  const timer = setTimeout(() => controle.abort(), timeout)
  try {
    const resposta = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controle.signal,
    })
    if (!resposta.ok) throw new HttpError(`O servidor respondeu com erro ${resposta.status}`, resposta.status)
    return resposta.status === 204 ? null : await resposta.json()
  } catch (erro) {
    if (erro instanceof HttpError) throw erro
    if (erro.name === 'AbortError') throw new HttpError('O servidor demorou demais para responder')
    throw new HttpError('Sem conexão com o servidor')
  } finally {
    clearTimeout(timer)
  }
}
