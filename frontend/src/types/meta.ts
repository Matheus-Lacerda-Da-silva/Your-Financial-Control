export type Meta = {
  id: string
  nome: string
  valorObjetivoCentavos: number
  valorInicialCentavos: number
  dataInicio: string
  dataLimite: string
}

export type Aporte = { id: string; metaId: string; valorCentavos: number; data: string }
export type EstadoMetas = { metas: Meta[]; aportes: Aporte[]; erro: string | null }
export type EdicaoMeta = Pick<Meta, 'id' | 'nome' | 'valorObjetivoCentavos' | 'dataLimite'>
export type SituacaoMeta = 'Planejada' | 'Em andamento' | 'Concluída' | 'Prazo encerrado'
