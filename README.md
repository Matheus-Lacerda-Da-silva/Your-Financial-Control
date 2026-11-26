# Your Financial Control

Projeto de portfólio Full Stack Júnior para organização de finanças pessoais. O MVP prioriza simplicidade, segurança essencial e publicação.

- Frontend em React, TypeScript, Vite e Material UI, com publicação prevista no Cloudflare Pages.
- API REST em Hono e TypeScript, com Node.js no desenvolvimento e Cloudflare Workers na publicação.
- Supabase Auth por HTTPS com o SDK oficial no frontend e no Hono. PostgreSQL e Data API com RLS fazem parte da integração financeira prevista.

O frontend usa autenticação real e confirma a identidade em `GET /api/v1/me`. O Hono também oferece `GET /health`. Os dados financeiros ficam em memória e a migration de categorias aguarda aplicação autorizada.

Consulte [frontend](frontend/README.md), [backend](backend/README.md) e [visão geral](docs/00%20-%20Vis%C3%A3o%20Geral.md) para executar o projeto e acompanhar o MVP.
