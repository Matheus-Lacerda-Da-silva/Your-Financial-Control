> Histórico da arquitetura substituída. O procedimento abaixo foi desativado.

# Ensaio de papéis, RLS e privilégios

Roteiro preparado para um projeto Supabase Cloud descartável com PostgreSQL 17.12. Toda execução em Cloud depende de autorização específica. Use somente identidades fictícias e um alvo descartável. A etapa permanece pendente até os resultados serem registrados.

## Consultas somente leitura

1. Pela mesma conexão e identidade configuradas para a CLI, registre banco, versão, `session_user`, `current_user`, atributos em `pg_roles` e `current_setting('createrole_self_grant')`. Se possível, registre esses valores também por `RAISE NOTICE` na cópia de ensaio executada pelo runner. Compare com a sessão do SQL Editor.
2. Confira o histórico em `supabase_migrations.schema_migrations`. O ponto de partida contém somente `20261124000000`. Confira a ausência de `yfc_hono` e `yfc_executor` no cluster, o dono `postgres` e as quatro tabelas com RLS e zero políticas com o [verificador inicial](../../supabase/tests/verifica_modelo_financeiro.sql). Capture as ACLs originais de schema, tabelas, colunas, sequências e rotinas e o estado dos dois papéis. Confira os schemas expostos no Dashboard.
3. Sob o implantador, confira `USAGE` em `auth` para a resolução do nome e a ACL de `auth.uid()` via `pg_proc`, `aclexplode` e beneficiário zero. Registre separadamente os resultados de `WITH GRANT OPTION`.
4. Após a aplicação de ensaio, execute o `verifica_papeis_rls_financeiros.sql` na identidade administrativa do runner. Confira a linha de estado da sessão, ACLs, políticas, o grafo e os inventários. A concessão implícita ao criador com apenas `ADMIN` é esperada. Compare o catálogo antes e depois e revise outros administradores explicitamente. `pg_roles` não verifica a senha. A regra `PASSWORD NULL` é conferida no DDL e a ausência de conexão é uma verificação separada.
5. Revise objetos expostos marcados por dependência ou menção textual e as demais rotinas acessíveis que possam intermediar acesso. O catálogo rastreia dependências registradas, inclusive views aninhadas e corpos SQL analisados na criação. Corpos textuais, nomes montados por SQL dinâmico, chamadas indiretas via extensões e configurações de sessão podem escapar. Confirme a superfície por inspeção das definições e chamadas negativas de REST, GraphQL e RPC no alvo descartável.

## Identificação do YFC-Sandbox e preparação no Windows

Após autorização, abra o Dashboard do **YFC-Sandbox**, nome provisório do projeto descartável, e registre sua referência. Registre também a referência do **YFC-Development** para bloqueio explícito. Compare a referência do Sandbox com o host da conexão direta informado pelo Dashboard. Se o host direto estiver indisponível, interrompa e revise o roteiro para o transporte autorizado. Use a CLI 2.116.0 já disponível e um PowerShell dedicado. Mantenha a URL de conexão fora do Git, de transcrições e de registros do ensaio.

Execute o bloco a partir da raiz do repositório. Ele prepara três diretórios fora do repositório, com arquivos separados para baseline, falha e versão íntegra. Registre os hashes exibidos antes de prosseguir.

