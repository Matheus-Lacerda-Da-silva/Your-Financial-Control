import type { Transacao } from '../types/transacao.ts'
import { somarCentavos, validarCentavos } from './dinheiro.ts'

type TransacaoFinanceira = Pick<Transacao, 'id' | 'tipo' | 'valorCentavos'>

export function calcularResumo(transacoes: readonly TransacaoFinanceira[]) {
  let receitas = 0
  let despesas = 0
  for (const transacao of transacoes) {
    validarCentavos(transacao.valorCentavos)
    if (transacao.valorCentavos === 0 ||
      (transacao.tipo !== 'receita' && transacao.tipo !== 'despesa') ||
      (transacao.tipo === 'receita') !== (transacao.valorCentavos > 0)) {
      throw new Error('Tipo e valor da transação são incompatíveis.')
    }
    if (transacao.valorCentavos > 0) {
      receitas = somarCentavos(receitas, transacao.valorCentavos)
    } else {
      despesas = somarCentavos(despesas, -transacao.valorCentavos)
    }
  }
  return { receitas, despesas, saldo: somarCentavos(receitas, -despesas) }
}

export type OperacaoTransacao<T = Transacao> =
  | { tipo: 'cadastrar'; transacao: T }
  | { tipo: 'editar'; transacao: T }
  | { tipo: 'excluir'; id: number }

export function aplicarOperacao<T extends TransacaoFinanceira>(transacoes: readonly T[], operacao: OperacaoTransacao<T>) {
  let proximas: T[]
  if (operacao.tipo === 'cadastrar') {
    proximas = [operacao.transacao, ...transacoes]
  } else if (operacao.tipo === 'editar') {
    proximas = transacoes.map(t => t.id === operacao.transacao.id ? operacao.transacao : t)
  } else {
    proximas = transacoes.filter(t => t.id !== operacao.id)
  }
  calcularResumo(proximas)
  return proximas
}

export type EstadoTransacoes = { transacoes: Transacao[]; erro: string | null }
export type AcaoTransacoes = OperacaoTransacao | { tipo: 'limpar' } | { tipo: 'limparErro' }

// A validação ocorre sobre o estado mais recente, antes de substituir qualquer dado.
export function reduzirTransacoes(estado: EstadoTransacoes, acao: AcaoTransacoes): EstadoTransacoes {
  if (acao.tipo === 'limpar') return { transacoes: [], erro: null }
  if (acao.tipo === 'limparErro') return { ...estado, erro: null }
  try {
    return { transacoes: aplicarOperacao(estado.transacoes, acao), erro: null }
  } catch (erro) {
    return { transacoes: estado.transacoes, erro: erro instanceof Error ? erro.message : 'Valor inválido.' }
  }
}
