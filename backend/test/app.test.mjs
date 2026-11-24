import assert from 'node:assert/strict'
import { test } from 'node:test'
import { criarApp } from '../src/app.ts'

test('GET /health responde com status da aplicação', async () => {
  const resposta = await criarApp().request('/health')

  assert.equal(resposta.status, 200)
  assert.match(resposta.headers.get('content-type'), /^application\/json\b/)
  assert.deepEqual(await resposta.json(), { status: 'ok' })
})

test('uma rota inexistente responde com erro estruturado', async () => {
  const resposta = await criarApp().request('/inexistente')

  assert.equal(resposta.status, 404)
  assert.match(resposta.headers.get('content-type'), /^application\/json\b/)
  assert.deepEqual(await resposta.json(), {
    erro: {
      codigo: 'ROTA_NAO_ENCONTRADA',
      mensagem: 'Rota não encontrada.',
    },
  })
})

test('um erro interno responde com mensagem genérica', async () => {
  const app = criarApp()
  app.get('/falha', () => {
    throw new Error('Detalhe interno de teste')
  })

  const resposta = await app.request('/falha')

  assert.equal(resposta.status, 500)
  assert.match(resposta.headers.get('content-type'), /^application\/json\b/)
  assert.deepEqual(await resposta.json(), {
    erro: {
      codigo: 'ERRO_INTERNO',
      mensagem: 'Ocorreu um erro interno.',
    },
  })
})
