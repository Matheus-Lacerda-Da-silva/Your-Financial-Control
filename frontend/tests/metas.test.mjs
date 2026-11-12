import test from 'node:test'
import assert from 'node:assert/strict'
import { listarMeses, validarDataCivil } from '../src/utils/datasMetas.ts'
import { criarIdMeta, distribuirCentavos, resumirMeta } from '../src/utils/metas.ts'
import { aplicarAcaoMetas, criarEstadoMetas, reduzirMetas } from '../src/utils/estadoMetas.ts'
import { LIMITE_CENTAVOS } from '../src/utils/dinheiro.ts'
import { criarEstadoFinanceiro, reduzirEstadoFinanceiro } from '../src/utils/estadoFinanceiro.ts'
import { calcularResumo } from '../src/utils/transacoes.ts'

const hoje = '2027-01-01'
const meta = (extra = {}) => ({ id: 'm', nome: 'Viagem', valorObjetivoCentavos: 1200000, valorInicialCentavos: 0, dataInicio: hoje, dataLimite: '2027-12-31', ...extra })
const criar = (m = meta()) => aplicarAcaoMetas(criarEstadoMetas(), { tipo: 'criar', meta: m, hoje })
const aportar = (estado, extra = {}, referencia = hoje) => aplicarAcaoMetas(estado, { tipo: 'aportar', aporte: { id: 'a', metaId: 'm', valorCentavos: 10000, data: hoje, ...extra }, hoje: referencia })
function recusa(estado, acao) {
  const proximo = reduzirMetas(estado, acao)
  assert.ok(proximo.erro)
  assert.strictEqual(proximo.metas, estado.metas)
  assert.strictEqual(proximo.aportes, estado.aportes)
}

test('datas civis validam calendário, limites e anos bissextos sem fuso', () => {
  for (const data of ['2028-02-29', '2000-02-29', '0001-01-01', '9999-12-31']) validarDataCivil(data)
  for (const data of ['2027-02-29', '1900-02-29', '2027-04-31', '2027-00-01', '2027-13-01', '0000-01-01', '2027-01-00', '2027-1-01', '2027-01-01T00:00:00Z']) assert.throws(() => validarDataCivil(data))
  assert.deepEqual(listarMeses('2027-12-20', '2028-01-05'), ['2027-12', '2028-01'])
  assert.deepEqual(listarMeses(hoje, hoje), ['2027-01'])
  assert.equal(listarMeses(hoje, '2036-12-31').length, 120)
  assert.throws(() => listarMeses(hoje, '2037-01-01'))
  assert.throws(() => listarMeses('2027-01-02', hoje))
})

test('planeja 12 mil em 12 meses e distribui centavos, zeros e limite exato', () => {
  const resumo = resumirMeta(meta(), [], hoje)
  assert.equal(resumo.referencia.length, 12)
  assert.ok(resumo.referencia.every(m => m.valorCentavos === 100000))
  assert.deepEqual(distribuirCentavos(10000, ['a', 'b', 'c']).map(m => m.valorCentavos), [3334, 3333, 3333])
  assert.deepEqual(distribuirCentavos(2, ['a', 'b', 'c']).map(m => m.valorCentavos), [1, 1, 0])
  for (const valor of [0, 1, 2, 10000, LIMITE_CENTAVOS]) {
    for (const n of [1, 3, 12, 120]) {
      const plano = distribuirCentavos(valor, Array.from({ length: n }, (_, i) => String(i)))
      assert.equal(plano.reduce((s, p) => s + BigInt(p.valorCentavos), 0n), BigInt(valor))
      assert.ok(Math.max(...plano.map(p => p.valorCentavos)) - Math.min(...plano.map(p => p.valorCentavos)) <= 1)
    }
  }
  for (const valor of [-1, 0.005, NaN, Infinity, LIMITE_CENTAVOS + 1]) assert.throws(() => distribuirCentavos(valor, ['a']))
  assert.throws(() => distribuirCentavos(1, []))
})

test('criação normaliza nome e recusa valores, datas e IDs inválidos preservando arrays', () => {
  assert.equal(criar(meta({ nome: '  Viagem   férias  ' })).metas[0].nome, 'Viagem férias')
  assert.notEqual(criarIdMeta(), criarIdMeta())
  assert.deepEqual(criarEstadoMetas(), { metas: [], aportes: [], erro: null })
  for (const extra of [{ nome: ' ' }, { id: '' }, { id: ' m' }, { valorObjetivoCentavos: 0 }, { valorObjetivoCentavos: 0.1 }, { valorObjetivoCentavos: Infinity }, { valorObjetivoCentavos: LIMITE_CENTAVOS + 1 }, { valorInicialCentavos: -1 }, { valorInicialCentavos: 1200001 }, { dataLimite: '2026-12-31' }, { dataInicio: '2028-01-01' }, { dataInicio: '2027-02-30' }]) {
    recusa(criarEstadoMetas(), { tipo: 'criar', meta: meta(extra), hoje })
  }
  recusa(criar(), { tipo: 'criar', meta: meta(), hoje })
  assert.equal(criar(meta({ valorObjetivoCentavos: LIMITE_CENTAVOS })).metas.length, 1)
})

