import test from 'node:test'
import assert from 'node:assert/strict'
import { converterParaCentavos, centavosParaEntrada, somarCentavos, LIMITE_CENTAVOS } from '../src/utils/dinheiro.ts'
import { formatarMoeda } from '../src/utils/formatadores.ts'
import { calcularResumo, reduzirTransacoes } from '../src/utils/transacoes.ts'

const criar = (id, valorCentavos) => ({ id, descricao: 'Teste', categoria: 'Teste', data: '2026-11-09', tipo: valorCentavos > 0 ? 'receita' : 'despesa', valorCentavos })
const vazio = () => ({ transacoes: [], erro: null })
const cadastrar = (estado, transacao) => reduzirTransacoes(estado, { tipo: 'cadastrar', transacao })
const moeda = valor => formatarMoeda(valor).replaceAll('\u00a0', ' ')

test('entrada decimal exata: centavos, inteiros e espaços externos', () => {
  for (const [entrada, esperado] of [['0.01', 1], ['0.10', 10], ['0.20', 20], ['12.3', 1230], ['12', 1200], [' 001.20 ', 120]]) {
    assert.equal(converterParaCentavos(entrada), esperado)
  }
})

test('rejeita frações de centavo e sintaxes não monetárias sem arredondamento', () => {
  for (const entrada of ['0.005', '1.001', '1.000', '', ' ', '0', '0.00', '-0', '-1', 'NaN', 'Infinity', '1e3', '0x10', '+1', '1,23', '1.2.3', '.1', '1.']) {
    assert.throws(() => converterParaCentavos(entrada), undefined, entrada)
  }
})

test('aceita limite seguro exato e rejeita o próximo centavo e extremos', () => {
  assert.equal(converterParaCentavos('90071992547409.91'), LIMITE_CENTAVOS)
  for (const entrada of ['90071992547409.92', '99999999999999999999999999999999999', '1e308']) {
    assert.throws(() => converterParaCentavos(entrada))
  }
})

test('0.10 + 0.20 totaliza exatamente 30 centavos', () => {
  assert.equal(somarCentavos(converterParaCentavos('0.10'), converterParaCentavos('0.20')), 30)
})

test('saldo zero não possui sinal negativo nem resíduo', () => {
  const resumo = calcularResumo([criar(1, 30), criar(2, -10), criar(3, -20)])
  assert.deepEqual(resumo, { receitas: 30, despesas: 30, saldo: 0 })
  assert.equal(Object.is(resumo.saldo, -0), false)
  assert.equal(moeda(resumo.saldo), 'R$ 0,00')
  assert.equal(moeda(-0), 'R$ 0,00')
})

test('formatação exata de centavos e sinais, inclusive no limite', () => {
  assert.equal(moeda(1), 'R$ 0,01')
  assert.equal(moeda(-1), '-R$ 0,01')
  assert.equal(moeda(LIMITE_CENTAVOS), 'R$ 90.071.992.547.409,91')
  assert.equal(moeda(-LIMITE_CENTAVOS), '-R$ 90.071.992.547.409,91')
})

test('edição recebe magnitude decimal exata, sem perder centavos', () => {
  for (const valor of [1, -1, 10, -12345, LIMITE_CENTAVOS, -LIMITE_CENTAVOS]) {
    assert.equal(converterParaCentavos(centavosParaEntrada(valor)), Math.abs(valor))
  }
})

test('operações monetárias rejeitam números não inteiros, não finitos e inseguros', () => {
  for (const valor of [0.5, NaN, Infinity, -Infinity, LIMITE_CENTAVOS + 1]) {
    assert.throws(() => somarCentavos(valor, 0))
    assert.throws(() => formatarMoeda(valor))
    assert.throws(() => centavosParaEntrada(valor))
    assert.throws(() => calcularResumo([criar(1, valor)]))
  }
  assert.throws(() => somarCentavos(LIMITE_CENTAVOS, 1))
  assert.throws(() => somarCentavos(-LIMITE_CENTAVOS, -1))
})

test('receitas e despesas têm limites independentes mesmo com saldo compensado', () => {
  const valores = [criar(1, LIMITE_CENTAVOS), criar(2, -LIMITE_CENTAVOS)]
  assert.equal(calcularResumo(valores).saldo, 0)
  assert.throws(() => calcularResumo([...valores, criar(3, 1)]))
  assert.throws(() => calcularResumo([...valores, criar(3, -1)]))
})

