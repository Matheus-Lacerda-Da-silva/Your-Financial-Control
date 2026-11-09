# Your Financial Control — Instruções para o Codex

## Objetivo
Auxiliar no desenvolvimento e manutenção do Your Financial Control, preservando o funcionamento existente e priorizando qualidade, segurança e aprendizado.

## Contexto
- Leia `docs/00 - Visão Geral.md` para entender o projeto.
- Consulte apenas os documentos adicionais relevantes à tarefa.
- Confirme a arquitetura e as tecnologias diretamente no código antes de fazer recomendações.
- Não presuma que funcionalidades planejadas já estejam implementadas.

## Fluxo de trabalho
1. Antes de alterar o código, explique brevemente o que pretende fazer.
2. Para alterações grandes, apresente um plano e aguarde aprovação.
3. Faça mudanças pequenas e relacionadas à tarefa solicitada.
4. Preserve o padrão de organização e nomenclatura existente.
5. Execute os testes disponíveis e informe os resultados.
6. Ao concluir alterações importantes, atualize a documentação correspondente em `docs/`.
7. Responda em português do Brasil, explicando decisões técnicas de forma didática.

## Segurança e regras financeiras
- Nunca exponha credenciais, tokens, arquivos `.env` ou dados financeiros reais.
- Não execute migrations destrutivas, operações em produção ou deploy sem autorização explícita.
- Verifique autorização e isolamento de dados entre usuários em funcionalidades financeiras.
- Evite cálculos monetários com arredondamento inadequado; respeite as regras de precisão existentes.
- Não altere regras financeiras sem explicar seus impactos.

## Git e sincronização
- Considere que o projeto é desenvolvido em dois computadores.
- Não execute `git push`, `git reset --hard`, rebase ou force push sem autorização.
- Não inclua segredos, arquivos locais ou dados sensíveis nos commits.
- Antes de encerrar uma tarefa, apresente um resumo das alterações, testes e pendências.

## Skills
- Utilize skills disponíveis quando forem relevantes à tarefa.
- Não instale novas dependências, plugins ou skills sem aprovação.