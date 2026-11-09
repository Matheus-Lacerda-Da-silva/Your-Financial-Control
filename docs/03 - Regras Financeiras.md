# Regras Financeiras

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[04 - Roadmap]].

## Lançamentos implementados

Evidências: `frontend/src/pages/Transacoes.tsx`, `frontend/src/types/transacao.ts` e `frontend/src/App.tsx`.

- Cadastro e edição exigem descrição e categoria não vazias após `trim`, data não vazia e valor convertido por `Number` que seja finito e maior que zero.
- Descrição e categoria são verificadas com trim, mas armazenadas como digitadas, incluindo espaços nas extremidades.
- O usuário informa uma magnitude positiva. Os handlers convertem despesa para valor negativo; receita permanece positiva. Zero e valores negativos de entrada são rejeitados.
- O input usa `min: 0` e `step: '0.01'`. O handler não exige explicitamente duas casas decimais; edição é salva por botão fora de um submit de formulário. A restrição HTML não constitui política de precisão do domínio.
- Ao editar, a interface mostra `Math.abs(valor)` e reconstrói o sinal conforme o tipo escolhido. Mantém o ID e a posição do registro no array.
- Exclusão exige confirmação em diálogo; cancelar preserva o registro. A remoção é definitiva apenas dentro do estado atual, sem lixeira ou desfazer identificado.
- Novos registros são inseridos no início, com ID baseado em milissegundos. Não há ordenação por data financeira.

## Resumo financeiro

Evidência: `frontend/src/pages/Inicio.tsx`.

| Indicador | Regra |
| --- | --- |
| Receitas | Soma dos valores estritamente positivos |
| Despesas | Soma dos valores absolutos dos lançamentos estritamente negativos |
| Saldo atual | Receitas menos despesas |
| Últimas transações | Primeiros cinco itens do array, ou seja, ordem de cadastro e não da data informada |

Os totais incluem todos os lançamentos em memória, sem filtro de período, situação de pagamento ou restrição a datas passadas. Uma data futura aceita pelo formulário participa dos totais. O saldo inicial implícito é zero; não há entidade de conta ou saldo de abertura identificada.

O cálculo usa o sinal de `valor`; rótulos usam `tipo`. A consistência é produzida pelos handlers atuais, sem invariante central ou validação no servidor.

## Moeda e datas

`frontend/src/utils/formatadores.ts` formata moeda em `pt-BR` e BRL via `toLocaleString`. Isso formata a exibição, sem corrigir a precisão dos cálculos em ponto flutuante. Não foi identificada regra explícita de arredondamento, centavos inteiros, decimal exato ou limite máximo de valores/totais.

`dataLocalAtual` usa ano/mês/dia locais do navegador. O cadastro inicia e reinicia com essa data. `formatarData` separa a string por hífens e retorna dia/mês/ano; não valida calendário nem trata formatos inválidos. Os handlers verificam presença de data, sem validação semântica explícita ou política de fuso central.

## Não identificado e pendente de definição

Não foram identificados parcelamento, recorrência, juros, transferências entre contas, conciliação, orçamento, metas, importação/exportação, múltiplas moedas, estado pago/pendente ou relatórios por período. São lacunas de escopo, não funcionalidades planejadas confirmadas.

Gerenciamento de categorias é anunciado como em preparação em `Categorias.tsx`; a implementação atual aceita texto livre, sem padronização, deduplicação ou integridade referencial. Nenhum prazo ou regra futura foi identificado.

## Verificação ausente

Não foram identificados testes automatizados destas regras. Priorizar testes de receita/despesa/saldo, edição de tipo, exclusão, entradas inválidas, precisão decimal, valores extremos e datas; decidir primeiro o comportamento esperado das lacunas. Ver [[04 - Roadmap]].