test('cadastro, edição de valor/tipo e exclusão recalculam totais e preservam ordem e IDs', () => {
  let estado = cadastrar(vazio(), criar(1, 10000))
  estado = cadastrar(estado, criar(2, -2500))
  assert.deepEqual(estado.transacoes.map(t => t.id), [2, 1])
  assert.deepEqual(calcularResumo(estado.transacoes), { receitas: 10000, despesas: 2500, saldo: 7500 })
  estado = reduzirTransacoes(estado, { tipo: 'editar', transacao: criar(2, -3000) })
  assert.equal(calcularResumo(estado.transacoes).saldo, 7000)
  estado = reduzirTransacoes(estado, { tipo: 'editar', transacao: criar(2, 500) })
  assert.deepEqual(calcularResumo(estado.transacoes), { receitas: 10500, despesas: 0, saldo: 10500 })
  assert.deepEqual(estado.transacoes.map(t => t.id), [2, 1])
  estado = reduzirTransacoes(estado, { tipo: 'excluir', id: 1 })
  assert.deepEqual(estado.transacoes, [criar(2, 500)])
  assert.deepEqual(calcularResumo(estado.transacoes), { receitas: 500, despesas: 0, saldo: 500 })
})

test('cadastro que excede total não altera os dados nem referências existentes', () => {
  const estado = cadastrar(vazio(), Object.freeze(criar(1, LIMITE_CENTAVOS)))
  Object.freeze(estado.transacoes)
  const rejeitado = cadastrar(estado, criar(2, 1))
  assert.ok(rejeitado.erro)
  assert.strictEqual(rejeitado.transacoes, estado.transacoes)
  const valido = cadastrar(rejeitado, criar(3, -1))
  assert.equal(valido.erro, null)
  assert.equal(calcularResumo(valido.transacoes).saldo, LIMITE_CENTAVOS - 1)
})

test('edição que excede total mantém integralmente o registro anterior', () => {
  let estado = cadastrar(vazio(), criar(1, LIMITE_CENTAVOS - 1))
  estado = cadastrar(estado, criar(2, 1))
  const rejeitado = reduzirTransacoes(estado, { tipo: 'editar', transacao: criar(2, 2) })
  assert.ok(rejeitado.erro)
  assert.strictEqual(rejeitado.transacoes, estado.transacoes)
  assert.equal(rejeitado.transacoes[0].valorCentavos, 1)
  const corrigido = reduzirTransacoes(rejeitado, { tipo: 'editar', transacao: criar(2, -1) })
  assert.equal(corrigido.erro, null)
  assert.equal(calcularResumo(corrigido.transacoes).saldo, LIMITE_CENTAVOS - 2)
})

test('estado é preservado ao receber valor inválido ou sinal/tipo incompatíveis', () => {
  const estado = cadastrar(vazio(), criar(1, 100))
  for (const transacao of [criar(2, 0), criar(2, 0.005), criar(2, Infinity), { ...criar(2, 10), tipo: 'despesa' }, { ...criar(2, 10), tipo: 'outro' }]) {
    const rejeitado = cadastrar(estado, transacao)
    assert.ok(rejeitado.erro)
    assert.strictEqual(rejeitado.transacoes, estado.transacoes)
  }
})

test('edição com fração de centavo ou valor extremo preserva dados anteriores', () => {
  const estado = cadastrar(vazio(), criar(1, 100))
  for (const valor of [0.005, 0, NaN, Infinity, LIMITE_CENTAVOS + 1]) {
    const rejeitado = reduzirTransacoes(estado, { tipo: 'editar', transacao: criar(1, valor) })
    assert.ok(rejeitado.erro)
    assert.strictEqual(rejeitado.transacoes, estado.transacoes)
    assert.equal(rejeitado.transacoes[0].valorCentavos, 100)
  }
})

test('limite de despesas também é protegido em cadastro e edição', () => {
  let estado = cadastrar(vazio(), criar(1, -LIMITE_CENTAVOS + 1))
  estado = cadastrar(estado, criar(2, -1))
  assert.equal(calcularResumo(estado.transacoes).despesas, LIMITE_CENTAVOS)
  for (const acao of [{ tipo: 'cadastrar', transacao: criar(3, -1) }, { tipo: 'editar', transacao: criar(2, -2) }]) {
    const rejeitado = reduzirTransacoes(estado, acao)
    assert.ok(rejeitado.erro)
    assert.strictEqual(rejeitado.transacoes, estado.transacoes)
  }
  const aposExcluir = reduzirTransacoes(estado, { tipo: 'excluir', id: 2 })
  assert.equal(calcularResumo(aposExcluir.transacoes).despesas, LIMITE_CENTAVOS - 1)
})

test('exclusão inexistente, fechar erro e sair preservam os comportamentos da sessão', () => {
  const estado = cadastrar(vazio(), criar(1, 100))
  assert.deepEqual(reduzirTransacoes(estado, { tipo: 'excluir', id: 2 }).transacoes, estado.transacoes)
  const comErro = { ...estado, erro: 'Teste' }
  assert.strictEqual(reduzirTransacoes(comErro, { tipo: 'limparErro' }).transacoes, estado.transacoes)
  assert.deepEqual(reduzirTransacoes(estado, { tipo: 'limpar' }), vazio())
  assert.deepEqual(calcularResumo([]), { receitas: 0, despesas: 0, saldo: 0 })
})
