import type { Categoria } from '../types/categoria.ts'
import type { TransacaoRegistrada } from '../types/transacao.ts'

export function normalizarNomeCategoria(nome: string): string {
  return nome.normalize('NFC').trim().replace(/\s+/gu, ' ')
}

export function chaveNomeCategoria(nome: string): string {
  return normalizarNomeCategoria(nome).toLocaleLowerCase('pt-BR')
}

export function validarCategoria(categoria: Categoria, categorias: readonly Categoria[]): Categoria {
  const nome = normalizarNomeCategoria(categoria.nome)
  if (!categoria.id.trim()) throw new Error('Identificador de categoria inválido.')
  if (!nome) throw new Error('Informe o nome da categoria.')
  if (categoria.tipo !== 'receita' && categoria.tipo !== 'despesa') {
    throw new Error('Selecione Receita ou Despesa para a categoria.')
  }
  if (categorias.some(c => c.id !== categoria.id && c.tipo === categoria.tipo && chaveNomeCategoria(c.nome) === chaveNomeCategoria(nome))) {
    throw new Error('Já existe uma categoria com esse nome e tipo.')
  }
  return { ...categoria, nome }
}

export function validarVinculoCategoria(transacao: TransacaoRegistrada, categorias: readonly Categoria[]) {
  const categoria = categorias.find(c => c.id === transacao.categoriaId)
  if (!categoria) throw new Error('Selecione uma categoria cadastrada.')
  if (categoria.tipo !== transacao.tipo) throw new Error('A categoria deve ter o mesmo tipo da transação.')
}

export function contarVinculosCategoria(id: string, transacoes: readonly TransacaoRegistrada[]): number {
  return transacoes.filter(t => t.categoriaId === id).length
}

// Gerado no evento de cadastro, nunca durante a redução ou renderização.
export function criarIdCategoria(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  if (!globalThis.crypto?.getRandomValues) throw new Error('Não foi possível gerar o identificador da categoria neste navegador.')
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')
}
