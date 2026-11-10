# Regras Financeiras

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[04 - Roadmap]].

## Lançamentos implementados

Evidências: `frontend/src/pages/Transacoes.tsx`, `frontend/src/types/transacao.ts` e `frontend/src/App.tsx`.

- Cadastro e edição exigem descrição e categoria não vazias após `trim`, data não vazia e magnitude monetária válida, convertida do texto diretamente para centavos inteiros por `utils/dinheiro.ts`.
- Descrição e categoria são verificadas com trim, mas armazenadas como digitadas, incluindo espaços nas extremidades.
- O usuário informa uma magnitude positiva em reais. O estado armazena `valorCentavos`: inteiro seguro positivo para receita e negativo para despesa. Zero e valores negativos de entrada são rejeitados; a camada de operações também verifica coerência entre sinal e tipo.
- O input mantém `min: 0` e `step: '0.01'`, mas a validação compartilhada em execução rejeita mais de duas casas decimais, inclusive `0.005`, sem arredondamento silencioso, tanto no cadastro quanto na edição.
- Ao editar, a interface recebe a magnitude decimal exata produzida por `centavosParaEntrada` e reconstrói o sinal conforme o tipo escolhido. Mantém o ID e a posição do registro no array.
- Exclusão exige confirmação em diálogo; cancelar preserva o registro. A remoção é definitiva apenas dentro do estado atual, sem lixeira ou desfazer identificado.
- Novos registros são inseridos no início, com ID baseado em milissegundos. Não há ordenação por data financeira.

## Resumo financeiro

Evidência: `frontend/src/pages/Inicio.tsx`.

| Indicador | Regra |
| --- | --- |
| Receitas | Soma segura dos centavos positivos |
| Despesas | Soma segura das magnitudes em centavos das despesas |
| Saldo atual | Receitas menos despesas, em centavos inteiros; zero sem sinal negativo |
| Últimas transações | Primeiros cinco itens do array, ou seja, ordem de cadastro e não da data informada |

Os totais incluem todos os lançamentos em memória, sem filtro de período, situação de pagamento ou restrição a datas passadas. Uma data futura aceita pelo formulário participa dos totais. O saldo inicial implícito é zero; não há entidade de conta ou saldo de abertura identificada.

`utils/transacoes.ts` centraliza resumo, operações e reducer. Antes de atualizar o estado, valida inteiros seguros e coerência de sinal/tipo. Cadastro ou edição inválidos preservam o array anterior e produzem uma mensagem de erro. A pré-validação dos formulários mantém os campos e o diálogo abertos quando a operação é recusada; o reducer revalida sobre o estado mais recente. Não há validação de servidor nesta demonstração.

## Moeda e datas

`frontend/src/utils/dinheiro.ts` define o limite de `Number.MAX_SAFE_INTEGER` centavos: R$ 90.071.992.547.409,91 por lançamento em magnitude e por total de receitas/despesas. O saldo também é verificado como inteiro seguro. Receitas e despesas não podem ultrapassar o limite mesmo que se compensem no saldo.

A entrada aceita dígitos, opcionalmente ponto e uma ou duas casas decimais, com espaços externos ignorados. Exemplos válidos: `12`, `12.3`, `0.01`. Rejeita frações de centavo, zero, negativos, vírgula no texto recebido pelo utilitário, agrupadores, notação científica, hexadecimal, `NaN` e infinito. O input numérico do navegador continua sendo utilizado; o utilitário recebe sua string de valor. Nenhuma instalação ou dependência foi adicionada.

Conversão e somas usam `BigInt` transitoriamente para verificar limites antes de retornar `number` inteiro seguro. Não há arredondamento monetário automático. `formatarMoeda` recebe centavos, formata a parte inteira com `Intl.NumberFormat`/`BigInt` e insere os centavos exatos, sem dividir por 100 em ponto flutuante. Isso preserva inclusive o último centavo no limite e apresenta zero como `R$ 0,00`.

`dataLocalAtual` usa ano/mês/dia locais do navegador. O cadastro inicia e reinicia com essa data. `formatarData` separa a string por hífens e retorna dia/mês/ano; não valida calendário nem trata formatos inválidos. Os handlers verificam presença de data, sem validação semântica explícita ou política de fuso central.

## Não identificado e pendente de definição

Não foram identificados parcelamento, recorrência, juros, transferências entre contas, conciliação, orçamento, metas, importação/exportação, múltiplas moedas, estado pago/pendente ou relatórios por período. São lacunas de escopo, não funcionalidades planejadas confirmadas.

Gerenciamento de categorias é anunciado como em preparação em `Categorias.tsx`; a implementação atual aceita texto livre, sem padronização, deduplicação ou integridade referencial. Nenhum prazo ou regra futura foi identificado.

## Verificação ausente

`frontend/tests/financeiro.test.mjs` testa conversão, rejeição de `0.005`, limites, somas, saldo zero, formatação exata, edição, exclusão, consistência de sinal/tipo e preservação de dados em operações inválidas. Os testes exercitam as mesmas funções e reducer utilizados pela aplicação; não substituem testes de interação no navegador. Datas e colisões de IDs continuam fora desta correção. Ver [[04 - Roadmap]] e [[05 - Diário de Desenvolvimento]].
