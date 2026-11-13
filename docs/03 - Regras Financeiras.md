# Regras Financeiras

## Evolução das metas — 2026-11-13

- Janela completa entre início e prazo da meta, de uma a 120 competências civis, sem meses posteriores ao prazo. Calendário validado sem conversão UTC.
- Planejado acumulado: reserva inicial mais parcelas acumuladas de `resumirMeta.referencia`, nunca do roteiro restante atualizado. Último ponto igual ao objetivo, com centavos exatos.
- Referência corresponde ao objetivo/prazo atuais: edição recalcula inclusive competências passadas; não há armazenamento de versões históricas. Limitação explícita na interface.
- Realizado: reserva inicial uma vez mais aportes por competência. Meses encerrados mantêm acumulado mesmo sem aportes. Mês atual considera fatos até hoje e é parcial; comparação com expectativa do fim do mês não implica atraso.
- Antes do início (inclusive no mesmo mês), realizado null. Competências posteriores ao mês atual também null e não ligadas por projeção. Reserva continua no resumo mesmo antes do início, pois não possui data própria no modelo.
- Conclusão antecipada mantém acumulado no objetivo nas competências já ocorridas; futuras continuam null. Conclusão por reserva integral respeita situação existente. Prazo encerrado é aceito para leitura e mantém série final sem estender período.
- Validação local não altera domínio: objetivo/reserva inteiros seguros nos limites existentes; aportes vinculados positivos, IDs únicos, datas dentro do período e não futuras. Erro monetário, data inválida, duplicidade ou acumulado excedente torna a seção indisponível sem resultado parcial. Aportes de outras metas não participam.
- Somas usam `somarCentavos`; exibição usa `formatarMoeda`. Aproximação somente na geometria SVG. Exclusão de aporte e edição de meta recalculam a evolução por props, sem estado agregado duplicado.

## Evolução financeira — 2026-11-13

- Agregação derivada somente de transações, por data financeira civil válida `YYYY-MM-DD`; não altera arrays, resumo geral, reducer, metas ou aportes.
- Seis meses civis cronológicos, incluindo o atual e cinco anteriores, com zeros em meses sem registros. Aritmética mensal trata dezembro/janeiro sem conversão UTC. A referência usa a data local já atualizada por Início na virada do dia/foco/visibilidade.
- Inclui futuros dentro do mês atual; exclui meses posteriores e anteriores à janela. Cartões financeiros continuam exibindo totais gerais.
- Receitas positivas e magnitudes positivas de despesas são somadas separadamente por `somarCentavos`, sem compensação. Formatação exata por `formatarMoeda`; ponto flutuante apenas na geometria visual.
- Valores não inteiros seguros, zero, tipo/sinal incompatível ou overflow mensal impedem o resultado completo; interface exibe indisponibilidade. Valores inválidos são detectados inclusive fora da janela. Não são mostrados totais parciais.
- Datas inválidas são excluídas com contagem e aviso explícito, pois seu período não pode ser determinado; tabela identifica resultados como restritos a datas válidas. Data de referência inválida ou incapaz de abranger seis meses desde o ano 0001 gera indisponibilidade.
- Estado vazio depende da quantidade de transações válidas no período, não do saldo líquido. A tabela mantém seis linhas zeradas no vazio. Reagregação por props, sem estado duplicado; sem filtros configuráveis.

## Metas e aportes — regras implementadas em 2026-11-12

- Domínio independente: não altera receitas, despesas, saldo, transações ou categorias. Não inclui rendimentos, juros ou inflação.
- Objetivo positivo em centavos seguros; reserva inicial entre zero e objetivo. O formulário reconhece zero explicitamente para reserva e reutiliza o conversor existente para positivos, sem mudar regras monetárias compartilhadas.
- Nome normalizado com NFC/trim/espaços, obrigatório; nomes repetidos são permitidos. IDs não vazios, sem espaços externos, únicos por conjunto, gerados criptograficamente na interface.
- Datas civis reais `YYYY-MM-DD`, anos de 0001 a 9999, validação de bissexto. Início <= término; criação/edição exige término hoje ou futuro. Até 120 meses inclusivos, sem proporcionalidade por dias. Início passado/futuro permitido.
- Referência: objetivo menos reserva inicial, distribuído pelo período completo das configurações atuais. Não desconta aportes nem preserva versões anteriores do planejamento. Não representa compromisso histórico imutável.
- Restante atualizado: objetivo menos reserva inicial e todos os aportes. Distribuição pelos meses a partir do mais recente entre início e mês atual, incluindo o mês atual enquanto o prazo estiver aberto. Aportes já realizados não são cobrados novamente. Períodos passados ficam no histórico de aportes, sem recomendação retroativa.
- Distribuição usa quociente/resto BigInt; primeiros meses recebem os centavos excedentes. Soma exata, diferença máxima de um centavo; parcelas zero são possíveis. O percentual é apenas apresentação, em centésimos, limitado a 99,99% enquanto houver restante.
- Aportes positivos, até o restante, sem frações de centavo; excedente recusado integralmente. Data entre início e término e não futura. Registro após vencimento é permitido para fato ocorrido dentro do período. Fato posterior ao prazo requer prorrogação.
- Exclusão individual exige confirmação na interface, preserva outros aportes e recalcula acumulado/roteiro/situação. Não há edição de aportes. Não há estorno em Transações.
- Edição de meta altera somente nome, objetivo e prazo; início, reserva, ID e aportes preservados. Objetivo não pode ser menor que acumulado; prazo não pode anteceder início ou aporte existente. Aumento de objetivo/prorrogação pode reabrir meta.
- Exclusão de meta confirma remoção dos aportes vinculados e ocorre em uma operação pura. Cancelar não altera estado. Erros do reducer preservam ambos os arrays anteriores.
- Situação derivada: Concluída se acumulado=objetivo; senão Planejada antes do início; Prazo encerrado após término; Em andamento nos demais casos. Conclusão tem precedência. Sem planejamento restante após término/conclusão.

