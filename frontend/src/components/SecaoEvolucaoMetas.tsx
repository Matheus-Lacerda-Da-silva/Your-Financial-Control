import { useId, useState } from 'react'
import { Alert, Box, Button, CardContent, Chip, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Aporte, Meta } from '../types/meta'
import { agregarEvolucaoMeta, indicesRotulosMeta } from '../utils/evolucaoMetas'
import { formatarData, formatarMoeda } from '../utils/formatadores'
import SuperficieVidro from './SuperficieVidro'

type Props = {
  readonly metas: readonly Readonly<Meta>[]
  readonly aportes: readonly Readonly<Aporte>[]
  readonly hoje: string
}

const mesLegivel = (mes: string) => `${mes.slice(5)}/${mes.slice(0, 4)}`

export default function SecaoEvolucaoMetas({ metas, aportes, hoje }: Props) {
  const id = useId()
  const [selecionadaId, setSelecionadaId] = useState<string | undefined>(() => metas[0]?.id)
  const selecionada = metas.find(meta => meta.id === selecionadaId) ?? metas[0]
  // Sincroniza somente a seleção removida, sem copiar os dados derivados para estado.
  if (selecionadaId !== selecionada?.id) setSelecionadaId(selecionada?.id)
  let resultado: ReturnType<typeof agregarEvolucaoMeta> | undefined
  if (selecionada) {
    try { resultado = agregarEvolucaoMeta(selecionada, aportes, hoje) } catch { /* Não mostrar resultados parciais. */ }
  }

  return <SuperficieVidro component="section" aria-labelledby={`${id}-titulo`}>
    <CardContent>
      <Stack spacing={2.5}>
        <Box>
          <Typography id={`${id}-titulo`} component="h2" variant="h6">Evolução das metas</Typography>
          <Typography color="text.secondary" variant="body2">Compare o planejamento acumulado com os valores guardados. Aportes não compõem receitas, despesas ou saldo.</Typography>
        </Box>
        {!selecionada ? <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography component="h3" variant="h6">Você ainda não tem metas</Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>Crie uma meta para acompanhar sua evolução mensal.</Typography>
          <Button component={Link} to="/metas" variant="outlined">Ver metas</Button>
        </Box> : <>
          <TextField select fullWidth label="Meta para acompanhar" value={selecionada.id} onChange={evento => setSelecionadaId(evento.target.value)}
            slotProps={{ select: { sx: { '& .MuiSelect-select': { whiteSpace: 'normal', overflowWrap: 'anywhere' } }, MenuProps: { slotProps: { paper: { sx: { maxWidth: 'calc(100vw - 32px)' } } } } } }}>
            {metas.map(meta => <MenuItem key={meta.id} value={meta.id} sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
              {meta.nome} — {formatarData(meta.dataLimite)}{Number.isSafeInteger(meta.valorObjetivoCentavos) ? ` — ${formatarMoeda(meta.valorObjetivoCentavos)}` : ''}
            </MenuItem>)}
          </TextField>
          {!resultado ? <Alert severity="error">Evolução indisponível: há dados inconsistentes na meta ou em seus aportes. Nenhum resultado parcial é exibido.</Alert> : <>
            <Box aria-live="polite" aria-atomic="true">
              <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>{selecionada.nome}</Typography>
              <Chip label={resultado.situacao} variant="outlined" sx={{ my: 1 }} />
              <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2, m: 0, '& dt': { typography: 'body2', color: 'text.secondary' }, '& dd': { m: 0, fontWeight: 650, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' } }}>
                <Box><dt>Objetivo</dt><dd>{formatarMoeda(selecionada.valorObjetivoCentavos)}</dd></Box>
                <Box><dt>Reserva inicial</dt><dd>{formatarMoeda(selecionada.valorInicialCentavos)}</dd></Box>
                <Box><dt>Acumulado atual</dt><dd>{formatarMoeda(resultado.acumulado)}</dd></Box>
                <Box><dt>Progresso</dt><dd>{resultado.percentual.toLocaleString('pt-BR')}%</dd></Box>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Planejamento de referência calculado com o objetivo e o prazo atuais. Edições recalculam também os meses anteriores; versões históricas não são preservadas. A reserva inicial está incluída uma única vez nos acumulados.
            </Typography>
            <GraficoMeta key={selecionada.id} meta={selecionada} resultado={resultado} hoje={hoje} />
          </>}
        </>}
      </Stack>
    </CardContent>
  </SuperficieVidro>
}

type GraficoProps = { meta: Readonly<Meta>; resultado: ReturnType<typeof agregarEvolucaoMeta>; hoje: string }

function GraficoMeta({ meta, resultado, hoje }: GraficoProps) {
  const id = useId()
  const { meses } = resultado
  const x = (i: number) => meses.length === 1 ? 300 : 24 + i / (meses.length - 1) * 552
  const y = (valor: number) => 184 - valor / meta.valorObjetivoCentavos * 168
  const futuro = meses.findIndex(mes => mes.situacaoTemporal === 'futura')
  const inicioFuturo = futuro < 0 ? null : futuro === 0 ? 12 : (x(futuro - 1) + x(futuro)) / 2
  const atuais = meses.filter(mes => mes.realizadoAcumuladoCentavos !== null)
  const rotulosDesktop = indicesRotulosMeta(meses.length, 8)
  const rotulosMoveis = indicesRotulosMeta(meses.length, 4)
  const rotulos = [...new Set([...rotulosDesktop, ...rotulosMoveis])].sort((a, b) => a - b)
  const marcadores = new Set([...rotulosDesktop, atuais.length - 1])
  return <Stack spacing={2}>
    <Typography variant="body2" color="text.secondary">
      {formatarData(meta.dataInicio)} a {formatarData(meta.dataLimite)}. Planejado: expectativa ao fim de cada mês. Realizado: aportes até {formatarData(hoje)}.
      {' '}O mês atual é parcial; a diferença para o planejado não indica, por si só, atraso.
      {hoje > meta.dataLimite ? ' Período encerrado; não são acrescentados meses após o prazo.' : ''}
    </Typography>
    <Stack direction="row" useFlexGap spacing={2} sx={{ flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary">┄ □ Planejado acumulado — tracejado, quadrados</Typography>
      <Typography variant="body2" color="success.main">━ ● Realizado acumulado — contínuo, círculos</Typography>
    </Stack>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>Escala compartilhada: R$ 0,00 a {formatarMoeda(meta.valorObjetivoCentavos)}. Área hachurada: meses futuros.</Typography>
      <Box component="svg" viewBox="0 0 600 200" preserveAspectRatio="none" role="img" aria-labelledby={`${id}-nome`} aria-describedby={`${id}-descricao`} sx={{ display: 'block', width: '100%', height: { xs: 190, sm: 250 } }}>
        <title id={`${id}-nome`}>Evolução da meta {meta.nome}</title>
        <desc id={`${id}-descricao`}>Planejamento de referência tracejado e realizado contínuo. O realizado não é projetado em meses futuros. Todos os valores estão na tabela expansível a seguir. O mês atual é parcial.</desc>
        <defs><pattern id={`${id}-futuro`} width="10" height="10" patternUnits="userSpaceOnUse"><Box component="path" d="M0 10 L10 0" fill="none" stroke="currentColor" strokeWidth="1" sx={{ color: 'divider' }} /></pattern></defs>
        {inicioFuturo !== null && <>
          <rect x={inicioFuturo} y="8" width={588 - inicioFuturo} height="184" fill={`url(#${id}-futuro)`} />
          <Box component="line" x1={inicioFuturo} x2={inicioFuturo} y1="8" y2="192" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" sx={{ color: 'text.secondary' }} />
        </>}
        {[16, 100, 184].map(posicao => <Box component="line" key={posicao} x1="24" x2="576" y1={posicao} y2={posicao} stroke="currentColor" strokeWidth="1" sx={{ color: 'divider' }} />)}
        {/* Tokens do tema são resolvidos em color; stroke/fill usam atributos SVG válidos. */}
        <Box component="polyline" points={meses.map((mes, i) => `${x(i)},${y(mes.planejadoAcumuladoCentavos)}`).join(' ')} fill="none" stroke="currentColor" sx={{ color: 'text.secondary' }} strokeWidth="2" strokeDasharray="7 5" vectorEffect="non-scaling-stroke" />
        <Box component="polyline" points={atuais.map((mes, i) => `${x(i)},${y(mes.realizadoAcumuladoCentavos!)}`).join(' ')} fill="none" stroke="currentColor" sx={{ color: 'success.main' }} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {meses.map((mes, i) => marcadores.has(i) ? <Box component="g" key={mes.competencia}>
          <Box component="rect" x={x(i) - 4} y={y(mes.planejadoAcumuladoCentavos) - 4} width="8" height="8" fill="currentColor" sx={{ color: 'text.secondary' }} />
          {mes.realizadoAcumuladoCentavos !== null && <Box component="circle" cx={x(i)} cy={y(mes.realizadoAcumuladoCentavos)} r="5" fill="currentColor" sx={{ color: 'success.main' }} />}
        </Box> : null)}
      </Box>
      <Box sx={{ position: 'relative', height: 28, mx: '4%' }} aria-hidden="true">
        {rotulos.map((indice, i) => <Typography key={indice} variant="caption" color="text.secondary" sx={{ position: 'absolute', left: meses.length === 1 ? '50%' : `${indice / (meses.length - 1) * 100}%`, transform: i === 0 && meses.length > 1 ? 'none' : i === rotulos.length - 1 && meses.length > 1 ? 'translateX(-100%)' : 'translateX(-50%)', display: { xs: rotulosMoveis.includes(indice) ? 'block' : 'none', sm: rotulosDesktop.includes(indice) ? 'block' : 'none' }, whiteSpace: 'nowrap' }}>{mesLegivel(meses[indice].competencia)}</Typography>)}
      </Box>
      {meses.some(mes => mes.situacaoTemporal === 'atual') && <Typography variant="body2">Mês atual: {mesLegivel(hoje.slice(0, 7))} — parcial.</Typography>}
      {futuro >= 0 && <Typography variant="body2" color="text.secondary">Futuro a partir de {mesLegivel(meses[futuro].competencia)}: ainda não ocorrido.</Typography>}
    </Box>
    <Box component="details" sx={{ minWidth: 0, '& > summary': { cursor: 'pointer', py: 1.5, minHeight: 44 }, '& summary:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
      <Box component="summary">Ver valores mensais — {meses.length} competências</Box>
      <TableContainer tabIndex={0} role="region" aria-label={`Valores mensais da meta ${meta.nome}`} sx={{ '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
        <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }}>
          <caption>Valores acumulados exatos. Reserva inicial incluída; referência conforme objetivo e prazo atuais.</caption>
          <TableHead><TableRow><TableCell scope="col">Competência</TableCell><TableCell scope="col" align="right">Planejado</TableCell><TableCell scope="col" align="right">Realizado</TableCell><TableCell scope="col">Período</TableCell></TableRow></TableHead>
          <TableBody>{meses.map(mes => <TableRow key={mes.competencia}>
            <TableCell component="th" scope="row">{mesLegivel(mes.competencia)}</TableCell>
            <TableCell align="right">{formatarMoeda(mes.planejadoAcumuladoCentavos)}</TableCell>
            <TableCell align="right">{mes.realizadoAcumuladoCentavos === null ? 'Ainda não ocorrido' : formatarMoeda(mes.realizadoAcumuladoCentavos)}</TableCell>
            <TableCell>{mes.situacaoTemporal === 'atual' ? 'Mês atual — parcial' : mes.situacaoTemporal === 'futura' ? 'Futuro' : 'Encerrado'}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  </Stack>
}
