# Diário de Desenvolvimento

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## 2026-11-11 — Categorias funcionais em memória, aguardando validação

- Implementação aprovada com `frontend-design`. Criados `Categoria`, `TransacaoRegistrada`/`TransacaoExibicao`, normalização/duplicidade e validação de vínculo em `utils/categorias.ts`, além do coordenador puro e reducer em `utils/estadoFinanceiro.ts`. Operações financeiras existentes foram generalizadas apenas na tipagem; o algoritmo monetário, conversores e formatadores não foram alterados.
- Categorias usam IDs estáveis gerados fora do reducer com UUID ou bytes criptográficos, com recusa de colisão no estado. Transações armazenam `categoriaId`; nomes são projetados para exibição, sem mudar Início ou TransacaoCard. Categorias e transações começam vazias e são limpas juntas na saída/recarga, sem persistência ou categorias padrão.
- Tela com formulário visível, lista responsiva e contagem de vínculos, estado vazio, dois painéis `SuperficieVidro`, itens opacos sem blur, diálogos MUI com nomes acessíveis e alertas internos. Renomeação atualiza a exibição dos lançamentos; exclusão e mudança de tipo são bloqueadas enquanto houver vínculos, na interface e no reducer.
- Transações usa seletores filtrados pelo tipo no cadastro/edição; trocar tipo limpa a categoria e não escolhe outra. Sem opções há orientação e navegação para Categorias. O link dentro da edição informa que o rascunho será descartado. Callbacks pré-validam antes de limpar campos/fechar diálogos e o reducer revalida sobre o estado mais recente.
- Validação estrutural intermediária: 30 testes passaram. Verificação final, repetida após revisão dos avisos na exclusão: 32 testes passaram (10 novos de categorias/integração e os 22 existentes); TypeScript local `tsc -b` passou; `npm.cmd run build` passou, incluindo TypeScript. Chunk principal final: 578,28 kB (177,90 kB gzip), com aviso de tamanho acima de 500 kB. Lint continua bloqueado por `SyntaxError: Invalid or unexpected token` ao carregar `@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`; análise do código pelo ESLint não concluída, sem reparo de dependências.
- Revisão estática com `react-best-practices`: componentes no escopo de módulo, hooks no topo, props tipadas sem `any`, estado compartilhado em reducer puro e valores de exibição derivados sem efeitos. Não houve alteração de tema, superfície compartilhada, dashboard, sidebar, cabeçalho ou login. Sem dependências novas, commit, push, deploy ou produção.
- Pendente: validação visual e funcional pelo usuário conforme `frontend/VALIDACAO_VISUAL.md`. Não houve inspeção no navegador; contraste composto, leitor de tela, contenção/retorno de foco, seletores longos, responsividade/zoom e desempenho móvel não foram comprovados. Playwright não está instalado no projeto e nenhuma ferramenta foi adicionada. A implementação não é considerada concluída até a validação do usuário.

## 2026-11-10 — Sidebar, cabeçalho e alternador reutilizável

- Plano aprovado implementado com `frontend-design`. Criados `AlternadorTema.tsx` e `ContextoTema.ts`; estado único em `TemaProvider`, atualização funcional e persistência opcional de `yfc-tema` por efeito. Removidos o botão absoluto e suas regras CSS. Controle reutilizado no cabeçalho principal e no layout compartilhado de acesso/cadastro, com ícones MUI e nome acessível indicando o tema de destino.
- Cabeçalho usa controles no fluxo, altura mínima adaptável e superfícies opacas do tema. Sidebar usa fundo opaco, luz interna, marcador ativo sem deslocamento, hover específico para item ativo, ícones de 24 px e foco explícito. Foco comum dos controles MUI definido no tema. Não foram adicionados filtros, animações, dependências ou alterações financeiras.
- Drawer móvel mantém modal, backdrop e gestão de foco MUI. Adicionados botão Fechar, identificação do diálogo e estado expandido no botão de abertura. Ao atravessar `md`, o layout limpa o estado aberto do menu. `Navbar.tsx` legado não foi alterado nem integrado ao fluxo.
- Verificações: 22 testes passaram; TypeScript (`tsc -b`) com saída 0; build passou. Bundle principal 565,13 kB (175,06 kB gzip), mantendo aviso acima de 500 kB. Lint executado com saída 2 por `SyntaxError` ao carregar `@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`, falha local já registrada; sem reparo/reinstalação de dependências.
- Revisão estática com `react-best-practices`: componentes fora da renderização, contexto tipado, nenhum `any`, persistência fora do updater de estado e navegação por links preservada. `git diff --check` sem erros de whitespace.
- Limitações: não houve inspeção no navegador, medição de contraste ou verificação de leitor de tela, retorno/contenção de foco, teclado, zoom e transição de breakpoint. São critérios pendentes no roteiro visual, não resultados comprovados pelos testes de funções. Sem commit, push ou deploy.

## 2026-11-10 — Refinamento visual do dashboard

