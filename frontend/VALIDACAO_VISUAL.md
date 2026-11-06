# Validação visual do YFC

Execute `npm run dev` na pasta `frontend` e abra o endereço informado pelo Vite.

## Telas e navegação

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
