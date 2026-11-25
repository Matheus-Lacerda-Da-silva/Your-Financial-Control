-- Somente leitura. Execute após a aplicação autorizada.
-- Consultas de desvios devem retornar zero linhas. Inventários exigem revisão.
-- Execute com o papel de implantação ou registre explicitamente quem é o implantador.
select session_user, current_user, current_setting('server_version') as versao,
       current_setting('createrole_self_grant') as createrole_self_grant;

select e.papel, 'papel esperado ausente' as desvio
from (values ('anon'), ('authenticated'), ('authenticator'), ('service_role'),
             ('yfc_hono'), ('yfc_executor')) e(papel)
left join pg_roles r on r.rolname = e.papel
where r.oid is null
order by e.papel;

with esperado(papel, login, limite) as (
  values ('yfc_hono', true, 0), ('yfc_executor', false, -1)
)
select e.papel, r.rolcanlogin, r.rolconnlimit, r.rolinherit, r.rolsuper,
       r.rolcreatedb, r.rolcreaterole, r.rolreplication, r.rolbypassrls
from esperado e
left join pg_roles r on r.rolname = e.papel
where r.oid is not null and row(r.rolcanlogin, r.rolconnlimit, r.rolinherit,
       r.rolsuper, r.rolcreatedb, r.rolcreaterole, r.rolreplication, r.rolbypassrls)
  is distinct from row(e.login, e.limite, false, false, false, false, false, false);
-- pg_roles não permite verificar a senha.

-- Memberships diretos, incluindo os de papéis intermediários a caminho do runtime.
select membro.rolname as membro, papel.rolname as papel, g.rolname as concedente,
       a.admin_option, a.inherit_option, a.set_option,
       case
         when papel.rolname in ('yfc_hono', 'yfc_executor')
           and membro.rolname = current_user and g.oid = 10
           and a.admin_option and not a.inherit_option and not a.set_option
           then 'administração implícita esperada para o implantador'
         else 'revisar membership'
       end as avaliacao
from pg_auth_members a
join pg_roles membro on membro.oid = a.member
join pg_roles papel on papel.oid = a.roleid
join pg_roles g on g.oid = a.grantor
where exists (
  select from pg_roles d
  where d.rolname in ('yfc_hono', 'yfc_executor')
    and (pg_has_role(a.roleid, d.oid, 'MEMBER')
         or pg_has_role(d.oid, a.member, 'MEMBER'))
)
order by membro.rolname, papel.rolname, g.rolname;

-- MEMBER inclui cadeias sem uso imediato. USAGE e SET testam cada caminho efetivo.
-- Superusuários aparecem como controle administrativo, inclusive sem grant explícito.
with donos(oid) as (
  select nspowner from pg_namespace where nspname = 'yfc_privado'
  union
  select c.relowner from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'yfc_privado'
  union
  select p.proowner from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'yfc_privado'
)
select m.rolname as membro, m.rolcanlogin, r.rolname as destino,
       caminhos.member, caminhos.usage, caminhos.set_role,
       d.oid is not null as destino_e_dono,
       r.rolsuper, r.rolbypassrls, r.rolcreaterole, r.rolcreatedb, r.rolreplication,
       case
         when m.rolsuper then 'superusuário administrativo'
         when m.rolname = current_user and r.rolname in ('yfc_hono', 'yfc_executor')
           and not caminhos.usage and not caminhos.set_role
           then 'conferir ADMIN no inventário de memberships'
         else 'desvio: caminho para revisar'
       end as avaliacao
from pg_roles m cross join pg_roles r
left join donos d on d.oid = r.oid
cross join lateral (
  select pg_has_role(m.oid, r.oid, 'MEMBER') as member,
         pg_has_role(m.oid, r.oid, 'USAGE') as usage,
         pg_has_role(m.oid, r.oid, 'SET') as set_role
) caminhos
where m.oid <> r.oid and (caminhos.member or caminhos.usage or caminhos.set_role)
  and (
    r.rolname in ('yfc_hono', 'yfc_executor')
    or m.rolname in ('yfc_hono', 'yfc_executor')
    or (m.rolname in ('anon', 'authenticated', 'authenticator', 'service_role')
        and (d.oid is not null or r.rolsuper or r.rolbypassrls or r.rolcreaterole))
  )
order by membro, destino;

