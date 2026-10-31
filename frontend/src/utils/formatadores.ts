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