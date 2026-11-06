export function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function validarCadastro(nome: string, email: string, senha: string, confirmacao: string) {
  return {
    nome: nome.trim() ? '' : 'Informe seu nome.',
    email: validarEmail(email) ? '' : 'Informe um e-mail válido.',
    senha: senha.trim().length >= 8 ? '' : 'Use pelo menos 8 caracteres, além dos espaços nas extremidades.',
    confirmacao: confirmacao && senha === confirmacao ? '' : 'As senhas precisam ser iguais.',
  }
}