-- Inventário e estado da RLS. O dono deve ser a identidade administrativa aprovada.
with esperado(objeto, tipo) as (
  select t, 'r'::"char" from unnest(array['categorias','transacoes','metas','aportes']) t
  union all
  select t || '_ordem_cadastro_seq', 'S'::"char"
  from unnest(array['categorias','transacoes','metas','aportes']) t
), observado as (
  select c.relname::text as objeto, c.relkind as tipo,
         c.relowner, c.relrowsecurity, c.relforcerowsecurity
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'yfc_privado' and c.relkind in ('r','S','v','m','f','p','c')
)
select coalesce(e.objeto, o.objeto) as objeto, e.tipo as tipo_esperado,
       o.tipo as tipo_observado, pg_get_userbyid(o.relowner) as dono,
       o.relrowsecurity, o.relforcerowsecurity,
       case
         when e.objeto is null then 'objeto inesperado'
         when o.objeto is null then 'objeto ausente'
         when e.tipo <> o.tipo then 'tipo divergente'
         when pg_get_userbyid(o.relowner) <> 'postgres' then 'dono divergente do alvo confirmado'
         when e.tipo = 'r' and (not o.relrowsecurity or o.relforcerowsecurity) then 'RLS divergente'
       end as desvio
from esperado e full join observado o using (objeto)
order by objeto;

select nspname, pg_get_userbyid(nspowner) as dono
from pg_namespace where nspname = 'yfc_privado' and pg_get_userbyid(nspowner) <> 'postgres';

select p.oid::regprocedure as rotina_inesperada, pg_get_userbyid(p.proowner) as dono,
       p.prokind, p.prosecdef, p.proleakproof, p.provolatile
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'yfc_privado';

select t.typname as tipo_inesperado, pg_get_userbyid(t.typowner) as dono
from pg_type t join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'yfc_privado' and t.typrelid = 0
  and not exists (select from pg_type base where base.typarray = t.oid);

-- Desvios das políticas. Normaliza apenas espaços, qualificação de uid e o
-- alias emitido pelo deparser. A dependência confirma qual função foi resolvida.
-- Examine divergências textuais no PG17.12 durante o ensaio, mantendo os
-- predicados, papéis, comandos e dependências esperados em todas as checagens.
with esperado as (
  select t as tabela, t || '_' || lower(cmd) || '_proprio' as nome, cmd,
         case when cmd <> 'INSERT' then '(usuario_id=(selectuid()))' end as qual,
         case when cmd in ('INSERT','UPDATE') then '(usuario_id=(selectuid()))' end as check_expr
  from unnest(array['categorias','transacoes','metas','aportes']) t
  cross join unnest(array['SELECT','INSERT','UPDATE','DELETE']) cmd
  where t <> 'aportes' or cmd <> 'UPDATE'
), observado as (
  select v.tablename::text as tabela, v.policyname::text as nome,
         v.cmd, v.roles, v.permissive, v.qual, v.with_check,
         regexp_replace(v.qual, 'auth\.| AS uid\y|[[:space:]]', '', 'gi') as qual_normalizada,
         regexp_replace(v.with_check, 'auth\.| AS uid\y|[[:space:]]', '', 'gi') as check_normalizado,
         exists (
           select from pg_depend d
           where d.classid = 'pg_policy'::regclass and d.objid = p.oid
             and d.refclassid = 'pg_proc'::regclass and d.refobjid = 'auth.uid()'::regprocedure
         ) as depende_uid
  from pg_policies v
  join pg_namespace n on n.nspname = v.schemaname
  join pg_class c on c.relnamespace = n.oid and c.relname = v.tablename
  join pg_policy p on p.polrelid = c.oid and p.polname = v.policyname
  where v.schemaname = 'yfc_privado'
)
select tabela, nome,
       case when e.nome is null then 'excedente'
            when o.nome is null then 'ausente' else 'divergente' end as desvio,
       e.cmd as comando_esperado, o.cmd, o.roles, o.permissive, o.qual, o.with_check, o.depende_uid
from esperado e full join observado o using (tabela, nome)
where e.nome is null or o.nome is null or o.cmd <> e.cmd
   or o.roles is distinct from array['yfc_executor']::name[]
   or o.permissive <> 'PERMISSIVE' or not o.depende_uid
   or lower(o.qual_normalizada) is distinct from e.qual
   or lower(o.check_normalizado) is distinct from e.check_expr
order by tabela, nome;

