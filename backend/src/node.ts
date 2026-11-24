import { serve } from '@hono/node-server'
import { criarApp } from './app.ts'

const porta = Number(process.env.PORT ?? '3000')

if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
  throw new Error('PORT deve ser um número inteiro entre 1 e 65535.')
}

serve({
  fetch: criarApp().fetch,
  hostname: '127.0.0.1',
  port: porta,
}, endereco => {
  console.log(`API YFC disponível em http://127.0.0.1:${endereco.port}`)
})
