-- Consultas somente de leitura para executar após a aplicação autorizada.

-- Esperado: quatro tabelas, todas com RLS ativo e nenhuma política.
select c.relname as tabela, c.relrowsecurity as rls,
       (select count(*) from pg_policy p where p.polrelid = c.oid) as politicas
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'yfc_privado' and c.relkind = 'r'
order by c.relname;

select table_name, column_name, data_type, is_nullable, column_default,
       is_identity, identity_generation, collation_name
from information_schema.columns
where table_schema = 'yfc_privado'
order by table_name, ordinal_position;

select c.relname as tabela, k.conname as restricao, k.convalidated as validada,
       pg_get_constraintdef(k.oid) as definicao
from pg_constraint k
join pg_class c on c.oid = k.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'yfc_privado'
order by c.relname, k.conname;

select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'yfc_privado'
order by tablename, indexname;

-- Esperado: todos os indicadores de acesso dos papéis clientes devem ser false.
with papeis(papel) as (values ('anon'), ('authenticated'))
select p.papel, n.nspname as schema,
       has_schema_privilege(p.papel::name, n.oid, 'USAGE, CREATE') as acesso
from papeis p
cross join pg_namespace n
where n.nspname = 'yfc_privado'
order by p.papel;

with papeis(papel) as (values ('anon'), ('authenticated'))
select p.papel, c.relname as objeto, c.relkind as tipo,
       case c.relkind
         when 'r' then has_table_privilege(
           p.papel::name, c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN'
         ) or has_any_column_privilege(p.papel::name, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')
         when 'S' then has_sequence_privilege(p.papel::name, c.oid, 'USAGE, SELECT, UPDATE')
       end as acesso
from papeis p
cross join pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'yfc_privado' and c.relkind in ('r', 'S')
order by p.papel, c.relkind, c.relname;

-- Inventário de defaults globais e locais do proprietário do schema.
-- A lista de schemas expostos pela Data API é conferida à parte no Dashboard.
select r.rolname as papel_criador, coalesce(n.nspname, '(global)') as escopo,
       d.defaclobjtype as tipo, d.defaclacl as privilegios
from pg_default_acl d
join pg_roles r on r.oid = d.defaclrole
left join pg_namespace n on n.oid = d.defaclnamespace
where d.defaclrole = (select nspowner from pg_namespace where nspname = 'yfc_privado')
  and (d.defaclnamespace = 0 or n.nspname = 'yfc_privado')
order by escopo, tipo;
