# Arquitetura

## Arquitetura aprovada para o MVP

O frontend React, TypeScript, Vite e Material UI será publicado no Cloudflare Pages. A API REST Hono em TypeScript usa Node.js localmente e Cloudflare Workers na publicação.

O backend valida o JWT das rotas protegidas com `auth.getUser(token)` por HTTPS, usando `@supabase/supabase-js` e a chave publicável. Cada requisição guarda o ID autenticado e o JWT no seu contexto Hono. O Node lê a configuração do ambiente e o Worker recebe os mesmos campos por bindings. `GET /health` é pública e independente do Supabase.

O frontend usa o SDK do Supabase para restaurar e renovar a sessão. O painel envia o access token ao Hono e compara o ID da resposta de `GET /api/v1/me` com o ID da sessão. As rotas de categorias encaminham o JWT à Data API por um cliente criado para cada requisição. Os grants limitam operações e colunas, a RLS filtra pelo proprietário e o PostgreSQL aplica normalização, unicidade e integridade dos vínculos gravados.

O primeiro acesso ao painel exige confirmação da API. Durante a revalidação de uma conta já confirmada, as páginas permanecem montadas e os formulários preservam os rascunhos. Uma sessão rejeitada bloqueia o conteúdo. Logout e troca de conta desmontam o painel e cancelam a consulta anterior. O frontend exige HTTPS para enviar o JWT a destinos remotos e aceita HTTP apenas em endereços de loopback.

O painel carrega o catálogo após confirmar a identidade, descarta respostas de contas anteriores e consulta novamente a lista quando o resultado de uma escrita é incerto. Ao renovar o token da mesma conta, mantém rascunhos, lançamentos e a proteção de vínculos da gravação em andamento. A conclusão de uma gravação do token anterior aciona uma releitura com a sessão vigente. Se a leitura ainda não confirmar uma exclusão ou troca de tipo incerta, a aba mantém o bloqueio de novos vínculos para a categoria.

O SDK seleciona `yfc_privado` explicitamente. O CRUD usa o papel `authenticated`. A integração foi verificada no Sandbox por chamadas diretas à Data API e pelo Hono em Node e no Worker local. No Development, o usuário concluiu o CRUD pela interface React. Ver [[02 - Banco de Dados]].

## Evolução das metas — 2026-11-13

`utils/evolucaoMetas.ts` valida meta/aportes vinculados e produz competências acumuladas com `resumirMeta.referencia`, `somarCentavos` e calendário civil existentes. Não chama a validação de criação que rejeitaria metas vencidas. Não altera entrada nem depende de transações. `indicesRotulosMeta` reduz apenas rótulos, preservando extremos; todos os pontos permanecem no SVG e na tabela (até 120 meses).

`SecaoEvolucaoMetas` recebe props somente leitura de Início e guarda apenas o ID selecionado. Se o ID desaparecer, sincroniza a escolha com a primeira meta restante. Dados derivados são calculados no render; usa a data diária já disponível sem efeitos/timers adicionais. O gráfico interno tem chave pelo ID, reiniciando a expansão nativa da tabela ao trocar a meta. `details/summary` oferece expansão acessível sem estado React; SVG usa IDs únicos, título/descrição, hachura futura, linhas e marcadores diferentes. Resumo financeiro tem anúncio polite. Uma superfície glass externa, sem filtros internos/animação. Componentes existentes e reducers preservados.

Verificação: 59 testes, lint e build/TypeScript aprovados; JS principal 633,09 kB (191,44 kB gzip), mantendo aviso de chunk acima de 500 kB. Interação/contraste/leitor de tela não verificados no navegador. Sem infraestrutura de testes de componentes/E2E adicionada.

## Visão Geral — seção Suas metas (2026-11-12)

A página Início apresenta até quatro metas, na ordem atual do estado, entre os cartões financeiros e Últimas transações. O componente independente SecaoSuasMetas mostra nome, objetivo, acumulado, percentual, barra acessível e situação; o link “Ver todas as metas” permanece disponível no estado vazio. Não há gráficos nem espaços reservados.

