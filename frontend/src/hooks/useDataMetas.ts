import { useEffect, useState } from 'react'
import { dataLocalAtual } from '../utils/formatadores'

export default function useDataMetas() {
  const [hoje, setHoje] = useState(dataLocalAtual)
  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout>
    const atualizar = () => {
      setHoje(dataLocalAtual())
      clearTimeout(temporizador)
      const agora = new Date()
      const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)
      temporizador = setTimeout(atualizar, amanha.getTime() - agora.getTime() + 100)
    }
    atualizar()
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => { clearTimeout(temporizador); window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar) }
  }, [])
  return hoje
}

