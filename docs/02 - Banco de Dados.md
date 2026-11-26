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

## Preparação de categorias — 2026-11-25

A [migration de categorias](../supabase/migrations/20261125000000_protege_crud_categorias.sql) substitui localmente a versão pendente `20261125000000`. Confirme o histórico do ambiente autorizado antes de aplicar. Se essa versão já constar no histórico, preserve o SQL aplicado e prepare uma migration posterior. A inicial permanece como foi aplicada, com seu [verificador de baseline](../supabase/tests/verifica_modelo_financeiro.sql).

- As quatro tabelas continuam em `yfc_privado`. O `config.toml` expõe o schema em ambiente local. A exposição no Supabase Cloud é uma configuração separada.
- `authenticated` recebe `USAGE` no schema e CRUD em categorias próprias. O dono vem de `auth.uid()`. Na criação podem ser enviados nome, tipo e UUID opcional. Na edição, nome e tipo. Nome, chave e metadados são protegidos conforme seus grants e defaults.
- Um trigger com privilégio do chamador normaliza `nome` e deriva `nome_chave` em NFC, com espaços equivalentes aos do JavaScript e minúsculas usando a collation ICU `pt-BR`. O banco aplica a unicidade por dono, tipo e chave. Eventuais categorias existentes são normalizadas na migration. Se houver conflito, revise os registros antes de tentar novamente.
- Transações, metas e aportes permanecem com RLS ativa, sem políticas ou grants de acesso para o aplicativo. UUIDs, FKs, centavos, constraints e datas civis existentes são preservados. A referência civil para regras novas de “hoje” é `America/Sao_Paulo`.

Após autorização, valide a migration e o [verificador de RLS e permissões](../supabase/tests/verifica_rls_categorias.sql) em um ambiente descartável. Use dois usuários fictícios e chamadas diretas à Data API, além de uma chamada anônima. Confira defaults, isolamento, colunas protegidas, unicidade de nomes compostos e decompostos, espaços Unicode, minúsculas e acentos significativos. Teste também que o papel de aplicação não pode acessar as outras tabelas.

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
