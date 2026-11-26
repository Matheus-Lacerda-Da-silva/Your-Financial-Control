# Roadmap do MVP

1. **Preparar o banco para categorias.** A migration inicial foi aplicada no YFC-Development conforme registro em [[02 - Banco de Dados]]. A versão de segurança substituta está pronta localmente. Após autorização, confirme o histórico do destino e valide a migration em ambiente descartável, incluindo teste direto da Data API.
2. **Integrar autenticação e categorias.** O Hono já valida o JWT em `GET /api/v1/me` com o SDK oficial. Validar o fluxo com uma sessão do Supabase de desenvolvimento, implementar sessão no frontend e adicionar as rotas de categorias. Testar login, logout, CRUD e isolamento em Node.js e no runtime Workers.
3. **Integrar transações e resumo.** Proteger no banco os limites independentes de receitas e despesas antes de liberar escrita. Preservar centavos exatos, vínculo de categoria e ordem de cadastro.
4. **Integrar metas e aportes.** Proteger de forma atômica objetivo, reserva, acumulado e datas antes de liberar escrita. Preservar a independência do saldo.
5. **Publicar.** Após autorização, publicar no Cloudflare Pages e Workers, configurar origens e redirecionamentos e testar o fluxo publicado. Priorizar recursos gratuitos. Validar os fluxos e a interface conforme o [roteiro visual](../frontend/VALIDACAO_VISUAL.md).

Ver [[01 - Arquitetura]], [[03 - Regras Financeiras]] e [[05 - Diário de Desenvolvimento]].