App fornece metas e aportes por props somente leitura. A apresentação reutiliza resumirMeta e formatarMoeda; useDataMetas foi extraído para frontend/src/hooks e é compartilhado por Início e Metas, preservando atualização na virada do dia, foco/visibilidade e limpeza de timer/listeners. Uma superfície glass externa adicional envolve cartões opacos, sem novos tokens. Reducer, cálculos, Transações, Categorias e navegação global não foram alterados. Dados continuam temporários e aportes independentes do saldo.

Verificação desta etapa: 44 testes aprovados, incluindo independência do estado financeiro; TypeScript (npx.cmd --no-install tsc -b) e build aprovados. Bundle principal: 617,01 kB (187,03 kB gzip), com aviso acima de 500 kB. Lint não concluiu: SyntaxError no carregamento de node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js. Dependências não foram reinstaladas. Revisão estática React: props tipadas, chaves por ID, resumo derivado sem estado duplicado, seção/títulos semânticos, progresso nomeado e hook com limpeza. Sem inspeção no navegador ou testes automatizados de componentes/hook; aprovação visual e funcional pendente. Sem commit ou push.


## Metas — implementação de 2026-11-12

`App.tsx` mantém um segundo `useReducer`, exclusivo de Metas, sem alterar `estadoFinanceiro.ts`. `/metas` está sob `LayoutPrincipal` e a sessão demonstrativa. `Sidebar.tsx` recebeu apenas o novo item. Sair limpa ambos os estados; recarregar também perde os dados. Dashboard, Transações, Categorias, tema e superfícies compartilhadas foram preservados.

- `types/meta.ts`: Meta, Aporte, EstadoMetas, EdicaoMeta e SituacaoMeta.
- `utils/datasMetas.ts`: validação de calendário civil e enumeração inclusiva de até 120 meses, sem interpretação UTC.
- `utils/metas.ts`: IDs criptográficos, validação, distribuição exata e seletores de progresso/situação/roteiros.
- `utils/estadoMetas.ts`: operações puras e reducer; erros preservam os arrays anteriores. Edição aplica lista explícita de campos permitidos. Exclusão de meta remove seus aportes na mesma operação; exclusão individual valida o vínculo.
- `pages/Metas.tsx`: composição e referência diária atualizada na montagem, retorno de foco/visibilidade e virada do dia; timer e listeners têm limpeza.
- Componentes locais: CartaoMeta, FormularioMeta, DetalhesMeta e RoteiroMensalMeta. Uma superfície glass externa e cartões opacos internos, sem novos tokens ou efeitos globais.

IDs de metas/aportes são gerados fora do reducer com `crypto.randomUUID` ou bytes criptográficos, com colisões recusadas. Não foi reutilizado nem corrigido o `Date.now()` das transações. Os callbacks pré-validam e o reducer revalida o estado mais recente, seguindo o padrão existente. Uma futura integração com transações deve coordenar operações explicitamente para evitar dupla contabilização; não existe vínculo automático agora.

Verificação nesta máquina: 44 testes, lint e build/TypeScript aprovados. Bundle principal 614,41 kB (186,65 kB gzip), com aviso acima de 500 kB. O erro histórico local do scope-manager não ocorreu. Sem testes de componentes/E2E ou inspeção no navegador nesta entrega.

Relacionadas: [[00 - Visão Geral]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[04 - Roadmap]], [[05 - Diário de Desenvolvimento]].

## Estrutura confirmada

| Caminho | Responsabilidade |
| --- | --- |
| `frontend/` | Aplicação React/TypeScript e ferramentas locais |
| `frontend/src/main.tsx` | Montagem com React StrictMode e TemaProvider |
| `frontend/src/App.tsx` | Rotas públicas e controle de acesso ao painel |
| `frontend/src/Painel.tsx` | Verificação da identidade na API e estado financeiro em memória por conta |
| `frontend/src/pages/` | Início, transações, categorias, acesso e cadastro |
| `frontend/src/layouts/` | Layout de acesso e layout principal com Outlet |
| `frontend/src/components/` | Menu, campo de senha, cartão de transação; Navbar existe mas não é utilizada pelo fluxo principal inspecionado |
| `frontend/src/utils/` | Validação de cadastro/e-mail, dinheiro em centavos, resumo e reducer de transações, formatação e datas |
| `frontend/src/theme/` | Tema Material UI, preferência do sistema e localStorage |
| `frontend/tests/` | Testes de acesso/cadastro e regras financeiras/operações em memória |
| `backend/` | API Hono em TypeScript, entradas Node e Workers e testes de rotas |
| `docs/` | Raiz única do cofre, com seis notas oficiais e configurações em `.obsidian/` |

