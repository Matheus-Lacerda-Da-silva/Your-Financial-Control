# API do Your Financial Control

A API Hono em TypeScript oferece `GET /health`, `GET /api/v1/me` e o CRUD de categorias. As rotas protegidas validam o token de acesso pelo Supabase Auth via HTTPS usando `@supabase/supabase-js`. O ambiente local usa Node.js e a publicação está prevista para Cloudflare Workers.

## Instalação e execução local em Node.js

Requisito: Node.js 24 ou superior. Execute os comandos em `backend/`.

```powershell
npm.cmd ci
npm.cmd run dev
```

Para usar a rota protegida, copie `.env.example` para `.env` antes de iniciar. Preencha `SUPABASE_URL` com a URL HTTPS do projeto e `SUPABASE_PUBLISHABLE_KEY` com a chave publicável, que começa com `sb_publishable_`. Os scripts `dev` e `start` carregam o arquivo quando presente.

Para chamadas do frontend no navegador, informe em `FRONTEND_ORIGINS` as origens exatas separadas por vírgulas, sem barra final. Use `FRONTEND_ORIGINS=http://localhost:5173` se o Vite for aberto nesse endereço. Reinicie o backend após mudar o arquivo. O CORS permite `Authorization` em `GET /api/v1/me` e permite `Authorization` e `Content-Type` nas rotas de categorias. A lista vazia deixa o acesso via CORS desabilitado. No Wrangler local, use a mesma variável em `.dev.vars`.

O servidor escuta em `127.0.0.1:3000`. Para mudar a porta, defina `$env:PORT` antes de iniciar. O modo de desenvolvimento reinicia o servidor quando os arquivos mudam.

```powershell
curl.exe -i http://127.0.0.1:3000/health
curl.exe -i http://127.0.0.1:3000/inexistente
```

## Verificações e execução compilada

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

Os testes usam `node:test` e `app.request()` com respostas simuladas do Supabase Auth e da Data API. O build gera `dist/` e `npm.cmd start` executa a entrada Node compilada.

## Contrato HTTP

| Situação | HTTP | JSON |
| --- | --- | --- |
| `GET /health` | 200 | `{"status":"ok"}` |
| `GET /api/v1/me` com token válido | 200 | `{"id":"id-do-usuario"}` |
| Autenticação ausente ou inválida | 401 | `{"erro":{"codigo":"NAO_AUTENTICADO","mensagem":"Autenticação necessária ou inválida."}}` |
| Rota inexistente | 404 | `{"erro":{"codigo":"ROTA_NAO_ENCONTRADA","mensagem":"Rota não encontrada."}}` |
| Exceção interna | 500 | `{"erro":{"codigo":"ERRO_INTERNO","mensagem":"Ocorreu um erro interno."}}` |
| Falha na consulta ao Supabase Auth | 502 | `{"erro":{"codigo":"AUTENTICACAO_INDISPONIVEL","mensagem":"Não foi possível consultar o serviço de autenticação."}}` |

`/health` é pública e funciona mesmo sem configuração do Supabase. Nas rotas protegidas, envie `Authorization: Bearer <token>`. O middleware chama `getUser(token)` e disponibiliza o ID retornado e o JWT validado no contexto da requisição. A rota de identidade funciona independentemente da migration de categorias.

### Categorias

Cada categoria retornada contém `id`, `nome` e `tipo`. O tipo pode ser `receita` ou `despesa`.

| Rota | JSON de entrada | Resposta |
| --- | --- | --- |
| GET `/api/v1/categorias` | — | 200 com `{ categorias: [...] }`, em ordem de cadastro |
| POST `/api/v1/categorias` | `{ nome, tipo }` | 201 com a categoria |
| PATCH `/api/v1/categorias/:id` | `{ nome?, tipo? }`, com pelo menos um campo | 200 com a categoria |
| DELETE `/api/v1/categorias/:id` | — | 204 sem corpo |

As respostas privadas usam `Cache-Control: no-store`. Os erros de categorias seguem `{ erro: { codigo, mensagem } }`. O status 400 cobre entrada inválida, 401 cobre sessão rejeitada e 404 vale tanto para ID inexistente quanto para linha invisível pela RLS. O status 409 indica nome duplicado no mesmo tipo ou vínculo com transação gravada. Configuração inválida ou exceção interna retorna 500. Falhas do Supabase retornam 502.

O Hono encaminha a chave publicável e o JWT validado à Data API no schema `yfc_privado`. O PostgreSQL gera o UUID, atribui o proprietário com `auth.uid()` e aplica normalização, unicidade e RLS. Para usar as rotas, o projeto Supabase deve ter as duas migrations do repositório aplicadas e `yfc_privado` em **Exposed schemas**. O CRUD foi validado no Sandbox pela Data API direta, pelo Hono em Node e pelo Worker local.

## Execução local em Cloudflare Workers

Para testar a rota com um token, copie `.env.example` para `.dev.vars` e preencha as mesmas variáveis. O Wrangler entrega esses valores aos bindings do Worker. Os arquivos locais de ambiente são ignorados pelo Git.

Em `backend/`, depois de `npm.cmd ci`, inicie o Wrangler instalado no projeto.

```powershell
npm.cmd exec -- wrangler dev --local --ip 127.0.0.1 --port 8787
```

Em outro terminal, verifique as respostas:

```powershell
curl.exe -i http://127.0.0.1:8787/health
curl.exe -i http://127.0.0.1:8787/inexistente
curl.exe -i http://127.0.0.1:8787/api/v1/me
```

A Etapa 7.1 verificou as rotas de saúde e rota inexistente localmente em Wrangler 4.167.0 e workerd 1.20261123.1, com HTTP 200 e 404. O `wrangler.jsonc` desativa explicitamente a compatibilidade Node.js com `no_nodejs_compat` e `no_nodejs_compat_v2`. O adaptador HTTP do Node fica na entrada `src/node.ts`. No ensaio de categorias, o Worker local confirmou autenticação, CRUD, isolamento entre contas e exclusão com HTTP `204` sem corpo.

## Estrutura

- `src/app.ts` monta as rotas e os handlers de erro do Hono.
- `src/autenticacao.ts` valida o token e disponibiliza o ID e o JWT no contexto.
- `src/categorias.ts` valida e executa o CRUD pela Data API.
- `src/supabase.ts` configura o SDK por requisição com a chave publicável e sem persistência de sessão.
- `src/node.ts` inicia o servidor HTTP local com o adaptador Node.
- `src/worker.ts` exporta a mesma aplicação como entrada Fetch.
- `test/app.test.mjs` cobre sucesso, rota inexistente e exceção interna.
- `test/autenticacao.test.mjs` cobre o contrato da rota protegida com mocks.
- `wrangler.jsonc` aponta para a entrada Worker.
