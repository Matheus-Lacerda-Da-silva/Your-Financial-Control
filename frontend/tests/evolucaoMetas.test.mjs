import test from 'node:test'
import assert from 'node:assert/strict'
import { agregarEvolucaoMeta as agregar, indicesRotulosMeta } from '../src/utils/evolucaoMetas.ts'
import { resumirMeta } from '../src/utils/metas.ts'
import { aplicarAcaoMetas, criarEstadoMetas } from '../src/utils/estadoMetas.ts'

const meta = (extra = {}) => ({ id: 'm', nome: 'Viagem', valorObjetivoCentavos: 10000, valorInicialCentavos: 0, dataInicio: '2027-01-01', dataLimite: '2027-03-31', ...extra })
const aporte = (extra = {}) => ({ id: 'a', metaId: 'm', valorCentavos: 1000, data: '2027-01-10', ...extra })

test('planejado usa referência e reserva uma única vez, com centavos exatos', () => {
  assert.deepEqual(agregar(meta(), [], '2027-03-31').meses.map(m => m.planejadoAcumuladoCentavos), [3334, 6667, 10000])
  assert.deepEqual(agregar(meta({ valorInicialCentavos: 1000 }), [], '2027-03-31').meses.map(m => m.planejadoAcumuladoCentavos), [4000, 7000, 10000])
  assert.deepEqual(agregar(meta({ valorObjetivoCentavos: 2 }), [], '2027-03-31').meses.map(m => m.planejadoAcumuladoCentavos), [1, 2, 2])
  const m = meta({ valorInicialCentavos: 1000 })
  const resultado = agregar(m, [aporte()], '2027-02-01')
  assert.equal(resultado.acumulado, 2000)
  assert.deepEqual(resultado.meses.map(m => m.realizadoAcumuladoCentavos), [2000, 2000, null])
  assert.equal(resultado.percentual, resumirMeta(m, [aporte()], '2027-02-01').percentual)
})

test('agrupa aportes pela data sem ordenar entrada; mantém meses sem aportes e isola outras metas', () => {
  const aportes = [aporte({ id: 'b', data: '2027-02-02', valorCentavos: 20 }), aporte({ valorCentavos: 10 }), aporte({ id: 'c', valorCentavos: 20 }), aporte({ metaId: 'outra', data: 'inválida', valorCentavos: NaN })]
  const resultado = agregar(meta(), aportes, '2027-03-15')
  assert.deepEqual(resultado.meses.map(m => m.realizadoAcumuladoCentavos), [30, 50, 50])
  assert.deepEqual(resultado, agregar(meta(), [...aportes].reverse(), '2027-03-15'))
})

test('futuro é null, início futuro no mês atual e competência atual parcial', () => {
  const m = meta({ dataInicio: '2027-01-20', valorInicialCentavos: 1000 })
  assert.ok(agregar(m, [], '2027-01-10').meses.every(m => m.realizadoAcumuladoCentavos === null && m.situacaoTemporal === 'futura'))
  const resultado = agregar(m, [], '2027-01-20')
  assert.equal(resultado.situacao, 'Em andamento')
  assert.equal(resultado.meses[0].situacaoTemporal, 'atual')
  assert.equal(resultado.meses[0].realizadoAcumuladoCentavos, 1000)
  assert.equal(agregar(m, [], '2026-12-31').situacao, 'Planejada')
})

test('conclusão antecipada, reserva integral e prazo encerrado sem adicionar meses', () => {
  const r = agregar(meta(), [aporte({ valorCentavos: 10000 })], '2027-02-01')
  assert.equal(r.situacao, 'Concluída')
  assert.deepEqual(r.meses.map(m => m.realizadoAcumuladoCentavos), [10000, 10000, null])
  assert.ok(agregar(meta({ valorInicialCentavos: 10000 }), [], '2027-03-31').meses.every(m => m.realizadoAcumuladoCentavos === 10000))
  const vencida = agregar(meta(), [], '2028-01-01')
  assert.equal(vencida.situacao, 'Prazo encerrado')
  assert.equal(vencida.meses.length, 3)
  assert.ok(vencida.meses.every(m => m.situacaoTemporal === 'encerrada'))
})