## Orientações para evolução incremental

O projeto está em estágio inicial. Preservar o código funcional e evoluir por mudanças pequenas, com validação do fluxo afetado. Reutilizar os componentes, layouts e tema existentes; extrair componentes e regras compartilhadas quando houver benefício concreto, evitando reescritas amplas.

A direção visual provisória é glassmorphism em cinza e verde, conforme [[00 - Visão Geral]]. Início usa `theme.glass`, definido e tipado em `TemaProvider.tsx`, e os componentes `SuperficieVidro.tsx` e `CartaoResumo.tsx`. Transações também reutiliza `SuperficieVidro` nos dois painéis de cadastro e histórico desde 2026-11-11, sem mudanças no tema ou no componente compartilhado. O efeito mantém fallback opaco por padrão, transparência e blur de 8 px dentro de `@supports`, fundo local cinza/grafite e destaque esmeralda, sem override global novo de Card. Espaçamentos reutilizam a escala MUI. Não há filtros aninhados nem animações adicionadas. A inspeção no navegador, incluindo contraste efetivo, responsividade, teclado e desempenho, permanece pendente.

Em Transações, o cadastro continua visível e mantém ordem de campos e handlers. A tabela tem contêiner de rolagem focável, quebra de textos e valores tabulares; cartões móveis usam superfície opaca sem filtro. Diálogos têm títulos associados, exclusão com descrição associada e foco inicial em Cancelar, edição com foco inicial na descrição e alerta interno persistente enquanto aberta. Escape e restauração de foco seguem o MUI; após exclusão há fallback para o título do histórico quando o foco fica no body. Cálculos, conversão, datas, reducer e ordem dos registros não foram alterados. Esses comportamentos foram inspecionados no código e ainda exigem validação interativa conforme `frontend/VALIDACAO_VISUAL.md`.

A autenticação do frontend está integrada à API Hono. A persistência financeira e os testes de isolamento em PostgreSQL seguem no [[04 - Roadmap]]. As evidências do banco estão em [[02 - Banco de Dados]].

## Fluxo e rotas

Na Etapa 4, `LayoutPrincipal.tsx` renderiza o cabeçalho, com menu e marca compacta abaixo de `md` e ações de Tema e Sair alinhadas à direita. Os grupos podem quebrar em linhas em larguras reduzidas. `Sidebar.tsx` usa a marca completa nos Drawers permanente e temporário e mantém a ordem Visão geral, Transações, Categorias e Metas. Na Etapa 5, `MarcaYFC.tsx` importa via Vite `assets/branding/yfc-emblema-120.png`, uma cópia de 120 × 120 px (17.908 bytes) do PNG oficial. O emblema conserva seu fundo grafite nos dois temas. A variante completa renderiza a imagem decorativa a 40 px e mantém o nome visível ao lado. A compacta renderiza a imagem a 32 px com nome alternativo. A caixa mantém as dimensões quando a imagem falha e cede lugar à assinatura textual nessa mesma área. `Navbar.tsx` segue fora do fluxo de renderização.

Sidebar e cabeçalho usam superfícies opacas de `theme.glass` e luz interna discreta, sem filtros novos. `AlternadorTema.tsx` é composto no cabeçalho principal e no layout compartilhado de acesso/cadastro, sem posicionamento absoluto. `ContextoTema.ts` compartilha modo e alternância; `TemaProvider` mantém o estado único, preferência inicial e persistência opcional em `yfc-tema`. A sidebar preserva NavLink e Drawer MUI, com marcador ativo, hover e foco explícitos, botão móvel de fechar e identificação do diálogo. Ao atingir `md`, o layout fecha o estado do menu móvel para evitar manter o modal aberto no desktop.

