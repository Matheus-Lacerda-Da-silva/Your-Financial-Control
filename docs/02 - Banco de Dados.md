# Banco de Dados

## Etapa 7.2.3 — Supabase Cloud e migration inicial concluída em 2026-11-24

O ambiente de desenvolvimento é o projeto **YFC-Development**, no Supabase Cloud, região São Paulo (`sa-east-1`). O responsável pelo projeto confirmou manualmente o PostgreSQL 17.12, a inicialização e o vínculo da Supabase CLI 2.116.0, o dry-run, a aplicação da migration `20261124000000_cria_modelo_financeiro.sql` e a sincronização dos históricos local e remoto. Esta revisão conferiu os arquivos locais e registrou as evidências fornecidas.

### Verificações manuais no Cloud

| Verificação | Resultado informado |
| --- | --- |
| Estrutura de `yfc_privado` | Quatro tabelas e quatro sequências de ordenação de cadastro |
| Colunas | 32: aportes 7, categorias 7, metas 9 e transacoes 9 |
| Índices | 14: aportes 3, categorias 4, metas 3 e transacoes 4 |
| Restrições | 4 PRIMARY KEY, 6 FOREIGN KEY, 7 UNIQUE e 10 CHECK explícitos confirmados em `pg_constraint` |
| RLS | Habilitada nas quatro tabelas, com zero políticas |
| Schema privado | `USAGE` e `CREATE` negados a `anon` e `authenticated` |
| Privilégios dos papéis clientes | 56 verificações de tabelas, 32 de colunas e 24 de sequências retornaram `false` |
| Data API | Somente `public` e `graphql_public` em **Exposed schemas** |

- [Migration 20261124000000](../supabase/migrations/20261124000000_cria_modelo_financeiro.sql) cria `yfc_privado` e as quatro tabelas. [Consultas de verificação](../supabase/tests/verifica_modelo_financeiro.sql) inspecionam metadados e permissões após aplicação autorizada.
- As FKs compostas exigem o mesmo usuário e, em transações, o mesmo tipo da categoria. A exclusão de categoria vinculada é bloqueada, a de meta remove os aportes relacionados e a exclusão de usuário com registros depende de uma política explícita de descarte.
- Os centavos são `bigint` com limites do inteiro seguro do JavaScript por valor. Datas de negócio são `date` e ficam entre os anos 0001 e 9999. O prazo de metas tem até 120 competências inclusivas. `criado_em` é `timestamptz` e `ordem_cadastro` é uma identidade separada, estável para ordenação, com lacunas permitidas. Use ordem decrescente nas transações e crescente em categorias e metas. No histórico de aportes, desempate a data por ordem decrescente.
- PKs e restrições de unicidade fornecem os índices de identidade, busca e ordenação por usuário. Os três índices adicionais dão suporte ao vínculo transação–categoria, às consultas por data financeira e ao histórico de aportes por meta.
- No baseline, a RLS começa sem políticas e a migration revoga privilégios de `PUBLIC`, `anon` e `authenticated` no schema, nas tabelas e nas sequências. A revogação dos defaults locais ao schema não cancela defaults globais. Por isso, a migration também revoga explicitamente os privilégios dos objetos criados. O baseline registrado mantinha `yfc_privado` fora de **Exposed schemas**.

## Preparação de categorias — 2026-11-25

A [migration de categorias](../supabase/migrations/20261125000000_protege_crud_categorias.sql) substitui localmente a versão pendente `20261125000000`. Confirme o histórico do ambiente autorizado antes de aplicar. Se essa versão já constar no histórico, preserve o SQL aplicado e prepare uma migration posterior. A inicial permanece como foi aplicada, com seu [verificador de baseline](../supabase/tests/verifica_modelo_financeiro.sql).

- As quatro tabelas continuam em `yfc_privado`. O `config.toml` expõe o schema em ambiente local. A exposição no Supabase Cloud é uma configuração separada.
- `authenticated` recebe `USAGE` no schema e CRUD em categorias próprias. O dono vem de `auth.uid()`. Na criação podem ser enviados nome, tipo e UUID opcional. Na edição, nome e tipo. Nome, chave e metadados são protegidos conforme seus grants e defaults.
- Um trigger com privilégio do chamador normaliza `nome` e deriva `nome_chave` em NFC, com espaços equivalentes aos do JavaScript e minúsculas usando a collation ICU `pt-BR`. O banco aplica a unicidade por dono, tipo e chave. Eventuais categorias existentes são normalizadas na migration. Se houver conflito, revise os registros antes de tentar novamente.
- Transações, metas e aportes permanecem com RLS ativa, sem políticas ou grants de acesso para o aplicativo. UUIDs, FKs, centavos, constraints e datas civis existentes são preservados. A referência civil para regras novas de “hoje” é `America/Sao_Paulo`.

