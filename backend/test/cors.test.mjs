import assert from 'node:assert/strict'
import { test } from 'node:test'
import { criarApp } from '../src/app.ts'

const origem = 'http://localhost:5173'
const bindings = { FRONTEND_ORIGINS: `http://127.0.0.1:5173, ${origem}` }

test('preflight de /api/v1/me autoriza GET com Bearer para uma origem configurada', async () => {
  const resposta = await criarApp().request('/api/v1/me', {
    method: 'OPTIONS',
    headers: {
      Origin: origem,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  }, bindings)

  assert.equal(resposta.status, 204)
  assert.equal(resposta.headers.get('Access-Control-Allow-Origin'), origem)
  assert.equal(resposta.headers.get('Access-Control-Allow-Methods'), 'GET')
  assert.equal(resposta.headers.get('Access-Control-Allow-Headers'), 'Authorization')
})

test('CORS permite ler o 401 somente de uma origem autorizada', async () => {
  const app = criarApp()
  for (const [origin, config, esperado] of [
    [origem, bindings, origem],
    ['http://localhost:5174', bindings, null],
    [origem, undefined, null],
  ]) {
    const resposta = await app.request('/api/v1/me', { headers: { Origin: origin } }, config)
    assert.equal(resposta.status, 401)
    assert.equal(resposta.headers.get('Access-Control-Allow-Origin'), esperado)
  }
})
