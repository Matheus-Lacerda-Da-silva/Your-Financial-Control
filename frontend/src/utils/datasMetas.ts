export function validarDataCivil(data: string): void {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  if (!partes) throw new Error('Informe uma data no formato dia/mês/ano.')
  const [, a, m, d] = partes
  const ano = Number(a), mes = Number(m), dia = Number(d)
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)
  const dias = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (ano < 1 || mes < 1 || mes > 12 || dia < 1 || dia > dias[mes - 1]) {
    throw new Error('Informe uma data real do calendário.')
  }
}

export function listarMeses(inicio: string, fim: string): string[] {
  validarDataCivil(inicio)
  validarDataCivil(fim)
  if (inicio > fim) throw new Error('O prazo final deve ser igual ou posterior ao início.')
  const indice = (data: string) => Number(data.slice(0, 4)) * 12 + Number(data.slice(5, 7)) - 1
  const primeiro = indice(inicio), ultimo = indice(fim)
  if (ultimo - primeiro + 1 > 120) throw new Error('O período máximo é de 120 meses civis.')
  return Array.from({ length: ultimo - primeiro + 1 }, (_, i) => {
    const atual = primeiro + i
    return `${String(Math.floor(atual / 12)).padStart(4, '0')}-${String(atual % 12 + 1).padStart(2, '0')}`
  })
}
