import test from 'node:test'
import assert from 'node:assert/strict'
import { agregarEvolucaoFinanceira as agregar } from '../src/utils/evolucaoFinanceira.ts'
import { aplicarOperacao } from '../src/utils/transacoes.ts'
import { formatarMoeda } from '../src/utils/formatadores.ts'

const criar = (data, valorCentavos = 1, id = 1) => ({ id, data, valorCentavos, tipo: valorCentavos > 0 ? 'receita' : 'despesa', descricao: 'Fictícia', categoria: 'Teste' })
const hoje = '2026-11-13'

test('seis meses civis cronológicos, zeros e virada dezembro/janeiro', () => {
  const resultado = agregar([], '2027-01-31')
  assert.deepEqual(resultado.meses.map(m => m.competencia), ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01'])
  assert.ok(resultado.meses.every(m => m.receitasCentavos === 0 && m.despesasCentavos === 0))
  assert.equal(resultado.quantidadeMovimentacoes, 0)
  assert.equal(agregar([], '2026-12-01').meses.at(-1).competencia, '2026-12')
  assert.equal(agregar([], '2027-02-01').meses[0].competencia, '2026-09')
})

test('data financeira independe da ordem; extremos inclusivos e futuro no mês atual', () => {
  const entrada = [criar('2026-11-30', -50), criar('2026-06-01', 10), criar('2026-05-31', 999), criar('2026-12-01', 999), criar('2026-11-01', 20)]
  const resultado = agregar(entrada, hoje)
  assert.deepEqual(resultado, agregar([...entrada].reverse(), hoje))
  assert.equal(resultado.quantidadeMovimentacoes, 3)
  assert.deepEqual(resultado.meses[0], { competencia: '2026-06', receitasCentavos: 10, despesasCentavos: 0 })
  assert.deepEqual(resultado.meses[5], { competencia: '2026-11', receitasCentavos: 20, despesasCentavos: 50 })
})

test('datas inválidas são contadas explicitamente; calendário bissexto e ausência de conversão UTC', () => {
  const resultado = agregar(['2024-02-29', '2024-02-30', '2023-02-29', '2024-13-01', '2024-02-00', '2024-2-01', '', '2024-02-29T00:00:00Z', '0000-01-01'].map(d => criar(d)), '2024-03-01')
  assert.equal(resultado.quantidadeDatasInvalidas, 8)
  assert.equal(resultado.quantidadeMovimentacoes, 1)
  assert.equal(resultado.meses[4].receitasCentavos, 1)
  assert.equal(resultado.meses[5].receitasCentavos, 0)
  for (const referencia of ['2026-02-30', 'inválida', '0001-01-01']) assert.throws(() => agregar([], referencia))
  assert.equal(agregar([], '0001-06-01').meses[0].competencia, '0001-01')
  assert.equal(agregar([], '9999-12-31').meses[5].competencia, '9999-12')
})

test('soma exata e séries independentes, mesmo com saldo compensado', () => {
  const resultado = agregar([criar(hoje, 10), criar(hoje, 20), criar(hoje, -30)], hoje)
  assert.equal(resultado.meses[5].receitasCentavos, 30)
  assert.equal(resultado.meses[5].despesasCentavos, 30)
  assert.equal(resultado.quantidadeMovimentacoes, 3)
  assert.match(formatarMoeda(resultado.meses[5].receitasCentavos), /0,30/)
})

test('limite seguro exato, overflow de ambas as séries e valores inválidos não retornam parciais', () => {
  const limite = Number.MAX_SAFE_INTEGER
  for (const sinal of [1, -1]) {
    const resultado = agregar([criar(hoje, sinal * limite)], hoje)
    assert.equal(resultado.meses[5][sinal > 0 ? 'receitasCentavos' : 'despesasCentavos'], limite)
    assert.throws(() => agregar([criar(hoje, sinal * limite), criar(hoje, sinal)], hoje))
  }
  for (const valor of [0, 0.5, NaN, Infinity, -Infinity, limite + 1]) {
    assert.throws(() => agregar([criar(hoje, 10), criar(hoje, valor)], hoje))
    assert.throws(() => agregar([criar('2025-01-01', valor)], hoje))
  }
  assert.throws(() => agregar([{ ...criar(hoje, -10), tipo: 'receita' }], hoje))
  assert.throws(() => agregar([{ ...criar(hoje), tipo: 'outro' }], hoje))
})

test('arrays e objetos congelados são preservados, inclusive em falha', () => {
  const entrada = Object.freeze([Object.freeze(criar('2026-10-01', 20)), Object.freeze(criar(hoje, -10))])
  const copia = structuredClone(entrada)
  agregar(entrada, hoje)
  assert.deepEqual(entrada, copia)
  assert.throws(() => agregar(entrada, 'inválida'))
  assert.deepEqual(entrada, copia)
})

test('reagrega cadastro, edição de mês/tipo/valor, exclusão e mudança do mês', () => {
  let transacoes = aplicarOperacao([], { tipo: 'cadastrar', transacao: criar(hoje, 20) })
  assert.equal(agregar(transacoes, hoje).meses[5].receitasCentavos, 20)
  transacoes = aplicarOperacao(transacoes, { tipo: 'editar', transacao: criar('2026-10-10', -30) })
  assert.equal(agregar(transacoes, hoje).meses[5].receitasCentavos, 0)
  assert.equal(agregar(transacoes, hoje).meses[4].despesasCentavos, 30)
  assert.equal(agregar(transacoes, '2026-12-01').meses[3].despesasCentavos, 30)
  transacoes = aplicarOperacao(transacoes, { tipo: 'excluir', id: 1 })
  assert.equal(agregar(transacoes, hoje).quantidadeMovimentacoes, 0)
})