-- Desvios de ACL efetiva. São testados privilégio e opção de concessão.
with papeis as (
  select oid, rolname from pg_roles
  where rolname in ('yfc_executor','yfc_hono','anon','authenticated','authenticator','service_role')
), relacoes as (
  select c.oid, c.relname, c.relkind
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'yfc_privado' and c.relkind in ('r','p','v','m','f','S')
), colunas(tabela, insercao, edicao) as (
  values
    ('categorias', 'id usuario_id nome nome_chave tipo', 'nome nome_chave tipo'),
    ('transacoes', 'id usuario_id categoria_id tipo descricao valor_centavos data',
                   'categoria_id tipo descricao valor_centavos data'),
    ('metas', 'id usuario_id nome objetivo_centavos reserva_centavos data_inicio data_limite',
              'nome objetivo_centavos data_limite'),
    ('aportes', 'id usuario_id meta_id valor_centavos data', '')
), matriz as (
  select r.rolname as papel, n.nspname::text as objeto, 'schema' as tipo,
         v as privilegio, r.rolname = 'yfc_executor' and v = 'USAGE' as esperado,
         has_schema_privilege(r.oid, n.oid, v) as efetivo,
         has_schema_privilege(r.oid, n.oid, v || ' WITH GRANT OPTION') as pode_conceder
  from papeis r cross join pg_namespace n cross join unnest(array['USAGE','CREATE']) v
  where n.nspname = 'yfc_privado'
  union all
  select r.rolname, c.relname, 'relação', v,
         r.rolname = 'yfc_executor' and e.tabela is not null and v in ('SELECT','DELETE'),
         has_table_privilege(r.oid, c.oid, v),
         has_table_privilege(r.oid, c.oid, v || ' WITH GRANT OPTION')
  from papeis r cross join relacoes c left join colunas e on e.tabela = c.relname
  cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) v
  where c.relkind <> 'S'
  union all
  select r.rolname, c.relname || '.' || a.attname, 'coluna', v,
         r.rolname = 'yfc_executor' and e.tabela is not null
         and (v = 'SELECT' or (v = 'INSERT' and a.attname::text = any(string_to_array(e.insercao,' ')))
              or (v = 'UPDATE' and a.attname::text = any(string_to_array(e.edicao,' ')))),
         has_column_privilege(r.oid, c.oid, a.attnum, v),
         has_column_privilege(r.oid, c.oid, a.attnum, v || ' WITH GRANT OPTION')
  from papeis r cross join relacoes c left join colunas e on e.tabela = c.relname
  join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  cross join unnest(array['SELECT','INSERT','UPDATE','REFERENCES']) v
  where c.relkind <> 'S'
  union all
  select r.rolname, c.relname, 'sequência', v, false,
         has_sequence_privilege(r.oid, c.oid, v),
         has_sequence_privilege(r.oid, c.oid, v || ' WITH GRANT OPTION')
  from papeis r cross join relacoes c cross join unnest(array['USAGE','SELECT','UPDATE']) v
  where c.relkind = 'S'
  union all
  select r.rolname, p.oid::regprocedure::text, 'rotina', 'EXECUTE', false,
         has_function_privilege(r.oid, p.oid, 'EXECUTE'),
         has_function_privilege(r.oid, p.oid, 'EXECUTE WITH GRANT OPTION')
  from papeis r cross join pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'yfc_privado'
)
select * from matriz where efetivo is distinct from esperado or pode_conceder
order by papel, tipo, objeto, privilegio;

-- Uma coluna esperada que desapareceu não produz linha na matriz de ACLs.
with esperadas(tabela, colunas) as (
  values
    ('categorias', 'id usuario_id ordem_cadastro criado_em nome nome_chave tipo'),
    ('transacoes', 'id usuario_id ordem_cadastro criado_em categoria_id tipo descricao valor_centavos data'),
    ('metas', 'id usuario_id ordem_cadastro criado_em nome objetivo_centavos reserva_centavos data_inicio data_limite'),
    ('aportes', 'id usuario_id ordem_cadastro criado_em meta_id valor_centavos data')
), esperado as (
  select tabela, coluna from esperadas cross join unnest(string_to_array(colunas, ' ')) coluna
), observado as (
  select c.relname::text as tabela, a.attname::text as coluna
  from pg_namespace n join pg_class c on c.relnamespace = n.oid
  join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  where n.nspname = 'yfc_privado' and c.relname in (select tabela from esperadas)
)
select tabela, coluna, case when e.coluna is null then 'excedente' else 'ausente' end as desvio
from esperado e full join observado o using (tabela, coluna)
where e.coluna is null or o.coluna is null
order by tabela, coluna;

