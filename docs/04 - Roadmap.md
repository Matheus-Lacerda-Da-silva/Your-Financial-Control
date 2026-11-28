# Roadmap do MVP

1. **Preparar o banco para categorias — concluído.** Migrations e exposição da Data API verificadas no Sandbox e no Development. Ver [[02 - Banco de Dados]].
2. **Integrar autenticação e categorias — concluído.** CRUD persistido com isolamento por conta e validação manual no React. Ver [[05 - Diário de Desenvolvimento]].
3. **Refinar visualmente o frontend — próxima etapa.** Conferir consistência visual, responsividade e acessibilidade com o [roteiro visual](../frontend/VALIDACAO_VISUAL.md), antes de integrar a persistência de transações.
4. **Integrar transações e resumo.** Proteger no banco os limites independentes de receitas e despesas antes de liberar escrita. Preservar centavos exatos, vínculo de categoria e ordem de cadastro.
5. **Integrar metas e aportes.** Proteger de forma atômica objetivo, reserva, acumulado e datas antes de liberar escrita. Preservar a independência do saldo.
6. **Publicar.** Após autorização, publicar no Cloudflare Pages e Workers, configurar origens e redirecionamentos e testar o fluxo publicado. Priorizar recursos gratuitos. Validar os fluxos e a interface conforme o [roteiro visual](../frontend/VALIDACAO_VISUAL.md).

Ver [[01 - Arquitetura]], [[03 - Regras Financeiras]] e [[05 - Diário de Desenvolvimento]].
