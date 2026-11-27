import { Hono } from 'hono'
import type { Context } from 'hono'
import { autenticar } from './autenticacao.ts'
import type { AmbienteApi } from './autenticacao.ts'
import { criarClienteSupabase } from './supabase.ts'

type Contexto = Context<AmbienteApi>
type Campos = { nome: string; tipo: 'receita' | 'despesa' }
const colunas = 'id,nome,tipo'
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

function entradaInvalida(c: Contexto, mensagem: string) {
  return c.json({ erro: { codigo: 'CATEGORIA_INVALIDA', mensagem } }, 400)
}

function categoriaAusente(c: Contexto) {
  return c.json({ erro: { codigo: 'CATEGORIA_NAO_ENCONTRADA', mensagem: 'Categoria não encontrada.' } }, 404)
}

function erroDados(c: Contexto, codigo: string, status: number) {
  if (codigo === '23505') {
    return c.json({ erro: { codigo: 'CATEGORIA_DUPLICADA', mensagem: 'Já existe uma categoria com esse nome e tipo.' } }, 409)
  }
  if (codigo === '23503') {
    return c.json({ erro: { codigo: 'CATEGORIA_VINCULADA', mensagem: 'A categoria possui transações vinculadas.' } }, 409)
  }
  if (status === 401) {
    c.header('WWW-Authenticate', 'Bearer')
    return c.json({ erro: { codigo: 'NAO_AUTENTICADO', mensagem: 'Autenticação necessária ou inválida.' } }, 401)
  }
  return c.json({ erro: { codigo: 'CATEGORIAS_INDISPONIVEIS', mensagem: 'Não foi possível consultar o serviço de categorias.' } }, 502)
}

async function lerCampos(c: Contexto, parcial: boolean): Promise<Partial<Campos>> {
  const corpo: unknown = await c.req.json().catch(() => null)
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    throw new Error('Envie um objeto JSON com os dados da categoria.')
  }
  const chaves = Object.keys(corpo)
  if (!chaves.length || chaves.some(chave => chave !== 'nome' && chave !== 'tipo')) {
    throw new Error('Envie somente nome e tipo da categoria.')
  }
  const campos: Partial<Campos> = {}
  if ('nome' in corpo || !parcial) {
    const nome = 'nome' in corpo && typeof corpo.nome === 'string'
      ? corpo.nome.normalize('NFC').trim().replace(/\s+/gu, ' ')
      : ''
    if (!nome || nome.includes('\0')) throw new Error('Informe um nome válido para a categoria.')
    campos.nome = nome
  }
  if ('tipo' in corpo || !parcial) {
    const tipo = 'tipo' in corpo && corpo.tipo
    if (tipo !== 'receita' && tipo !== 'despesa') throw new Error('Selecione Receita ou Despesa para a categoria.')
    campos.tipo = tipo
  }
  return campos
}

export function criarRotasCategorias(buscar?: typeof fetch) {
  const rotas = new Hono<AmbienteApi>()
  const tabela = (c: Contexto) => criarClienteSupabase(c.env, buscar, c.get('token'))
    .schema('yfc_privado').from('categorias')

  rotas.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store')
    await next()
  }, autenticar(buscar))

  rotas.get('/', async c => {
    const categorias: (Campos & { id: string })[] = []
    const categoriasDb = tabela(c)
    // Lotes com ordem estável dentro da conta.
    const tamanho = 100
    let cursor: string | undefined
    while (true) {
      // O cast ocorre no PostgreSQL, antes de o JSON passar pelo JavaScript.
      const consulta = categoriasDb.select('id,nome,tipo,ordem_cadastro::text')
        .order('ordem_cadastro').limit(tamanho)
      const { data, error, status } = await (cursor === undefined ? consulta : consulta.gt('ordem_cadastro', cursor))
      if (error) return erroDados(c, error.code, status)
      if (!data.length) return c.json({ categorias })
      for (const { id, nome, tipo, ordem_cadastro } of data) {
        categorias.push({ id, nome, tipo })
        cursor = ordem_cadastro
      }
    }
  })

  rotas.post('/', async c => {
    let campos
    try {
      campos = await lerCampos(c, false)
    } catch (erro) {
      return entradaInvalida(c, (erro as Error).message)
    }
    const { data, error, status } = await tabela(c).insert(campos).select(colunas).single()
    if (error) return erroDados(c, error.code, status)
    return c.json(data, 201)
  })

  rotas.patch('/:id', async c => {
    const id = c.req.param('id')
    if (!uuid.test(id)) return entradaInvalida(c, 'Identificador de categoria inválido.')
    let campos
    try {
      campos = await lerCampos(c, true)
    } catch (erro) {
      return entradaInvalida(c, (erro as Error).message)
    }
    const { data, error, status } = await tabela(c).update(campos).eq('id', id).select(colunas).maybeSingle()
    if (error) return erroDados(c, error.code, status)
    return data ? c.json(data) : categoriaAusente(c)
  })

  rotas.delete('/:id', async c => {
    const id = c.req.param('id')
    if (!uuid.test(id)) return entradaInvalida(c, 'Identificador de categoria inválido.')
    const { data, error, status } = await tabela(c).delete().eq('id', id).select('id').maybeSingle()
    if (error) return erroDados(c, error.code, status)
    return data ? c.body(null, 204) : categoriaAusente(c)
  })

  return rotas
}
