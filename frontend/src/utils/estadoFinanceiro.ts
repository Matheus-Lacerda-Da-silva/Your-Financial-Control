import type { Categoria } from '../types/categoria.ts'
import type { TransacaoExibicao, TransacaoRegistrada } from '../types/transacao.ts'
import { contarVinculosCategoria, validarCategoria, validarVinculoCategoria } from './categorias.ts'
import { aplicarOperacao } from './transacoes.ts'
import type { OperacaoTransacao } from './transacoes.ts'

export type EstadoFinanceiro = {
  categorias: Categoria[]
  transacoes: TransacaoRegistrada[]
  erro: string | null
}

export type AcaoFinanceira =
  | { tipo: 'categorias/carregar'; categorias: Categoria[] }
  | { tipo: 'categoria/confirmar'; categoria: Categoria }
  | { tipo: 'categoria/confirmarExclusao'; id: string }
  | { tipo: 'categoria/editar'; categoria: Categoria }
  | { tipo: 'categoria/excluir'; id: string }
  | { tipo: 'transacao'; operacao: OperacaoTransacao<TransacaoRegistrada> }
  | { tipo: 'limpar' }
  | { tipo: 'limparErro' }

export function criarEstadoFinanceiro(): EstadoFinanceiro {
  return { categorias: [], transacoes: [], erro: null }
}

export function validarAlteracaoCategoria(estado: EstadoFinanceiro, id: string, tipo?: Categoria['tipo'] | null) {
  const anterior = estado.categorias.find(c => c.id === id)
  if (!anterior) throw new Error('Categoria não encontrada.')
  const vinculadas = contarVinculosCategoria(id, estado.transacoes)
  if (vinculadas && tipo === null) {
    throw new Error(`Esta categoria possui ${vinculadas} transação(ões). Reclassifique os lançamentos antes de excluir.`)
  }
  if (vinculadas && tipo !== undefined && tipo !== anterior.tipo) {
    throw new Error('Não é possível alterar o tipo de uma categoria com transações vinculadas.')
  }
}

// Operação pura compartilhada pela pré-validação da interface e pelo reducer.
export function aplicarAcaoFinanceira(estado: EstadoFinanceiro, acao: AcaoFinanceira): EstadoFinanceiro {
  if (acao.tipo === 'limpar') return criarEstadoFinanceiro()
  if (acao.tipo === 'limparErro') return { ...estado, erro: null }
  if (acao.tipo === 'categorias/carregar') return { ...estado, categorias: acao.categorias }
  if (acao.tipo === 'categoria/confirmarExclusao') {
    return { ...estado, categorias: estado.categorias.filter(c => c.id !== acao.id) }
  }
  if (acao.tipo === 'categoria/confirmar') {
    const categoria = acao.categoria
    const categorias = estado.categorias.some(c => c.id === categoria.id)
      ? estado.categorias.map(c => c.id === categoria.id ? categoria : c)
      : [...estado.categorias, categoria]
    return { ...estado, categorias }
  }
  if (acao.tipo === 'transacao') {
    if (acao.operacao.tipo !== 'excluir') validarVinculoCategoria(acao.operacao.transacao, estado.categorias)
    const transacoes = aplicarOperacao(estado.transacoes, acao.operacao)
    return { ...estado, transacoes, erro: null }
  }
  const id = acao.tipo === 'categoria/editar' ? acao.categoria.id : acao.id
  validarAlteracaoCategoria(estado, id, acao.tipo === 'categoria/editar' ? acao.categoria.tipo : null)
  if (acao.tipo === 'categoria/excluir') {
    return { ...estado, categorias: estado.categorias.filter(c => c.id !== id), erro: null }
  }
  const categoria = validarCategoria(acao.categoria, estado.categorias)
  return { ...estado, categorias: estado.categorias.map(c => c.id === id ? categoria : c), erro: null }
}

export function reduzirEstadoFinanceiro(estado: EstadoFinanceiro, acao: AcaoFinanceira): EstadoFinanceiro {
  try {
    return aplicarAcaoFinanceira(estado, acao)
  } catch (erro) {
    return { ...estado, erro: erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.' }
  }
}

export function selecionarTransacoes(estado: EstadoFinanceiro): TransacaoExibicao[] {
  const categorias = new Map(estado.categorias.map(c => [c.id, c]))
  return estado.transacoes.map(t => {
    const categoria = categorias.get(t.categoriaId)
    return { ...t, categoria: categoria?.tipo === t.tipo ? categoria.nome : 'Categoria indisponível' }
  })
}
