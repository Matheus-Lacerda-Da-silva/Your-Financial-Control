create schema yfc_privado;

revoke all on schema yfc_privado from public, anon, authenticated;

-- Defaults locais ao schema para o papel que cria os objetos.
alter default privileges in schema yfc_privado
  revoke all on tables from public, anon, authenticated;
alter default privileges in schema yfc_privado
  revoke all on sequences from public, anon, authenticated;

create table yfc_privado.categorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on update restrict on delete restrict,
  ordem_cadastro bigint generated always as identity,
  criado_em timestamptz not null default now(),
  nome text not null,
  nome_chave text collate "C" not null,
  tipo text collate "C" not null,
  constraint categorias_nome_ck check (btrim(nome) <> '' and btrim(nome_chave) <> ''),
  constraint categorias_tipo_ck check (tipo in ('receita', 'despesa')),
  constraint categorias_usuario_ordem_uk unique (usuario_id, ordem_cadastro),
  constraint categorias_usuario_tipo_nome_uk unique (usuario_id, tipo, nome_chave),
  constraint categorias_usuario_id_tipo_uk unique (usuario_id, id, tipo)
);

create table yfc_privado.transacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on update restrict on delete restrict,
  ordem_cadastro bigint generated always as identity,
  criado_em timestamptz not null default now(),
  categoria_id uuid not null,
  tipo text collate "C" not null,
  descricao text not null,
  valor_centavos bigint not null,
  data date not null,
  constraint transacoes_usuario_ordem_uk unique (usuario_id, ordem_cadastro),
  constraint transacoes_categoria_fk foreign key (usuario_id, categoria_id, tipo)
    references yfc_privado.categorias (usuario_id, id, tipo) on update restrict on delete restrict,
  constraint transacoes_descricao_ck check (btrim(descricao) <> ''),
  constraint transacoes_valor_sinal_ck check (
    (tipo = 'receita' and valor_centavos between 1 and 9007199254740991)
    or (tipo = 'despesa' and valor_centavos between -9007199254740991 and -1)
  ),
  constraint transacoes_data_ck check (data between date '0001-01-01' and date '9999-12-31')
);

create table yfc_privado.metas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on update restrict on delete restrict,
  ordem_cadastro bigint generated always as identity,
  criado_em timestamptz not null default now(),
  nome text not null,
  objetivo_centavos bigint not null,
  reserva_centavos bigint not null,
  data_inicio date not null,
  data_limite date not null,
  constraint metas_usuario_ordem_uk unique (usuario_id, ordem_cadastro),
  constraint metas_usuario_id_uk unique (usuario_id, id),
  constraint metas_nome_ck check (btrim(nome) <> ''),
  constraint metas_valores_ck check (
    objetivo_centavos between 1 and 9007199254740991
    and reserva_centavos between 0 and objetivo_centavos
  ),
  constraint metas_periodo_ck check (
    data_inicio >= date '0001-01-01'
    and data_limite <= date '9999-12-31'
    and data_inicio <= data_limite
    and (extract(year from data_limite) - extract(year from data_inicio)) * 12
      + extract(month from data_limite) - extract(month from data_inicio) < 120
  )
);

create table yfc_privado.aportes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on update restrict on delete restrict,
  ordem_cadastro bigint generated always as identity,
  criado_em timestamptz not null default now(),
  meta_id uuid not null,
  valor_centavos bigint not null,
  data date not null,
  constraint aportes_usuario_ordem_uk unique (usuario_id, ordem_cadastro),
  constraint aportes_meta_fk foreign key (usuario_id, meta_id)
    references yfc_privado.metas (usuario_id, id) on update restrict on delete cascade,
  constraint aportes_valor_ck check (valor_centavos between 1 and 9007199254740991),
  constraint aportes_data_ck check (data between date '0001-01-01' and date '9999-12-31')
);

create index transacoes_usuario_categoria_tipo_idx
  on yfc_privado.transacoes (usuario_id, categoria_id, tipo);
create index transacoes_usuario_data_idx
  on yfc_privado.transacoes (usuario_id, data);
create index aportes_usuario_meta_historico_idx
  on yfc_privado.aportes (usuario_id, meta_id, data desc, ordem_cadastro desc);

-- RLS sem políticas mantém os papéis clientes sem acesso a linhas.
alter table yfc_privado.categorias enable row level security;
alter table yfc_privado.transacoes enable row level security;
alter table yfc_privado.metas enable row level security;
alter table yfc_privado.aportes enable row level security;

-- Defaults globais do criador podem ter sido herdados na criação.
revoke all on all tables in schema yfc_privado from public, anon, authenticated;
revoke all on all sequences in schema yfc_privado from public, anon, authenticated;
