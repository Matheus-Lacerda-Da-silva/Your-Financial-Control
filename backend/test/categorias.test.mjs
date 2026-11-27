import assert from 'node:assert/strict'
import { test } from 'node:test'
import { criarApp } from '../src/app.ts'

const config = {
  SUPABASE_URL: 'https://projeto.example',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ficticia',
}
const rota = '/api/v1/categorias'
const id = '10000000-0000-0000-0000-000000000001'
const campos = { nome: 'Café extra', tipo: 'receita' }
const categoria = { id, ...campos }

function requisitar(app, metodo, { conta = 'a', sufixo = '', corpo } = {}) {
  return app.request(rota + sufixo, {
    method: metodo,
    headers: { Authorization: `Bearer token-${conta}`, 'Content-Type': 'application/json' },
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  }, config)
}

function simularSupabase(responderDados) {
  return criarApp(async (url, opcoes) => {
    const caminho = new URL(url)
    const headers = new Headers(opcoes.headers)
    assert.equal(headers.get('apikey'), config.SUPABASE_PUBLISHABLE_KEY)
    const token = headers.get('Authorization')
    if (caminho.pathname === '/auth/v1/user') {
      if (token === 'Bearer token-invalido') {
        return Response.json({ code: 'bad_jwt' }, {
          status: 403, headers: { 'X-Supabase-Api-Version': '2024-01-01' },
        })
      }
      return Response.json({ id: token === 'Bearer token-a' ? 'conta-a' : 'conta-b' })
    }
    assert.equal(caminho.pathname, '/rest/v1/categorias')
    assert.match(token, /^Bearer token-[ab]$/)
    const metodo = opcoes.method
    assert.equal(headers.get(metodo === 'GET' ? 'Accept-Profile' : 'Content-Profile'), 'yfc_privado')
    return responderDados(caminho.searchParams, metodo, token, opcoes.body && JSON.parse(opcoes.body))
  })
}

test('as quatro rotas rejeitam requisições sem Bearer e JWT inválido antes de consultar categorias', async () => {
  const app = simularSupabase(() => assert.fail('Data API não deveria ser chamada'))
  for (const [method, sufixo] of [['GET', ''], ['POST', ''], ['PATCH', '/' + id], ['DELETE', '/' + id]]) {
    assert.equal((await app.request(rota + sufixo, { method }, config)).status, 401)
    const resposta = await requisitar(app, method, { conta: 'invalido', sufixo })
    assert.equal(resposta.status, 401)
    assert.equal(resposta.headers.get('WWW-Authenticate'), 'Bearer')
    assert.equal(resposta.headers.get('Cache-Control'), 'no-store')
  }
})

test('CRUD encaminha o JWT de cada conta, preserva ordem, aplica PATCH parcial e respeita linhas invisíveis', async () => {
  const registros = new Map()
  const app = simularSupabase((params, metodo, token, corpo) => {
    const existente = registros.get(token)
    if (metodo === 'GET') {
      assert.equal(params.get('select'), 'id,nome,tipo,ordem_cadastro::text')
      assert.equal(params.get('order'), 'ordem_cadastro.asc')
      return Response.json(existente && !params.has('ordem_cadastro') ? [{ ...existente, ordem_cadastro: '1' }] : [])
    }
    if (metodo === 'POST') {
      assert.deepEqual(corpo, campos)
      registros.set(token, categoria)
      return Response.json(categoria, { status: 201 })
    }
    assert.equal(params.get('id'), `eq.${id}`)
    if (!existente) return Response.json([])
    if (metodo === 'PATCH') {
      assert.deepEqual(corpo, { nome: 'Café novo' })
      const alterada = { ...existente, ...corpo }
      registros.set(token, alterada)
      return Response.json([alterada])
    }
    registros.delete(token)
    assert.equal(params.get('select'), 'id')
    return Response.json([{ id }])
  })

  const criada = await requisitar(app, 'POST', { corpo: { ...campos, nome: '\uFEFFCafe\u0301\u00A0 extra  ' } })
  assert.equal(criada.status, 201)
  assert.deepEqual(await criada.json(), categoria)
  const [listaA, listaB] = await Promise.all([requisitar(app, 'GET'), requisitar(app, 'GET', { conta: 'b' })])
  assert.deepEqual(await listaA.json(), { categorias: [categoria] })
  assert.deepEqual(await listaB.json(), { categorias: [] })
  for (const metodo of ['PATCH', 'DELETE']) {
    const alheia = await requisitar(app, metodo, {
      conta: 'b', sufixo: '/' + id, corpo: metodo === 'PATCH' ? { nome: 'Café novo' } : undefined,
    })
    assert.equal(alheia.status, 404)
    assert.equal((await alheia.json()).erro.codigo, 'CATEGORIA_NAO_ENCONTRADA')
  }
  const editada = await requisitar(app, 'PATCH', { sufixo: '/' + id, corpo: { nome: 'Café novo' } })
  assert.equal(editada.status, 200)
  assert.deepEqual(await editada.json(), { ...categoria, nome: 'Café novo' })
  const excluida = await requisitar(app, 'DELETE', { sufixo: '/' + id })
  assert.equal(excluida.status, 204)
  assert.equal(await excluida.text(), '')
  assert.deepEqual(await (await requisitar(app, 'GET')).json(), { categorias: [] })
})

