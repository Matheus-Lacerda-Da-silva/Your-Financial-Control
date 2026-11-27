import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { autenticar } from './autenticacao.ts'
import type { AmbienteApi } from './autenticacao.ts'
import { criarRotasCategorias } from './categorias.ts'

export function criarApp(buscar?: typeof fetch) {
  const app = new Hono<AmbienteApi>()

  app.get('/health', contexto => contexto.json({ status: 'ok' }))

  const origin: NonNullable<Parameters<typeof cors>[0]>['origin'] = (origem, contexto) => {
    const configuracao: AmbienteApi['Bindings'] | undefined = contexto.env
    const origens = configuracao?.FRONTEND_ORIGINS?.split(',').map(valor => valor.trim())
    return origens?.includes(origem) ? origem : undefined
  }
  app.use('/api/v1/me', cors({
    origin,
    allowMethods: ['GET'],
    allowHeaders: ['Authorization'],
  }))

  const corsCategorias = cors({
    origin,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowHeaders: ['Authorization', 'Content-Type'],
  })
  app.use('/api/v1/categorias', corsCategorias)
  app.use('/api/v1/categorias/*', corsCategorias)
  app.route('/api/v1/categorias', criarRotasCategorias(buscar))

  app.get('/api/v1/me', autenticar(buscar), contexto => {
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
