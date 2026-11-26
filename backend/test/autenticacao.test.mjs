import assert from 'node:assert/strict'
import { test } from 'node:test'
import { criarApp } from '../src/app.ts'

const config = {
  SUPABASE_URL: 'https://projeto.example',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ficticia',
}
const token = 'token-ficticio'
const headers = { Authorization: `Bearer ${token}` }

test('GET /api/v1/me rejeita cabeçalho ausente ou malformado sem consultar o Supabase', async () => {
  const app = criarApp(() => assert.fail('O Supabase não deveria ser consultado'))

  for (const authorization of [undefined, 'Basic abc', 'Bearer', 'Bearer token extra', 'Bearer um,dois']) {
    const headers = authorization ? { Authorization: authorization } : {}
    const resposta = await app.request('/api/v1/me', { headers }, config)

    assert.equal(resposta.status, 401)
    assert.equal(resposta.headers.get('WWW-Authenticate'), 'Bearer')
    assert.equal((await resposta.json()).erro.codigo, 'NAO_AUTENTICADO')
  }
})

test('GET /api/v1/me valida o Bearer no Supabase e devolve apenas o ID', async () => {
  const app = criarApp(async (url, opcoes) => {
    assert.equal(String(url), 'https://projeto.example/auth/v1/user')
    const headers = new Headers(opcoes.headers)
    assert.equal(headers.get('Authorization'), `Bearer ${token}`)
    assert.equal(headers.get('apikey'), config.SUPABASE_PUBLISHABLE_KEY)

    return Response.json({ id: 'usuario-ficticio', email: 'pessoa@example.com' })
  })

  const resposta = await app.request('/api/v1/me', {
    headers: { Authorization: `bearer ${token}` },
  }, config)

  assert.equal(resposta.status, 200)
  assert.equal(resposta.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(await resposta.json(), { id: 'usuario-ficticio' })
})

test('GET /api/v1/me retorna 401 quando o Supabase rejeita o JWT', async () => {
  for (const code of ['bad_jwt', 'session_not_found']) {
    const app = criarApp(async () => Response.json({
      code,
      msg: 'Detalhe interno do JWT',
    }, { status: 403, headers: { 'X-Supabase-Api-Version': '2024-01-01' } }))

    const resposta = await app.request('/api/v1/me', { headers }, config)

    assert.equal(resposta.status, 401)
    assert.deepEqual(await resposta.json(), {
      erro: { codigo: 'NAO_AUTENTICADO', mensagem: 'Autenticação necessária ou inválida.' },
    })
  }
})

test('GET /api/v1/me retorna 500 com configuração ausente ou inválida', async () => {
  const app = criarApp(() => assert.fail('O Supabase não deveria ser consultado'))

  for (const ambiente of [
    undefined,
    { ...config, SUPABASE_URL: 'url-invalida' },
    { ...config, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_ficticia' },
  ]) {
    const resposta = await app.request('/api/v1/me', { headers }, ambiente)

    assert.equal(resposta.status, 500)
    assert.equal((await resposta.json()).erro.codigo, 'ERRO_INTERNO')
  }
})

test('GET /api/v1/me retorna 502 quando a consulta ao Supabase falha', async () => {
  for (const fetchAuth of [
    async () => { throw new TypeError('Falha de rede simulada') },
    async () => new Response(null, { status: 503 }),
    async () => Response.json({ message: 'Invalid API key' }, { status: 401 }),
  ]) {
    const resposta = await criarApp(fetchAuth).request('/api/v1/me', { headers }, config)

    assert.equal(resposta.status, 502)
    assert.deepEqual(await resposta.json(), {
      erro: {
        codigo: 'AUTENTICACAO_INDISPONIVEL',
        mensagem: 'Não foi possível consultar o serviço de autenticação.',
      },
    })
  }
})
