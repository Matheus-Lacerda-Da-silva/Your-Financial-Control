export type ResultadoIdentidade = 'confirmada' | 'invalida' | 'indisponivel'

export async function consultarIdentidade(
  urlApi: string,
  sessao: { access_token: string; user: { id: string } },
  signal: AbortSignal,
  buscar: typeof fetch = fetch,
): Promise<ResultadoIdentidade> {
  try {
    const url = new URL('/api/v1/me', urlApi)
    const loopback = url.hostname === 'localhost' || url.hostname === '[::1]'
      || /^127\.(?:\d{1,3}\.){2}\d{1,3}$/.test(url.hostname)
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
      return 'indisponivel'
    }

    const resposta = await buscar(url, {
      headers: { Authorization: `Bearer ${sessao.access_token}` },
      redirect: 'error',
      signal,
    })
    if (resposta.status === 401) return 'invalida'
    if (!resposta.ok) return 'indisponivel'

    const identidade = await resposta.json()
    if (typeof identidade?.id !== 'string') return 'indisponivel'
    return identidade.id === sessao.user.id ? 'confirmada' : 'invalida'
  } catch {
    return 'indisponivel'
  }
}
