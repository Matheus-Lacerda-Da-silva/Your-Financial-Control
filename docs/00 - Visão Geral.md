# Your Financial Control

## Atualização — Metas em memória (2026-11-12)

Implementada a página `/metas`, com entrada na sidebar, CRUD de metas, aportes e exclusão individual com confirmação. Metas usam reducer independente, centavos inteiros seguros, calendário civil e planejamento mensal exato. Os detalhes distinguem planejamento de referência (objetivo menos reserva inicial no período completo das configurações atuais) e restante atualizado (acumulado e meses ainda disponíveis). Aportes não alteram receitas, despesas, saldo ou transações. Dados são temporários e apagados na recarga/saída. Ver regras e diário. Validação visual/funcional pelo usuário continua pendente; testes de funções não comprovam interface.

Auditoria inicial: 2026-11-09. Escopo: código e arquivos locais; sem consulta a produção ou dados reais.

## Objetivo e estado atual

Aplicação web para gerenciamento de finanças pessoais: registrar receitas e despesas e acompanhar saldo e histórico. A versão encontrada é um frontend demonstrativo, sem persistência financeira nem autenticação real. Não deve ser tratada como sistema financeiro pronto para uso real.

O projeto está em estágio inicial e será desenvolvido progressivamente. A prioridade é preservar o código e os fluxos existentes, entregando melhorias pequenas e verificáveis. Backend, banco de dados e autenticação real são etapas futuras do [[04 - Roadmap]], sem exigência de implementação imediata para continuar a evolução da demonstração.

## Direção de evolução e visual provisório

- Evoluir incrementalmente, reutilizando componentes e padrões existentes antes de introduzir novas abstrações ou reescrever telas.
- Priorizar responsividade, navegação por teclado, foco visível, legibilidade e acessibilidade em cada entrega.
- Adotar glassmorphism como direção visual provisória, com tons de cinza como base e verde para destaques. Essa é uma orientação para futuras alterações, não uma declaração de estilo já implementado ou identidade visual definitiva.
- Aplicar transparência e desfoque somente quando preservarem contraste e leitura, especialmente de valores financeiros, campos e mensagens. Prever superfícies opacas quando necessário e não depender apenas de cor para comunicar receita, despesa ou erro.

Em 2026-11-10, a primeira aplicação dessa direção foi implementada em Início: tokens tipados `theme.glass`, superfícies translúcidas com fallback opaco e cartões de resumo reutilizáveis. Em 2026-11-11, Transações passou a reutilizar `SuperficieVidro` nos painéis de cadastro e histórico, com refinamentos de tabela, cartões móveis e diálogos. Tema e superfície compartilhada não foram alterados nessa extensão. A validação visual no navegador e a aprovação visual de Transações continuam pendentes; a evolução deve permanecer gradual nos dois temas e em diferentes tamanhos de tela.

O README raiz descreve uma aplicação full stack e cita Node.js, Express, PostgreSQL, REST e JWT. Essas declarações não comprovam implementação: `backend/` contém somente `.gitkeep`; não foram identificados servidor, endpoints, esquema ou integração de autenticação. Node.js é utilizado pelo comando de testes, não por um backend identificado.

## Tecnologias confirmadas

Em `frontend/package.json`: React e React DOM, TypeScript, Vite e plugin React, React Router DOM, Material UI, Emotion, ESLint e plugins de TypeScript/React. Os testes usam `node:test` e `node:assert/strict`. Há `frontend/package-lock.json`; as faixas do manifesto não equivalem necessariamente às versões instaladas.

## Funcionalidades e classificação

| Recurso | Estado | Evidência |
| --- | --- | --- |
| Criar, listar, editar e excluir transações em memória | Implementado no escopo demonstrativo | `frontend/src/App.tsx`, `frontend/src/pages/Transacoes.tsx` |
| Receitas, despesas, saldo e cinco registros mais recentemente cadastrados | Implementado | `frontend/src/pages/Inicio.tsx` |
| Layout responsivo, menu lateral, cartões no celular e tabela em telas maiores | Implementado no código; validação visual não executada nesta auditoria | `frontend/src/layouts/LayoutPrincipal.tsx`, `frontend/src/components/Sidebar.tsx`, `frontend/src/pages/Transacoes.tsx` |
| Tema claro/escuro com preferência salva | Implementado | `frontend/src/theme/TemaProvider.tsx` |
| Acesso e cadastro | Parcial: formulários demonstrativos e validação local; nenhuma conta criada | `frontend/src/pages/Acesso.tsx`, `frontend/src/pages/Cadastro.tsx` |
| Categorias de Receita/Despesa | CRUD em memória com IDs, normalização, duplicidade por nome/tipo e contagem de vínculos; validação interativa pendente | `frontend/src/pages/Categorias.tsx`, `frontend/src/utils/categorias.ts` |
| Associação de categorias | Seleção por tipo no cadastro/edição de transações; renomeação refletida por projeção; exclusão e mudança de tipo bloqueadas enquanto houver vínculos | `frontend/src/App.tsx`, `frontend/src/utils/estadoFinanceiro.ts` |
| Backend, API, banco, JWT e isolamento por usuário | Não identificados no código | `backend/.gitkeep`, `frontend/src/App.tsx` |

## Qualidade e limites

Em 2026-11-11, Categorias passou a reutilizar dois painéis `SuperficieVidro` e `theme.glass`, sem mudanças nos componentes compartilhados. Categorias começam vazias e desaparecem junto das transações ao recarregar/sair. O estado coordenado armazena `categoriaId`; nomes são derivados para exibição, preservando o dashboard. Foram executados 32 testes, TypeScript e build com sucesso; lint segue bloqueado pela dependência local. Aparência e interação ainda aguardam validação do usuário conforme `frontend/VALIDACAO_VISUAL.md`.

Os valores financeiros agora usam `valorCentavos` com inteiros seguros, rejeição de frações de centavo e limites por lançamento e total. Operações monetárias inválidas preservam os dados anteriores. Ver [[03 - Regras Financeiras]]. A suíte reúne testes de acesso/cadastro e testes financeiros das funções e reducer utilizados pela aplicação. Ela não comprova interação visual ou autenticação real. O roteiro `frontend/VALIDACAO_VISUAL.md` é uma lista manual, não um relatório de execução. Resultados e limitações estão em [[01 - Arquitetura]] e [[05 - Diário de Desenvolvimento]].

## Instruções do projeto

`AGENTS.md` orienta consultar documentação e código antes de recomendar mudanças, preservar padrões e comportamento, explicar alterações, executar testes disponíveis e atualizar documentação. Exige português do Brasil, proteção de segredos e dados financeiros, atenção a precisão monetária e isolamento por usuário e autorização para operações restritas. Não presumir que planos estejam implementados. O projeto é desenvolvido em dois computadores; não instalar dependências nem executar operações Git restritas sem autorização.

## Mapa das notas

- [[01 - Arquitetura]]: estrutura, rotas, segurança e testes.
- [[02 - Banco de Dados]]: modelo em memória e lacunas de persistência.
- [[03 - Regras Financeiras]]: cálculos e validações efetivamente encontrados.
- [[04 - Roadmap]]: propostas priorizadas, sem compromisso de entrega.
- [[05 - Diário de Desenvolvimento]]: registro e limites da auditoria.

`docs/` é a única raiz do cofre Obsidian, com configurações em `docs/.obsidian/`. A documentação antiga de `docs/docs/` foi preservada em backup externo antes da remoção da pasta duplicada. O histórico da auditoria permanece em [[05 - Diário de Desenvolvimento]].
