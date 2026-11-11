# Arquitetura

Relacionadas: [[00 - Visão Geral]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[04 - Roadmap]], [[05 - Diário de Desenvolvimento]].

## Estrutura confirmada

| Caminho | Responsabilidade |
| --- | --- |
| `frontend/` | Aplicação React/TypeScript e ferramentas locais |
| `frontend/src/main.tsx` | Montagem com React StrictMode e TemaProvider |
| `frontend/src/App.tsx` | Rotas, sessão demo, estado de transações e operações CRUD |
| `frontend/src/pages/` | Início, transações, categorias, acesso e cadastro |
| `frontend/src/layouts/` | Layout de acesso e layout principal com Outlet |
| `frontend/src/components/` | Menu, campo de senha, cartão de transação; Navbar existe mas não é utilizada pelo fluxo principal inspecionado |
| `frontend/src/utils/` | Validação de cadastro/e-mail, dinheiro em centavos, resumo e reducer de transações, formatação e datas |
| `frontend/src/theme/` | Tema Material UI, preferência do sistema e localStorage |
| `frontend/tests/` | Testes de acesso/cadastro e regras financeiras/operações em memória |
| `backend/` | Apenas `.gitkeep`; backend não identificado |
| `docs/` | Raiz única do cofre, com seis notas oficiais e configurações em `.obsidian/` |

## Orientações para evolução incremental

O projeto está em estágio inicial. Preservar o código funcional e evoluir por mudanças pequenas, com validação do fluxo afetado. Reutilizar os componentes, layouts e tema existentes; extrair componentes e regras compartilhadas quando houver benefício concreto, evitando reescritas amplas.

A direção visual provisória é glassmorphism em cinza e verde, conforme [[00 - Visão Geral]]. Início usa `theme.glass`, definido e tipado em `TemaProvider.tsx`, e os componentes `SuperficieVidro.tsx` e `CartaoResumo.tsx`. Transações também reutiliza `SuperficieVidro` nos dois painéis de cadastro e histórico desde 2026-11-11, sem mudanças no tema ou no componente compartilhado. O efeito mantém fallback opaco por padrão, transparência e blur de 8 px dentro de `@supports`, fundo local cinza/grafite e destaque esmeralda, sem override global novo de Card. Espaçamentos reutilizam a escala MUI. Não há filtros aninhados nem animações adicionadas. A inspeção no navegador, incluindo contraste efetivo, responsividade, teclado e desempenho, permanece pendente.

Em Transações, o cadastro continua visível e mantém ordem de campos e handlers. A tabela tem contêiner de rolagem focável, quebra de textos e valores tabulares; cartões móveis usam superfície opaca sem filtro. Diálogos têm títulos associados, exclusão com descrição associada e foco inicial em Cancelar, edição com foco inicial na descrição e alerta interno persistente enquanto aberta. Escape e restauração de foco seguem o MUI; após exclusão há fallback para o título do histórico quando o foco fica no body. Cálculos, conversão, datas, reducer e ordem dos registros não foram alterados. Esses comportamentos foram inspecionados no código e ainda exigem validação interativa conforme `frontend/VALIDACAO_VISUAL.md`.

Backend, banco e autenticação real serão abordados em etapas posteriores do [[04 - Roadmap]]. A ausência atual é compatível com o estágio demonstrativo; os requisitos de persistência e isolamento devem ser atendidos antes da transição para uso real com dados pessoais e financeiros.

## Fluxo e rotas

Sidebar e cabeçalho usam superfícies opacas de `theme.glass` e luz interna discreta, sem filtros novos. `AlternadorTema.tsx` é composto no cabeçalho principal e no layout compartilhado de acesso/cadastro, sem posicionamento absoluto. `ContextoTema.ts` compartilha modo e alternância; `TemaProvider` mantém o estado único, preferência inicial e persistência opcional em `yfc-tema`. A sidebar preserva NavLink e Drawer MUI, com marcador ativo, hover e foco explícitos, botão móvel de fechar e identificação do diálogo. Ao atingir `md`, o layout fecha o estado do menu móvel para evitar manter o modal aberto no desktop.

No refinamento de Início, `theme.glass` também centraliza `luzInterna`, `sombraDestaque` e `iluminacao`. `CartaoResumo` reutiliza a propriedade `destaque` para a hierarquia do saldo, preservando sinal monetário e usando cor de erro quando negativo. Iluminação é estática e decorativa; não representa avaliação financeira. Resultados técnicos e limitações visuais estão no [[05 - Diário de Desenvolvimento]].

`main.tsx` monta `TemaProvider → App → BrowserRouter`. `App` entrega transações por props ao painel e à página de transações. Callbacks de criação, edição e exclusão despacham ações para `useReducer` com `utils/transacoes.ts`. O reducer valida o estado proposto antes de substituí-lo e preserva os dados em caso de erro monetário. Não há camada de serviços ou chamada HTTP identificada em `src`.

| Rota | Comportamento em `App.tsx` |
| --- | --- |
| `/acesso` | Formulário demo; com sessão redireciona para `/` |
| `/cadastro` | Validação demo; com sessão redireciona para `/` |
| `/` | Resumo financeiro sob LayoutPrincipal, condicionado à sessão demo |
| `/transacoes` | CRUD local sob LayoutPrincipal |
| `/categorias` | Tela informativa sob LayoutPrincipal |
| Outras | Redirecionamento conforme sessão demo |

