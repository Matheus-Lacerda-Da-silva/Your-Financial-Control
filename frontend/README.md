# YFC — Frontend

Interface de controle financeiro com React, TypeScript, Material UI e Vite.

## Executar

```sh
npm ci
npm run dev
```

No PowerShell com restrição de scripts, use `npm.cmd` no lugar de `npm`.

## Verificações

```sh
npm run build
npm run lint
npm test
```

O roteiro de conferência de telas, temas e operações está em [VALIDACAO_VISUAL.md](./VALIDACAO_VISUAL.md). Os testes das validações de cadastro usam o runner nativo do Node.js com suporte a TypeScript (Node 22.6 ou superior).

## Organização

- `src/theme`: paleta, tipografia e padrões globais dos componentes. A preferência claro/escuro é salva em `localStorage`; sem preferência salva, utiliza o tema do sistema.
- `src/layouts`: estrutura responsiva, cabeçalho e área principal.
- `src/components`: navegação e componentes reutilizáveis.
- `src/pages`: acesso, cadastro, visão geral, transações e página informativa de categorias.
- `src/types`: modelo compartilhado de transação.
- `src/utils`: formatação e data local.

A navegação usa menu temporário abaixo de 900 px e barra lateral permanente em telas maiores. Os formulários usam colunas adaptáveis; as transações são cartões abaixo de 600 px e tabela nas demais larguras.

## Limites atuais

O acesso inicial direciona para `/acesso`, com link para `/cadastro`. O cadastro apenas valida os campos e retorna ao acesso; não cria uma conta. O acesso aceita um e-mail válido e uma senha fictícia não vazia para abrir a demonstração. Senhas não são gravadas em armazenamento nem enviadas pela rede.

A sessão demonstrativa e as transações ficam apenas na memória e são apagadas ao recarregar ou sair. As rotas do painel exigem essa sessão local, mas isso não representa uma proteção de autenticação real. Não há API, autenticação ou banco de dados implementados. O gerenciamento de categorias ainda não está disponível.
