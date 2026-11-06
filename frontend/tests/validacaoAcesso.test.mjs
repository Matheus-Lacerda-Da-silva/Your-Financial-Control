import test from 'node:test'
import assert from 'node:assert/strict'
import { validarEmail, validarCadastro } from '../src/utils/validacaoAcesso.ts'

test('e-mail aceita endereços comuns e espaços nas extremidades', () => {
  assert.equal(validarEmail(' pessoa+teste@exemplo.com.br '), true)
})

test('e-mail rejeita ausência de domínio, espaços internos e campos vazios', () => {
  for (const email of ['', '   ', 'pessoa', 'pessoa@', 'pessoa@exemplo', 'pessoa teste@exemplo.com']) {
    assert.equal(validarEmail(email), false, email)
  }
})

test('cadastro informa os erros de todos os campos vazios', () => {
  const erros = validarCadastro(' ', '', '', '')
  assert.ok(Object.values(erros).every(Boolean))
})

test('cadastro exige uma senha de pelo menos oito caracteres úteis', () => {
  for (const senha of ['1234567', '        ', ' 1234567 ']) {
    assert.ok(validarCadastro('Pessoa', 'pessoa@exemplo.com', senha, senha).senha)
  }
})

test('cadastro exige confirmação idêntica sem alterar a senha', () => {
  assert.ok(validarCadastro('Pessoa', 'pessoa@exemplo.com', 'senha123', 'Senha123').confirmacao)
  assert.ok(validarCadastro('Pessoa', 'pessoa@exemplo.com', 'senha123 ', 'senha123').confirmacao)
})

test('cadastro válido não retorna erros', () => {
  const erros = validarCadastro(' Pessoa ', ' pessoa@exemplo.com ', 'senha123', 'senha123')
  assert.ok(Object.values(erros).every(erro => erro === ''))
})