test('cursor bigint preserva as categorias sobreviventes após exclusão entre lotes', async () => {
  const registros = Array.from({ length: 101 }, (_, i) => ({
    ...categoria, id: String(i), ordem_cadastro: String(9007199254740994n + BigInt(i)),
  }))
  const esperadas = registros.map(({ id, nome, tipo }) => ({ id, nome, tipo }))
  let rodada = 0
  const app = simularSupabase(params => {
    assert.equal(params.get('select'), 'id,nome,tipo,ordem_cadastro::text')
    assert.equal(params.has('offset'), false)
    const filtro = params.get('ordem_cadastro')
    if (++rodada === 2) {
      registros.shift()
      assert.equal(filtro, 'gt.9007199254741093')
    }
    return Response.json(registros.filter(c => !filtro || BigInt(c.ordem_cadastro) > BigInt(filtro.slice(3)))
      .slice(0, Number(params.get('limit'))))
  })
  const resposta = await requisitar(app, 'GET')
  assert.equal(resposta.status, 200)
  assert.deepEqual(await resposta.json(), { categorias: esperadas })
})

test('entrada inválida é recusada antes de acessar a Data API', async () => {
  const app = simularSupabase(() => assert.fail('Data API não deveria ser chamada'))
  for (const [metodo, sufixo, corpo] of [
    ['POST', '', '{'],
    ['POST', '', { ...campos, usuario_id: 'conta-b' }],
    ['POST', '', { ...campos, nome: '\u00a0' }],
    ['POST', '', { ...campos, tipo: 'outro' }],
    ['POST', '', { nome: 'Café' }],
    ['PATCH', '/' + id, {}],
    ['PATCH', '/' + id, { id }],
    ['DELETE', '/invalido'],
  ]) {
    const resposta = await requisitar(app, metodo, { sufixo, corpo })
    assert.equal(resposta.status, 400)
    assert.equal((await resposta.json()).erro.codigo, 'CATEGORIA_INVALIDA')
  }
})

test('conflitos e falhas da Data API retornam erro estruturado sem detalhes internos', async () => {
  for (const [code, status, esperado, codigo, metodo] of [
    ['23505', 409, 409, 'CATEGORIA_DUPLICADA', 'POST'],
    ['23503', 409, 409, 'CATEGORIA_VINCULADA', 'DELETE'],
    ['PGRST303', 401, 401, 'NAO_AUTENTICADO', 'GET'],
    ['PGRST106', 406, 502, 'CATEGORIAS_INDISPONIVEIS', 'GET'],
    ['', 503, 502, 'CATEGORIAS_INDISPONIVEIS', 'GET'],
  ]) {
    const app = simularSupabase(() => Response.json({ code, message: 'Detalhe interno' }, { status }))
    const resposta = await requisitar(app, metodo, {
      sufixo: metodo === 'DELETE' ? '/' + id : '', corpo: metodo === 'POST' ? campos : undefined,
    })
    assert.equal(resposta.status, esperado)
    const { erro } = await resposta.json()
    assert.equal(erro.codigo, codigo)
    assert.doesNotMatch(erro.mensagem, /Detalhe interno/)
  }
})
