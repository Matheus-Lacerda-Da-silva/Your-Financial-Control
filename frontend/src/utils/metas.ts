import type { Aporte, Meta, SituacaoMeta } from '../types/meta.ts'
import { somarCentavos, validarCentavos } from './dinheiro.ts'
import { listarMeses, validarDataCivil } from './datasMetas.ts'
import { formatarMoeda } from './formatadores.ts'

export function recomendacaoMeta(plano: { valorCentavos: number }[]): string {
  if (!plano.length) return 'Sem parcelas futuras.'
  const valores = plano.map(p => p.valorCentavos)
  const minimo = Math.min(...valores), maximo = Math.max(...valores)
  return minimo === maximo ? `${formatarMoeda(minimo)} por mês` : `${formatarMoeda(minimo)} a ${formatarMoeda(maximo)} por mês`
}

export function criarIdMeta(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  if (!globalThis.crypto?.getRandomValues) throw new Error('Não foi possível gerar um identificador seguro.')
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
}

export function validarIdMeta(id: string) {
  if (!id.trim() || id !== id.trim()) throw new Error('Identificador inválido.')
}

export function validarMeta(meta: Meta, hoje: string): Meta {
  validarIdMeta(meta.id)
  validarDataCivil(hoje)
  listarMeses(meta.dataInicio, meta.dataLimite)
  if (meta.dataLimite < hoje) throw new Error('O prazo final deve ser hoje ou uma data futura.')
  validarCentavos(meta.valorObjetivoCentavos)
  validarCentavos(meta.valorInicialCentavos)
  if (meta.valorObjetivoCentavos <= 0 || meta.valorInicialCentavos < 0 || meta.valorInicialCentavos > meta.valorObjetivoCentavos) {
    throw new Error('O objetivo deve ser positivo e a reserva inicial deve estar entre zero e o objetivo.')
  }
  const nome = meta.nome.normalize('NFC').trim().replace(/\s+/gu, ' ')
  if (!nome) throw new Error('Informe o nome da meta.')
  return { ...meta, nome }
}

export function distribuirCentavos(valor: number, meses: readonly string[]) {
  validarCentavos(valor)
  if (valor < 0 || meses.length === 0) throw new Error('Valor ou período de planejamento inválido.')
  const total = BigInt(valor), quantidade = BigInt(meses.length)
  const base = total / quantidade, sobra = total % quantidade
  return meses.map((mes, i) => ({ mes, valorCentavos: Number(base + (BigInt(i) < sobra ? 1n : 0n)) }))
}

export function resumirMeta(meta: Meta, aportes: readonly Aporte[], hoje: string) {
  validarDataCivil(hoje)
  const vinculados = aportes.filter(a => a.metaId === meta.id)
  const acumulado = vinculados.reduce((total, a) => somarCentavos(total, a.valorCentavos), meta.valorInicialCentavos)
  const restante = somarCentavos(meta.valorObjetivoCentavos, -acumulado)
  if (restante < 0) throw new Error('O acumulado excede o objetivo.')
  const situacao: SituacaoMeta = restante === 0 ? 'Concluída' : hoje < meta.dataInicio ? 'Planejada' : hoje > meta.dataLimite ? 'Prazo encerrado' : 'Em andamento'
  const meses = listarMeses(meta.dataInicio, meta.dataLimite)
  const referencia = distribuirCentavos(meta.valorObjetivoCentavos - meta.valorInicialCentavos, meses)
  const elegiveis = meses.filter(m => m >= hoje.slice(0, 7))
  const atualizado = restante > 0 && hoje <= meta.dataLimite && elegiveis.length ? distribuirCentavos(restante, elegiveis) : []
  const centesimos = (BigInt(acumulado) * 10000n + BigInt(meta.valorObjetivoCentavos) / 2n) / BigInt(meta.valorObjetivoCentavos)
  // Uma meta incompleta não deve parecer concluída por arredondamento visual.
  const percentual = Number(restante > 0 && centesimos === 10000n ? 9999n : centesimos) / 100
  return { acumulado, restante, percentual, situacao, referencia, atualizado }
}
