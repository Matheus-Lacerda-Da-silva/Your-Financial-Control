import assert from 'node:assert/strict'
import { test } from 'node:test'
import { consultarIdentidade } from '../src/services/identidadeApi.ts'
import { atualizarSessao } from '../src/utils/sessao.ts'

const sessao = (id, token = 'token-ficticio') => ({ user: { id }, access_token: token })
const urlApi = 'http://127.0.0.1:3000'

test('a renovação mantém a chave do painel e a troca de conta altera a chave', () => {
  const inicial = { sessao: undefined, versaoConta: 0, versaoToken: 0 }
  const semSessao = atualizarSessao(inicial, null)
  assert.equal(semSessao.sessao, null)

  const contaA = atualizarSessao(semSessao, sessao('conta-a'))
  const renovada = atualizarSessao(contaA, sessao('conta-a', 'token-renovado'))
  assert.equal(renovada.versaoConta, contaA.versaoConta)
  assert.notEqual(renovada.versaoToken, contaA.versaoToken)
  assert.equal(renovada.sessao.access_token, 'token-renovado')

  const contaB = atualizarSessao(renovada, sessao('conta-b'))
  assert.notEqual(contaB.versaoConta, renovada.versaoConta)
  assert.notEqual(atualizarSessao(atualizarSessao(contaB, null), sessao('conta-b')).versaoConta, contaB.versaoConta)
})

test('a consulta envia o Bearer e confirma a identidade da conta atual', async () => {
  const controle = new AbortController()
  const resultado = await consultarIdentidade(urlApi, sessao('conta-a'), controle.signal, async (url, opcoes) => {
    assert.equal(String(url), `${urlApi}/api/v1/me`)
    assert.equal(new Headers(opcoes.headers).get('Authorization'), 'Bearer token-ficticio')
    assert.equal(opcoes.signal, controle.signal)
    return Response.json({ id: 'conta-a' })
  })
  assert.equal(resultado, 'confirmada')
})

test('a consulta distingue sessão rejeitada, identidade divergente e indisponibilidade', async () => {
  for (const [responder, esperado] of [
    [async () => new Response(null, { status: 401 }), 'invalida'],
    [async () => Response.json({ id: 'conta-b' }), 'invalida'],
    [async () => Response.json({}), 'indisponivel'],
    [async () => new Response(null, { status: 502 }), 'indisponivel'],
    [async () => { throw new TypeError('Falha de rede simulada') }, 'indisponivel'],
  ]) {
    const resultado = await consultarIdentidade(urlApi, sessao('conta-a'), new AbortController().signal, responder)
    assert.equal(resultado, esperado)
  }
})

test('a consulta aceita HTTP em loopback e HTTPS remoto', async () => {
  for (const origem of [urlApi, 'http://localhost:3000', 'http://[::1]:3000', 'https://api.example']) {
    let chamadas = 0
    const resultado = await consultarIdentidade(origem, sessao('conta-a'), new AbortController().signal, async url => {
      chamadas++
      assert.equal(url.origin, origem)
      return Response.json({ id: 'conta-a' })
    })
    assert.equal(chamadas, 1)
    assert.equal(resultado, 'confirmada')
  }
})

test('a consulta rejeita HTTP remoto e URLs inválidas antes de enviar o Bearer', async () => {
  for (const origem of ['http://api.example', 'http://localhost.example', 'http://127.0.0.1.example', 'invalida']) {
    let chamadas = 0
    const resultado = await consultarIdentidade(origem, sessao('conta-a'), new AbortController().signal, async () => {
      chamadas++
      return Response.json({ id: 'conta-a' })
    })
    assert.equal(chamadas, 0)
    assert.equal(resultado, 'indisponivel')
  }
})
