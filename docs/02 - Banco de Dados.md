# Banco de Dados

## Modelo adicional em memória — Metas (2026-11-12)

Não há banco novo. `Meta` armazena `id` string, `nome`, `valorObjetivoCentavos`, `valorInicialCentavos`, `dataInicio` e `dataLimite`. `Aporte` armazena `id` string, `metaId`, `valorCentavos` positivo e `data`. `EstadoMetas` contém os dois arrays e erro transitório. Progresso, situação e roteiros são derivados; não são campos persistidos. Reserva inicial não é duplicada como aporte.

Arrays ficam no App, separados do estado de categorias/transações, e são apagados ao recarregar/sair. IDs são aleatórios criptográficos com recusa de colisões no respectivo conjunto. O reducer valida referência ao excluir aporte; excluir meta remove somente seus aportes. Edição preserva o histórico e os campos imutáveis.

PostgreSQL continua futuro: será necessário definir propriedade por usuário, constraints, representação dos inteiros no contrato HTTP, atomicidade, política de exclusão, migrations e backup. Nenhuma conexão, esquema ou autenticação foi implementada.

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## Estado confirmado

Não foi identificado banco de dados implementado. `backend/` contém apenas `.gitkeep`. Não foram encontrados esquema SQL, migrations, ORM, repositório de dados, conexão ou tabelas. PostgreSQL é citado no README raiz, mas sua adoção efetiva não é confirmada pelo código.

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

Não foi possível confirmar banco externo, volume real, infraestrutura, credenciais, backups ou integrações fora deste repositório. Nenhuma conexão ou migration foi executada.