test('situações e referência separada do restante atualizado', () => {
  const m = meta()
  assert.equal(resumirMeta(m, [], '2026-12-31').situacao, 'Planejada')
  assert.equal(resumirMeta(m, [], hoje).situacao, 'Em andamento')
  assert.equal(resumirMeta(m, [], '2027-12-31').atualizado.length, 1)
  assert.equal(resumirMeta(m, [], '2028-01-01').situacao, 'Prazo encerrado')
  assert.deepEqual(resumirMeta(m, [], '2028-01-01').atualizado, [])
  const cheio = meta({ valorInicialCentavos: 1200000 })
  assert.equal(resumirMeta(cheio, [], '2026-12-31').situacao, 'Concluída')
  const estado = aportar(criar(), { valorCentavos: 300000 })
  const resumo = resumirMeta(m, estado.aportes, '2027-04-01')
  assert.equal(resumo.percentual, 25)
  assert.equal(resumo.atualizado.length, 9)
  assert.ok(resumo.atualizado.every(p => p.valorCentavos === 100000))
  assert.equal(resumo.referencia.reduce((s, p) => s + p.valorCentavos, 0), 1200000)
  assert.equal(resumo.atualizado.reduce((s, p) => s + p.valorCentavos, 0), 900000)
})

test('aportes recusam excedente, zero, fração, colisão, vínculo e datas inválidas', () => {
  const estado = aportar(criar())
  for (const extra of [{ id: 'a' }, { id: '' }, { metaId: 'outra' }, { valorCentavos: 0 }, { valorCentavos: -1 }, { valorCentavos: 0.005 }, { valorCentavos: Infinity }, { valorCentavos: 1200001 }, { data: '2026-12-31' }, { data: '2027-01-02' }, { data: '2027-02-30' }]) {
    recusa(estado, { tipo: 'aportar', aporte: { id: 'novo', metaId: 'm', data: hoje, valorCentavos: 1, ...extra }, hoje })
  }
  const completo = aportar(criar(), { valorCentavos: 1200000 })
  assert.equal(resumirMeta(completo.metas[0], completo.aportes, hoje).situacao, 'Concluída')
  recusa(completo, { tipo: 'aportar', aporte: { id: 'b', metaId: 'm', data: hoje, valorCentavos: 1 }, hoje })
})

test('aporte retroativo dentro do período é aceito após vencimento, data fora não', () => {
  const estado = aportar(criar(), { data: '2027-12-31' }, '2028-01-10')
  assert.equal(estado.aportes.length, 1)
  recusa(estado, { tipo: 'aportar', aporte: { id: 'b', metaId: 'm', data: '2028-01-01', valorCentavos: 1 }, hoje: '2028-01-10' })
})

test('edição preserva histórico/início/reserva e rejeita objetivo abaixo do acumulado', () => {
  const estado = aportar(criar())
  const editado = aplicarAcaoMetas(estado, { tipo: 'editar', meta: { ...meta(), nome: 'Nova', dataInicio: '2030-01-01', valorInicialCentavos: 999, valorObjetivoCentavos: 10000 }, hoje })
  assert.strictEqual(editado.aportes, estado.aportes)
  assert.equal(editado.metas[0].dataInicio, hoje)
  assert.equal(editado.metas[0].valorInicialCentavos, 0)
  assert.equal(resumirMeta(editado.metas[0], editado.aportes, hoje).situacao, 'Concluída')
  recusa(estado, { tipo: 'editar', meta: { ...meta(), valorObjetivoCentavos: 9999 }, hoje })
  recusa(estado, { tipo: 'editar', meta: { ...meta(), id: 'ausente' }, hoje })
  const posterior = aportar(criar(), { data: '2027-10-01' }, '2027-10-01')
  recusa(posterior, { tipo: 'editar', meta: { ...meta(), dataLimite: '2027-09-01' }, hoje })
})

test('exclusão individual reabre meta e recalcula plano; vínculo incorreto preserva estado', () => {
  const cheio = aportar(criar(), { valorCentavos: 1200000 })
  recusa(cheio, { tipo: 'excluirAporte', id: 'a', metaId: 'outra' })
  recusa(cheio, { tipo: 'excluirAporte', id: 'ausente', metaId: 'm' })
  const antes = cheio.aportes
  const estado = aplicarAcaoMetas(cheio, { tipo: 'excluirAporte', id: 'a', metaId: 'm' })
  assert.equal(antes.length, 1)
  assert.strictEqual(estado.metas, cheio.metas)
  const resumo = resumirMeta(estado.metas[0], estado.aportes, '2027-04-01')
  assert.equal(resumo.restante, 1200000)
  assert.equal(resumo.situacao, 'Em andamento')
  assert.equal(resumo.atualizado.length, 9)
})

