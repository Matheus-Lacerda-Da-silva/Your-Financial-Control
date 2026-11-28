# YFC — Frontend

Interface de controle financeiro com React, TypeScript, Vite e Material UI. O Supabase Auth gerencia cadastro, acesso e sessão. A API Hono confirma a identidade em `GET /api/v1/me`. A publicação está prevista no Cloudflare Pages.

## Executar

Copie `.env.example` para `.env.local` e configure:

| Variável | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | URL HTTPS do mesmo projeto Supabase configurado no backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publicável do projeto, com prefixo `sb_publishable_` |
| `VITE_API_URL` | Origem da API, por exemplo `http://127.0.0.1:3000` |

Inicie o backend com a origem exata do Vite em `FRONTEND_ORIGINS`. O cadastro usa `/acesso` na origem atual como destino de confirmação. Para testar o link de e-mail, a configuração existente do projeto Supabase deve permitir esse endereço, por exemplo `http://localhost:5173/acesso`.

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

O roteiro de conferência de telas, temas e operações está em [VALIDACAO_VISUAL.md](./VALIDACAO_VISUAL.md). Os testes usam o runner nativo do Node.js com suporte a TypeScript e respostas simuladas da API. Para testar renovação da sessão, troca de conta e gravação incerta no Chrome headless, execute `node --test tests/renovacao.browser.mjs`. Configure `YFC_CHROME_PATH` se o Chrome estiver em outro local.

## Organização

- `src/theme`: paleta, tipografia e padrões globais dos componentes. A preferência claro/escuro é salva em `localStorage`; sem preferência salva, utiliza o tema do sistema.
- `src/layouts`: estrutura responsiva, cabeçalho e área principal.
- `src/components`: navegação e componentes reutilizáveis.
- `src/pages`: acesso, cadastro, visão geral, transações, categorias e metas.
- `src/hooks/useSessao.ts` e `src/services`: sessão do SDK, consulta de identidade e CRUD de categorias pelo Hono.
- `src/Painel.tsx`: validação da identidade e estado financeiro da conta ativa.
- `src/types`: modelo compartilhado de transação.
- `src/utils`: formatação e data local.

A navegação usa menu temporário abaixo de 900 px e barra lateral permanente em telas maiores. Os formulários usam colunas adaptáveis; as transações são cartões abaixo de 600 px e tabela nas demais larguras.

## Sessão e dados financeiros

O SDK restaura a sessão ao recarregar e renova o token. Se o cadastro exigir confirmação, a tela orienta a conferir o e-mail. O painel aguarda a sessão inicial e verifica o token na API. Um `401` orienta a entrar novamente. Em caso de falha temporária, o painel oferece uma nova tentativa e mantém a sessão do Supabase ativa.

O painel carrega categorias da API após confirmar a sessão, mantém o catálogo em memória apenas para a conta ativa e o atualiza com os resultados confirmados. Uma falha de leitura é exibida na interface e bloqueia novos vínculos até a recuperação. O CRUD foi validado manualmente no YFC-Development. As categorias persistem após recarregar e voltar a entrar na mesma conta. Confira os requisitos de execução no [README do backend](../backend/README.md#categorias).

Transações, metas e aportes ficam em memória. Os registros são descartados ao recarregar, sair ou trocar de conta e são preservados durante a renovação do token da mesma conta. Uma categoria usada na aba pode ser renomeada. Alterar o tipo ou excluir exige primeiro remover ou reclassificar os lançamentos. Se uma leitura posterior detectar uma mudança em outra aba ou dispositivo, o histórico e os totais são preservados e o vínculo aparece como **Categoria indisponível** até a reclassificação.
