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
  | { tipo: 'categoria/cadastrar'; categoria: Categoria }
  | { tipo: 'categoria/editar'; categoria: Categoria }
  | { tipo: 'categoria/excluir'; id: string }
  | { tipo: 'transacao'; operacao: OperacaoTransacao<TransacaoRegistrada> }
  | { tipo: 'limpar' }
  | { tipo: 'limparErro' }

export function criarEstadoFinanceiro(): EstadoFinanceiro {
  return { categorias: [], transacoes: [], erro: null }
}

// Operação pura compartilhada pela pré-validação da interface e pelo reducer.
export function aplicarAcaoFinanceira(estado: EstadoFinanceiro, acao: AcaoFinanceira): EstadoFinanceiro {
  if (acao.tipo === 'limpar') return criarEstadoFinanceiro()
  if (acao.tipo === 'limparErro') return { ...estado, erro: null }
  if (acao.tipo === 'transacao') {
    if (acao.operacao.tipo !== 'excluir') validarVinculoCategoria(acao.operacao.transacao, estado.categorias)
    const transacoes = aplicarOperacao(estado.transacoes, acao.operacao)
    return { ...estado, transacoes, erro: null }
  }
  if (acao.tipo === 'categoria/cadastrar') {
    if (estado.categorias.some(c => c.id === acao.categoria.id)) throw new Error('O identificador da categoria já está em uso. Tente novamente.')
    const categoria = validarCategoria(acao.categoria, estado.categorias)
    return { ...estado, categorias: [...estado.categorias, categoria], erro: null }
  }
  const id = acao.tipo === 'categoria/editar' ? acao.categoria.id : acao.id
  const anterior = estado.categorias.find(c => c.id === id)
  if (!anterior) throw new Error('Categoria não encontrada.')
  const vinculadas = contarVinculosCategoria(id, estado.transacoes)
  if (acao.tipo === 'categoria/excluir') {
    if (vinculadas) throw new Error(`Esta categoria possui ${vinculadas} transação(ões). Reclassifique os lançamentos antes de excluir.`)
    return { ...estado, categorias: estado.categorias.filter(c => c.id !== id), erro: null }
  }
  if (vinculadas && acao.categoria.tipo !== anterior.tipo) {
    throw new Error('Não é possível alterar o tipo de uma categoria com transações vinculadas.')
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
    if (!categoria || categoria.tipo !== t.tipo) throw new Error('Vínculo de categoria inválido no estado financeiro.')
    return { ...t, categoria: categoria.nome }
  })
}
