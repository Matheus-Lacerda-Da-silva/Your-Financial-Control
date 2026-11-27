# Roadmap do MVP

1. **Preparar o banco para categorias.** A migration inicial foi aplicada no YFC-Development conforme registro em [[02 - Banco de Dados]]. A versão de segurança substituta está pronta localmente. Após autorização, confirme o histórico do destino e valide a migration em ambiente descartável, incluindo teste direto da Data API.
2. **Integrar autenticação e categorias.** Cadastro com confirmação por e-mail, login, acesso ao painel e logout foram confirmados no navegador. O CRUD de categorias no React e no Hono foi implementado e testado com mocks. No computador pessoal, validar persistência, grants, RLS, normalização e concorrência com contas fictícias em ambiente autorizado, incluindo o Worker e a Data API direta.
3. **Integrar transações e resumo.** Proteger no banco os limites independentes de receitas e despesas antes de liberar escrita. Preservar centavos exatos, vínculo de categoria e ordem de cadastro.
4. **Integrar metas e aportes.** Proteger de forma atômica objetivo, reserva, acumulado e datas antes de liberar escrita. Preservar a independência do saldo.
5. **Publicar.** Após autorização, publicar no Cloudflare Pages e Workers, configurar origens e redirecionamentos e testar o fluxo publicado. Priorizar recursos gratuitos. Validar os fluxos e a interface conforme o [roteiro visual](../frontend/VALIDACAO_VISUAL.md).

Ver [[01 - Arquitetura]], [[03 - Regras Financeiras]] e [[05 - Diário de Desenvolvimento]].
