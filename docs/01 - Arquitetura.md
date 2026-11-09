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
| `frontend/src/utils/` | Validação de cadastro/e-mail, formatação de moeda/data e data local |
| `frontend/src/theme/` | Tema Material UI, preferência do sistema e localStorage |
| `frontend/tests/` | Seis testes de validação de acesso/cadastro |
| `backend/` | Apenas `.gitkeep`; backend não identificado |
| `docs/` | Notas desta auditoria; documentação e configuração Obsidian anteriores em `docs/docs/` |

## Fluxo e rotas

`main.tsx` monta `TemaProvider → App → BrowserRouter`. `App` entrega transações por props ao painel e à página de transações. Callbacks de criação, edição e exclusão atualizam o array em `useState`; não há camada de serviços ou chamada HTTP identificada em `src`.

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

| Impacto | Constatação e consequência | Evidência |
| --- | --- | --- |
| Alto para uso real | Sessão é booleano no cliente; não existe barreira de autorização de servidor nem isolamento entre usuários. Não há backend atual a ser protegido, mas a demo não serve como mecanismo de segurança para futura API | `App.tsx`, `Acesso.tsx`, `backend/.gitkeep` |
| Alto | Transações somem ao recarregar/sair; não há recuperação ou backup financeiro identificado | `App.tsx` |
| Alto | Aritmética monetária com `number`, sem política explícita de arredondamento ou limite de magnitude | `Transacoes.tsx`, `Inicio.tsx` |
| Médio | IDs com `Date.now()` podem colidir no mesmo milissegundo; edição/exclusão por ID pode atingir registros com IDs repetidos | `App.tsx` |
| Médio | Validação concentrada na interface; data só é verificada como não vazia nos handlers; tipo usa cast, não validação de execução | `Transacoes.tsx` |
| Médio | Totais usam sinal do valor; rótulos usam tipo. Objetos inconsistentes podem produzir exibição contraditória | `Inicio.tsx`, `TransacaoCard.tsx`, `Transacoes.tsx` |
| Médio | README anuncia stack não implementada; notas anteriores em outro nível de diretório podem divergir | `README.md`, `docs/docs/00 - Visão Geral.md` |

Não foram identificadas configurações de CI, monitoramento, políticas de backup ou infraestrutura de produção nos arquivos examinados. Não houve auditoria de dependências contra bases de vulnerabilidades, análise do histórico Git ou validação de TLS, headers, CORS e ambiente publicado; não se afirma ausência de vulnerabilidades ou segredos no histórico. `.gitignore` exclui `.env` e variantes, mas isso não comprova ausência de segredos já versionados.

## Testes e ferramentas

`frontend/package.json` define `dev`, `build`, `lint`, `test` e `preview`. Build executa `tsc -b && vite build`; não foi executado para evitar artefatos fora dos seis documentos autorizados. ESLint combina regras JS, TypeScript, hooks e refresh; configurações TypeScript possuem verificações de símbolos não utilizados, mas não declaram `strict: true` nos arquivos de aplicação e ferramentas inspecionados.

`frontend/tests/validacaoAcesso.test.mjs` usa testes nativos Node com remoção experimental de tipos. São seis casos: e-mail válido, e-mail inválido, campos vazios, senha curta/espaços, confirmação divergente e cadastro válido. Todos passaram nesta auditoria. Não há medição de cobertura identificada.

Não foram identificados testes de cálculo financeiro, formatos/data local, criação/edição/exclusão, colisão de IDs, rotas/sessão/logout, componentes, acessibilidade automatizada, integração ou E2E. Persistência, API e isolamento também não possuem testes identificados, e suas implementações estão ausentes. `frontend/VALIDACAO_VISUAL.md` oferece roteiro manual de responsividade, temas, teclado e fluxos; não foi executado nesta auditoria.

O lint foi tentado com `npm.cmd run lint`, mas falhou antes de concluir a análise: erro de sintaxe ao carregar `node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js`. Isso indica falha de carregamento da dependência local, sem confirmar a causa ou a qualidade do código da aplicação. Não houve reinstalação. Ver [[05 - Diário de Desenvolvimento]].