-- ACLs de PUBLIC atuais, incluindo defaults implícitos quando acl é NULL.
with objetos as (
  select n.nspname::text as objeto, n.nspacl as acl, 'n'::"char" as tipo, n.nspowner as dono
  from pg_namespace n where n.nspname in ('yfc_privado','auth')
  union all
  select format('%I.%I', n.nspname, c.relname), c.relacl,
         (case when c.relkind = 'S' then 's' else 'r' end)::"char", c.relowner
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'yfc_privado' and c.relkind in ('r','p','v','m','f','S')
  union all
  select format('%I.%I.%I', n.nspname, c.relname, a.attname), a.attacl, 'c', c.relowner
  from pg_attribute a join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'yfc_privado' and a.attnum > 0 and not a.attisdropped and a.attacl is not null
  union all
  select p.oid::regprocedure::text, p.proacl, 'f', p.proowner
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'yfc_privado' or p.oid = 'auth.uid()'::regprocedure
)
select objeto, tipo, acl is null as default_implicito, a.privilege_type,
       pg_get_userbyid(a.grantor) as concedente, a.is_grantable
from objetos cross join lateral aclexplode(coalesce(acl, acldefault(tipo, dono))) a
where a.grantee = 0
order by objeto, tipo, a.privilege_type;

-- Inventário de defaults para futuros objetos. A ausência de override global
-- de funções mantém o EXECUTE de PUBLIC do PostgreSQL.
select r.rolname as criador, coalesce(n.nspname, '(global)') as escopo,
       d.defaclobjtype, d.defaclacl,
       array(select a.privilege_type from aclexplode(d.defaclacl) a where a.grantee = 0)
         as privilegios_public
from pg_default_acl d join pg_roles r on r.oid = d.defaclrole
left join pg_namespace n on n.oid = d.defaclnamespace
where d.defaclnamespace = 0 or n.nspname = 'yfc_privado'
order by criador, escopo, d.defaclobjtype;

-- EXECUTE deve ser verdadeiro para o executor. USAGE é contexto do ensaio.
select r.rolname, has_schema_privilege(r.oid, 'auth', 'USAGE') as uso_auth,
       has_function_privilege(r.oid, 'auth.uid()'::regprocedure, 'EXECUTE') as executa_uid,
       case when r.rolname = 'yfc_executor'
         and not has_function_privilege(r.oid, 'auth.uid()'::regprocedure, 'EXECUTE')
         then 'desvio: falta EXECUTE para as políticas' end as desvio
from pg_roles r where r.rolname in ('yfc_hono','yfc_executor');

