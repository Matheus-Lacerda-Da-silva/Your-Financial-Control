import type { Transacao } from '../types/transacao.ts'
import { validarDataCivil } from './datasMetas.ts'
import { somarCentavos, validarCentavos } from './dinheiro.ts'

export type EvolucaoMensal = {
  readonly competencia: string
  readonly receitasCentavos: number
  readonly despesasCentavos: number
}

export type ResultadoEvolucao = {
  readonly meses: readonly EvolucaoMensal[]
  readonly quantidadeMovimentacoes: number
  readonly quantidadeDatasInvalidas: number
}

type Movimento = Readonly<Pick<Transacao, 'data' | 'tipo' | 'valorCentavos'>>

// Não interpreta datas civis como instantes UTC e não altera a entrada.
export function agregarEvolucaoFinanceira(transacoes: readonly Movimento[], hoje: string): ResultadoEvolucao {
  validarDataCivil(hoje)
  const atual = Number(hoje.slice(0, 4)) * 12 + Number(hoje.slice(5, 7)) - 1
  if (atual - 5 < 12) throw new Error('A referência não permite seis meses no calendário suportado.')
  const meses = Array.from({ length: 6 }, (_, i) => {
    const indice = atual - 5 + i
    return {
      competencia: `${String(Math.floor(indice / 12)).padStart(4, '0')}-${String(indice % 12 + 1).padStart(2, '0')}`,
      receitasCentavos: 0,
      despesasCentavos: 0,
    }
  })
  let quantidadeMovimentacoes = 0
  let quantidadeDatasInvalidas = 0
  for (const transacao of transacoes) {
    // Erros monetários nunca produzem um resultado parcial, mesmo fora do período.
    validarCentavos(transacao.valorCentavos)
    if (transacao.valorCentavos === 0 ||
      (transacao.tipo !== 'receita' && transacao.tipo !== 'despesa') ||
      (transacao.tipo === 'receita') !== (transacao.valorCentavos > 0)) {
      throw new Error('Tipo e valor da transação são incompatíveis.')
    }
    try { validarDataCivil(transacao.data) } catch {
      quantidadeDatasInvalidas++
      continue
    }
    const mes = meses.find(item => item.competencia === transacao.data.slice(0, 7))
    if (!mes) continue
    if (transacao.tipo === 'receita') {
      mes.receitasCentavos = somarCentavos(mes.receitasCentavos, transacao.valorCentavos)
    } else {
      mes.despesasCentavos = somarCentavos(mes.despesasCentavos, -transacao.valorCentavos)
    }
    quantidadeMovimentacoes++
  }
  return { meses, quantidadeMovimentacoes, quantidadeDatasInvalidas }
}
