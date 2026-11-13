import type { Aporte, Meta } from '../types/meta.ts'
import { listarMeses, validarDataCivil } from './datasMetas.ts'
import { somarCentavos, validarCentavos } from './dinheiro.ts'
import { resumirMeta, validarIdMeta } from './metas.ts'

export type CompetenciaEvolucaoMeta = {
  readonly competencia: string
  readonly planejadoAcumuladoCentavos: number
  readonly realizadoAcumuladoCentavos: number | null
  readonly situacaoTemporal: 'encerrada' | 'atual' | 'futura'
}

export function agregarEvolucaoMeta(meta: Readonly<Meta>, aportes: readonly Readonly<Aporte>[], hoje: string) {
  validarDataCivil(hoje)
  validarIdMeta(meta.id)
  if (!meta.nome.trim()) throw new Error('Nome da meta inválido.')
  listarMeses(meta.dataInicio, meta.dataLimite)
  validarCentavos(meta.valorObjetivoCentavos)
  validarCentavos(meta.valorInicialCentavos)
  if (meta.valorObjetivoCentavos <= 0 || meta.valorInicialCentavos < 0 || meta.valorInicialCentavos > meta.valorObjetivoCentavos) {
    throw new Error('Objetivo ou reserva inicial inválidos.')
  }
  const vinculados = aportes.filter(aporte => aporte.metaId === meta.id)
  const ids = new Set<string>()
  const porMes = new Map<string, number>()
  for (const aporte of vinculados) {
    validarIdMeta(aporte.id)
    validarDataCivil(aporte.data)
    validarCentavos(aporte.valorCentavos)
    if (ids.has(aporte.id) || aporte.valorCentavos <= 0 || aporte.data < meta.dataInicio || aporte.data > meta.dataLimite || aporte.data > hoje) {
      throw new Error('Aporte duplicado, futuro ou fora dos limites da meta.')
    }
    ids.add(aporte.id)
    const mes = aporte.data.slice(0, 7)
    porMes.set(mes, somarCentavos(porMes.get(mes) ?? 0, aporte.valorCentavos))
  }
  // Não usa validarMeta: metas existentes com prazo encerrado são válidas aqui.
  const resumo = resumirMeta(meta, vinculados, hoje)
  let planejado = meta.valorInicialCentavos
  let realizado = meta.valorInicialCentavos
  const meses: CompetenciaEvolucaoMeta[] = resumo.referencia.map(parcela => {
    planejado = somarCentavos(planejado, parcela.valorCentavos)
    realizado = somarCentavos(realizado, porMes.get(parcela.mes) ?? 0)
    const futura = parcela.mes > hoje.slice(0, 7) || hoje < meta.dataInicio
    return {
      competencia: parcela.mes,
      planejadoAcumuladoCentavos: planejado,
      realizadoAcumuladoCentavos: futura ? null : realizado,
      situacaoTemporal: futura ? 'futura' : parcela.mes === hoje.slice(0, 7) && hoje <= meta.dataLimite ? 'atual' : 'encerrada',
    }
  })
  return { meses, acumulado: resumo.acumulado, percentual: resumo.percentual, situacao: resumo.situacao }
}

// Reduz apenas rótulos/marcadores; todos os meses permanecem nas linhas e na tabela.
export function indicesRotulosMeta(quantidade: number, limite: number): number[] {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 120 || !Number.isInteger(limite) || limite < 2) throw new Error('Quantidade de rótulos inválida.')
  const total = Math.min(quantidade, limite)
  return Array.from({ length: total }, (_, i) => total === 1 ? 0 : Math.round(i * (quantidade - 1) / (total - 1)))
}
