# API do Your Financial Control

A Etapa 7.1 disponibiliza uma API Hono em TypeScript com uma rota de saúde. O frontend demonstrativo funciona de forma independente. PostgreSQL, Supabase Auth e operações financeiras ficam para etapas posteriores.

## Instalação e execução local em Node.js

Requisito: Node.js 24 ou superior. Execute os comandos em `backend/`.

```powershell
npm.cmd ci
npm.cmd run dev
```

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

Os testes usam `node:test` e `app.request()` sem abrir uma porta. O build gera `dist/` e `npm.cmd start` executa a entrada Node compilada.

## Contrato HTTP

| Situação | HTTP | JSON |
| --- | --- | --- |
| `GET /health` | 200 | `{"status":"ok"}` |
| Rota inexistente | 404 | `{"erro":{"codigo":"ROTA_NAO_ENCONTRADA","mensagem":"Rota não encontrada."}}` |
| Exceção interna | 500 | `{"erro":{"codigo":"ERRO_INTERNO","mensagem":"Ocorreu um erro interno."}}` |

`/health` indica que a aplicação está respondendo. O erro interno retorna uma mensagem genérica ao cliente.

## Execução local em Cloudflare Workers

Em `backend/`, depois de `npm.cmd ci`, inicie o Wrangler instalado no projeto:

```powershell
npm.cmd exec -- wrangler dev --local --ip 127.0.0.1 --port 8787
```

Em outro terminal, verifique as respostas:

```powershell
curl.exe -i http://127.0.0.1:8787/health
curl.exe -i http://127.0.0.1:8787/inexistente
```

A Etapa 7.1 foi verificada localmente com Wrangler 4.167.0 e workerd 1.20261123.1. Os endpoints retornaram, respectivamente, HTTP 200 e 404 com os corpos JSON documentados acima. O `wrangler.jsonc` desativa explicitamente a compatibilidade Node.js com `no_nodejs_compat` e `no_nodejs_compat_v2`. O adaptador HTTP do Node fica na entrada `src/node.ts`. A prova cobre a API atual e ocorreu sem deploy.

## Estrutura

- `src/app.ts` monta o Hono, a rota de saúde e os handlers de erro.
- `src/node.ts` inicia o servidor HTTP local com o adaptador Node.
- `src/worker.ts` exporta a mesma aplicação como entrada Fetch.
- `test/app.test.mjs` cobre sucesso, rota inexistente e exceção interna.
- `wrangler.jsonc` aponta para a entrada Worker.
