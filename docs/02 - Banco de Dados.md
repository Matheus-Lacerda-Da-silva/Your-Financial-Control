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
- RLS começa sem políticas e a migration revoga privilégios de `PUBLIC`, `anon` e `authenticated` no schema, nas tabelas e nas sequências. A revogação dos defaults locais ao schema não cancela defaults globais. Por isso, a migration também revoga explicitamente os privilégios dos objetos criados e as consultas verificam o acesso efetivo dos papéis. Mantenha `yfc_privado` fora de **Exposed schemas** no Dashboard do Supabase. A lista de exposição é configuração da Data API e deve ser conferida separadamente.

### Configuração da CLI e vínculo por computador

`supabase/config.toml` é adequado para versionamento como configuração compartilhada da CLI. A revisão encontrou PostgreSQL major 17, schemas locais `public` e `graphql_public`, URLs de loopback nos campos de desenvolvimento e campos de segredo vazios ou referenciados por `env(...)`. As opções de serviços locais e o seed padrão apontando para `./seed.sql` pertencem ao template. O arquivo de seed está ausente e esse fluxo está fora do uso atual, exclusivamente Cloud. A exposição remota é confirmada separadamente no Dashboard.

Cada computador mantém seu próprio vínculo para o ambiente de desenvolvimento. `supabase/.temp/` e `supabase/.branches/` são ignorados, assim como `.env` e suas variantes, com exceção de `.env.example` para exemplos sem credenciais. Tokens de login e senhas devem permanecer no armazenamento local da CLI ou em variáveis de ambiente. O vínculo local inclui metadados do projeto e do pooler.

O fluxo abaixo usa a versão confirmada e documenta operações remotas para execução somente quando autorizadas. O dry-run lista migrations pendentes. A confirmação da execução do DDL vem da aplicação e das consultas posteriores.

```powershell
npx supabase@2.116.0 --version
npx supabase@2.116.0 login
npx supabase@2.116.0 link --project-ref REF_DO_YFC_DEVELOPMENT
npx supabase@2.116.0 migration list --linked
npx supabase@2.116.0 db push --linked --dry-run
# Execute a linha seguinte apenas após conferir o alvo e as versões pendentes.
npx supabase@2.116.0 db push --linked
npx supabase@2.116.0 migration list --linked
```

Use o fluxo de login da CLI e mantenha tokens, senhas e strings de conexão fora do Git. Antes de aplicar, confirme que o histórico e o schema de destino condizem com uma primeira migration e que o dry-run lista somente `20261124000000`. O dry-run lista o plano e não valida o DDL em PostgreSQL. O push registra a versão em `supabase_migrations.schema_migrations`. Depois de aplicar, execute as consultas de verificação no editor SQL e registre a versão aplicada, o ambiente e os resultados. Use uma nova migration para correções após aplicação. Evite aplicar o arquivo pelo editor SQL como fluxo normal, pois isso não atualiza automaticamente o histórico da CLI.

### Etapa 7.2.4.2 — papéis, RLS e privilégios implementados localmente

A [migration de papéis e RLS](../supabase/migrations/20261125000000_configura_papeis_rls_financeiros.sql) aguarda aprovação para aplicação. A Data API segue habilitada na arquitetura aprovada, com `yfc_privado` fora de **Exposed schemas**. A migration inicial e seu [verificador da etapa 7.2.3](../supabase/tests/verifica_modelo_financeiro.sql) continuam sendo o retrato daquela etapa. Para a nova migration, usar o [verificador de papéis e RLS](../supabase/tests/verifica_papeis_rls_financeiros.sql).

| Papel | Schema financeiro | Tabelas financeiras |
| --- | --- | --- |
| `PUBLIC`, `anon`, `authenticated`, `authenticator`, `service_role` e `yfc_hono` | Sem `USAGE` ou `CREATE` esperado | Sem acesso direto esperado |
| `yfc_executor` | `USAGE` | `SELECT` e `DELETE` nas quatro tabelas; `INSERT` e `UPDATE` por coluna |
| Proprietários e papel administrativo | Conforme propriedade e ACL do ambiente | Administração e recuperação, fora do caminho da aplicação |

