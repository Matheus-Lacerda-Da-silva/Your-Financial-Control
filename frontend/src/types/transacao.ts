export type Transacao = {
  id: number
  descricao: string
  tipo: 'receita' | 'despesa'
  valorCentavos: number
  categoria: string
  data: string
}

// O nome é derivado somente para exibição; o estado armazena o vínculo por ID.
export type TransacaoRegistrada = Omit<Transacao, 'categoria'> & { categoriaId: string }
export type TransacaoExibicao = Transacao & { categoriaId: string }
