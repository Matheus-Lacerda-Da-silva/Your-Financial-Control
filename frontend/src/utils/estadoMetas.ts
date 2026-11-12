import type { Aporte, EdicaoMeta, EstadoMetas, Meta } from '../types/meta.ts'
import { validarDataCivil } from './datasMetas.ts'
import { validarCentavos } from './dinheiro.ts'
import { resumirMeta, validarIdMeta, validarMeta } from './metas.ts'

export type AcaoMetas =
  | { tipo: 'criar'; meta: Meta; hoje: string }
  | { tipo: 'editar'; meta: EdicaoMeta; hoje: string }
  | { tipo: 'excluir'; id: string }
  | { tipo: 'aportar'; aporte: Aporte; hoje: string }
  | { tipo: 'excluirAporte'; id: string; metaId: string }
  | { tipo: 'limpar' }
  | { tipo: 'limparErro' }

export function criarEstadoMetas(): EstadoMetas { return { metas: [], aportes: [], erro: null } }

export function aplicarAcaoMetas(estado: EstadoMetas, acao: AcaoMetas): EstadoMetas {
  if (acao.tipo === 'limpar') return criarEstadoMetas()
  if (acao.tipo === 'limparErro') return { ...estado, erro: null }
  if (acao.tipo === 'criar') {
    if (estado.metas.some(m => m.id === acao.meta.id)) throw new Error('Identificador de meta já utilizado.')
    const meta = validarMeta(acao.meta, acao.hoje)
    return { ...estado, metas: [...estado.metas, meta], erro: null }
  }
  if (acao.tipo === 'excluirAporte') {
    if (!estado.metas.some(m => m.id === acao.metaId) || !estado.aportes.some(a => a.id === acao.id && a.metaId === acao.metaId)) throw new Error('Aporte não encontrado nesta meta.')
    return { ...estado, aportes: estado.aportes.filter(a => a.id !== acao.id), erro: null }
  }
  const id = acao.tipo === 'editar' ? acao.meta.id : acao.tipo === 'aportar' ? acao.aporte.metaId : acao.id
  const anterior = estado.metas.find(m => m.id === id)
  if (!anterior) throw new Error('Meta não encontrada.')
  if (acao.tipo === 'excluir') return { metas: estado.metas.filter(m => m.id !== id), aportes: estado.aportes.filter(a => a.metaId !== id), erro: null }
  if (acao.tipo === 'editar') {
    // Lista explícita impede alterar início/reserva mesmo com campos extras em execução.
    const meta = validarMeta({ ...anterior, nome: acao.meta.nome, valorObjetivoCentavos: acao.meta.valorObjetivoCentavos, dataLimite: acao.meta.dataLimite }, acao.hoje)
    resumirMeta(meta, estado.aportes, acao.hoje)
    if (estado.aportes.some(a => a.metaId === id && a.data > meta.dataLimite)) throw new Error('O prazo não pode anteceder um aporte registrado.')
    return { ...estado, metas: estado.metas.map(m => m.id === id ? meta : m), erro: null }
  }
  const aporte = acao.aporte
  validarIdMeta(aporte.id)
  validarDataCivil(acao.hoje)
  validarDataCivil(aporte.data)
  validarCentavos(aporte.valorCentavos)
  if (estado.aportes.some(a => a.id === aporte.id)) throw new Error('Identificador de aporte já utilizado.')
  if (aporte.data < anterior.dataInicio || aporte.data > anterior.dataLimite || aporte.data > acao.hoje) throw new Error('O aporte deve ter data dentro do período da meta e não pode ser futuro.')
  if (aporte.valorCentavos <= 0 || aporte.valorCentavos > resumirMeta(anterior, estado.aportes, acao.hoje).restante) throw new Error('Informe um aporte positivo de até o valor restante da meta.')
  return { ...estado, aportes: [...estado.aportes, aporte], erro: null }
}

export function reduzirMetas(estado: EstadoMetas, acao: AcaoMetas): EstadoMetas {
  try { return aplicarAcaoMetas(estado, acao) }
  catch (erro) { return { ...estado, erro: erro instanceof Error ? erro.message : 'Operação inválida.' } }
}