No refinamento de Início, `theme.glass` também centraliza `luzInterna`, `sombraDestaque` e `iluminacao`. `CartaoResumo` reutiliza a propriedade `destaque` para a hierarquia do saldo, preservando sinal monetário e usando cor de erro quando negativo. Iluminação é estática e decorativa; não representa avaliação financeira. Resultados técnicos e limitações visuais estão no [[05 - Diário de Desenvolvimento]].

`main.tsx` monta `TemaProvider → App`. Após a leitura inicial da sessão, o `BrowserRouter` decide entre as rotas públicas e o painel. `Painel` coordena categorias e transações em `useReducer` com `utils/estadoFinanceiro.ts`. A operação pura `aplicarAcaoFinanceira` pré-valida callbacks para manter formulários abertos em caso de recusa. O reducer revalida sobre o estado mais recente e preserva ambos os arrays em erros. As operações reutilizam `aplicarOperacao` de `utils/transacoes.ts`.

`Categoria` contém ID string, nome e tipo. `TransacaoRegistrada` armazena `categoriaId`; `selecionarTransacoes` produz `TransacaoExibicao` com nome derivado, compatível com Início e TransacaoCard existentes, sem alterar esses componentes. O estado não duplica o nome da categoria. O PostgreSQL gera o UUID das categorias criadas pelo Hono. O frontend usa `utils/categorias.ts` para normalizar a entrada e validar vínculos com lançamentos em memória. Categorias não recebem valores financeiros e não criam lançamentos automaticamente.

Categorias usa dois painéis `SuperficieVidro`, formulário visível e lista responsiva com itens opacos, contagem de vínculos e diálogos MUI com alertas internos. Cadastro e edição de transações usam seletores compatíveis com o tipo, sem escolha automática. A lista de categorias é carregada da conta autenticada. Sair descarta a lista em memória e um novo login recupera as categorias persistidas.

| Rota | Comportamento em `App.tsx` |
| --- | --- |
| `/acesso` | Login com Supabase Auth. Com sessão, redireciona para `/` |
| `/cadastro` | Cadastro com Supabase Auth. Aguarda confirmação por e-mail quando exigida |
| `/` | Resumo financeiro sob LayoutPrincipal, condicionado à identidade confirmada |
| `/transacoes` | CRUD local sob LayoutPrincipal |
| `/categorias` | CRUD de categorias persistidas, via Hono, sob LayoutPrincipal |
| `/metas` | Metas e aportes em memória sob LayoutPrincipal |
| Outras | Redirecionamento conforme a sessão |

As rotas principais aguardam a sessão inicial e redirecionam para `/acesso` se ela estiver ausente. Sair e trocar de conta descartam o estado financeiro. Recarregar restaura a sessão quando válida, recarrega o catálogo da conta e recria vazios os registros mantidos apenas em memória. BrowserRouter exige suporte a fallback para `index.html` para rotas diretas na hospedagem.

## Autenticação e APIs

Na Etapa 6, `LayoutAcesso.tsx` usa duas colunas iguais a partir de `md`. O painel institucional ocupa toda a coluna esquerda com o gradiente histórico `linear-gradient(145deg, #083e38, #087f68)` nos dois temas. A variante institucional de `MarcaYFC` exibe o emblema de 80 px e o nome completo. Abaixo de `md`, o layout usa uma coluna com a marca compacta junto ao alternador de tema. Os formulários compartilham uma superfície opaca com borda e sombra de `theme.glass`. O favicon `public/favicon-yfc-32.png` foi gerado do emblema oficial de 120 × 120 px com redimensionamento bicúbico em PowerShell e `System.Drawing`, preservando o canal alfa. Veja o roteiro em `frontend/VALIDACAO_VISUAL.md`.

