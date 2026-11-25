-- Etapa 7.2.4.2. O login fica reservado para a ativação operacional.
create role yfc_hono login noinherit nosuperuser nocreatedb nocreaterole
  noreplication nobypassrls connection limit 0 password null;
create role yfc_executor nologin noinherit nosuperuser nocreatedb nocreaterole
  noreplication nobypassrls;

revoke all on schema yfc_privado from public, anon, authenticated, service_role, yfc_hono;
revoke all on all tables in schema yfc_privado from public, anon, authenticated, service_role, yfc_hono;
revoke all on all sequences in schema yfc_privado from public, anon, authenticated, service_role, yfc_hono;
revoke all on all routines in schema yfc_privado from public, anon, authenticated, service_role, yfc_hono;

grant usage on schema yfc_privado to yfc_executor;

-- O implantador resolve auth.uid() ao criar as políticas. O executor usa
-- a expressão armazenada. Validar em Cloud a execução sem USAGE em auth.
-- Uma futura chamada direta à função exige análise própria de resolução.
do $$
begin
  if not has_function_privilege('yfc_executor', 'auth.uid()'::regprocedure, 'EXECUTE') then
    raise exception 'yfc_executor precisa de EXECUTE efetivo em auth.uid() para as políticas.';
  end if;
end
$$;

-- INSERT por coluna permite UUID estável e usa os defaults de ordem e criação.
-- A identidade é gerada pelo INSERT. Não há chamadas diretas à sequência.
grant select, delete on yfc_privado.categorias to yfc_executor;
grant insert (id, usuario_id, nome, nome_chave, tipo)
  on yfc_privado.categorias to yfc_executor;
grant update (nome, nome_chave, tipo)
  on yfc_privado.categorias to yfc_executor;

grant select, delete on yfc_privado.transacoes to yfc_executor;
grant insert (id, usuario_id, categoria_id, tipo, descricao, valor_centavos, data)
  on yfc_privado.transacoes to yfc_executor;
grant update (categoria_id, tipo, descricao, valor_centavos, data)
  on yfc_privado.transacoes to yfc_executor;

grant select, delete on yfc_privado.metas to yfc_executor;
grant insert (id, usuario_id, nome, objetivo_centavos, reserva_centavos, data_inicio, data_limite)
  on yfc_privado.metas to yfc_executor;
grant update (nome, objetivo_centavos, data_limite)
  on yfc_privado.metas to yfc_executor;

grant select, delete on yfc_privado.aportes to yfc_executor;
grant insert (id, usuario_id, meta_id, valor_centavos, data)
  on yfc_privado.aportes to yfc_executor;

-- A RLS já está habilitada. O executor é distinto dos donos das tabelas.
-- FORCE fica para revisão do fluxo administrativo e de recuperação.
create policy categorias_select_proprio on yfc_privado.categorias
  for select to yfc_executor
  using (usuario_id = (select auth.uid()));
create policy categorias_insert_proprio on yfc_privado.categorias
  for insert to yfc_executor
  with check (usuario_id = (select auth.uid()));
create policy categorias_update_proprio on yfc_privado.categorias
  for update to yfc_executor
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy categorias_delete_proprio on yfc_privado.categorias
  for delete to yfc_executor
  using (usuario_id = (select auth.uid()));

create policy transacoes_select_proprio on yfc_privado.transacoes
  for select to yfc_executor
  using (usuario_id = (select auth.uid()));
create policy transacoes_insert_proprio on yfc_privado.transacoes
  for insert to yfc_executor
  with check (usuario_id = (select auth.uid()));
create policy transacoes_update_proprio on yfc_privado.transacoes
  for update to yfc_executor
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy transacoes_delete_proprio on yfc_privado.transacoes
  for delete to yfc_executor
  using (usuario_id = (select auth.uid()));

create policy metas_select_proprio on yfc_privado.metas
  for select to yfc_executor
  using (usuario_id = (select auth.uid()));
create policy metas_insert_proprio on yfc_privado.metas
  for insert to yfc_executor
  with check (usuario_id = (select auth.uid()));
create policy metas_update_proprio on yfc_privado.metas
  for update to yfc_executor
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy metas_delete_proprio on yfc_privado.metas
  for delete to yfc_executor
  using (usuario_id = (select auth.uid()));

create policy aportes_select_proprio on yfc_privado.aportes
  for select to yfc_executor
  using (usuario_id = (select auth.uid()));
create policy aportes_insert_proprio on yfc_privado.aportes
  for insert to yfc_executor
  with check (usuario_id = (select auth.uid()));
create policy aportes_delete_proprio on yfc_privado.aportes
  for delete to yfc_executor
  using (usuario_id = (select auth.uid()));
