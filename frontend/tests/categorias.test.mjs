import test from 'node:test'
import assert from 'node:assert/strict'
import { contarVinculosCategoria, criarIdCategoria, normalizarNomeCategoria } from '../src/utils/categorias.ts'
import { aplicarAcaoFinanceira, criarEstadoFinanceiro, reduzirEstadoFinanceiro, selecionarTransacoes } from '../src/utils/estadoFinanceiro.ts'
import { calcularResumo } from '../src/utils/transacoes.ts'
import { LIMITE_CENTAVOS } from '../src/utils/dinheiro.ts'

const categoria = (id = 'r', nome = 'Salário', tipo = 'receita') => ({ id, nome, tipo })
const transacao = (id = 1, categoriaId = 'r', tipo = 'receita', valorCentavos = 100) => ({ id, categoriaId, tipo, valorCentavos, descricao: 'Teste', data: '2026-11-11' })
const cadastrar = (estado, c = categoria()) => aplicarAcaoFinanceira(estado, { tipo: 'categoria/cadastrar', categoria: c })
const lancar = (estado, t = transacao()) => aplicarAcaoFinanceira(estado, { tipo: 'transacao', operacao: { tipo: 'cadastrar', transacao: t } })
function recusada(estado, acao) {
  const proximo = reduzirEstadoFinanceiro(estado, acao)
  assert.ok(proximo.erro)
  assert.strictEqual(proximo.categorias, estado.categorias)
  assert.strictEqual(proximo.transacoes, estado.transacoes)
  return proximo
}

test('normaliza espaços e Unicode, gera IDs distintos e inicia sem categorias padrão', () => {
  assert.equal(normalizarNomeCategoria('  Salário \n extra  '), 'Salário extra')
  assert.equal(normalizarNomeCategoria('Cafe\u0301'), 'Café')
  assert.notEqual(criarIdCategoria(), criarIdCategoria())
  assert.deepEqual(criarEstadoFinanceiro(), { categorias: [], transacoes: [], erro: null })
})

test('cadastro valida nome, tipo, ID e duplicidade por nome normalizado e tipo', () => {
  let estado = cadastrar(criarEstadoFinanceiro(), categoria('r', '  Salário   extra '))
  assert.equal(estado.categorias[0].nome, 'Salário extra')
  for (const c of [categoria('a', ' '), categoria('a', 'SALÁRIO extra'), categoria('r', 'Outro'), categoria('', 'Outro'), categoria('a', 'Outro', 'inválido')]) {
    recusada(estado, { tipo: 'categoria/cadastrar', categoria: c })
  }
  estado = cadastrar(estado, categoria('d', 'Salário extra', 'despesa'))
  assert.equal(estado.categorias.length, 2)
  estado = cadastrar(estado, categoria('a', 'Avó'))
  estado = cadastrar(estado, categoria('b', 'Avô'))
  estado = cadastrar(estado, categoria('c', 'Café'))
  recusada(estado, { tipo: 'categoria/cadastrar', categoria: categoria('e', 'Cafe\u0301') })
})

test('edição preserva ID, aceita o próprio nome e valida duplicidade no tipo de destino', () => {
  let estado = cadastrar(cadastrar(criarEstadoFinanceiro()), categoria('d', 'Salário', 'despesa'))
  estado = aplicarAcaoFinanceira(estado, { tipo: 'categoria/editar', categoria: categoria('r', ' SALÁRIO ') })
  assert.equal(estado.categorias[0].id, 'r')
  recusada(estado, { tipo: 'categoria/editar', categoria: categoria('r', 'salário', 'despesa') })
  estado = aplicarAcaoFinanceira(estado, { tipo: 'categoria/editar', categoria: categoria('r', 'Outros', 'despesa') })
  assert.equal(estado.categorias[0].tipo, 'despesa')
  recusada(estado, { tipo: 'categoria/editar', categoria: categoria('inexistente') })
})

test('recusa categorias inexistentes e incompatíveis em cadastro e edição de transação', () => {
  const estado = lancar(cadastrar(criarEstadoFinanceiro()))
  for (const t of [transacao(1, ''), transacao(1, 'inexistente'), transacao(1, 'r', 'despesa', -100)]) {
    for (const tipo of ['cadastrar', 'editar']) {
      recusada(estado, { tipo: 'transacao', operacao: { tipo, transacao: t } })
    }
  }
})

