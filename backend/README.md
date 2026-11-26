# API do Your Financial Control

A API Hono em TypeScript oferece `GET /health` e `GET /api/v1/me`. A rota protegida valida o token de acesso pelo Supabase Auth via HTTPS usando `@supabase/supabase-js`. O ambiente local usa Node.js e a publicação está prevista para Cloudflare Workers.

## Instalação e execução local em Node.js

Requisito: Node.js 24 ou superior. Execute os comandos em `backend/`.

```powershell
npm.cmd ci
npm.cmd run dev
```

Para usar a rota protegida, copie `.env.example` para `.env` antes de iniciar. Preencha `SUPABASE_URL` com a URL HTTPS do projeto e `SUPABASE_PUBLISHABLE_KEY` com a chave publicável, que começa com `sb_publishable_`. Os scripts `dev` e `start` carregam o arquivo quando presente.

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

Os testes usam `node:test` e `app.request()`. Os testes de autenticação simulam as respostas HTTP do Supabase com valores fictícios. O build gera `dist/` e `npm.cmd start` executa a entrada Node compilada.

## Contrato HTTP

| Situação | HTTP | JSON |
| --- | --- | --- |
| `GET /health` | 200 | `{"status":"ok"}` |
| `GET /api/v1/me` com token válido | 200 | `{"id":"id-do-usuario"}` |
| Autenticação ausente ou inválida | 401 | `{"erro":{"codigo":"NAO_AUTENTICADO","mensagem":"Autenticação necessária ou inválida."}}` |
| Rota inexistente | 404 | `{"erro":{"codigo":"ROTA_NAO_ENCONTRADA","mensagem":"Rota não encontrada."}}` |
| Exceção interna | 500 | `{"erro":{"codigo":"ERRO_INTERNO","mensagem":"Ocorreu um erro interno."}}` |
| Falha na consulta ao Supabase Auth | 502 | `{"erro":{"codigo":"AUTENTICACAO_INDISPONIVEL","mensagem":"Não foi possível consultar o serviço de autenticação."}}` |

`/health` é pública e funciona mesmo sem configuração do Supabase. Para `/api/v1/me`, envie o token de acesso da sessão no cabeçalho `Authorization: Bearer <token>`. O middleware pede ao Supabase Auth que valide o token com `getUser(token)` e guarda o ID retornado no contexto da requisição. A chave publicável identifica o projeto na chamada ao Supabase. Configuração local ausente ou inválida retorna 500 com a mensagem genérica acima. A rota de identidade funciona independentemente da migration de categorias.

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

A Etapa 7.1 foi verificada localmente com Wrangler 4.167.0 e workerd 1.20261123.1. Os endpoints retornaram, respectivamente, HTTP 200 e 404 com os corpos JSON documentados acima. O `wrangler.jsonc` desativa explicitamente a compatibilidade Node.js com `no_nodejs_compat` e `no_nodejs_compat_v2`. O adaptador HTTP do Node fica na entrada `src/node.ts`. A prova cobre a API atual e ocorreu sem deploy.

## Estrutura

- `src/app.ts` monta as rotas e os handlers de erro do Hono.
- `src/autenticacao.ts` valida o token e disponibiliza o ID no contexto.
- `src/supabase.ts` configura o SDK por requisição com a chave publicável e sem persistência de sessão.
- `src/node.ts` inicia o servidor HTTP local com o adaptador Node.
- `src/worker.ts` exporta a mesma aplicação como entrada Fetch.
- `test/app.test.mjs` cobre sucesso, rota inexistente e exceção interna.
- `test/autenticacao.test.mjs` cobre o contrato da rota protegida com mocks.
- `wrangler.jsonc` aponta para a entrada Worker.