Sem sessão, as rotas principais redirecionam para `/acesso`. Sair limpa sessão e transações. Recarregar recria ambos os estados vazios. BrowserRouter exige suporte a fallback para `index.html` ao acessar rotas diretamente em uma hospedagem; essa configuração não foi identificada ou testada. `vite.config.ts` configura somente o plugin React, sem proxy de API.

## Autenticação e APIs

- `Acesso.tsx`: aceita e-mail sintaticamente válido e senha não vazia após trim, limpa a senha e chama `onEntrar`. Não verifica identidade ou credenciais.
- `Cadastro.tsx` e `utils/validacaoAcesso.ts`: nome não vazio após trim, e-mail validado por expressão regular, senha com pelo menos oito caracteres após trim e confirmação exatamente igual à senha original. Redireciona para acesso com e-mail no estado de navegação; não cria conta.
- As telas avisam explicitamente que são demonstrativas e solicitam senha fictícia. `CampoSenha.tsx` permite mostrar/ocultar a senha.
- Não foram identificados endpoints, contratos REST, cliente HTTP, emissão/verificação de JWT, hash de senha, recuperação de conta, autorização de servidor ou propriedade de transações por usuário.
- O único armazenamento persistente identificado em `src` é a preferência `yfc-tema`. Senhas permanecem transitoriamente em estado de componente, sem gravação ou transmissão identificada no código examinado. Isso não constitui garantia sobre extensões, navegador ou infraestrutura externa.

## Riscos técnicos e de segurança

Os impactos abaixo registram limites e riscos técnicos da auditoria inicial. Eles não tornam backend e banco tarefas imediatas; a sequência de evolução está no [[04 - Roadmap]].

| Impacto | Constatação e consequência | Evidência |
| --- | --- | --- |
| Alto para uso real | Sessão é booleano no cliente; não existe barreira de autorização de servidor nem isolamento entre usuários. Não há backend atual a ser protegido, mas a demo não serve como mecanismo de segurança para futura API | `App.tsx`, `Acesso.tsx`, `backend/.gitkeep` |
| Alto | Transações somem ao recarregar/sair; não há recuperação ou backup financeiro identificado | `App.tsx` |
| Corrigido | Valores e totais usam centavos inteiros seguros, sem frações de centavo; limites validados antes da atualização | `utils/dinheiro.ts`, `utils/transacoes.ts` |
| Médio | IDs com `Date.now()` podem colidir no mesmo milissegundo; edição/exclusão por ID pode atingir registros com IDs repetidos | `App.tsx` |
| Médio | Validação concentrada na interface; data só é verificada como não vazia nos handlers; tipo usa cast, não validação de execução | `Transacoes.tsx` |
| Corrigido no estado financeiro | Operações validam coerência de sinal e tipo antes de aceitar o estado | `utils/transacoes.ts` |
| Médio | README anuncia stack não implementada; distinguir a intenção full stack do estágio demonstrativo atual | `README.md` |

Não foram identificadas configurações de CI, monitoramento, políticas de backup ou infraestrutura de produção nos arquivos examinados. Não houve auditoria de dependências contra bases de vulnerabilidades, análise do histórico Git ou validação de TLS, headers, CORS e ambiente publicado; não se afirma ausência de vulnerabilidades ou segredos no histórico. `.gitignore` exclui `.env` e variantes, mas isso não comprova ausência de segredos já versionados.

## Testes e ferramentas

`frontend/package.json` define `dev`, `build`, `lint`, `test` e `preview`. Build executa `tsc -b && vite build`; não foi executado para evitar artefatos fora dos seis documentos autorizados. ESLint combina regras JS, TypeScript, hooks e refresh; configurações TypeScript possuem verificações de símbolos não utilizados, mas não declaram `strict: true` nos arquivos de aplicação e ferramentas inspecionados.

`frontend/tests/validacaoAcesso.test.mjs` usa testes nativos Node com remoção experimental de tipos. São seis casos: e-mail válido, e-mail inválido, campos vazios, senha curta/espaços, confirmação divergente e cadastro válido. Todos passaram nesta auditoria. Não há medição de cobertura identificada.

Após a auditoria inicial, `frontend/tests/financeiro.test.mjs` passou a cobrir cálculo financeiro, formatação monetária, criação/edição/exclusão pelo reducer e preservação do estado inválido. Não há testes de interação de componentes, rotas, colisão de IDs, datas, acessibilidade automatizada ou E2E identificados. Persistência, API e isolamento continuam etapas futuras. `frontend/VALIDACAO_VISUAL.md` oferece roteiro manual de responsividade, temas, teclado e fluxos; não foi executado nesta correção.

O lint foi tentado com `npm.cmd run lint`, mas falhou antes de concluir a análise: erro de sintaxe ao carregar `node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`. Isso indica falha de carregamento da dependência local, sem confirmar a causa ou a qualidade do código da aplicação. Não houve reinstalação. Ver [[05 - Diário de Desenvolvimento]].
