import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { atualizarSessao } from '../utils/sessao'
import type { EstadoSessao } from '../utils/sessao'

export function useSessao() {
  const [estado, setEstado] = useState<EstadoSessao>({ sessao: undefined, versaoConta: 0, versaoToken: 0 })

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setEstado(anterior => atualizarSessao(anterior, sessao))
    })
    return () => subscription.unsubscribe()
  }, [])

  return estado
}
