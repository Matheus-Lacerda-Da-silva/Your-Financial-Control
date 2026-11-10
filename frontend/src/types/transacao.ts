export type Transacao = {
  id: number
  descricao: string
  tipo: 'receita' | 'despesa'
  valorCentavos: number
  categoria: string
  data: string
}