```powershell
$ErrorActionPreference = 'Stop'
$repo = (Get-Location).Path
$raizEnsaio = Join-Path ([System.IO.Path]::GetTempPath()) ("yfc-sandbox-" + [guid]::NewGuid())
$raizEnsaio = [IO.Path]::GetFullPath($raizEnsaio)
if ($raizEnsaio.StartsWith($repo.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Os diretórios de ensaio devem ficar fora do repositório.'
}

$inicial = '20261124000000_cria_modelo_financeiro.sql'
$seguranca = '20261125000000_configura_papeis_rls_financeiros.sql'
$origem = Join-Path $repo 'supabase/migrations'
git diff --exit-code 6526db7 -- "supabase/migrations/$inicial"
if ($LASTEXITCODE -ne 0) { throw 'A migration inicial diverge da base.' }

$hashInicial = (Get-FileHash -LiteralPath (Join-Path $origem $inicial)).Hash
$hashIntegra = (Get-FileHash -LiteralPath (Join-Path $origem $seguranca)).Hash
$baseline = Join-Path $raizEnsaio 'baseline'
$falha = Join-Path $raizEnsaio 'falha'
$integra = Join-Path $raizEnsaio 'integra'
foreach ($diretorio in @($baseline, $falha, $integra)) {
  $migrations = Join-Path $diretorio 'supabase/migrations'
  New-Item -ItemType Directory -Path $migrations | Out-Null
  Copy-Item -LiteralPath (Join-Path $repo 'supabase/config.toml') -Destination (Join-Path $diretorio 'supabase')
  Copy-Item -LiteralPath (Join-Path $origem $inicial) -Destination $migrations
  if ($diretorio -ne $baseline) {
    Copy-Item -LiteralPath (Join-Path $origem $seguranca) -Destination $migrations
  }
}

$arquivoFalha = Join-Path $falha "supabase/migrations/$seguranca"
if ((Get-FileHash -LiteralPath $arquivoFalha).Hash -ne $hashIntegra) {
  throw 'A cópia de falha deve partir da migration íntegra.'
}
Add-Content -LiteralPath $arquivoFalha -Encoding utf8 -Value @'

-- SOMENTE YFC-Sandbox. Falha deliberada.
do $$
begin
  raise exception 'YFC_SANDBOX_ROLLBACK_CONTROLADO'
    using detail = format('session_user=%s current_user=%s createrole_self_grant=%L',
                          session_user, current_user, current_setting('createrole_self_grant'));
end
$$;
'@
$hashFalha = (Get-FileHash -LiteralPath $arquivoFalha).Hash
[pscustomobject]@{ Inicial = $hashInicial; Integra = $hashIntegra; Falha = $hashFalha }
```

Use o mesmo PowerShell para os blocos seguintes. Preencha as duas referências com os valores conferidos no Dashboard e passe somente a URL direta do Sandbox para a CLI. O exemplo usa entrada mascarada. O processo local da CLI recebe a URL como argumento, portanto use uma sessão controlada e registre apenas referência, versão, hashes e resultado.

```powershell
$refSandbox = Read-Host 'Referência do YFC-Sandbox'
$refDevelopment = Read-Host 'Referência do YFC-Development'
$urlProtegida = Read-Host 'URL direta do PostgreSQL do YFC-Sandbox' -AsSecureString
$urlSandbox = [Net.NetworkCredential]::new('', $urlProtegida).Password

function Confirmar-Ensaio($diretorio, $hashSeguranca) {
  if ($refSandbox -cnotmatch '^[a-z0-9]{20}$' -or
      $refDevelopment -cnotmatch '^[a-z0-9]{20}$' -or $refSandbox -eq $refDevelopment) {
    throw 'Referências inválidas ou iguais.'
  }
  $uri = [uri]$urlSandbox
  if ($uri.Scheme -notin @('postgresql','postgres') -or
      $uri.Host -ne "db.$refSandbox.supabase.co" -or
      $uri.Port -ne 5432 -or $uri.AbsolutePath -ne '/postgres' -or
      $uri.Query -or $uri.Fragment) {
    throw 'Conexão fora do padrão direto aprovado para o Sandbox.'
  }
  if ((& supabase --version) -ne '2.116.0' -or $LASTEXITCODE -ne 0) {
    throw 'Versão da CLI divergente.'
  }
  $pasta = Join-Path $diretorio 'supabase/migrations'
  $arquivos = @(Get-ChildItem -LiteralPath $pasta -File)
  $nomesEsperados = @($inicial)
  if ($hashSeguranca) { $nomesEsperados += $seguranca }
  if ((Compare-Object ($nomesEsperados | Sort-Object) ($arquivos.Name | Sort-Object)) -or
      (Test-Path -LiteralPath (Join-Path $diretorio 'supabase/.temp/project-ref'))) {
    throw 'Inventário de arquivos divergente ou vínculo local encontrado.'
  }
  if ((Get-FileHash -LiteralPath (Join-Path $pasta $inicial)).Hash -ne $hashInicial) {
    throw 'Hash da migration inicial divergente.'
  }
  if ($hashSeguranca -and
      (Get-FileHash -LiteralPath (Join-Path $pasta $seguranca)).Hash -ne $hashSeguranca) {
    throw 'Hash da migration de segurança divergente.'
  }
  Write-Host "Alvo: $refSandbox | Arquivos: $($nomesEsperados -join ', ')"
  & supabase migration list --workdir $diretorio --db-url $urlSandbox
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao consultar o histórico. Confira o alvo.' }
}

function Invocar-PushDeEnsaio($diretorio, $hashSeguranca, $versaoEsperada) {
  Confirmar-Ensaio $diretorio $hashSeguranca
  & supabase db push --dry-run --workdir $diretorio --db-url $urlSandbox
  if ($LASTEXITCODE -ne 0) { throw 'Dry-run falhou.' }
  Write-Host 'Confira no histórico a coluna remota e no dry-run a única versão pendente.'
  $confirmacao = Read-Host "Digite $refSandbox/$versaoEsperada após conferir ambas as saídas"
  if ($confirmacao -cne "$refSandbox/$versaoEsperada") { throw 'Ensaio interrompido.' }
  Confirmar-Ensaio $diretorio $hashSeguranca
  if ((Read-Host 'Confirme que a coluna remota continua igual digitando HISTORICO-CONFERIDO') -cne
      'HISTORICO-CONFERIDO') { throw 'Histórico não confirmado.' }
  & supabase db push --workdir $diretorio --db-url $urlSandbox
  if ($LASTEXITCODE -ne 0) { throw 'Push falhou. Confira o erro e o catálogo antes de prosseguir.' }
}
```

