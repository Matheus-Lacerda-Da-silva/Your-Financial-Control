import { createClient } from '@supabase/supabase-js'

export type ConfiguracaoSupabase = {
  SUPABASE_URL?: string
  SUPABASE_PUBLISHABLE_KEY?: string
}

export function criarClienteSupabase(config: ConfiguracaoSupabase, buscar?: typeof fetch, token?: string) {
  const url = config.SUPABASE_URL?.trim()
  const chave = config.SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || new URL(url).protocol !== 'https:' || !chave?.startsWith('sb_publishable_')) {
    throw new Error('Configuração inválida do Supabase.')
  }

  return createClient(url, chave, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { fetch: buscar },
    ...(token ? { accessToken: async () => token } : {}),
  })
}
