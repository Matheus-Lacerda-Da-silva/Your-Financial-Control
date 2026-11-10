---
name: code-review
description: Revisar código React e TypeScript do Your Financial Control, com achados verificáveis sobre bugs, duplicações, tipagem e integridade financeira. Usar em pedidos de revisão de código, alterações ou fluxos financeiros; entregar diagnóstico e testes recomendados sem aplicar correções automaticamente.
---

# Revisão de código

## Escopo e limites

- Leia `AGENTS.md` e `docs/00 - Visão Geral.md`, a partir da raiz do repositório. Para arquitetura e finanças, consulte `docs/01 - Arquitetura.md` e `docs/03 - Regras Financeiras.md`; leia `docs/02 - Banco de Dados.md` quando houver persistência ou propriedade de dados envolvida.
- Confirme as conclusões no código atual. A documentação registra uma auditoria histórica e não substitui evidência atual. Não presuma backend, banco ou autenticação a partir de planos ou README.
- Revise o diff ou os arquivos solicitados e siga os consumidores, tipos e testes necessários para avaliar o impacto. Sem escopo explícito, priorize os fluxos de transações e saldo; declare o alcance examinado.
- Durante a revisão, não altere código, testes, documentação, dependências ou configurações sem autorização. Recomendar uma correção não autoriza aplicá-la. Não execute migrations, deploy, commit ou push como parte da revisão.
- Não exponha credenciais ou dados financeiros reais. Use exemplos sintéticos e trechos mínimos sem dados sensíveis.

## Critérios de inspeção

### React e TypeScript

- Verifique estado derivado, atualizações concorrentes, closures obsoletas, dependências e limpeza de efeitos, mutações e identidade das chaves em listas. Relacione cada problema ao comportamento observável; não exija memoização sem evidência de necessidade.
- Siga cadastro, edição e exclusão até os consumidores do estado, incluindo resumo, navegação e limpeza de sessão. Confira cancelamento, reenvio, entradas inválidas e preservação dos demais registros.
- Examine contratos de props, unions, nulabilidade, conversões numéricas e casts que ocultem estados inválidos. Tipos TypeScript e atributos HTML não substituem validação em execução.
- Compare regras duplicadas, especialmente cadastro versus edição e representações de transações em telas diferentes. Reporte divergência ou risco concreto de manutenção; sem efeito demonstrável, classifique extração de código como sugestão, não bug.
- Quando pertinente ao escopo, confira formulários, interação por teclado, acessibilidade das ações e tratamento de falhas assíncronas. Diferencie sessão demonstrativa de autenticação e autorização reais.

### Integridade financeira

- Rastreie o valor desde a entrada até armazenamento, edição, agregação e exibição. Verifique conversão, `NaN`, infinito, negativos, zero, casas decimais, magnitude máxima e política de arredondamento realmente existente.
- Avalie erros de ponto flutuante e perda de precisão em valores e totais. Formatação BRL e `step="0.01"` não garantem aritmética exata. Não prescreva uma biblioteca ou mudança de unidade sem explicitar impacto e compatibilidade.
- Recalcule receitas, despesas e saldo com exemplos sintéticos; confira sinais, dupla contabilização, alteração de tipo, remoção e eventual filtragem por período. Verifique coerência entre `tipo` e sinal de `valor` em cálculo e apresentação.
- Confira datas, fuso e ordenação: ordem de cadastro não equivale à data financeira. Não trate lançamento futuro ou ausência de filtros como defeito sem requisito que sustente essa conclusão.
- Inspecione geração e unicidade de IDs, inclusive chamadas no mesmo milissegundo quando houver `Date.now()`. Verifique consequências de colisões em chaves React, `map` de edição e `filter` de exclusão. Separe a possibilidade demonstrável de colisão de uma ocorrência real não observada.
- Quando houver persistência/API, confira propriedade por usuário, autorização no servidor, integridade e atomicidade. A ausência desses recursos em uma demo deve ser descrita como limite de uso real, sem inventar uma exploração de serviço inexistente.

## Evidência e severidade

Classifique por impacto e condições reais, sem elevar severidade apenas pelo tema financeiro:

| Severidade | Critério |
| --- | --- |
| Crítica | Perda financeira/dados ou acesso indevido grave e abrangente com caminho demonstrado; exige ação imediata |
| Alta | Resultado financeiro incorreto relevante, corrupção/perda de registros ou falha de autorização comprovada em fluxo alcançável |
| Média | Falha com impacto limitado, condição menos comum ou risco concreto de inconsistência/manutenção |
| Baixa | Problema localizado de baixo impacto; melhorias sem defeito comprovado ficam em sugestões |

- **Confirmado:** mecanismo e caminho sustentados pelo código, teste ou reprodução. Não significa incidente já ocorrido. Mostre precondição, resultado esperado e observado/deduzido; identifique quando a evidência for apenas estática.
- **Hipótese:** depende de requisito, ambiente ou condição não confirmada. Declare o que falta e como verificar; não apresente como bug nem misture à lista confirmada.
- Cite arquivo e linha atuais para cada achado, obtidos por leitura numerada. Use a menor localização útil e inclua consumidores quando necessários para demonstrar o efeito. Não invente linhas nem reutilize números de auditorias anteriores.
- Em revisão de diff, diferencie regressões introduzidas de problemas preexistentes. Não reporte o mesmo mecanismo repetidamente; agrupe locais relacionados.

## Testes e entrega

- Inspecione os testes e scripts disponíveis. Execute verificações existentes compatíveis com o escopo e com as permissões, sem modificar fontes ou instalar dependências. Informe comando, resultado e limitações; falha do ambiente não comprova defeito da aplicação.
- Recomende para cada risco um teste com entrada sintética, ação e resultado esperado: receitas menos despesas; edição de tipo; exclusão preservando outros IDs; IDs gerados com relógio fixo; valores decimais/extremos/inválidos; datas e sessão quando pertinentes. Se o requisito estiver indefinido, explicite a decisão necessária antes de fixar a expectativa.
- Não crie ou modifique testes durante uma revisão sem autorização. Diferencie testes executados, apenas inspecionados e recomendados; não declare cobertura sem medição.
- Responda em português do Brasil, com achados confirmados primeiro, em ordem de severidade. Para cada um, forneça: severidade, título, `arquivo:linha`, cenário/evidência, consequência, recomendação e teste sugerido.
- Apresente hipóteses e perguntas pendentes separadamente, com severidade provisória quando houver base, seguidas dos testes executados e limites da análise. Sugestões de refatoração ficam separadas dos defeitos.
- Se nenhum problema for confirmado, diga isso explicitamente e registre lacunas relevantes. Não interprete ausência de achados como garantia de correção ou segurança.
