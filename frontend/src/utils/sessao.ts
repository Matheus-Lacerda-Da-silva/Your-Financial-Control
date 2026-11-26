import type { Session } from '@supabase/supabase-js'

export type EstadoSessao = {
  sessao: Session | null | undefined
  versaoConta: number
  versaoToken: number
}

export function atualizarSessao(anterior: EstadoSessao, sessao: Session | null): EstadoSessao {
  const mudouConta = anterior.sessao?.user.id !== sessao?.user.id
  const mudouToken = anterior.sessao?.access_token !== sessao?.access_token
  return {
    sessao,
    versaoConta: anterior.versaoConta + Number(mudouConta),
    versaoToken: anterior.versaoToken + Number(mudouToken),
  }
}