test('renomear categoria vinculada atualiza projeção sem alterar registros, valores, datas ou ordem', () => {
  let estado = lancar(lancar(cadastrar(criarEstadoFinanceiro())), transacao(2))
  const anteriores = estado.transacoes
  assert.equal('categoria' in anteriores[0], false)
  const resumo = calcularResumo(anteriores)
  estado = aplicarAcaoFinanceira(estado, { tipo: 'categoria/editar', categoria: categoria('r', 'Renda') })
  assert.strictEqual(estado.transacoes, anteriores)
  assert.deepEqual(selecionarTransacoes(estado).map(t => t.categoria), ['Renda', 'Renda'])
  assert.deepEqual(selecionarTransacoes(estado).map(t => t.id), [2, 1])
  assert.deepEqual(calcularResumo(estado.transacoes), resumo)
  recusada(estado, { tipo: 'categoria/editar', categoria: categoria('r', 'Renda', 'despesa') })
  recusada(estado, { tipo: 'categoria/excluir', id: 'r' })
})

test('reclassificação ou remoção libera categoria para exclusão sem remover transações em cascata', () => {
  let estado = lancar(cadastrar(cadastrar(criarEstadoFinanceiro()), categoria('r2', 'Extra')))
  estado = aplicarAcaoFinanceira(estado, { tipo: 'transacao', operacao: { tipo: 'editar', transacao: transacao(1, 'r2') } })
  estado = aplicarAcaoFinanceira(estado, { tipo: 'categoria/excluir', id: 'r' })
  assert.equal(estado.transacoes.length, 1)
  assert.equal(estado.transacoes[0].categoriaId, 'r2')
  recusada(estado, { tipo: 'categoria/excluir', id: 'r' })
  estado = aplicarAcaoFinanceira(estado, { tipo: 'transacao', operacao: { tipo: 'excluir', id: 1 } })
  estado = aplicarAcaoFinanceira(estado, { tipo: 'categoria/excluir', id: 'r2' })
  assert.equal(estado.categorias.length, 0)
})

test('estado coordenado preserva limites monetários e aceita edição de tipo com categoria compatível', () => {
  let estado = cadastrar(cadastrar(criarEstadoFinanceiro()), categoria('d', 'Compras', 'despesa'))
  estado = lancar(estado, transacao(1, 'r', 'receita', LIMITE_CENTAVOS))
  recusada(estado, { tipo: 'transacao', operacao: { tipo: 'cadastrar', transacao: transacao(2) } })
  for (const valor of [0, 0.005, Infinity, LIMITE_CENTAVOS + 1]) {
    recusada(estado, { tipo: 'transacao', operacao: { tipo: 'editar', transacao: transacao(1, 'r', 'receita', valor) } })
  }
  estado = aplicarAcaoFinanceira(estado, { tipo: 'transacao', operacao: { tipo: 'editar', transacao: transacao(1, 'd', 'despesa', -30) } })
  assert.deepEqual(calcularResumo(estado.transacoes), { receitas: 0, despesas: 30, saldo: -30 })
  assert.equal(estado.transacoes[0].id, 1)
})

test('reducer revalida vínculos no estado mais recente e limpa toda a sessão', () => {
  let estado = cadastrar(criarEstadoFinanceiro())
  estado = reduzirEstadoFinanceiro(estado, { tipo: 'categoria/excluir', id: 'r' })
  estado = recusada(estado, { tipo: 'transacao', operacao: { tipo: 'cadastrar', transacao: transacao() } })
  const limpo = reduzirEstadoFinanceiro(estado, { tipo: 'limparErro' })
  assert.equal(limpo.erro, null)
  assert.strictEqual(limpo.transacoes, estado.transacoes)
  assert.deepEqual(reduzirEstadoFinanceiro(lancar(cadastrar(criarEstadoFinanceiro())), { tipo: 'limpar' }), criarEstadoFinanceiro())
})

test('edição inválida de nome preserva categorias e transações vinculadas', () => {
  const estado = lancar(cadastrar(cadastrar(criarEstadoFinanceiro()), categoria('r2', 'Extra')))
  Object.freeze(estado.categorias)
  Object.freeze(estado.transacoes)
  for (const nome of [' ', ' EXTRA ']) {
    recusada(estado, { tipo: 'categoria/editar', categoria: categoria('r', nome) })
  }
  assert.equal(contarVinculosCategoria('r', estado.transacoes), 1)
  assert.equal(contarVinculosCategoria('r2', estado.transacoes), 0)
})

test('ações sequenciais revalidam vínculos novos antes de excluir ou mudar tipo', () => {
  let estado = cadastrar(criarEstadoFinanceiro())
  estado = reduzirEstadoFinanceiro(estado, { tipo: 'transacao', operacao: { tipo: 'cadastrar', transacao: transacao() } })
  recusada(estado, { tipo: 'categoria/excluir', id: 'r' })
  recusada(estado, { tipo: 'categoria/editar', categoria: categoria('r', 'Outro', 'despesa') })
  assert.throws(() => selecionarTransacoes({ ...estado, categorias: [] }), /Vínculo/)
})
