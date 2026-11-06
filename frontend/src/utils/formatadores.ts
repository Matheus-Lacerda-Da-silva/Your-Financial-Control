export const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export const formatarMoeda = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export const dataLocalAtual = () => {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
}