Rode uma fase por vez, após a autorização e as comparações abaixo. Use somente `--db-url` explícito, sem vincular as pastas a projetos. Mantenha a confirmação interativa da CLI. A cópia com falha fica fora do repositório durante todo o ensaio.

```powershell
# Baseline em projeto vazio. Histórico remoto sem migrations do YFC.
Invocar-PushDeEnsaio $baseline $null '20261124000000'

# Somente após capturar o baseline. Histórico remoto contém apenas a inicial.
Invocar-PushDeEnsaio $falha $hashFalha '20261125000000'

# Somente após conferir a falha prevista e o rollback em outra sessão.
Invocar-PushDeEnsaio $integra $hashIntegra '20261125000000'
```

## Aplicação de ensaio e critérios de atomicidade

1. Antes de cada push, confira a coluna remota de `migration list`, o arquivo e o plano. O dry-run mostra versões planejadas. Após o baseline, use as consultas de leitura para capturar catálogo, ACLs e histórico antes do próximo passo.
2. **Rollback do DDL.** Exija o erro `YFC_SANDBOX_ROLLBACK_CONTROLADO`. Confira no detalhe do erro a identidade da sessão real do runner. Em outra sessão, confirme que os papéis e políticas continuam ausentes e que estado da RLS, donos e ACLs coincidem com o baseline. Uma falha anterior à exceção prevista exige diagnóstico antes de prosseguir.
3. **Histórico após falha.** Verifique em outra sessão que `20261125000000` continua ausente. Essa ausência também é compatível com um runner que nunca tentou inserir o registro.
4. **Histórico após sucesso.** Execute a cópia íntegra após validar o rollback. Confira uma única entrada da versão nova, as 15 políticas e os checks do verificador.
5. **Limite transacional comum.** Na tag 2.116.0, `MigrationFile.ExecBatch` enfileira as instruções normais, acrescenta o registro por `insertVersionSQL` e envia o lote pelo `PgConn().ExecBatch`. O driver fixado é `pgconn` 1.14.3, cujo lote usa um único `Sync` e uma transação implícita na ausência de controle transacional explícito. A CLI faz flush separado para instruções classificadas para execução fora do lote. O arquivo em ensaio não contém essas instruções. A inspeção confirma o limite comum nesse caminho Go da versão publicada. A execução do binário e o resultado no Sandbox seguem pendentes. Se for exigida evidência experimental direta de falha na gravação do histórico, faça um ensaio separado nesse ponto, em ambiente descartável e após autorização adicional. [CLI 2.116.0, ExecBatch](https://github.com/supabase/cli/blob/v2.116.0/apps/cli-go/pkg/migration/file.go#L107-L174) · [Dependências da CLI 2.116.0](https://github.com/supabase/cli/blob/v2.116.0/apps/cli-go/go.mod#L28) · [Implementação do lote no pgconn 1.14.3](https://github.com/jackc/pgconn/blob/v1.14.3/pgconn.go#L1648-L1681)
6. Se houver colisão, erro inesperado ou estado parcial, interrompa. Preserve erro e histórico e identifique papéis, memberships, dependentes, ACLs e políticas. Em Sandbox, restaure um baseline conhecido ou descarte o projeto. Evite reutilizar papéis ou reparar o histórico para contornar a divergência.

## Testes que modificam sessão, dados ou objetos

Prepare dois usuários fictícios via Auth e anote seus UUIDs como A e B. Use uma conexão exclusiva para o ensaio. Mantenha `yfc_hono` com senha nula e limite zero. Em uma transação descartável, o administrador com `ADMIN` pode conceder temporariamente a si mesmo `SET TRUE, INHERIT FALSE` no executor e no Hono. Confirme as opções e use `SET LOCAL ROLE yfc_executor`. Reverta os grants de ensaio com `ROLLBACK`. Teste negativas em savepoints independentes e execute `ROLLBACK TO SAVEPOINT` após cada erro esperado. Sequências podem consumir números mesmo com rollback.

Sob o executor, a consulta abaixo deve retornar `false` para o acesso ao schema e `true` para a execução por OID. Capture o OID de `auth.uid()` como administrador antes de trocar de papel.

```sql
select has_schema_privilege(current_user, 'auth', 'USAGE');
-- Substitua o número pelo OID registrado como administrador.
select has_function_privilege(current_user, 12345::oid, 'EXECUTE');
```

Use `current_user` para confirmar o papel executor e limpe os dois formatos de contexto antes de cada caso. Para identidade ausente use sub vazio e claims `{}`. Para A ou B, use sub vazio e claims com o UUID escolhido. Faça tudo na mesma transação e conexão.

```sql
select set_config('request.jwt.claim.sub', '', true),
       set_config('request.jwt.claims', '{}', true);
-- Para um caso autenticado, substitua o UUID pela identidade fictícia.
select set_config('request.jwt.claims',
                  '{"sub":"00000000-0000-0000-0000-000000000001"}', true);
```

| Caso | Instrução e resultado esperado |
| --- | --- |
| Inserção própria A e B | Para cada identidade, inserir categoria de receita com `usuario_id, nome, nome_chave, tipo`, meta com `usuario_id, nome, objetivo_centavos, reserva_centavos, data_inicio, data_limite`, transação com `usuario_id, categoria_id, tipo, descricao, valor_centavos, data` e aporte com `usuario_id, meta_id, valor_centavos, data`. Usar 100 centavos na transação, meta de 1000, reserva zero, aporte de 10 e datas dentro do prazo. Obter `RETURNING id, ordem_cadastro` e guardar cada ID. Omitir ordem e criação em todos os inserts. |
| Sequências | Conferir as quatro ordens geradas e positivas. Confirmar que `nextval` explícito numa sequência financeira falha com `42501`, usando savepoint. |
| Leitura e CRUD próprio | Como A, consultar as quatro tabelas e ver somente suas quatro linhas. Atualizar o nome da categoria, descrição da transação e nome da meta. Conferir um registro afetado em cada. Ensaiar exclusão de transação, categoria e meta nessa ordem ao final, conferindo cascata do aporte. Ensaiar também exclusão direta de aporte sob savepoint e restaurá-lo. |
| Isolamento cruzado | Como A, filtrar pelo ID de B. Esperar zero linhas em `SELECT` e zero afetadas em `UPDATE` de campo permitido e `DELETE`. Repetir como B sobre A. |
| Dono alheio e contexto ausente | Como A, inserir categoria com dono B e nome único. Esperar `42501` de RLS. Com contexto vazio e dados de A e B presentes, esperar zero linhas em leitura, atualização permitida por coluna e exclusão. Esperar `42501` em inserção válida de categoria própria. Repetir a ausência de contexto em conexão nova. |
| Campos imutáveis | Atualizar `usuario_id`, `id`, `ordem_cadastro` e `criado_em` em linha própria, individualmente. Tentar também atualizar `data_inicio` e `reserva_centavos` na meta. Esperar `42501`. |
| FKs compostas | Como A, inserir transação própria usando categoria de B e inserir aporte próprio usando meta de B. Esperar `23503` nos dois casos. Ensaiar ainda classificação com tipo incompatível em categoria própria, usando valor com sinal válido para o tipo da transação. |
| Aporte imutável | Como A, tentar editar `valor_centavos` de aporte próprio. Esperar `42501`. |

Reverta a transação. Para o Hono, em uma nova transação, conceda ao administrador somente o `SET` temporário no Hono e use `SET LOCAL ROLE yfc_hono`. Teste `SELECT`, `INSERT`, `UPDATE` e `DELETE` em objetos privados, esperando `42501`. Confirme a ausência efetiva de ACL pela matriz. Use `pg_has_role('yfc_hono', 'yfc_executor', 'SET')` e espere `false`. Uma tentativa de `SET ROLE yfc_executor` iniciada numa sessão cujo `session_user` é administrador mede a autoridade desse administrador. A ativação temporária do Hono fica fora deste ensaio. Depois reverta a transação.

### Desvios intencionais no catálogo

Em transações separadas no alvo descartável, introduza cada alteração, rode o verificador na mesma sessão e reverta.

- Conceda `UPDATE (usuario_id)` em categorias ao executor. Espere desvio de ACL por coluna.
- Remova `categorias_select_proprio`. Espere política ausente. Acrescente uma política de nome distinto e espere política excedente. Altere um predicado esperado e confira política divergente.
- Crie dois papéis de ensaio sem login. Conceda o executor ao intermediário com opções `INHERIT TRUE, SET TRUE` e o intermediário a um papel de ensaio com as mesmas opções. Confira que o verificador aponta a cadeia e a capacidade efetiva dos papéis de alcançar o executor.
- No fim, confira zero desvios na matriz, nas políticas e nos objetos esperados. Registre quais caminhos administrativos foram revisados e a ausência de caminhos operacionais indevidos.

Se a RLS falhar sem `USAGE` em `auth`, interrompa o ensaio. Avalie com o responsável uma concessão administrativa específica autorizada ou um mecanismo privado restrito de resolução de identidade com ACL e proprietário revisados. Esta etapa não aprova essas alternativas nem a futura integração Workers/Hyperdrive.

### Data API e objetos intermediários

Use a chave publicável do Sandbox para o caso anônimo e o JWT de cada usuário fictício para A e B, conforme o cliente da Data API. Para verificar ausência de vazamento, use dados sintéticos conhecidos e já visíveis a uma sessão administrativa separada. Dados ainda dentro da transação de testes SQL ficam invisíveis para a Data API. Prepare e registre fixtures confirmadas em transação separada no Sandbox, com inventário para limpeza.

| Identidade | Endpoint | Objeto | Operação | Resultado esperado |
| --- | --- | --- | --- | --- |
| Anônimo, A, B | `/rest/v1/` | Quatro tabelas financeiras em `yfc_privado` | GET com `Accept-Profile` privado. POST, PATCH e DELETE com `Content-Profile` privado e dados fictícios. | Schema recusado ou fora da exposição. Nenhum registro financeiro retornado ou alterado. |
| Anônimo, A, B | `/graphql/v1` | Tipos e operações das tabelas privadas | Consultar campos e tentar as operações financeiras de leitura e mutação no schema padrão. | Campos e operações privados ausentes ou recusados. Inspecionar inclusive `errors` e `data` quando houver HTTP 200. |
| Anônimo, A, B | `/rest/v1/rpc/{rotina}` | Rotina financeira privada, caso exista. Na ausência, registrar inventário vazio e consultar a exposição do perfil privado. | Chamada por assinatura e perfil apropriado. | Sem resolução de rotina privada nem efeito financeiro. A etapa não cria rotinas financeiras. |
| Anônimo, A, B | REST e GraphQL | Cada view candidata identificada no inventário, incluindo views que encaminham escrita por regra ou trigger | Consultar e testar somente as operações mapeadas, com argumentos e IDs sintéticos. | Ausência de exposição ou efeito sobre dados privados por esse caminho nesta etapa. |
| Anônimo, A, B | RPC e GraphQL quando aplicável | Cada rotina intermediária identificada, inclusive funções de triggers usadas por views expostas | Conferir exposição e executar a chamada aplicável a cada superfície. | Sem retorno ou alteração de dados financeiros. Rotinas de trigger são verificadas também pela operação na view. |

Registre status, diagnóstico e corpos sem segredos. Confirme o estado final das fixtures em sessão administrativa. Um erro de autenticação do cliente ou uma requisição inválida exige corrigir o caso de teste antes de concluir que a autorização bloqueou a operação.

Revise ACLs de relação e coluna, USAGE do schema, capacidade de escrita, donos, triggers e regras no verificador. ACL efetiva e capacidade de escrita são propriedades distintas. Dependências registradas e menções textuais ajudam na triagem. Encadeamentos em SQL dinâmico, corpos textuais, extensões e lógica disparada indiretamente podem escapar do catálogo. A matriz cobre os schemas confirmados no Dashboard. Divergências textuais nos predicados RLS devem ser examinadas no PG17.12, preservando a comparação estrita de comandos, papéis, predicados e dependências de `auth.uid()`.

### Limpeza e descarte

1. Reverta as transações de testes e confirme em outra sessão que os objetos de desvio, grants e memberships temporários desapareceram. Verifique novamente os atributos do Hono. Mantenha o login desativado para conexões durante todo o ensaio.
2. Remova as fixtures confirmadas da Data API usando os IDs inventariados. Remova aportes e transações antes das metas e categorias. Confira ausência de registros para A e B e só então remova os usuários fictícios via Auth. Revogue sessões de teste e encerre os clientes.
3. Confirme no Dashboard a mesma referência descartável registrada na preparação. Após autorização específica de descarte, exclua o YFC-Sandbox e verifique sua ausência na lista de projetos. Encerre o PowerShell dedicado e descarte as cópias locais fora do repositório, incluindo a cópia com falha. Preserve apenas resultados, referências e hashes sem segredos.
