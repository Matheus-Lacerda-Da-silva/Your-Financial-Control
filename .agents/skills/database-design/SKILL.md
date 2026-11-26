---
name: database-design
description: Modelar e revisar o PostgreSQL do Your Financial Control, incluindo schema, migrations, integridade financeira e isolamento de dados no Supabase.
---

# Database Design & Review do Your Financial Control

## Arquitetura e prioridades do MVP

O MVP utiliza Supabase PostgreSQL, Supabase Auth e Data API por HTTPS. O Hono usa o SDK oficial com chave publicável e JWT do usuário. Use RLS convencional para `authenticated`, grants mínimos e `America/Sao_Paulo` como referência civil. Siga KISS, YAGNI e a ordem do MVP. Entregue autenticação e categorias primeiro. Libere escrita nas outras tabelas junto das respectivas garantias no banco. Dimensione testes de concorrência para cada regra entre linhas quando ela entrar no escopo.

## Contexto e escopo

Leia `AGENTS.md` e `docs/00 - Visão Geral.md`. Consulte `docs/01 - Arquitetura.md`, `docs/02 - Banco de Dados.md` e `docs/03 - Regras Financeiras.md` conforme a tarefa. Confirme as regras no código e nos testes de categorias, transações, metas e aportes. Confira as migrations e a configuração do backend quando existirem. Identifique o que está planejado, implementado ou validado no banco. Planejamento e revisão são somente leitura, salvo autorização explícita para implementar.

## Modelo relacional e migrations

- Descreva entidades, propriedade, cardinalidade e ciclo de vida. Prefira armazenar fatos e derivar saldo, progresso e totais conforme as regras atuais. Preserve a independência entre aportes e transações.
- Justifique PKs, FKs, nulabilidade, defaults, `CHECK` e `UNIQUE`. Avalie FKs compostas com `usuario_id` para impedir vínculos entre contas e, quando aplicável, com `tipo` para garantir a compatibilidade entre categoria e transação. Explique as ações de atualização e exclusão. Use `auth.users(id)` como referência quando o modelo aprovado usar Supabase Auth.
- Separe a data financeira civil (`date`) dos metadados de criação (`timestamptz`). Preserve a ordem de cadastro quando ela for parte do comportamento. Registre o fuso de referência para regras que dependem de “hoje”.
- Justifique cada índice com uma consulta, ordenação ou verificação de vínculo. Considere os índices já criados por PK e `UNIQUE` e avalie as colunas do lado que referencia a FK. Quando houver dados representativos em ambiente autorizado, confira o plano de execução antes de afirmar ganho de desempenho.
- Quando a implementação estiver autorizada, versione as migrations em ordem e preserve as já aplicadas. Valide a recriação de uma base vazia e a atualização de uma base de teste da versão anterior, quando aplicável. Para dados existentes, descreva pré-condições, preenchimento de colunas, impacto e recuperação antes de introduzir restrições ou mudanças incompatíveis.

## Dinheiro e nomes

- Armazene dinheiro em `bigint` e centavos inteiros. Preserve o limite de `9.007.199.254.740.991` centavos definido pelo inteiro seguro do JavaScript, as receitas positivas, as despesas negativas e os limites independentes de receitas e despesas. Para metas, preserve reserva, objetivo e limite de aportes. Valide sinal, faixa e sintaxe antes de conversões que possam arredondar.
- Verifique o percurso completo do valor entre PostgreSQL, Data API, Hono e TypeScript. Confira o JSON bruto e o resultado após o parse. Se o contrato usar strings decimais inteiras, produza-as antes da serialização e converta para `number` somente após validar a faixa. Teste ida e volta com centavos no limite, sinais, frações inválidas e totais, incluindo valores que o banco consegue representar mas o contrato deve recusar.
- Compare a normalização SQL com o utilitário TypeScript de categorias. Exercite NFC, espaços Unicode, formas compostas e decompostas, minúsculas `pt-BR` e acentos significativos. Verifique tanto o nome gravado quanto a chave de unicidade. Use a versão de PostgreSQL e a collation do ambiente alvo para validar a paridade.

## Isolamento e superfície exposta

- Derive o proprietário da identidade autenticada. Revise RLS e grants juntos, incluindo `USING` para linhas existentes e `WITH CHECK` para o estado resultante. Confira leitura, inserção, edição e exclusão com dois usuários fictícios e acesso anônimo, inclusive troca de proprietário e vínculos cruzados.
- Inventarie os schemas expostos pela Data API e os privilégios efetivos em tabelas, views e funções. Em ambiente de teste autorizado, faça chamadas diretas ao Supabase pelos mesmos papéis usados pelo cliente, sem passar pelo Hono. Confirme que funções acessíveis preservam propriedade, validação e invariantes. O Hono não é a única fronteira quando a Data API expõe um caminho alternativo.
- Prefira `SECURITY INVOKER` quando os privilégios do chamador forem suficientes. Revise `EXECUTE` por assinatura, grants padrão e acesso de `PUBLIC` e `anon`. Se `SECURITY DEFINER` for necessário, justifique a elevação, limite o proprietário e os grants, defina um `search_path` seguro e qualifique os objetos referenciados. Verifique se as políticas de linha continuam efetivas no contexto real da função.
- Confira que chaves privilegiadas, senhas, tokens e strings de conexão com credenciais não estejam no código, em exemplos, logs ou bundles. Diferencie a chave publicável de credenciais privilegiadas. Use dados fictícios e reporte apenas o local e a categoria de um segredo encontrado, preservando o valor.

## Atomicidade, concorrência e reenvio

- Use constraints para invariantes de linha ou de relacionamento. Para invariantes entre linhas, valide e grave na mesma transação com uma estratégia explícita de concorrência. Documente o nível de isolamento, a granularidade, a ordem dos bloqueios e o comportamento de todas as rotas de gravação. Em caso de bloqueio, leia os registros relevantes depois de adquiri-lo e confirme que uma recusa não deixa alterações parciais.
- Reproduza em duas conexões independentes aportes que juntos excedem o restante, aporte concorrendo com edição de objetivo ou prazo e lançamentos próximos ao limite agregado. Confira o resultado final, as operações aceitas e recusadas e a independência dos aportes em relação ao saldo.
- Diferencie duplicidade de domínio de reenvio da mesma operação. Use unicidade no banco e, quando o contrato pedir, UUID estável ou chave de idempotência por usuário e operação. Teste duas requisições concorrentes com a mesma chave e a repetição após resposta perdida. Se houver replay durável, guarde o registro idempotente na mesma transação e defina o tratamento de payload diferente para a mesma chave.

## Verificação e entrega

- Cruze as versões e capacidades do PostgreSQL e do Supabase com o schema, as extensões e a Data API usados. Verifique no runtime Workers o caminho real do backend até o banco, incluindo cliente, bindings e dependências Node quando relevantes. Um teste em Node, um build ou a rota de saúde não comprovam compatibilidade da integração.
- Execute as verificações pertinentes e autorizadas com dados fictícios. Valide constraints, grants, RLS e concorrência em PostgreSQL real antes de dar essas garantias como comprovadas. Informe versão, ambiente, casos executados e pendências.
- Registre decisões e impactos na documentação pertinente quando o escopo permitir. Use um diagrama ER quando ajudar a entender o modelo. Em português do Brasil, mostre qual problema cada decisão resolve, com um exemplo curto de falha que ela impede. Para aprendizado e entrevistas, explique a diferença entre integridade relacional, autorização e consistência sob concorrência. Prefira o modelo mais simples que preserve as garantias necessárias.
