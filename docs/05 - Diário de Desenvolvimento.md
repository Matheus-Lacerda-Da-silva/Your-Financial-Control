# Diário de Desenvolvimento

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

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
