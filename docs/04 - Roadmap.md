# Roadmap do MVP

1. **Preparar o banco para categorias.** A migration inicial foi aplicada no YFC-Development conforme registro em [[02 - Banco de Dados]]. A versão de segurança substituta está pronta localmente. Após autorização, confirme o histórico do destino e valide a migration em ambiente descartável, incluindo teste direto da Data API.
2. **Integrar autenticação e categorias.** Cadastro com confirmação por e-mail, login, acesso ao painel, logout e descarte de uma transação em memória foram confirmados no navegador. A restauração de sessão e a consulta a `GET /api/v1/me` estão implementadas. As rotas persistentes de categorias e seus testes de isolamento ficam para a próxima etapa.
3. **Integrar transações e resumo.** Proteger no banco os limites independentes de receitas e despesas antes de liberar escrita. Preservar centavos exatos, vínculo de categoria e ordem de cadastro.
4. **Integrar metas e aportes.** Proteger de forma atômica objetivo, reserva, acumulado e datas antes de liberar escrita. Preservar a independência do saldo.
5. **Publicar.** Após autorização, publicar no Cloudflare Pages e Workers, configurar origens e redirecionamentos e testar o fluxo publicado. Priorizar recursos gratuitos. Validar os fluxos e a interface conforme o [roteiro visual](../frontend/VALIDACAO_VISUAL.md).

Ver [[01 - Arquitetura]], [[03 - Regras Financeiras]] e [[05 - Diário de Desenvolvimento]].
