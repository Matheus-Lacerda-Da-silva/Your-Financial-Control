import type { Categoria } from '../types/categoria.ts'
import { criarUrlApi } from './identidadeApi.ts'

type Campos = Omit<Categoria, 'id'>
export type OperacaoCategoria =
  | { metodo: 'POST'; campos: Campos }
  | { metodo: 'PATCH'; id: string; campos: Partial<Campos> }
  | { metodo: 'DELETE'; id: string }

export class ErroCategoriasApi extends Error {
  readonly status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
  }
}

function ehCategoria(dado: unknown): dado is Categoria {
  return Boolean(dado && typeof dado === 'object'
    && 'id' in dado && typeof dado.id === 'string'
    && 'nome' in dado && typeof dado.nome === 'string'
    && 'tipo' in dado && (dado.tipo === 'receita' || dado.tipo === 'despesa'))
}

export function criarApiCategorias(urlApi: string, token: string, sessao: AbortSignal, buscar: typeof fetch = fetch) {
  async function requisitar(operacao?: OperacaoCategoria) {
    const caminho = '/api/v1/categorias' + (operacao && 'id' in operacao ? '/' + encodeURIComponent(operacao.id) : '')
    const campos = operacao && 'campos' in operacao ? operacao.campos : undefined
    const resposta = await buscar(criarUrlApi(urlApi, caminho), {
      method: operacao?.metodo ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(campos && { 'Content-Type': 'application/json' }),
      },
      body: campos && JSON.stringify(campos),
      redirect: 'error',
      signal: AbortSignal.any([sessao, AbortSignal.timeout(10_000)]),
    })

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null)
      throw new ErroCategoriasApi(
        typeof corpo?.erro?.mensagem === 'string' ? corpo.erro.mensagem : 'Não foi possível consultar o serviço de categorias.',
        resposta.status,
      )
    }
    const statusEsperado = operacao?.metodo === 'POST' ? 201 : operacao?.metodo === 'DELETE' ? 204 : 200
    if (resposta.status !== statusEsperado) throw new Error('A API retornou uma resposta inesperada.')
    if (resposta.status === 204) return null
    return resposta.json()
  }

  return {
    async listar(): Promise<Categoria[]> {
      const corpo = await requisitar()
      if (!Array.isArray(corpo?.categorias) || !corpo.categorias.every(ehCategoria)) {
        throw new Error('A API retornou uma lista de categorias inválida.')
      }
      return corpo.categorias
    },
    async gravar(operacao: OperacaoCategoria): Promise<Categoria | null> {
      const corpo = await requisitar(operacao)
      if (operacao.metodo === 'DELETE' ? corpo !== null : !ehCategoria(corpo)
        || (operacao.metodo === 'PATCH' && corpo.id !== operacao.id)) {
        throw new Error('A API retornou uma resposta inválida ao gravar a categoria.')
      }
      return corpo
    },
  }
}
