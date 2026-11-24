# Banco de Dados

## Etapa 7.2.3 — Supabase Cloud e migration inicial

O ambiente de desenvolvimento do banco é exclusivamente o projeto **YFC-Development** no Supabase Cloud, plano gratuito, região São Paulo (`sa-east-1`). A configuração informada é PostgreSQL 17.12, banco `postgres`, schema padrão `public` e fuso UTC. Esta etapa preparou os arquivos no repositório sem conectar ao serviço, aplicar SQL ou usar Docker.

- [Migration 20261124000000](../supabase/migrations/20261124000000_cria_modelo_financeiro.sql) cria `yfc_privado` e as quatro tabelas. [Consultas de verificação](../supabase/tests/verifica_modelo_financeiro.sql) inspecionam metadados e permissões após aplicação autorizada.
- As FKs compostas exigem o mesmo usuário e, em transações, o mesmo tipo da categoria. A exclusão de categoria vinculada é bloqueada, a de meta remove os aportes relacionados e a exclusão de usuário com registros depende de uma política explícita de descarte.
- Os centavos são `bigint` com limites do inteiro seguro do JavaScript por valor. Datas de negócio são `date` e ficam entre os anos 0001 e 9999. O prazo de metas tem até 120 competências inclusivas. `criado_em` é `timestamptz` e `ordem_cadastro` é uma identidade separada, estável para ordenação, com lacunas permitidas. Use ordem decrescente nas transações e crescente em categorias e metas. No histórico de aportes, desempate a data por ordem decrescente.
- PKs e restrições de unicidade fornecem os índices de identidade, busca e ordenação por usuário. Os três índices adicionais dão suporte ao vínculo transação–categoria, às consultas por data financeira e ao histórico de aportes por meta.
- RLS começa sem políticas e a migration revoga privilégios de `PUBLIC`, `anon` e `authenticated` no schema, nas tabelas e nas sequências. A revogação dos defaults locais ao schema não cancela defaults globais. Por isso, a migration também revoga explicitamente os privilégios dos objetos criados e as consultas verificam o acesso efetivo dos papéis. Mantenha `yfc_privado` fora de **Exposed schemas** no Dashboard do Supabase. A lista de exposição é configuração da Data API e deve ser conferida separadamente.

### Fluxo remoto proposto, após aprovação

Use a Supabase CLI v2 via `npx`, a partir da raiz, sem instalação global. Para repetibilidade entre máquinas, registre a versão exata testada e use esse número no lugar de `2` nas próximas execuções. Se a CLI exigir configuração local e ainda não houver `supabase/config.toml`, use `npx supabase@2 init` e revise os arquivos gerados. Os comandos de link, histórico e push abaixo usam o projeto remoto e dispensam iniciar a stack local.

```powershell
npx supabase@2 --version
npx supabase@2 login
npx supabase@2 link --project-ref REF_DO_YFC_DEVELOPMENT
npx supabase@2 migration list --linked
npx supabase@2 db push --linked --dry-run
# Execute a linha seguinte apenas após conferir o alvo e as versões pendentes.
npx supabase@2 db push --linked
npx supabase@2 migration list --linked
```

Use o fluxo de login da CLI e mantenha tokens, senhas e strings de conexão fora do Git. Antes de aplicar, confirme que o histórico e o schema de destino condizem com uma primeira migration e que o dry-run lista somente `20261124000000`. O dry-run lista o plano e não valida o DDL em PostgreSQL. O push registra a versão em `supabase_migrations.schema_migrations`. Depois de aplicar, execute as consultas de verificação no editor SQL e registre a versão aplicada, o ambiente e os resultados. Use uma nova migration para correções após aplicação. Evite aplicar o arquivo pelo editor SQL como fluxo normal, pois isso não atualiza automaticamente o histórico da CLI.

### Regras reservadas para a próxima etapa

- Derivar `nome_chave` em um caminho de gravação confiável e testar sua paridade com TypeScript para NFC, espaços Unicode, minúsculas `pt-BR` e acentos. O `CHECK` atual só faz uma checagem básica de texto e a unicidade compara a chave fornecida.
- Implementar operações atômicas com controle de concorrência para os totais independentes de receitas e despesas, a reserva somada aos aportes e a validação de datas contra o período da meta. Preservar a imutabilidade de início e reserva na edição, e permitir a exclusão individual, sem edição de aportes. Usar a referência civil configurável proposta (`America/Sao_Paulo`) para “hoje”, sem mudar o fuso UTC do banco.
- Definir reenvio por UUID estável, privilégios das funções SQL, políticas por usuário e contrato de serialização exata de centavos pela Data API. Validar chamadas diretas, testes de concorrência e limites em PostgreSQL real antes de liberar gravações.

## Modelo adicional em memória — Metas (2026-11-12)

Não há banco novo. `Meta` armazena `id` string, `nome`, `valorObjetivoCentavos`, `valorInicialCentavos`, `dataInicio` e `dataLimite`. `Aporte` armazena `id` string, `metaId`, `valorCentavos` positivo e `data`. `EstadoMetas` contém os dois arrays e erro transitório. Progresso, situação e roteiros são derivados; não são campos persistidos. Reserva inicial não é duplicada como aporte.

Arrays ficam no App, separados do estado de categorias/transações, e são apagados ao recarregar/sair. IDs são aleatórios criptográficos com recusa de colisões no respectivo conjunto. O reducer valida referência ao excluir aporte; excluir meta remove somente seus aportes. Edição preserva o histórico e os campos imutáveis.

Essa seção registra a implementação histórica em memória. O modelo PostgreSQL e o estado da primeira migration estão descritos na Etapa 7.2.3.

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## Estado confirmado

A API inicial da Etapa 7.1 expõe uma rota de saúde e ainda não usa banco de dados. A primeira migration está preparada para revisão e ainda não foi aplicada ou validada em PostgreSQL nesta etapa.

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

Antes de implementar persistência, definir tecnologia, esquema e propriedade dos dados; unicidade de IDs de transações; integridade de categorias no servidor; semântica de datas; retenção/exclusão; backup e restauração; migrations e ambientes. A representação monetária atual foi aprovada como centavos inteiros seguros, com limites e integridade de sinal/tipo descritos em [[03 - Regras Financeiras]]; o armazenamento futuro deverá preservar essas regras. Não há dados persistidos a migrar nesta etapa. Isolamento por usuário deve ser aplicado e testado no servidor, não por filtro de interface.

Os dados do ambiente Cloud nesta nota foram informados pelo responsável pelo projeto. Nenhuma conexão remota ou migration foi executada nesta etapa.