Após autorização, valide a migration e o [verificador de RLS e permissões](../supabase/tests/verifica_rls_categorias.sql) em um ambiente descartável. Use dois usuários fictícios e chamadas diretas à Data API, além de uma chamada anônima. Confira defaults, isolamento, colunas protegidas, unicidade de nomes compostos e decompostos, espaços Unicode, minúsculas e acentos significativos. Teste também que o papel de aplicação não pode acessar as outras tabelas.

O CRUD implementado no Hono seleciona `yfc_privado` com chave publicável e JWT do usuário. O ambiente de ensaio precisa expor esse schema na Data API, como previsto no `supabase/config.toml` local. A lista de exposição é configuração do ambiente. A migration controla quais objetos e linhas ficam acessíveis. A validação local usou mocks, com o SQL versionado e as configurações remotas preservados.

A listagem do Hono usa `ordem_cadastro` como cursor crescente. A Data API devolve o cursor como texto para preservar o `bigint` inteiro, e o Hono o usa apenas no filtro da próxima consulta. Uma exclusão entre lotes deixa de deslocar o ponto de início da leitura. A resposta HTTP conserva apenas `id`, `nome` e `tipo`.

## Modelo adicional em memória — Metas (2026-11-12)

No fluxo demonstrativo, `Meta` armazena `id` string, `nome`, `valorObjetivoCentavos`, `valorInicialCentavos`, `dataInicio` e `dataLimite`. `Aporte` armazena `id` string, `metaId`, `valorCentavos` positivo e `data`. `EstadoMetas` contém os dois arrays e erro transitório. Progresso, situação e roteiros são derivados; não são campos persistidos. Reserva inicial não é duplicada como aporte.

Arrays ficam no App, separados do estado de categorias/transações, e são apagados ao recarregar/sair. IDs são aleatórios criptográficos com recusa de colisões no respectivo conjunto. O reducer valida referência ao excluir aporte; excluir meta remove somente seus aportes. Edição preserva o histórico e os campos imutáveis.

Essa seção registra a implementação histórica em memória. O modelo PostgreSQL e o estado da primeira migration estão descritos na Etapa 7.2.3.

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## Estado confirmado

A migration inicial já está aplicada no ambiente Cloud de desenvolvimento conforme o registro da Etapa 7.2.3. O CRUD de categorias está implementado na API. A execução real da migration de categorias, da RLS e dos vínculos em PostgreSQL aguarda o ensaio autorizado.

## Modelo existente em memória

O tipo armazenado é `TransacaoRegistrada`, um contrato TypeScript, não uma tabela ou esquema de banco. Evidência: `frontend/src/types/transacao.ts`.

| Campo | Tipo confirmado | Uso |
| --- | --- | --- |
| `id` | `number` | Criado por `Date.now()` em `Painel.tsx` |
| `descricao` | `string` | Texto informado no formulário |
| `tipo` | `'receita'` ou `'despesa'` | Seleção da natureza do lançamento |
| `valorCentavos` | `number` inteiro seguro | Receita positiva e despesa negativa, em centavos; limites e sinal validados pelas operações |
| `categoriaId` | `string` | Referência ao UUID do catálogo, validada pelo reducer |
| `data` | `string` | Input de data; formato esperado `YYYY-MM-DD` |

`Categoria` contém `id: string`, `nome: string` normalizado e `tipo: 'receita' | 'despesa'`. O PostgreSQL gera o UUID, normaliza o nome e garante unicidade por proprietário e tipo, ignorando diferenças de caixa e preservando acentos. A aba deriva a contagem de vínculos dos lançamentos em memória.

`Painel.tsx` coordena o catálogo retornado pela API e as transações locais com `reduzirEstadoFinanceiro`. A criação insere uma transação no início, a edição substitui pelo ID e a exclusão filtra pelo ID. As operações monetárias existentes são reutilizadas. `selecionarTransacoes` deriva o nome e sinaliza um vínculo indisponível sem retirar o lançamento dos totais. IDs numéricos de lançamentos ainda usam `Date.now()`. A FK do PostgreSQL só alcança as transações gravadas no banco.

## Persistência e ciclo de vida

- Categorias vêm do catálogo da conta. A lista do React é descartada ao sair, trocar de conta ou recarregar. Uma conta sem registros recebe um catálogo vazio.
- Transações, metas e aportes ficam em memória e são descartados ao sair, trocar de conta ou recarregar. O SDK do Supabase gerencia a sessão.
- Tema: `localStorage`, chave `yfc-tema`, com valores `light`/`dark` e tratamento de indisponibilidade (`frontend/src/theme/TemaProvider.tsx`). Não é um banco financeiro.
- Cadastro de usuário usa Supabase Auth, com confirmação por e-mail quando habilitada.

## Decisões pendentes

A integração da aplicação com o banco, a política de retenção/exclusão e os testes de backup e restauração seguem pendentes. A persistência deve preservar as regras monetárias e de datas de [[03 - Regras Financeiras]].
