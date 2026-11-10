# Roadmap

Relacionadas: [[00 - Visão Geral]], [[01 - Arquitetura]], [[02 - Banco de Dados]], [[03 - Regras Financeiras]], [[05 - Diário de Desenvolvimento]].

## Interpretação

Direção atualizada em 2026-11-09: o projeto está em estágio inicial e será desenvolvido progressivamente, preservando o código existente. As tarefas abaixo orientam entregas incrementais; não representam implementações concluídas nem autorização automática para alterar código. Impacto e esforço são estimativas relativas, sem prazos. P0 e P1 concentram a evolução da demonstração; P2 reúne etapas posteriores, sem exigência imediata de backend ou banco. Segurança, persistência e isolamento devem ser validados antes da transição para uso real com dados pessoais e financeiros.

## Priorização

| Prioridade | Proposta e estado atual | Impacto | Esforço | Critério de conclusão |
| --- | --- | --- | --- | --- |
| P0 | Definir representação/limites/arredondamento de dinheiro; hoje `number` sem política explícita | Alto | Médio | Regra documentada e testes de decimais, extremos e saldo aprovados |
| P0 | Definir e testar validação central de transação; hoje verificações locais duplicadas | Alto | Médio | Cadastro/edição compartilham invariantes de tipo/sinal, data e precisão com testes |
| P1 | Explorar glassmorphism provisório com base cinza e destaques verdes, em uma superfície por vez | Médio | Médio | Componentes existentes preservados, leitura e contraste verificados, alternativa opaca quando necessária e validação nos temas e tamanhos de tela disponíveis |
| P1 | Reutilizar componentes e regras compartilhadas conforme cada fluxo evoluir | Médio | Médio | Extrações pequenas com benefício concreto, sem regressão de comportamento, teclado ou responsividade |
| P1 | Substituir estratégia de IDs; hoje `Date.now()` | Médio | Baixo | Identificadores com garantia adequada ao armazenamento adotado e verificação de unicidade |
| P1 | Investigar dependência local que impede o lint; carregamento de `@typescript-eslint/scope-manager` falhou | Médio | Baixo estimado | Causa confirmada e lint executado com sucesso; eventual reinstalação exige autorização |
| P1 | Cobrir CRUD, resumo, sessão demo e rotas com testes; hoje só validação de acesso | Alto | Médio | Testes relevantes de criação, edição, exclusão, saldo e limpeza ao sair/recarregar |
| P1 | Executar roteiro visual e verificar teclado/acessibilidade; há checklist sem resultado desta auditoria | Médio | Médio | Evidências em larguras/temas previstos e correção de falhas verificadas |
| P1 | Reconciliar README com o estágio inicial e a stack efetivamente implementada | Médio | Baixo | Intenção futura e implementação atual claramente diferenciadas; cofre já consolidado em `docs/` |
| P2 | Definir backend/API e sua integração, após estabilizar os fluxos e levantar necessidades de persistência | Alto | Alto | Contratos documentados, validação no servidor e tratamento de erros testados; tecnologia a decidir |
| P2 | Definir banco e persistência com propriedade por usuário, junto ao desenho da API | Alto | Alto | Esquema revisado, integridade e backup/restauração testados em ambiente de teste |
| P2 | Implementar autenticação e autorização reais na preparação para uso real; hoje somente demo | Alto | Alto | Identidade validada no servidor e testes negativos de acesso entre usuários, com isolamento integrado ao banco/API |
| P2 | Implementar gerenciamento de categorias; planejado sinalizado na interface | Médio | Médio | CRUD e regras de associação, alteração e exclusão definidos e testados |
| P2 | Definir automação de qualidade e ambiente reproduzível; CI não identificada | Médio | Médio | Versão suportada do Node documentada e testes, lint e build validados em automação |

## Dependências e decisões

Autenticação, banco e API precisam ser desenhados juntos para preservar isolamento. A seleção de tecnologias do servidor/banco ainda precisa de confirmação; Express/PostgreSQL/JWT citados no README não são implementações verificadas nem decisão ratificada por esta auditoria.

A evolução do frontend pode continuar antes dessas etapas, mantendo explícitos os limites da demonstração. A direção glassmorphism é provisória e pode ser ajustada conforme testes de usabilidade, acessibilidade e desempenho; cinza e verde orientam a exploração, sem fixar tokens ou valores de cor nesta documentação.

A implementação futura não está autorizada por este documento. Não se propõem datas sem capacidade e escopo aprovados. Novas funções financeiras além de categorias dependem de levantamento de requisitos, pois não foram identificadas como plano confirmado no código.
