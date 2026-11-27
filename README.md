# Your Financial Control

Projeto de portfólio Full Stack Júnior para organização de finanças pessoais. O MVP prioriza simplicidade, segurança essencial e publicação.

- Frontend em React, TypeScript, Vite e Material UI, com publicação prevista no Cloudflare Pages.
- API REST em Hono e TypeScript, com Node.js no desenvolvimento e Cloudflare Workers na publicação.
- Supabase Auth por HTTPS com o SDK oficial no frontend e no Hono. O CRUD de categorias usa a Data API com RLS no PostgreSQL.

O frontend usa autenticação real e confirma a identidade em `GET /api/v1/me`. O CRUD de categorias está implementado no React e no Hono e foi verificado com mocks. A integração real depende da aplicação autorizada da migration de categorias, da exposição de `yfc_privado` na Data API e do ensaio em ambiente de teste. Transações, metas e aportes ficam em memória.

Consulte [frontend](frontend/README.md), [backend](backend/README.md) e [visão geral](docs/00%20-%20Vis%C3%A3o%20Geral.md) para executar o projeto e acompanhar o MVP.
