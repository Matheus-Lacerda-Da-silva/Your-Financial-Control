# Banco de Dados

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[03 - Regras Financeiras]], [[04 - Roadmap]].

## Estado confirmado

Não foi identificado banco de dados implementado. `backend/` contém apenas `.gitkeep`. Não foram encontrados esquema SQL, migrations, ORM, repositório de dados, conexão ou tabelas. PostgreSQL é citado no README raiz, mas sua adoção efetiva não é confirmada pelo código.

## Modelo existente em memória

O tipo abaixo é um contrato TypeScript, não uma tabela ou esquema de banco. Evidência: `frontend/src/types/transacao.ts`.

| Campo | Tipo confirmado | Uso |
| --- | --- | --- |
| `id` | `number` | Criado por `Date.now()` em `App.tsx` |
| `descricao` | `string` | Texto informado no formulário |
| `tipo` | `'receita'` ou `'despesa'` | Seleção da natureza do lançamento |
| `valor` | `number` | Receita positiva, despesa negativa pelos handlers da interface |
| `categoria` | `string` | Texto livre, sem entidade relacionada |
| `data` | `string` | Input de data; formato esperado `YYYY-MM-DD` |

`App.tsx` mantém um array inicialmente vazio. Cadastro insere no início; edição substitui objetos pelo ID; exclusão filtra pelo ID. Não existem transações de banco, chaves estrangeiras, índices, constraints ou garantias de unicidade identificados. Não há `usuarioId`, conta financeira, timestamps de auditoria ou exclusão lógica no tipo atual.

## Persistência e ciclo de vida

- Dados financeiros e sessão: somente memória React; recarga ou saída apaga os lançamentos.
- Tema: `localStorage`, chave `yfc-tema`, com valores `light`/`dark` e tratamento de indisponibilidade (`frontend/src/theme/TemaProvider.tsx`). Não é um banco financeiro.
- Cadastro: não persiste usuário; e-mail segue ao acesso no estado de navegação (`Cadastro.tsx`).

## Decisões pendentes

Antes de implementar persistência, definir tecnologia, esquema e propriedade dos dados; representação monetária exata e limites; integridade entre sinal e tipo; unicidade de IDs; categorias; semântica de datas; retenção/exclusão; backup e restauração; migrations e ambientes. Nenhuma dessas decisões deve ser inferida como já aprovada. Isolamento por usuário deve ser aplicado e testado no servidor, não por filtro de interface.

Não foi possível confirmar banco externo, volume real, infraestrutura, credenciais, backups ou integrações fora deste repositório. Nenhuma conexão ou migration foi executada.
