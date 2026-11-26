-- Somente leitura. Após a migration, espere quatro tabelas com RLS ativo.
select tablename, rowsecurity from pg_tables
where schemaname = 'yfc_privado' order by tablename;

-- Espere quatro políticas em categorias e apenas authenticated.
select tablename, cmd, roles, qual, with_check from pg_policies
where schemaname = 'yfc_privado' order by tablename, cmd;

-- Espere zero divergências de privilégios efetivos, incluindo herança de PUBLIC.
with papeis(papel) as (
  values ('anon'), ('authenticated'), ('service_role')
), operacoes(privilegio) as (
  values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
         ('TRUNCATE'), ('REFERENCES'), ('TRIGGER'), ('MAINTAIN')
), verificacoes as (
  select papel, 'schema' as objeto, 'USAGE' as privilegio,
         has_schema_privilege(papel, 'yfc_privado', 'USAGE') as efetivo,
         papel = 'authenticated' as esperado
  from papeis
  union all
  select papel, 'schema', 'CREATE',
         has_schema_privilege(papel, 'yfc_privado', 'CREATE'), false from papeis
  union all
  select papel, c.relname, privilegio, has_table_privilege(papel, c.oid, privilegio),
         papel = 'authenticated' and c.relname = 'categorias'
           and privilegio in ('SELECT', 'DELETE')
  from papeis cross join operacoes cross join pg_class c
  where c.relnamespace = 'yfc_privado'::regnamespace and c.relkind = 'r'
  union all
  select papel, c.relname || '.' || a.attname, privilegio,
         has_column_privilege(papel, c.oid, a.attnum, privilegio),
         papel = 'authenticated' and c.relname = 'categorias'
           and (privilegio = 'SELECT' or
                (privilegio in ('INSERT', 'UPDATE') and a.attname in ('nome', 'tipo')) or
                (privilegio = 'INSERT' and a.attname = 'id'))
  from papeis cross join operacoes cross join pg_class c
  join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  where c.relnamespace = 'yfc_privado'::regnamespace and c.relkind = 'r'
    and privilegio in ('SELECT', 'INSERT', 'UPDATE', 'REFERENCES')
  union all
  select papel, c.relname, privilegio,
         has_sequence_privilege(papel, c.oid, privilegio), false
  from papeis cross join (values ('USAGE'), ('SELECT'), ('UPDATE')) s(privilegio)
  cross join pg_class c
  where c.relnamespace = 'yfc_privado'::regnamespace and c.relkind = 'S'
  union all
  select papel, 'normalizar_categoria()', 'EXECUTE',
         has_function_privilege(papel, 'yfc_privado.normalizar_categoria()', 'EXECUTE'), false
  from papeis
)
select papel, objeto, privilegio, efetivo, esperado
from verificacoes where efetivo is distinct from esperado;
