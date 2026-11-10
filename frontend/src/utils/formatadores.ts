import { validarCentavos } from './dinheiro.ts'

export const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export const formatarMoeda = (valorCentavos: number) => {
  validarCentavos(valorCentavos)
  // Formata a parte inteira como BigInt e insere os centavos exatos.
  const absoluto = BigInt(Math.abs(valorCentavos))
  const formatador = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  const moeda = formatador.formatToParts(absoluto / 100n)
    .map(parte => parte.type === 'fraction' ? String(absoluto % 100n).padStart(2, '0') : parte.value)
    .join('')
  return valorCentavos < 0 ? `-${moeda}` : moeda
}

export const dataLocalAtual = () => {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
}
