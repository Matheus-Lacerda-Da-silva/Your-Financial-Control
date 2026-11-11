---
name: frontend-design
description: Orientar e implementar a evolução visual incremental do frontend do Your Financial Control com glassmorphism em cinza/grafite e verde esmeralda, reutilizando o tema e os componentes existentes. Usar em ajustes de interface, layout, responsividade e acessibilidade; não implica reescrita do produto nem alteração de regras financeiras.
---

# Frontend design do Your Financial Control

## Contexto e descoberta

Leia `AGENTS.md` e `docs/00 - Visão Geral.md`, a partir da raiz do repositório. Consulte `docs/01 - Arquitetura.md` e `frontend/VALIDACAO_VISUAL.md` conforme a área afetada. Confirme o estado atual no código antes de propor mudanças: o mapa abaixo é uma referência inicial, não uma garantia permanente.

- Stack inspecionada: React, TypeScript, Vite, React Router DOM, Material UI e Emotion. Confira `frontend/package.json`, o lockfile e a disponibilidade local antes de usar APIs. Não presuma Tailwind, outra biblioteca de componentes, fontes externas ou ferramentas de animação/testes. Não instale dependências, plugins ou skills sem aprovação.
- `frontend/src/theme/TemaProvider.tsx`: `createTheme`, `CssBaseline`, paleta clara/escura, tipografia, raios e overrides MUI. Preferência inicial do sistema e persistência da escolha em `yfc-tema`.
- `frontend/src/layouts/LayoutPrincipal.tsx` e `components/Sidebar.tsx`: cabeçalho, conteúdo com largura limitada, link para pular ao conteúdo, Drawer permanente a partir de `md` e temporário no celular. `Navbar.tsx` existe, mas não integra o fluxo principal inspecionado.
- `layouts/LayoutAcesso.tsx`: painel institucional verde em desktop e formulário; no celular, marca compacta e formulário em uma coluna. `components/CampoSenha.tsx` compartilha o controle de visibilidade da senha.
- `pages/Inicio.tsx`: três cartões de resumo, saldo com gradiente verde, últimas cinco transações e estado vazio. `pages/Transacoes.tsx`: formulário responsivo, cartões abaixo de `sm`, tabela a partir de `sm`, diálogos de edição/exclusão e notificações. `components/TransacaoCard.tsx` concentra a apresentação móvel.
- `pages/Categorias.tsx` é informativa. Acesso e cadastro são demonstrativos; sessão e transações ficam em memória. Não representar funcionalidades planejadas como implementadas nem esconder avisos da demonstração.
- Estilos combinam `sx`, tema MUI, `src/index.css` e `src/App.css`. O visual inspecionado usa superfícies opacas, bordas discretas, cantos arredondados, fonte Segoe UI/system-ui e verdes sobre fundos claros ou escuros levemente azulados. Glassmorphism ainda é direção provisória.

## Forma de evoluir

Explique brevemente a alteração e os arquivos envolvidos antes de editar. Para mudanças grandes, apresente um plano e aguarde aprovação conforme `AGENTS.md`. Uma invocação desta skill não autoriza redesenhar toda a aplicação; pedidos de diagnóstico ou planejamento permanecem sem edição.

Trabalhe no componente ou fluxo solicitado, valide-o e só amplie a mudança quando fizer parte do escopo. Preserve organização, nomenclatura em português, rotas, props, callbacks, estado, validações e ações existentes. Reutilize layouts e componentes antes de criar outros. Extraia padrões repetidos quando houver benefício concreto; evite componentes genéricos com muitas opções para um único uso.

## Direção visual e tokens

