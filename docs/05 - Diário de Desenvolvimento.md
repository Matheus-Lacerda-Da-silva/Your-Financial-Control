# Diário de Desenvolvimento

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## 2026-11-09 — Correção incremental de precisão monetária

- Substituído `valor` em reais por `valorCentavos`, inteiro seguro com sinal, em tipos, cadastro/edição, cartões, tabela e dashboard. IDs, estilos e fluxos de navegação foram preservados.
- Adicionados `frontend/src/utils/dinheiro.ts` (conversão decimal textual, limites, soma segura e entrada para edição) e `frontend/src/utils/transacoes.ts` (resumo, operações imutáveis e reducer).
- Rejeitadas frações de centavo como `0.005`, notação científica, entradas não monetárias, zero e valores fora do limite. Nenhum arredondamento silencioso é aplicado.
- Limite por lançamento em magnitude, por total de receitas e por total de despesas: 9.007.199.254.740.991 centavos. O saldo também deve ser inteiro seguro. Compensação entre receitas/despesas não permite exceder os limites dos grupos.
- Conversões e limites intermediários usam `BigInt`; o estado permanece em `number` inteiro seguro. A formatação BRL preserva centavos inclusive no limite e não apresenta zero negativo.
- Cadastro/edição são pré-validados antes de limpar formulário/fechar diálogo. O reducer também valida sobre o estado atualizado e mantém o array anterior quando uma operação é inválida.
- Criado `frontend/tests/financeiro.test.mjs` com 16 testes financeiros/regressivos, incluindo totais após edição/exclusão, limites de receitas/despesas, formatação, sinal/tipo e preservação dos dados.
- Verificação final: `npm.cmd test` passou com 22 testes (16 financeiros e 6 de acesso); `npm.cmd run build` passou, incluindo TypeScript. O build emitiu aviso de chunk JavaScript acima de 500 kB, sem impedir a compilação.
- `npm.cmd run lint` continua bloqueado por `SyntaxError` na dependência local `@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`, falha já observada anteriormente. Dependências não foram modificadas nem reinstaladas.
- Revisão React aplicada aos componentes alterados: estado financeiro validado em reducer puro, totais derivados sem efeitos e componentes/estilos reutilizados. `git diff --check` e links internos verificados. Não foram executados testes de interação/visuais no navegador; os testes financeiros exercitam as funções e o reducer reais.
- Não houve implementação de backend, banco, autenticação, persistência ou alteração de IDs/identidade visual, commit ou push. Os riscos conhecidos de colisão de IDs e perda de estado na recarga permanecem fora desta correção.

## 2026-11-09 — Direção de desenvolvimento progressivo

- Registrado o estágio inicial do projeto e a evolução por entregas pequenas, preservando o código e os fluxos existentes.
- Definido glassmorphism com tons de cinza e verde como direção visual provisória para futuras alterações, condicionada a legibilidade, contraste, responsividade e acessibilidade.
- Priorizados componentes reutilizáveis e validação incremental; nenhuma alteração de código ou estilos foi realizada nesta atualização.
- Backend, API, banco e autenticação real foram situados em etapas posteriores do roadmap, sem exigência imediata para evoluir a demonstração. Os requisitos de segurança continuam necessários antes do uso real.
- Atualizadas referências à organização do cofre: `docs/` é a raiz única e `docs/docs/` foi removida após backup externo verificado na tarefa anterior. O registro da auditoria abaixo foi preservado como histórico.
- Alteradas apenas as notas de visão geral, arquitetura, roadmap e este diário. `AGENTS.md` permanece inalterado: já orienta mudanças pequenas e consulta à visão geral.

## 2026-11-09 — Auditoria inicial e documentação

### Escopo e método

Leitura inicial de `AGENTS.md` e da visão geral encontrada em `docs/docs/00 - Visão Geral.md` (o caminho `docs/00 - Visão Geral.md` não existia no início). Nesta auditoria, `AGENTS.md` contém instruções e foi considerado conforme seu conteúdo atual. Inspeção da árvore, manifesto/lockfile presente, configuração frontend, todas as páginas, layouts, componentes, tipos, utilitários, tema, testes e roteiro visual; conferência de `backend/` e busca por persistência, HTTP, esquemas e migrations. Não foram lidos ou reproduzidos valores de credenciais ou dados financeiros reais.

### Principais descobertas

- Frontend React/TypeScript com Vite, React Router, Material UI e Emotion.
- CRUD de transações e painel funcionam sobre estado React, sem persistência financeira.
- Acesso/cadastro são demonstrativos; nenhuma conta, autenticação ou isolamento de servidor identificado.
- Categorias são texto livre; tela de gerenciamento é apenas informativa.
- Backend contém somente `.gitkeep`; PostgreSQL, Express, REST e JWT citados no README não possuem implementação identificada.
- Riscos: perda de dados na recarga/saída, ponto flutuante em dinheiro, IDs potencialmente repetidos, validação financeira local e pouca cobertura automatizada. Detalhes em [[01 - Arquitetura]].

### Verificação

- `npm test` e `npm run lint` inicialmente não iniciaram porque PowerShell bloqueou `npm.ps1`. Sem mudar política/configuração, foram usados os comandos equivalentes `npm.cmd`.
- `npm.cmd test` em `frontend`: 6 testes passaram, 0 falhas. Escopo exclusivo de validação de e-mail/cadastro, não de autenticação real ou finanças.
- `npm.cmd run lint`: falhou com `SyntaxError: Invalid or unexpected token` ao carregar `frontend/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`. A análise do código não foi concluída; o conteúdo da dependência local aparenta estar inválido. A causa não foi confirmada e nenhuma dependência foi reparada ou reinstalada.
- Build e servidor não executados para evitar geração de arquivos fora da documentação autorizada. Não houve instalação, migrations, conexão com banco, deploy ou Git push.
- Roteiro visual, execução no navegador, auditoria de dependências, integração externa e testes de produção não executados. Não há comprovação de comportamento visual ou segurança em ambiente publicado.

### Documentação produzida

Criadas as seis notas solicitadas diretamente em `docs/`, com estados de implementação, evidências por caminho, modelo de dados atual, regras financeiras, riscos e roadmap proposto. Notas antigas em `docs/docs/`, `AGENTS.md`, código, dependências e configurações preservados. Nenhuma migração de vault foi realizada.

### Informações não confirmadas

Infraestrutura/hospedagem, banco ou API fora do repositório, usuários reais, estratégia futura de autenticação, política monetária e de datas, backup, requisitos de negócio adicionais, prioridades aprovadas, prazos e execução histórica do checklist manual. Nenhum desses pontos foi apresentado como implementação existente.
