import { createContext, useContext } from 'react'

export const ContextoTema = createContext<{
  modo: 'light' | 'dark'
  alternar: () => void
} | null>(null)

export function useTema() {
  const contexto = useContext(ContextoTema)
  if (!contexto) throw new Error('useTema deve ser usado dentro de TemaProvider.')
  return contexto
}
