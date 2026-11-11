# Validação visual do YFC

Execute `npm run dev` na pasta `frontend` e abra o endereço informado pelo Vite.

## Dashboard com glassmorphism

Roteiro pendente de execução no navegador; não representa validação concluída.

- Refinamento: conferir iluminação esmeralda estática e brilho interno discretos nos dois temas, sem aparência de botão nos painéis. Somente o saldo deve ter maior destaque tipográfico.
- Forçar saldo negativo com uma despesa fictícia maior que a receita: conferir sinal negativo, cor de erro e detalhe “Receitas menos despesas”, sem confundir a decoração esmeralda com resultado positivo.
- Em 320/375 px, conferir o padding externo reduzido, estado vazio compacto, foco do botão e valores da lista em linha própria. Em telas maiores, conferir alinhamento dos valores à direita e que valores extensos continuam quebrando sem cortes.
- Comparar rolagem antes/depois em dispositivo móvel: o refinamento mantém quatro filtros de 8 px; iluminação usa gradiente estático e sombras, sem animações ou filtros adicionais.

- Entrar com dados fictícios e conferir Início vazio, depois cadastrar receita e despesa em Transações e retornar ao painel. Conferir totais, saldo negativo e as cinco movimentações cadastradas mais recentemente.
- Conferir superfícies claras e grafite, borda esmeralda no saldo e leitura de títulos, valores, detalhes e aviso de sessão nos dois temas. Os outros fluxos devem manter suas superfícies anteriores.
- Repetir as larguras e o zoom deste roteiro, incluindo 599/600, 899/900 e 1199/1200 px. Verificar quebra de textos longos e valores grandes sem rolagem horizontal da página.
- Conferir contraste efetivo de texto normal (4,5:1), texto grande (3:1), foco e controles (3:1), inclusive hover e seleção. Bordas dos painéis são decorativas; significado financeiro também aparece por rótulos.
- No inspetor, desativar a regra `@supports` de cada superfície: o fundo base deve ficar opaco. Para simular apenas a retirada do blur, também restaurar o `background-color` base. Conferir leitura e composição sem suporte a filtros.
- Conferir que há somente quatro superfícies com blur de 8 px, sem filtros internos, efeitos animados ou blur no menu/cabeçalho. Avaliar rolagem e repinturas em dispositivo móvel; não há medição de desempenho concluída.
- Usar Tab/Shift+Tab, Enter e Escape para conferir links, menu, alternador de tema e retorno de foco nos fluxos existentes.

## Telas e navegação

- Conferir exatamente um alternador de tema visível em Início, Transações, Categorias, acesso e cadastro. Ele deve participar do fluxo do layout, sem sobrepor títulos ou Sair, e preservar o tema ao navegar e recarregar.
- Conferir sidebar e cabeçalho opacos nos dois temas, sem novos filtros. Diferenciar item ativo, hover, ativo + hover e foco; o marcador lateral não deve deslocar texto. Conferir `aria-current="page"` apenas na rota correspondente, inclusive Visão geral.
- No celular, abrir o menu por teclado: conferir `aria-expanded`, identificação do diálogo, foco contido, botão Fechar, Escape, clique no fundo e fechamento após selecionar rota. Conferir retorno do foco quando fechar sem navegar.
- Com menu aberto, ampliar para 900 px e voltar ao celular: não deve restar backdrop, bloqueio de rolagem ou menu reaberto. Conferir também navegação com zoom de 200% e altura de tela reduzida, permitindo rolagem do Drawer.
- Conferir controles com área de pelo menos 44 px, ícones com nome acessível e foco visível. Medir contraste de texto (4,5:1), ícones essenciais e foco (3:1), incluindo seleção e hover, nos dois temas.

- Conferir larguras de 320, 375, 768, 1024 e 1440 px, além de zoom de 200%.
- Em telas menores que 900 px, abrir o menu pelo botão e selecionar cada página. O menu deve fechar ao navegar, clicar fora ou pressionar Escape.
- Em telas a partir de 900 px, conferir a barra lateral permanente.
- Conferir que nenhum conteúdo provoca rolagem horizontal da página. A tabela pode ter rolagem dentro do próprio contêiner.
- Usar Tab e conferir foco visível, o link para pular ao conteúdo e acesso às ações.

## Temas