- Refinamento aprovado, usando `frontend-design`, sobre a primeira versão existente. `theme.glass` recebeu luz interna, sombra de destaque e iluminação esmeralda estática com intensidades próprias para claro/escuro. `SuperficieVidro` combina sombra externa e brilho interno; opacidades, fallback opaco e blur de 8 px foram preservados.
- `CartaoResumo` diferencia o saldo por tamanho do valor, borda e iluminação discreta. Saldo negativo mantém o sinal da formatação e recebe `error.main`; esmeralda é decoração, não indicador de resultado positivo. Nenhum cálculo, formatação monetária, estado financeiro ou fluxo foi alterado.
- `Inicio` reduz padding externo no celular, separa seções em 24–32 px, mantém o grid existente, reorganiza valores da lista no celular e alinha-os à direita nas telas maiores. Estado vazio ganhou suporte visual para o ícone, título h3, largura de texto limitada e menor espaço vertical no celular.
- Verificação: 22 testes passaram; TypeScript (`tsc -b`) passou com saída 0; build passou. Bundle principal: 560,49 kB (173,57 kB gzip), com aviso acima de 500 kB; primeira versão registrava 559,61 kB (173,31 kB gzip). Sem dependências novas.
- Lint executado, mas terminou com saída 2 ao carregar `@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js` (`SyntaxError: Invalid or unexpected token`), repetindo falha local prévia. Nenhuma reinstalação ou reparo realizado; análise automática do código pelo ESLint não concluída.
- Revisão estática conforme `react-best-practices`: componentes e hooks existentes preservados, sem estado/efeitos novos, sem casts para `any`, sem animações, sem filtros extras ou aninhados, quatro superfícies filtradas e estilos restritos ao dashboard. `git diff --check` sem erros de whitespace.
- Limitações: não houve inspeção no navegador, medição de contraste composto, validação de zoom/foco/fallback ou perfil de desempenho móvel. Esses itens continuam pendentes no roteiro visual; testes de funções e compilação não os comprovam. Sem commit, push ou instalação de dependências.

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

## 2026-11-11 — Refinamento de Transações aguardando validação visual

Implementado o escopo aprovado com `frontend-design`: dois painéis reutilizam `SuperficieVidro`, fundo local usa `theme.glass`, formulário de cadastro permanece visível e com a mesma ordem de campos. Adicionados títulos semânticos, estado vazio com ícone e orientação sem ação duplicada, aviso de sessão temporária, tabela com rolagem interna focável, quebra de textos e números tabulares, cartões móveis opacos sem blur e ações com descrição no nome acessível e alvo mínimo de 44 px.

Edição mantém os handlers e validações existentes; campos receberam composição responsiva e indicação de obrigatoriedade, sem transformar o diálogo em formulário ou adicionar validação nativa ao envio. Erros aparecem em Alert dentro do diálogo, fora da área rolável dos campos, enquanto o Snackbar externo fica fechado. Ao abrir edição e após salvar com sucesso, mensagens locais antigas são limpas. Diálogos têm títulos associados, foco inicial explícito e preservam Escape e restauração do MUI; exclusão inclui fallback de foco no título do histórico se o acionador removido deixar o foco no body. Interação e anúncio assistivo ainda não foram executados no navegador.

Verificações executadas: `npm.cmd run test` passou com 22 testes; TypeScript local `node_modules/.bin/tsc.cmd -b` passou; build final `npm.cmd run build` passou, incluindo TypeScript após os últimos ajustes. Vite informou chunk principal de 568,03 kB (175,73 kB gzip), com aviso acima de 500 kB. `npm.cmd run lint` continua bloqueado por `SyntaxError: Invalid or unexpected token` ao carregar `@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`; não analisou a aplicação. Dependências não foram alteradas ou reinstaladas.

Revisão estática com `react-best-practices`: props tipadas, sem `any`, hooks no topo, ref de foco sem estado adicional, sem novos efeitos ou animações, composição MUI e callbacks financeiros preservados. `TemaProvider`, `SuperficieVidro`, dashboard, layouts, reducer, conversão, cálculos, datas e ordenação não foram alterados. Sem commit, push ou deploy.

Pendente: validação visual pelo usuário e execução do roteiro atualizado em `frontend/VALIDACAO_VISUAL.md`, nos dois temas e em todas as larguras/zoom previstos. Contraste composto, overflow real, retorno de foco, anúncio do alerta e desempenho móvel não foram comprovados por testes de funções ou build. A etapa permanece aguardando aprovação visual.

## 2026-11-10 — Redesign incremental de Início

Implementação aprovada com a skill `frontend-design`. Adicionados tokens tipados `theme.glass` em `TemaProvider.tsx`, o componente `SuperficieVidro` (Card MUI com fallback opaco e filtros condicionados a suporte) e `CartaoResumo`. Aplicação restrita a Início: fundo local cinza/grafite, quatro superfícies com blur de 8 px, saldo com borda esmeralda, padding responsivo e valores tabulares. Escala de espaçamento, temas, rotas, avisos, estado vazio e últimas cinco transações preservados. Nenhuma alteração em reducer, cálculos em centavos, formatação ou persistência.

Verificações: 22 testes passaram; TypeScript local (`tsc -b`) concluiu sem erros; `npm.cmd run build` passou. Build emitiu aviso de chunk principal de 559,61 kB (173,31 kB gzip), sem análise comparativa anterior que permita atribuir o tamanho ao redesign. `npm.cmd run lint` falhou ao carregar `@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js` com erro de sintaxe, repetindo a limitação local já registrada; não concluiu a análise da aplicação. Não houve reinstalação de dependências.

Revisão estática conforme `react-best-practices`: componentes definidos fora da renderização, props tipadas sem `any`, composição MUI, ausência de estado/efeitos novos ou animações e identidade estável nos itens. Sem dependências novas, commit, push ou deploy. Build produziu artefatos locais ignorados pelo Git. A skill `frontend-design` criada na etapa anterior continua como arquivo não rastreado.

Limitações: não houve execução no navegador; contraste composto, fallback em navegador sem filtros, foco, responsividade e desempenho em dispositivo móvel ainda precisam ser conferidos. Testes de funções e compilação não comprovam esses aspectos. Roteiro atualizado em `frontend/VALIDACAO_VISUAL.md`; resumo e arquitetura atualizados para distinguir o dashboard implementado da direção visual futura.

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
