export type Transacao = {
  id: number
  descricao: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  data: string
}
