-- Confirme que a versão 20261125000000 ainda não foi aplicada.
revoke all on schema yfc_privado from public, anon, authenticated, service_role;
revoke all on all tables in schema yfc_privado from public, anon, authenticated, service_role;
revoke all on all sequences in schema yfc_privado from public, anon, authenticated, service_role;

create collation yfc_privado.categoria_pt_br (provider = icu, locale = 'pt-BR');

create function yfc_privado.normalizar_categoria()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  -- Espaços do ECMAScript, incluindo NBSP e BOM.
  new.nome := btrim(regexp_replace(normalize(new.nome, NFC) collate pg_catalog."C",
    U&'[\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]+', ' ', 'g'));
  new.nome_chave := lower(new.nome collate yfc_privado.categoria_pt_br);
  return new;
end;
$$;

revoke all on function yfc_privado.normalizar_categoria()
  from public, anon, authenticated, service_role;

create trigger categorias_normalizar_nome
  before insert or update of nome, nome_chave on yfc_privado.categorias
  for each row execute function yfc_privado.normalizar_categoria();

-- Normaliza categorias existentes e deixa a restrição UNIQUE detectar colisões.
update yfc_privado.categorias set nome = nome;

alter table yfc_privado.categorias alter column usuario_id set default auth.uid();

grant usage on schema yfc_privado to authenticated;
grant select, delete on yfc_privado.categorias to authenticated;
grant insert (id, nome, tipo) on yfc_privado.categorias to authenticated;
grant update (nome, tipo) on yfc_privado.categorias to authenticated;

create policy categorias_select_proprio on yfc_privado.categorias
  for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy categorias_insert_proprio on yfc_privado.categorias
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy categorias_update_proprio on yfc_privado.categorias
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy categorias_delete_proprio on yfc_privado.categorias
  for delete to authenticated
  using (usuario_id = (select auth.uid()));