- Sem preferência salva, conferir que o tema inicial acompanha a preferência do sistema.
- Alternar entre claro e escuro nas três páginas e nos diálogos.
- Recarregar e conferir a preferência salva.
- Conferir legibilidade de campos, menus, notificações, valores e botões nos dois temas.

## Transações

Refinamento de 2026-11-11 implementado no código. Validação no navegador e aprovação visual do usuário pendentes; os itens abaixo são roteiro, não resultados.

- Nos dois temas, conferir os dois painéis `SuperficieVidro`, campos com fundo opaco e cartões móveis sem blur. Desativar `@supports` no inspetor e conferir o fallback opaco. Medir contraste composto: texto normal 4,5:1, texto grande e controles essenciais 3:1.
- Conferir 320, 375, 768, 1024 e 1440 px, transições 599/600, 899/900 e 1535/1536 px e zoom de 200%. O formulário deve continuar visível, com ordem Descrição → Tipo → Valor → Categoria → Data → Cadastrar. A rolagem horizontal deve ficar restrita à tabela, inclusive pelo teclado ao focar seu contêiner.
- No histórico vazio, conferir ícone decorativo, título e orientação para o formulário acima, sem outro botão de cadastro.
- Usar descrição e categoria longas, inclusive palavras sem espaços, e valores grandes fictícios. Conferir números tabulares, ausência de cortes, rótulos Receita/Despesa e acesso às duas ações nos cartões e na tabela.
- Em edição, tentar descrição/categoria somente com espaços, data vazia, zero, `0.005` e valor acima do limite. Conferir alerta dentro do diálogo, sem expiração automática enquanto aberto, e preservação dos campos e do registro recusado. Corrigir e salvar: não deve reaparecer mensagem de erro antiga.
- Usar Tab/Shift+Tab, Enter/Espaço e Escape nos diálogos. Conferir foco inicial na descrição ao editar e em Cancelar ao excluir; foco contido e retorno ao acionador ao cancelar/fechar/salvar. Ao confirmar exclusão, conferir foco no título do histórico se o acionador removido não puder recebê-lo. Repetir com o último registro e ao mudar o breakpoint com diálogo aberto.
- Conferir nomes acessíveis de Editar/Excluir com a descrição, alvos de ação de pelo menos 44 px e foco visível. Conferir alerta anunciado por leitor de tela e ausência de sobreposição com notificações, menu ou alternador de tema.
- Conferir aviso de dados temporários no fim da página e perda dos lançamentos ao recarregar/sair. Usar somente dados fictícios.

- Cadastrar uma receita e uma despesa e conferir os totais na visão geral.
- Conferir a data local atual no cadastro e depois de salvar.
- No celular, conferir cartões com as ações Editar e Excluir; em telas maiores, conferir a tabela.
- Testar descrições e categorias longas e valores grandes.
- Editar um lançamento e conferir a atualização dos valores.
- Cancelar uma exclusão e conferir que o registro permanece; confirmar e conferir a remoção.
- Conferir que a exclusão tem somente Cancelar e Excluir.
- Conferir mensagem para campos inválidos e notificação de cadastro concluído.

Os dados financeiros continuam apenas em memória. Recarregar apaga as transações; somente a preferência de tema é salva.

## Acesso e cadastro demonstrativos

- Abrir `/` sem sessão e conferir o redirecionamento para `/acesso`.
- Conferir as duas páginas em 320, 375, 768, 1024 e 1440 px e nos dois temas.
- Usar Tab para navegar pelos campos, mostrar/ocultar senha, enviar e alternar entre acesso e cadastro.
- Enviar acesso vazio ou com e-mail inválido e conferir mensagens nos campos.
- Conferir que mostrar/ocultar senha não envia o formulário.
- No cadastro, testar nome vazio, e-mail inválido, senha curta, somente espaços e confirmação diferente.
- Validar um cadastro fictício e conferir o retorno ao acesso com o e-mail preenchido e a mensagem de demonstração.
- Entrar com dados fictícios válidos e conferir o painel e suas rotas.
- Clicar em Sair e conferir o retorno ao acesso. Voltar pelo navegador não deve reabrir o painel sem sessão.
- Recarregar o painel e conferir que volta ao acesso sem transações ou sessão.
- Conferir que nenhuma senha é adicionada a localStorage, sessionStorage ou à URL.
