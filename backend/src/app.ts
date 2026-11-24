import { Hono } from 'hono'

export function criarApp() {
  const app = new Hono()

  app.get('/health', contexto => contexto.json({ status: 'ok' }))

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
