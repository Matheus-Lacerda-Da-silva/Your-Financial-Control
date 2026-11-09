# Roadmap

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[05 - Diário de Desenvolvimento]].

## Interpretação

Este roadmap é uma proposta da auditoria de 2026-11-09, não um compromisso aprovado ou trabalho já implementado. Impacto e esforço são estimativas relativas: baixo, médio ou alto; não são prazos. P0 precede P1 e P2. As prioridades de segurança tornam-se bloqueadoras antes de qualquer uso real com dados pessoais/financeiros.

## Priorização

| Prioridade | Proposta e estado atual | Impacto | Esforço | Critério de conclusão |
| --- | --- | --- | --- | --- |
| P0 | Definir representação/limites/arredondamento de dinheiro; hoje `number` sem política explícita | Alto | Médio | Regra documentada e testes de decimais, extremos e saldo aprovados |
| P0 | Definir e testar validação central de transação; hoje verificações locais duplicadas | Alto | Médio | Cadastro/edição compartilham invariantes de tipo/sinal, data e precisão com testes |
| P0 | Projetar autenticação e autorização reais; hoje somente demo | Alto | Alto | Identidade validada no servidor e testes negativos de acesso entre usuários; sem aceitar booleano do cliente como autorização |
| P0 | Projetar banco e persistência com propriedade por usuário; hoje array em memória | Alto | Alto | Esquema revisado, integridade, backup/restauração e isolamento testados em ambiente de teste |
| P1 | Implementar backend/API e integrar frontend após decisões acima; não identificados | Alto | Alto | Contratos documentados, validação no servidor e integração com tratamento de erros testada |
| P1 | Substituir estratégia de IDs; hoje `Date.now()` | Médio | Baixo | Identificadores com garantia adequada ao armazenamento adotado e verificação de unicidade |
| P1 | Investigar dependência local que impede o lint; carregamento de `@typescript-eslint/scope-manager` falhou | Médio | Baixo estimado | Causa confirmada e lint executado com sucesso; eventual reinstalação exige autorização |
| P1 | Cobrir CRUD, resumo, sessão demo e rotas com testes; hoje só validação de acesso | Alto | Médio | Testes relevantes de criação, edição, exclusão, saldo e limpeza ao sair/recarregar |
| P1 | Executar roteiro visual e verificar teclado/acessibilidade; há checklist sem resultado desta auditoria | Médio | Médio | Evidências em larguras/temas previstos e correção de falhas verificadas |
| P1 | Reconciliar README e localização do vault; hoje stack declarada diverge e há `docs/docs/` | Médio | Baixo | Documentação com fonte canônica e links sem ambiguidade; requer tarefa separada para arquivos fora deste escopo |
| P2 | Implementar gerenciamento de categorias; planejado sinalizado na interface | Médio | Médio | CRUD e regras de associação, alteração e exclusão definidos e testados |
| P2 | Definir automação de qualidade e ambiente reproduzível; CI não identificada | Médio | Médio | Versão suportada do Node documentada e testes, lint e build validados em automação |

## Dependências e decisões

Autenticação, banco e API precisam ser desenhados juntos para preservar isolamento. A seleção de tecnologias do servidor/banco ainda precisa de confirmação; Express/PostgreSQL/JWT citados no README não são implementações verificadas nem decisão ratificada por esta auditoria.

A implementação futura não está autorizada por este documento. Não se propõem datas sem capacidade e escopo aprovados. Novas funções financeiras além de categorias dependem de levantamento de requisitos, pois não foram identificadas como plano confirmado no código.
