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
```

O roteiro de conferência de telas, temas e operações está em [VALIDACAO_VISUAL.md](./VALIDACAO_VISUAL.md). Ainda não há testes automatizados configurados.

## Organização

- `src/theme`: paleta, tipografia e padrões globais dos componentes. A preferência claro/escuro é salva em `localStorage`; sem preferência salva, utiliza o tema do sistema.
- `src/layouts`: estrutura responsiva, cabeçalho e área principal.
- `src/components`: navegação e componentes reutilizáveis.
- `src/pages`: visão geral, transações e página informativa de categorias.
- `src/types`: modelo compartilhado de transação.
- `src/utils`: formatação e data local.

A navegação usa menu temporário abaixo de 900 px e barra lateral permanente em telas maiores. Os formulários usam colunas adaptáveis; as transações são cartões abaixo de 600 px e tabela nas demais larguras.

## Limites atuais

As transações ficam apenas na memória da sessão e são apagadas ao recarregar a página. Não há API, autenticação ou banco de dados implementados. O gerenciamento de categorias ainda não está disponível.