- Acesso e cadastro mantêm as validações locais e usam `signInWithPassword` e `signUp`. Quando o cadastro retorna sem sessão, a tela orienta a confirmar o e-mail. A saída usa `signOut` no escopo local.
- `useSessao` acompanha a sessão inicial e as mudanças publicadas pelo SDK. O painel refaz a consulta à API ao renovar o token e cancela a consulta anterior. A versão da conta controla o ciclo de vida dos reducers, preservados na renovação de token da mesma conta.
- A API responde separadamente a uma sessão rejeitada e a uma falha de consulta. O CORS das rotas protegidas autoriza somente origens em `FRONTEND_ORIGINS`. Consulte [backend/README.md](../backend/README.md).
- O SDK gerencia a persistência da sessão. A senha permanece no estado do formulário até o envio ao Supabase Auth por HTTPS. Transações, metas e aportes continuam em memória e a preferência de tema usa `yfc-tema`.

## Riscos técnicos e de segurança

Os impactos abaixo registram limites e riscos técnicos da auditoria inicial. Eles não tornam backend e banco tarefas imediatas; a sequência de evolução está no [[04 - Roadmap]].

| Impacto | Constatação e consequência | Evidência |
| --- | --- | --- |
| Alto para uso real | Transações, metas e aportes têm ciclo de vida em memória e são perdidos ao recarregar ou sair | `Painel.tsx` |
| Alto | Transações somem ao recarregar/sair; não há recuperação ou backup financeiro identificado | `Painel.tsx` |
| Corrigido | Valores e totais usam centavos inteiros seguros, sem frações de centavo; limites validados antes da atualização | `utils/dinheiro.ts`, `utils/transacoes.ts` |
| Médio | IDs com `Date.now()` podem colidir no mesmo milissegundo; edição/exclusão por ID pode atingir registros com IDs repetidos | `Painel.tsx` |
| Médio | Validação concentrada na interface; data só é verificada como não vazia nos handlers; tipo usa cast, não validação de execução | `Transacoes.tsx` |
| Corrigido no estado financeiro | Operações validam coerência de sinal e tipo antes de aceitar o estado | `utils/transacoes.ts` |

Não foram identificadas configurações de CI, monitoramento, políticas de backup ou infraestrutura de produção nos arquivos examinados. Não houve auditoria de dependências contra bases de vulnerabilidades, análise do histórico Git ou validação de TLS, headers, CORS e ambiente publicado; não se afirma ausência de vulnerabilidades ou segredos no histórico. `.gitignore` exclui `.env` e variantes, mas isso não comprova ausência de segredos já versionados.

## Testes e ferramentas

`frontend/package.json` define `dev`, `build`, `lint`, `test` e `preview`. Build executa `tsc -b && vite build`; não foi executado para evitar artefatos fora dos seis documentos autorizados. ESLint combina regras JS, TypeScript, hooks e refresh; configurações TypeScript possuem verificações de símbolos não utilizados, mas não declaram `strict: true` nos arquivos de aplicação e ferramentas inspecionados.

`frontend/tests/validacaoAcesso.test.mjs` usa testes nativos Node com remoção experimental de tipos. São seis casos: e-mail válido, e-mail inválido, campos vazios, senha curta/espaços, confirmação divergente e cadastro válido. Todos passaram nesta auditoria. Não há medição de cobertura identificada.

Após a auditoria inicial, `frontend/tests/financeiro.test.mjs` passou a cobrir cálculo financeiro, formatação monetária, criação/edição/exclusão pelo reducer e preservação do estado inválido. Não há testes de interação de componentes, rotas, colisão de IDs, datas, acessibilidade automatizada ou E2E identificados. Persistência, API e isolamento continuam etapas futuras. `frontend/VALIDACAO_VISUAL.md` oferece roteiro manual de responsividade, temas, teclado e fluxos; não foi executado nesta correção.

O lint foi tentado com `npm.cmd run lint`, mas falhou antes de concluir a análise: erro de sintaxe ao carregar `node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`. Isso indica falha de carregamento da dependência local, sem confirmar a causa ou a qualidade do código da aplicação. Não houve reinstalação. Ver [[05 - Diário de Desenvolvimento]].
