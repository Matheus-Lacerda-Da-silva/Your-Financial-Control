import { useId } from 'react'
import { Alert, Box, Button, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Transacao } from '../types/transacao'
import { agregarEvolucaoFinanceira } from '../utils/evolucaoFinanceira'
import type { ResultadoEvolucao } from '../utils/evolucaoFinanceira'
import { formatarMoeda } from '../utils/formatadores'
import SuperficieVidro from './SuperficieVidro'

const nomesMeses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const rotuloMes = (competencia: string) => `${nomesMeses[Number(competencia.slice(5)) - 1]}/${competencia.slice(0, 4)}`

type Props = {
  readonly transacoes: readonly Readonly<Transacao>[]
  readonly hoje: string
}

export default function SecaoEvolucaoFinanceira({ transacoes, hoje }: Props) {
  const id = useId()
  let resultado: ResultadoEvolucao | undefined
  try { resultado = agregarEvolucaoFinanceira(transacoes, hoje) } catch { /* Exibir indisponibilidade sem totais parciais. */ }
  const meses = resultado?.meses ?? []
  const maximo = Math.max(1, ...meses.flatMap(mes => [mes.receitasCentavos, mes.despesasCentavos]))
  // A aproximação é exclusiva da geometria; tabela e agregação mantêm centavos exatos.
  const x = (indice: number) => 50 + indice * 100
  const y = (valor: number) => 184 - (valor / maximo) * 168
  const series = [
    { chave: 'receitasCentavos', nome: 'Receitas', cor: 'success.main', tracejada: false },
    { chave: 'despesasCentavos', nome: 'Despesas', cor: 'error.main', tracejada: true },
  ] as const
  const periodo = meses.length ? `${rotuloMes(meses[0].competencia)} a ${rotuloMes(meses[5].competencia)}` : ''

  return <SuperficieVidro component="section" aria-labelledby={`${id}-titulo`}>
    <CardContent>
      <Typography id={`${id}-titulo`} variant="h6" component="h2">Evolução financeira</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
        Movimentações cadastradas nos últimos seis meses civis{periodo ? ` (${periodo})` : ''}, inclusive futuras dentro do mês atual. Meses posteriores não entram no gráfico.
        {' '}Os cartões financeiros acima representam totais gerais, sem filtro de período. Metas e aportes não compõem estas séries.
      </Typography>
      {!resultado ? <Alert severity="error" sx={{ mt: 2 }}>Evolução financeira indisponível: não foi possível calcular o período ou os valores com segurança. Nenhum total parcial é exibido.</Alert> : <>
        {resultado.quantidadeDatasInvalidas > 0 && <Alert severity="warning" sx={{ mt: 2 }}>
          {resultado.quantidadeDatasInvalidas} movimentação(ões) com data inválida foram desconsideradas. Não é possível determinar seu período; os valores abaixo consideram somente datas válidas.
        </Alert>}
        <Stack direction="row" useFlexGap spacing={2} sx={{ flexWrap: 'wrap', my: 2 }}>
          {series.map(serie => <Stack key={serie.chave} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box component="svg" aria-hidden="true" width="38" height="16" sx={{ color: serie.cor }}>
              <line x1="0" x2="38" y1="8" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray={serie.tracejada ? '5 3' : undefined} />
              {serie.tracejada ? <rect x="15" y="4" width="8" height="8" fill="currentColor" /> : <circle cx="19" cy="8" r="4" fill="currentColor" />}
            </Box>
            <Typography variant="body2">{serie.nome} — {serie.tracejada ? 'tracejada, quadrados' : 'contínua, círculos'}</Typography>
          </Stack>)}
        </Stack>
        {resultado.quantidadeMovimentacoes === 0 ? <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography component="h3" variant="subtitle1">Nenhuma movimentação neste período</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Os seis meses estão zerados para as transações com datas válidas.</Typography>
          <Button component={Link} to="/transacoes" variant="outlined">Ver transações</Button>
        </Box> : <Box sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>Escala compartilhada: R$ 0,00 a {formatarMoeda(maximo)}</Typography>
          <Box component="svg" viewBox="0 0 600 200" role="img" aria-labelledby={`${id}-grafico`} aria-describedby={`${id}-descricao`} sx={{ width: '100%', height: { xs: 180, sm: 240 }, display: 'block' }} preserveAspectRatio="none">
            <title id={`${id}-grafico`}>Receitas e despesas mensais de {periodo}</title>
            <desc id={`${id}-descricao`}>Duas séries independentes, com escala linear iniciando em zero. Receitas em linha contínua e círculos; despesas em linha tracejada e quadrados. Os valores exatos estão na tabela a seguir.</desc>
            {[16, 100, 184].map(posicao => <Box component="line" key={posicao} x1="50" x2="550" y1={posicao} y2={posicao} sx={{ stroke: 'divider' }} />)}
            {series.map(serie => <Box component="g" key={serie.chave} sx={{ color: serie.cor }}>
              <polyline points={meses.map((mes, i) => `${x(i)},${y(mes[serie.chave])}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeDasharray={serie.tracejada ? '7 5' : undefined} />
              {meses.map((mes, i) => serie.tracejada
                ? <rect key={mes.competencia} x={x(i) - 4} y={y(mes[serie.chave]) - 4} width="8" height="8" fill="currentColor" />
                : <circle key={mes.competencia} cx={x(i)} cy={y(mes[serie.chave])} r="5" fill="currentColor" />)}
            </Box>)}
          </Box>
          <Box aria-hidden="true" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', textAlign: 'center' }}>
            {meses.map(mes => <Typography key={mes.competencia} variant="caption" color="text.secondary">{nomesMeses[Number(mes.competencia.slice(5)) - 1]}</Typography>)}
          </Box>
        </Box>}
        <TableContainer tabIndex={0} role="region" aria-label="Valores mensais de receitas e despesas" sx={{ mt: 2, '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
          <Table size="small" sx={{ '& td': { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } }}>
            <caption>Valores exatos por mês — {periodo}. Despesas em magnitude positiva.</caption>
            <TableHead><TableRow><TableCell scope="col">Mês</TableCell><TableCell scope="col" align="right">Receitas</TableCell><TableCell scope="col" align="right">Despesas</TableCell></TableRow></TableHead>
            <TableBody>{meses.map(mes => <TableRow key={mes.competencia}>
              <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap' }}>{rotuloMes(mes.competencia)}</TableCell>
              <TableCell align="right">{formatarMoeda(mes.receitasCentavos)}</TableCell>
              <TableCell align="right">{formatarMoeda(mes.despesasCentavos)}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </TableContainer>
      </>}
    </CardContent>
  </SuperficieVidro>
}
