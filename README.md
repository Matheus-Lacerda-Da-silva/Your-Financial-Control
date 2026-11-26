# Your Financial Control

Projeto de portfólio Full Stack Júnior para organização de finanças pessoais. O MVP prioriza simplicidade, segurança essencial e publicação.

- Frontend em React, TypeScript, Vite e Material UI, com publicação prevista no Cloudflare Pages.
- API REST em Hono e TypeScript, com Node.js no desenvolvimento e Cloudflare Workers na publicação.
- Supabase PostgreSQL, Auth e Data API por HTTPS. Na integração, o Hono usará o SDK oficial e o JWT do usuário. A RLS protege os registros por conta.

A interface atual funciona em modo demonstrativo. O Hono oferece `GET /health`. O SQL de categorias está preparado localmente e aguarda validação e aplicação autorizadas.

Consulte [frontend](frontend/README.md), [backend](backend/README.md) e [visão geral](docs/00%20-%20Vis%C3%A3o%20Geral.md) para executar o projeto e acompanhar o MVP.