test('exclusão de meta remove só seus aportes e saída limpa domínio', () => {
  let estado = aportar(criar())
  estado = aplicarAcaoMetas(estado, { tipo: 'criar', meta: meta({ id: 'outra' }), hoje })
  estado = aportar(estado, { id: 'b', metaId: 'outra' })
  const excluido = aplicarAcaoMetas(estado, { tipo: 'excluir', id: 'm' })
  assert.deepEqual(excluido.metas.map(m => m.id), ['outra'])
  assert.deepEqual(excluido.aportes.map(a => a.id), ['b'])
  recusa(estado, { tipo: 'excluir', id: 'ausente' })
  assert.deepEqual(reduzirMetas(estado, { tipo: 'limpar' }), criarEstadoMetas())
  assert.strictEqual(reduzirMetas({ ...estado, erro: 'erro' }, { tipo: 'limparErro' }).aportes, estado.aportes)
})

test('ações de metas não alteram o estado financeiro nem seu saldo', () => {
  const financeiro = reduzirEstadoFinanceiro(criarEstadoFinanceiro(), { tipo: 'categoria/cadastrar', categoria: { id: 'r', nome: 'Renda', tipo: 'receita' } })
  const comTransacao = reduzirEstadoFinanceiro(financeiro, { tipo: 'transacao', operacao: { tipo: 'cadastrar', transacao: { id: 1, descricao: 'Fictícia', tipo: 'receita', valorCentavos: 50000, categoriaId: 'r', data: hoje } } })
  const snapshot = structuredClone(comTransacao)
  Object.freeze(comTransacao.transacoes)
  Object.freeze(comTransacao.categorias)
  let metas = aportar(criar())
  metas = aplicarAcaoMetas(metas, { tipo: 'excluirAporte', id: 'a', metaId: 'm' })
  metas = aportar(metas)
  metas = aplicarAcaoMetas(metas, { tipo: 'editar', meta: { ...meta(), nome: 'Atualizada' }, hoje })
  metas = aplicarAcaoMetas(metas, { tipo: 'excluir', id: 'm' })
  assert.equal(metas.metas.length, 0)
  assert.deepEqual(comTransacao, snapshot)
  assert.deepEqual(calcularResumo(comTransacao.transacoes), { receitas: 50000, despesas: 0, saldo: 50000 })
})

test('reducer revalida aportes sequenciais e preserva outras metas ao excluir um aporte', () => {
  let estado = aportar(criar(), { valorCentavos: 1200000 })
  estado = aplicarAcaoMetas(estado, { tipo: 'criar', meta: meta({ id: 'outra' }), hoje })
  estado = aportar(estado, { id: 'b', metaId: 'outra', valorCentavos: 5000 })
  Object.freeze(estado.metas)
  Object.freeze(estado.aportes)
  recusa(estado, { tipo: 'aportar', aporte: { id: 'c', metaId: 'm', valorCentavos: 1, data: hoje }, hoje })
  const semAporte = reduzirMetas(estado, { tipo: 'excluirAporte', id: 'a', metaId: 'm' })
  assert.deepEqual(semAporte.aportes.map(a => a.id), ['b'])
  assert.equal(resumirMeta(semAporte.metas[0], semAporte.aportes, '2028-01-01').situacao, 'Prazo encerrado')
})

test('reserva inicial, prorrogação, aumento de objetivo e limites não perdem centavos', () => {
  const comReserva = meta({ valorInicialCentavos: 200000 })
  const resumo = resumirMeta(comReserva, [], hoje)
  assert.equal(resumo.referencia.filter(p => p.valorCentavos === 83334).length, 4)
  assert.equal(resumo.referencia.filter(p => p.valorCentavos === 83333).length, 8)
  const cheio = aportar(criar(), { valorCentavos: 1200000 })
  const reaberto = aplicarAcaoMetas(cheio, { tipo: 'editar', meta: { ...meta(), valorObjetivoCentavos: 1200001, dataLimite: '2028-01-31' }, hoje: '2028-01-01' })
  assert.equal(resumirMeta(reaberto.metas[0], reaberto.aportes, '2028-01-01').situacao, 'Em andamento')
  assert.deepEqual(resumirMeta(reaberto.metas[0], reaberto.aportes, '2028-01-01').atualizado, [{ mes: '2028-01', valorCentavos: 1 }])
  const limite = aportar(criar(meta({ valorObjetivoCentavos: LIMITE_CENTAVOS, valorInicialCentavos: LIMITE_CENTAVOS - 1 })), { valorCentavos: 1 })
  assert.equal(resumirMeta(limite.metas[0], limite.aportes, hoje).acumulado, LIMITE_CENTAVOS)
})
