import assert from 'node:assert/strict'
import { test } from 'node:test'
import { criarApiCategorias, ErroCategoriasApi } from '../src/services/categoriasApi.ts'

const id = '10000000-0000-0000-0000-000000000001'
const campos = { nome: 'Renda', tipo: 'receita' }
const categoria = { id, ...campos }

test('serviço envia somente os campos do contrato com Bearer e respeita os quatro retornos', async () => {
  const respostas = [
    Response.json({ categorias: [categoria] }),
    Response.json(categoria, { status: 201 }),
    Response.json({ ...categoria, nome: 'Extra' }),
    new Response(null, { status: 204 }),
  ]
  const chamadas = []
  const api = criarApiCategorias('https://api.example', 'token-ficticio', new AbortController().signal, async (url, config) => {
    assert.equal(url.origin, 'https://api.example')
    assert.equal(config.headers.Authorization, 'Bearer token-ficticio')
    assert.equal(config.redirect, 'error')
    chamadas.push([config.method, url.pathname, config.body && JSON.parse(config.body)])
    return respostas.shift()
  })
  assert.deepEqual(await api.listar(), [categoria])
  assert.deepEqual(await api.gravar({ metodo: 'POST', campos }), categoria)
  assert.deepEqual(await api.gravar({ metodo: 'PATCH', id, campos: { nome: 'Extra' } }), { ...categoria, nome: 'Extra' })
  assert.equal(await api.gravar({ metodo: 'DELETE', id }), null)
  assert.deepEqual(chamadas, [
    ['GET', '/api/v1/categorias', undefined],
    ['POST', '/api/v1/categorias', campos],
    ['PATCH', '/api/v1/categorias/' + id, { nome: 'Extra' }],
    ['DELETE', '/api/v1/categorias/' + id, undefined],
  ])
})

test('serviço propaga erro HTTP, rejeita dados inválidos e protege o envio do token', async () => {
  const sinal = new AbortController().signal
  const indisponivel = criarApiCategorias('https://api.example', 'token-ficticio', sinal, async () =>
    Response.json({ erro: { mensagem: 'Serviço indisponível.' } }, { status: 502 }))
  await assert.rejects(indisponivel.listar(), erro =>
    erro instanceof ErroCategoriasApi && erro.status === 502 && erro.message === 'Serviço indisponível.')
  const invalida = criarApiCategorias('https://api.example', 'token-ficticio', sinal, async () => Response.json({ categorias: null }))
  await assert.rejects(invalida.listar(), /lista de categorias inválida/)
  let consultou = false
  const insegura = criarApiCategorias('http://api.example', 'token-ficticio', sinal, async () => { consultou = true })
  await assert.rejects(insegura.listar(), /Endereço da API inválido/)
  assert.equal(consultou, false)
})

test('cancelar a sessão aborta a requisição de categorias', async () => {
  const sessao = new AbortController()
  const api = criarApiCategorias('https://api.example', 'token-ficticio', sessao.signal, (_url, { signal }) =>
    new Promise((_, rejeitar) => signal.addEventListener('abort', () => rejeitar(signal.reason), { once: true })))
  const pendente = api.listar()
  sessao.abort()
  await assert.rejects(pendente, { name: 'AbortError' })
})