test('calendário civil, dezembro/janeiro, mês único, limites de 120 meses e bissexto', () => {
  const m = meta({ dataInicio: '2027-12-31', dataLimite: '2028-02-29' })
  assert.deepEqual(agregar(m, [], '2028-02-29').meses.map(m => m.competencia), ['2027-12', '2028-01', '2028-02'])
  assert.equal(agregar(meta({ dataLimite: '2027-01-01' }), [], '2027-01-01').meses[0].planejadoAcumuladoCentavos, 10000)
  assert.equal(agregar(meta({ dataLimite: '2036-12-31' }), [], '2027-01-01').meses.length, 120)
  for (const extra of [{ dataLimite: '2037-01-01' }, { dataLimite: '2027-02-29' }, { dataInicio: '2028-01-01' }, { dataInicio: '2027-01-01T00:00:00Z' }]) assert.throws(() => agregar(meta(extra), [], '2027-01-01'))
})

test('rejeita dados monetários, datas e IDs inconsistentes sem resultados parciais', () => {
  for (const valor of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => agregar(meta(), [aporte({ valorCentavos: valor })], '2027-02-01'))
    assert.throws(() => agregar(meta({ valorObjetivoCentavos: valor }), [], '2027-02-01'))
  }
  for (const data of ['2027-01-00', '2026-12-31', '2027-04-01', '2027-02-02']) assert.throws(() => agregar(meta(), [aporte({ data })], '2027-02-01'))
  assert.throws(() => agregar(meta(), [aporte(), aporte()], '2027-02-01'))
  assert.throws(() => agregar(meta(), [aporte({ id: '' })], '2027-02-01'))
  assert.throws(() => agregar(meta(), [aporte({ valorCentavos: 10001 })], '2027-02-01'))
  assert.throws(() => agregar(meta({ valorInicialCentavos: -1 }), [], '2027-02-01'))
  assert.throws(() => agregar(meta(), [], 'inválida'))
  const limite = Number.MAX_SAFE_INTEGER
  assert.equal(agregar(meta({ valorObjetivoCentavos: limite }), [aporte({ valorCentavos: limite })], '2027-03-31').acumulado, limite)
  assert.throws(() => agregar(meta({ valorObjetivoCentavos: limite, valorInicialCentavos: 1 }), [aporte({ valorCentavos: limite })], '2027-03-31'))
})

test('exclusão de aporte e edição do objetivo/prazo recalculam a referência atual', () => {
  let estado = aplicarAcaoMetas(criarEstadoMetas(), { tipo: 'criar', meta: meta(), hoje: '2027-01-01' })
  estado = aplicarAcaoMetas(estado, { tipo: 'aportar', aporte: aporte(), hoje: '2027-01-10' })
  estado = aplicarAcaoMetas(estado, { tipo: 'editar', meta: { id: 'm', nome: 'Nova', valorObjetivoCentavos: 20000, dataLimite: '2027-04-30' }, hoje: '2027-01-10' })
  let r = agregar(estado.metas[0], estado.aportes, '2027-02-01')
  assert.equal(r.meses[0].planejadoAcumuladoCentavos, 5000)
  assert.equal(r.meses.length, 4)
  estado = aplicarAcaoMetas(estado, { tipo: 'excluirAporte', id: 'a', metaId: 'm' })
  r = agregar(estado.metas[0], estado.aportes, '2027-02-01')
  assert.equal(r.acumulado, 0)
  assert.equal(r.meses[0].realizadoAcumuladoCentavos, 0)
})

test('não modifica arrays/objetos congelados e reduz só os rótulos', () => {
  const m = Object.freeze(meta())
  const aportes = Object.freeze([Object.freeze(aporte())])
  const copia = structuredClone({ m, aportes })
  agregar(m, aportes, '2027-02-01')
  assert.deepEqual({ m, aportes }, copia)
  for (const quantidade of [1, 2, 6, 12, 120]) {
    for (const limite of [4, 8]) {
      const indices = indicesRotulosMeta(quantidade, limite)
      assert.equal(indices[0], 0)
      assert.equal(indices.at(-1), quantidade - 1)
      assert.equal(new Set(indices).size, indices.length)
      assert.ok(indices.length <= limite)
    }
  }
})