-- Esperado: zero linhas. Examina ACLs mesmo quando USAGE em auth está ausente.
select r.rolname, c.relname,
       has_table_privilege(r.oid, c.oid,
         'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES, MAINTAIN') as acl_relacao,
       has_any_column_privilege(r.oid, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES') as acl_coluna
from pg_roles r cross join pg_class c join pg_namespace n on n.oid = c.relnamespace
where r.rolname in ('yfc_hono','yfc_executor') and n.nspname = 'auth'
  and c.relkind in ('r','p','v','m','f')
  and (has_table_privilege(r.oid, c.oid,
         'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES, MAINTAIN')
       or has_any_column_privilege(r.oid, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'));

-- Superfície a revisar nos schemas confirmados no Dashboard. As dependências
-- registradas incluem views aninhadas e corpos SQL analisados na criação.
-- Corpos textuais, SQL dinâmico e extensões podem escapar do catálogo.
with recursive privados(classe, objeto) as (
  select 'pg_class'::regclass::oid, c.oid
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'yfc_privado'
  union all
  select 'pg_proc'::regclass::oid, p.oid
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'yfc_privado'
), dependentes(classe, objeto) as (
  select classe, objeto from privados
  union
  select case when w.oid is not null or t.oid is not null
              then 'pg_class'::regclass::oid else d.classid end,
         coalesce(w.ev_class, t.tgrelid, d.objid)
  from dependentes a
  join pg_depend d on d.refclassid = a.classe and d.refobjid = a.objeto
  left join pg_rewrite w on d.classid = 'pg_rewrite'::regclass and w.oid = d.objid
  left join pg_trigger t on d.classid = 'pg_trigger'::regclass and t.oid = d.objid
  where d.classid in ('pg_class'::regclass,'pg_proc'::regclass,'pg_rewrite'::regclass,'pg_trigger'::regclass)
), expostos as (
  select 'pg_proc'::regclass::oid as classe, p.oid, n.oid as schema_oid,
         p.oid::regprocedure::text as objeto, p.proowner as dono,
         p.prosecdef as security_definer, null::boolean as security_invoker,
         p.prosrc ilike '%yfc_privado%' as mencao_textual,
         exists (select from unnest(p.proconfig) cfg where cfg like 'search_path=%') as search_path_proprio
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public','graphql_public') and p.prokind in ('f','p')
  union all
  select 'pg_class'::regclass::oid, c.oid, n.oid, format('%I.%I', n.nspname, c.relname),
         c.relowner, null,
         coalesce('security_invoker=true' = any(c.reloptions), false),
         pg_get_viewdef(c.oid) ilike '%yfc_privado%', null
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public','graphql_public') and c.relkind in ('v','m')
)
select e.objeto, pg_get_userbyid(e.dono) as dono, dono.rolbypassrls, dono.rolsuper,
       e.security_definer, e.security_invoker, e.search_path_proprio,
       d.objeto is not null as dependencia_catalogada, e.mencao_textual,
       array(select r.rolname from pg_roles r
             where r.rolname in ('anon','authenticated','authenticator','service_role')
               and has_schema_privilege(r.oid, e.schema_oid, 'USAGE')
               and case when e.classe = 'pg_proc'::regclass
                        then has_function_privilege(r.oid, e.oid, 'EXECUTE')
                        else has_any_column_privilege(r.oid, e.oid, 'SELECT')
                   end order by r.rolname) as papeis_com_acesso_de_leitura_ou_execucao
from expostos e join pg_roles dono on dono.oid = e.dono
left join dependentes d on d.classe = e.classe and d.objeto = e.oid
order by dependencia_catalogada desc, e.mencao_textual desc, e.objeto;

-- Todas as views expostas são candidatas à triagem. ACLs e capacidade de
-- escrita são checagens independentes. O bitmap usa CmdType do PG17:
-- UPDATE = 2, INSERT = 3, DELETE = 4. true inclui triggers INSTEAD OF.
with views_expostas as (
  select c.oid, n.oid as schema_oid, format('%I.%I', n.nspname, c.relname) as objeto,
         c.relkind, pg_relation_is_updatable(c.oid, true) as capacidade
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public','graphql_public') and c.relkind in ('v','m')
)
select v.objeto, v.relkind, r.rolname as papel,
       has_schema_privilege(r.oid, v.schema_oid, 'USAGE') as uso_schema,
       op.privilegio, has_table_privilege(r.oid, v.oid, op.privilegio) as acl_relacao,
       case when op.privilegio <> 'DELETE' then array(
         select a.attname from pg_attribute a
         where a.attrelid = v.oid and a.attnum > 0 and not a.attisdropped
           and has_column_privilege(r.oid, v.oid, a.attnum, op.privilegio)
         order by a.attnum
       ) end as colunas_com_acl_efetiva,
       case when op.bit is not null then (v.capacidade & op.bit) <> 0 end as suporta_escrita
from views_expostas v cross join pg_roles r
cross join (values ('SELECT', null::integer), ('INSERT', 8), ('UPDATE', 4), ('DELETE', 16))
  op(privilegio, bit)
where r.rolname in ('anon','authenticated','authenticator','service_role')
order by v.objeto, papel, op.privilegio;

-- Definições para revisão manual, incluindo views sem dependência detectada.
select format('%I.%I', n.nspname, c.relname) as objeto,
       'trigger' as mecanismo, t.tgname as nome, t.tgenabled as modo_trigger,
       t.tgfoid::regprocedure::text as funcao, pg_get_triggerdef(t.oid) as definicao
from pg_trigger t join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public','graphql_public') and c.relkind in ('v','m')
  and (t.tgtype & 28) <> 0 -- INSERT, DELETE e UPDATE
union all
select format('%I.%I', n.nspname, c.relname), 'regra', w.rulename, w.ev_enabled,
       null, pg_get_ruledef(w.oid)
from pg_rewrite w join pg_class c on c.oid = w.ev_class
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public','graphql_public') and c.relkind in ('v','m')
  and w.ev_type in ('2','3','4')
order by objeto, mecanismo, nome;
