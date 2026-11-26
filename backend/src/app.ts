import { Hono } from 'hono'
import { autenticar } from './autenticacao.ts'
import type { AmbienteApi } from './autenticacao.ts'

export function criarApp(fetchAuth?: typeof fetch) {
  const app = new Hono<AmbienteApi>()

  app.get('/health', contexto => contexto.json({ status: 'ok' }))

  app.get('/api/v1/me', autenticar(fetchAuth), contexto => {
    contexto.header('Cache-Control', 'no-store')
    return contexto.json({ id: contexto.get('usuarioId') })
  })

  app.notFound(contexto => contexto.json({
    erro: {
      codigo: 'ROTA_NAO_ENCONTRADA',
      mensagem: 'Rota não encontrada.',
    },
  }, 404))

  app.onError((_erro, contexto) => contexto.json({
    erro: {
      codigo: 'ERRO_INTERNO',
      mensagem: 'Ocorreu um erro interno.',
    },
  }, 500))

  return app
}