- `yfc_hono` tem o atributo `LOGIN`, senha nula, limite de conexões zero e nenhum grant financeiro. `yfc_executor` é `NOLOGIN`. Ambos são `NOINHERIT`, sem `BYPASSRLS` ou atributos administrativos. Nenhum membership é concedido ao runtime pela migration. Verificar opções `SET`, `INHERIT` e `ADMIN` reais, inclusive o membership administrativo que o PG17 pode atribuir ao criador de um papel. `NOINHERIT` sozinho não impede `SET ROLE`.
- Cada tabela tem políticas de leitura e exclusão com `USING`, e inserção com `WITH CHECK`. A atualização usa ambos em categorias, transações e metas. Todas usam `usuario_id = (select auth.uid())` e se aplicam ao executor. Sem identidade, a comparação produz `NULL` e fica fora das linhas autorizadas. Aportes têm três políticas e nenhum grant de atualização.
- Em inserções, o executor pode definir UUID, proprietário e campos de negócio. A RLS exige o proprietário do contexto. `ordem_cadastro` e `criado_em` usam defaults. Em edições, categorias permitem nome, chave e tipo; transações permitem categoria, tipo, descrição, centavos e data; metas permitem nome, objetivo e prazo. ID, dono, ordem e criação ficam fora de todas as edições. Início e reserva ficam fora das edições de metas.
- O implantador resolve `auth.uid()` ao criar a política. A primeira migration de segurança verifica o `EXECUTE` efetivo do executor e preserva as ACLs gerenciadas de Auth. O uso da expressão armazenada sem `USAGE` em `auth` é hipótese técnica a testar em Cloud descartável. Uma chamada direta em futura função privada depende de resolução de nomes e precisa de revisão própria. A identidade de cadastro é preenchida pelo INSERT, sem grant na sequência. Confirmar por ensaio.
- A RLS permanece habilitada. Adiou-se `FORCE ROW LEVEL SECURITY` para preservar manutenção e recuperação do dono das tabelas. O executor está sujeito à RLS por ser distinto dos donos e não ter `BYPASSRLS`. O proprietário pode ignorar RLS por padrão. Papéis com `BYPASSRLS` também a ignoram; suas ACLs financeiras devem ser verificadas.
- As revogações explícitas incluem privilégios de tabela como `TRUNCATE` e `MAINTAIN`. O verificador inventaria ACL efetiva de tabelas, colunas, sequências e rotinas, além de defaults. A migration não muda defaults globais do papel de implantação para evitar efeitos em outros schemas. Nas etapas seguintes, criar cada rotina e revogar `EXECUTE` padrão na mesma transação, antes do grant por assinatura. Defaults locais são aditivos em relação aos globais.

**Pré-validação no YFC-Development em 25/11/2026.** As consultas de leitura no SQL Editor mostraram banco `postgres`, PostgreSQL 17.12, `session_user` e `current_user` iguais a `postgres` e `createrole_self_grant` vazio. O papel tinha `LOGIN`, limite `-1`, `INHERIT`, `CREATEDB`, `CREATEROLE`, `REPLICATION` e `BYPASSRLS`, sem `SUPERUSER`. Tinha `USAGE` em `auth` e `EXECUTE` em `auth.uid()`, ambos sem opção de concessão. A função tinha `EXECUTE` para `PUBLIC`, `dashboard_user` e `supabase_auth_admin`, sem opção de concessão. `PUBLIC` não tinha `USAGE` em `auth`.

Os dois papéis dedicados estavam ausentes e apenas a migration inicial constava no histórico. O schema, as quatro tabelas e as quatro sequências pertenciam a `postgres`. As tabelas tinham RLS, sem `FORCE` e sem políticas. O Dashboard mostrava Data API habilitada com `public` e `graphql_public`, deixando `yfc_privado` fora. Essas evidências descrevem a sessão e a configuração consultadas. A identidade, autoridade e configuração da sessão da CLI ainda precisam ser verificadas.

**Revisão e pendências.** A revisão identificou a concessão inviável em Auth, lacunas em memberships, propriedade, ACLs e inventário, e a necessidade de demonstrar atomicidade do runner. A correção local remove as concessões em Auth e amplia as consultas de desvios. Após autorização, seguir [[06 - Ensaio de Papéis e RLS]] para validar CLI 2.116.0, rollback, RLS, ACLs e Data API em ambiente descartável. A aplicação no YFC-Development e a integração Workers/Hyperdrive seguem pendentes.

A segunda revisão levou à conferência explícita dos seis papéis, à matriz de escrita e leitura das views expostas e ao inventário de triggers e regras. O roteiro do YFC-Sandbox distingue as cópias do SQL por diretório e SHA-256, verifica o destino antes de cada push e documenta a evidência do código da CLI 2.116.0 para o lote do DDL com o histórico. As negativas da Data API e a limpeza das fixtures fazem parte do ensaio. A ativação temporária do login Hono fica fora do escopo.

### Etapa 7.2.4 — demais controles pendentes

A inspeção manual cobriu estrutura, privilégios e exposição. Em PostgreSQL real, ainda faltam testes com dados fictícios de PK, FK, UNIQUE e CHECK, incluindo vínculos cruzados e cascata. Após definir as políticas e a superfície de acesso, validar leitura, criação, edição e exclusão com dois usuários e acesso anônimo, inclusive troca de proprietário e chamadas diretas à Data API.