Exemplos cobertos: R$ 12.000 em 12 meses = R$ 1.000/mês; R$ 100 em 3 meses = 33,34 + 33,33 + 33,33; dois centavos em 3 meses = 0,01 + 0,01 + 0,00. Datas e operações de Metas não modificam a validação preexistente de Transações.

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[04 - Roadmap]].

## Lançamentos implementados

Evidências: `frontend/src/pages/Transacoes.tsx`, `frontend/src/types/transacao.ts` e `frontend/src/App.tsx`.

- Cadastro e edição exigem descrição não vazia após `trim`, categoria cadastrada com tipo compatível, data não vazia e magnitude monetária válida, convertida do texto diretamente para centavos inteiros por `utils/dinheiro.ts`.
- Descrição é verificada com trim, mas armazenada como digitada, incluindo espaços nas extremidades. Categoria é selecionada por ID; seu nome é normalizado no cadastro/edição da própria categoria.
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

`utils/transacoes.ts` centraliza resumo, operações e o reducer financeiro original. O coordenador atual de categorias/transações em `utils/estadoFinanceiro.ts` reutiliza essas operações, validando também o vínculo. Antes de atualizar o estado, são validados inteiros seguros e coerência de sinal/tipo. Cadastro ou edição inválidos preservam os arrays anteriores e produzem uma mensagem de erro. A pré-validação mantém os campos e o diálogo abertos quando a operação é recusada; o reducer revalida sobre o estado mais recente. Não há validação de servidor nesta demonstração.

## Moeda e datas

`frontend/src/utils/dinheiro.ts` define o limite de `Number.MAX_SAFE_INTEGER` centavos: R$ 90.071.992.547.409,91 por lançamento em magnitude e por total de receitas/despesas. O saldo também é verificado como inteiro seguro. Receitas e despesas não podem ultrapassar o limite mesmo que se compensem no saldo.

A entrada aceita dígitos, opcionalmente ponto e uma ou duas casas decimais, com espaços externos ignorados. Exemplos válidos: `12`, `12.3`, `0.01`. Rejeita frações de centavo, zero, negativos, vírgula no texto recebido pelo utilitário, agrupadores, notação científica, hexadecimal, `NaN` e infinito. O input numérico do navegador continua sendo utilizado; o utilitário recebe sua string de valor. Nenhuma instalação ou dependência foi adicionada.

Conversão e somas usam `BigInt` transitoriamente para verificar limites antes de retornar `number` inteiro seguro. Não há arredondamento monetário automático. `formatarMoeda` recebe centavos, formata a parte inteira com `Intl.NumberFormat`/`BigInt` e insere os centavos exatos, sem dividir por 100 em ponto flutuante. Isso preserva inclusive o último centavo no limite e apresenta zero como `R$ 0,00`.

`dataLocalAtual` usa ano/mês/dia locais do navegador. O cadastro inicia e reinicia com essa data. `formatarData` separa a string por hífens e retorna dia/mês/ano; não valida calendário nem trata formatos inválidos. Os handlers verificam presença de data, sem validação semântica explícita ou política de fuso central.

## Não identificado e pendente de definição

Não foram identificados parcelamento, recorrência, juros, transferências entre contas, conciliação, orçamento, metas, importação/exportação, múltiplas moedas, estado pago/pendente ou relatórios por período. São lacunas de escopo, não funcionalidades planejadas confirmadas.

## Categorias e vínculos em memória

Desde 2026-11-11, `Categorias.tsx` implementa CRUD local. Categoria tem ID estável, nome e tipo Receita/Despesa. Nome usa normalização Unicode NFC, trim e consolidação dos espaços internos; vazio é recusado. Duplicidade compara nome normalizado em minúsculas pt-BR dentro do mesmo tipo, ignorando o próprio ID ao editar. Acentos são significativos e o mesmo nome pode existir em tipos diferentes.

Transações armazenam `categoriaId`, com existência e compatibilidade de tipo validadas em `utils/estadoFinanceiro.ts` usando `utils/categorias.ts`. Trocar o tipo no formulário limpa a seleção; não há escolha automática. Renomear categoria atualiza apenas a exibição derivada, sem reescrever transações, valores, datas ou ordem. Categoria com vínculos não pode mudar de tipo nem ser excluída; o usuário deve primeiro reclassificar ou excluir os lançamentos. Categoria sem vínculos pode mudar de tipo, respeitando duplicidade no destino, ou ser excluída após confirmação. Não há exclusão em cascata ou reclassificação automática.

Categorias e transações começam vazias e são eliminadas na saída/recarga. Nenhuma categoria padrão é adicionada. As novas regras são de classificação e integridade; conversão, limites, sinais e cálculos monetários permanecem iguais. O coordenador reutiliza `aplicarOperacao` e revalida no reducer; recusas preservam ambos os arrays.

## Verificação ausente

`frontend/tests/financeiro.test.mjs` testa conversão, rejeição de `0.005`, limites, somas, saldo zero, formatação exata, edição, exclusão, consistência de sinal/tipo e preservação de dados em operações inválidas. Os testes exercitam as mesmas funções e reducer utilizados pela aplicação; não substituem testes de interação no navegador. Datas e colisões de IDs continuam fora desta correção. Ver [[04 - Roadmap]] e [[05 - Diário de Desenvolvimento]].
