import { isAuthSessionMissingError } from '@supabase/supabase-js'
import { createMiddleware } from 'hono/factory'
import { criarClienteSupabase } from './supabase.ts'
import type { ConfiguracaoSupabase } from './supabase.ts'

export type AmbienteApi = {
  Bindings: ConfiguracaoSupabase
  Variables: { usuarioId: string }
}

const errosDeAutenticacao = new Set([
  'bad_jwt',
  'no_authorization',
  'session_expired',
  'user_banned',
  'user_not_found',
])

export function autenticar(fetchAuth?: typeof fetch) {
  return createMiddleware<AmbienteApi>(async (contexto, next) => {
    const autorizacao = contexto.req.header('Authorization')
    const token = autorizacao?.match(/^Bearer +([^\s,]+)$/i)?.[1]
    const responderNaoAutenticado = () => {
      contexto.header('WWW-Authenticate', 'Bearer')
      return contexto.json({
        erro: { codigo: 'NAO_AUTENTICADO', mensagem: 'Autenticação necessária ou inválida.' },
      }, 401)
    }

    if (!token) return responderNaoAutenticado()

    const supabase = criarClienteSupabase(contexto.env ?? {}, fetchAuth)
    const { data, error } = await supabase.auth.getUser(token)

    if (isAuthSessionMissingError(error) || (error?.code && errosDeAutenticacao.has(error.code))) {
      return responderNaoAutenticado()
    }

    if (error || !data.user?.id) {
      return contexto.json({
        erro: {
          codigo: 'AUTENTICACAO_INDISPONIVEL',
          mensagem: 'Não foi possível consultar o serviço de autenticação.',
        },
      }, 502)
    }

    contexto.set('usuarioId', data.user.id)
    await next()
  })
}