- Derivar `nome_chave` em um caminho de gravação confiável e testar sua paridade com TypeScript para NFC, espaços Unicode, minúsculas `pt-BR` e acentos. O `CHECK` atual só faz uma checagem básica de texto e a unicidade compara a chave fornecida.
- Implementar operações atômicas com controle de concorrência para os totais independentes de receitas e despesas, a reserva somada aos aportes e a validação de datas contra o período da meta. Preservar a imutabilidade de início e reserva na edição, e permitir a exclusão individual, sem edição de aportes. Usar a referência civil configurável proposta (`America/Sao_Paulo`) para “hoje”, sem mudar o fuso UTC do banco.
- Definir reenvio por UUID estável, privilégios das funções SQL, políticas por usuário e contrato de serialização exata de centavos pela Data API. Validar chamadas diretas, testes de concorrência e limites em PostgreSQL real antes de liberar gravações.

## Modelo adicional em memória — Metas (2026-11-12)

No fluxo demonstrativo, `Meta` armazena `id` string, `nome`, `valorObjetivoCentavos`, `valorInicialCentavos`, `dataInicio` e `dataLimite`. `Aporte` armazena `id` string, `metaId`, `valorCentavos` positivo e `data`. `EstadoMetas` contém os dois arrays e erro transitório. Progresso, situação e roteiros são derivados; não são campos persistidos. Reserva inicial não é duplicada como aporte.

Arrays ficam no App, separados do estado de categorias/transações, e são apagados ao recarregar/sair. IDs são aleatórios criptográficos com recusa de colisões no respectivo conjunto. O reducer valida referência ao excluir aporte; excluir meta remove somente seus aportes. Edição preserva o histórico e os campos imutáveis.

Essa seção registra a implementação histórica em memória. O modelo PostgreSQL e o estado da primeira migration estão descritos na Etapa 7.2.3.

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## Estado confirmado

A API inicial da Etapa 7.1 expõe uma rota de saúde e ainda não usa banco de dados. A migration inicial já está aplicada no ambiente Cloud de desenvolvimento.

## Modelo existente em memória

O tipo armazenado é `TransacaoRegistrada`, um contrato TypeScript, não uma tabela ou esquema de banco. Evidência: `frontend/src/types/transacao.ts`.

| Campo | Tipo confirmado | Uso |
| --- | --- | --- |
| `id` | `number` | Criado por `Date.now()` em `App.tsx` |
| `descricao` | `string` | Texto informado no formulário |
| `tipo` | `'receita'` ou `'despesa'` | Seleção da natureza do lançamento |
| `valorCentavos` | `number` inteiro seguro | Receita positiva e despesa negativa, em centavos; limites e sinal validados pelas operações |
| `categoriaId` | `string` | Referência a uma Categoria em memória, validada pelo reducer |
| `data` | `string` | Input de data; formato esperado `YYYY-MM-DD` |

`Categoria` contém `id: string`, `nome: string` normalizado e `tipo: 'receita' | 'despesa'`. IDs usam UUID ou bytes aleatórios criptográficos e duplicações são recusadas. Nome é único por tipo na comparação normalizada, sem diferenciar maiúsculas/minúsculas e preservando acentos. Categorias não possuem contagem armazenada; vínculos são contados a partir dos lançamentos.

`App.tsx` mantém arrays inicialmente vazios de categorias e transações, coordenados por `reduzirEstadoFinanceiro` em `utils/estadoFinanceiro.ts`. Cadastro de transação insere no início; edição substitui objetos pelo ID; exclusão filtra pelo ID. As operações monetárias existentes são reutilizadas. Erros monetários ou de vínculo preservam os arrays anteriores. Categorias usadas não podem ser excluídas ou mudar de tipo. Nomes são derivados por `selecionarTransacoes` para o formato de exibição `TransacaoExibicao`; não são duplicados no registro armazenado. Não existem transações de banco, chaves estrangeiras, índices ou constraints de servidor. IDs numéricos dos lançamentos continuam com o risco de colisão de `Date.now()`. Não há `usuarioId`, conta financeira, timestamps de auditoria ou exclusão lógica no tipo atual.

## Persistência e ciclo de vida

- Categorias, transações e sessão: somente memória React; recarga ou saída apaga os dados. Não há categorias padrão automáticas.
- Tema: `localStorage`, chave `yfc-tema`, com valores `light`/`dark` e tratamento de indisponibilidade (`frontend/src/theme/TemaProvider.tsx`). Não é um banco financeiro.
- Cadastro: não persiste usuário; e-mail segue ao acesso no estado de navegação (`Cadastro.tsx`).

## Decisões pendentes

A integração da aplicação com o banco, a política de retenção/exclusão e os testes de backup e restauração seguem pendentes. A persistência deve preservar as regras monetárias e de datas de [[03 - Regras Financeiras]].