- Use cinza e grafite como base e verde esmeralda como destaque para ações principais, seleção e identidade. Mantenha o tema claro disponível: a direção grafite não implica converter tudo em tema escuro. Preserve cores semânticas de erro/despesa e sucesso/receita, com rótulos ou ícones que comuniquem o significado.
- Centralize decisões compartilhadas em `TemaProvider.tsx`: paleta semântica, superfícies, texto, bordas, espaçamento, tipografia, raios, sombras e intensidade de desfoque quando necessária. Prefira tokens MUI existentes (`background.paper`, `text.secondary`, `divider`, `primary.main`) e overrides de componentes para padrões globais; reserve `sx` para composição e exceções locais.
- Introduza tokens próprios apenas quando os existentes forem insuficientes, com tipagem por extensão do tema MUI quando aplicável. Evite casts para `any`, valores duplicados por página e um segundo sistema de tema em CSS. As cores atuais são ponto de partida, não uma obrigação de mantê-las nem uma paleta final de esmeralda.
- Aplique glassmorphism de forma seletiva: superfície translúcida, borda sutil, sombra leve e desfoque moderado em poucas camadas. Evite transparências acumuladas, brilho excessivo e decoração atrás de valores ou campos. Garanta fallback opaco quando `backdrop-filter` não estiver disponível ou quando contraste e desempenho exigirem.
- Preserve hierarquia: título da página, ação principal, resumo, conteúdo e ações secundárias. Garanta leitura rápida dos valores financeiros, alinhamento coerente e números tabulares quando útil. Não diminua texto ou esconda informações para acomodar efeitos visuais.

## Responsividade e acessibilidade

Use os breakpoints do tema e a composição responsiva existente, sem presumir valores caso o tema seja alterado. Preserve cartões móveis, tabela em telas maiores, Drawer, fechamento do menu e acesso a todas as ações. Evite larguras rígidas; trate descrições longas, valores grandes e rolagem da tabela dentro do contêiner.

Valide em 320, 375, 768, 1024 e 1440 px, nas transições dos breakpoints e com zoom de 200%. Confira sobreposições entre alternador de tema, cabeçalho, Drawer, diálogos e notificações.

Preserve HTML semântico, labels, nomes acessíveis de botões com ícone, mensagens de erro, foco visível e link de salto. Confira navegação por Tab/Shift+Tab, Enter/Espaço, Escape e retorno do foco em diálogos e menu. Não remova o comportamento acessível dos componentes MUI ao personalizá-los.

Verifique contraste sobre o fundo efetivamente composto nos dois temas: pelo menos 4,5:1 para texto normal, 3:1 para texto grande e 3:1 para indicadores e limites essenciais dos controles. Inclua estados de foco, hover, seleção e erro. Não use apenas cor para transmitir informação. Respeite `prefers-reduced-motion` ao introduzir movimento e mantenha alvos de interação confortáveis para toque.

## Desempenho e preservação funcional

Evite desfoque de tela inteira, camadas filtradas aninhadas, animações contínuas de filtros/sombras e efeitos que provoquem repinturas amplas durante rolagem. Prefira CSS/MUI já disponíveis e poucos efeitos estáticos; se houver animação, favoreça transformações e opacidade sem comprometer legibilidade. Não adicione imagens pesadas, fontes remotas ou dependências para obter um efeito simples.

Mudanças visuais não devem alterar cálculos, precisão em `valorCentavos`, formatação de moeda/data, validações, reducer ou persistência. Preserve cadastro, edição, confirmação/cancelamento de exclusão, atualização dos totais, avisos e saída da sessão. Use apenas dados fictícios na validação. Se o trabalho alcançar regras financeiras, consulte `docs/03 - Regras Financeiras.md` e explique os impactos antes de alterar seu comportamento.

## Verificação e entrega

Para implementações futuras, execute os comandos disponíveis em `frontend`: `npm run test`, `npm run lint` e `npm run build` (no PowerShell, use `npm.cmd` se necessário). Não instale ou repare dependências sem autorização. Informe falhas de execução separadamente de falhas do código.

Valide os fluxos afetados seguindo `frontend/VALIDACAO_VISUAL.md`, incluindo os dois temas, teclado, responsividade, estados vazios e mensagens. Testes de funções e build não comprovam aparência ou acessibilidade: declare quando a inspeção no navegador não tiver sido executada. Para alterações apenas nesta skill, valide seu frontmatter e instruções; testes da aplicação, se executados, são uma verificação complementar.

Ao concluir, relate alterações, motivos, verificações e pendências em português do Brasil. Atualize documentação relevante em `docs/` quando houver mudança importante na aplicação. Não faça commit, push, deploy ou operações de produção por iniciativa desta skill; respeite o escopo e as autorizações do pedido atual.
