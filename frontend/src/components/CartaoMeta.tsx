import { Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import type { Aporte, Meta } from '../types/meta'
import { recomendacaoMeta, resumirMeta } from '../utils/metas'
import { formatarData, formatarMoeda } from '../utils/formatadores'

export default function CartaoMeta({ meta, aportes, hoje, onDetalhes, onEditar, onExcluir }: {
  meta: Meta; aportes: Aporte[]; hoje: string
  onDetalhes: () => void; onEditar: () => void; onExcluir: () => void
}) {
  const resumo = resumirMeta(meta, aportes, hoje)
  return <Box component="article" sx={tema => ({ bgcolor: tema.glass.opaca, border: `1px solid ${tema.glass.borda}`, borderRadius: 3, p: { xs: 2, sm: 3 }, minWidth: 0 })}>
    <Stack spacing={2}>
      <Typography component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>{meta.nome}</Typography>
      <Chip label={resumo.situacao} color={resumo.situacao === 'Concluída' ? 'success' : resumo.situacao === 'Prazo encerrado' ? 'warning' : 'default'} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
      <Box component="dl" sx={{ m: 0, '& dt': { color: 'text.secondary', typography: 'body2' }, '& dd': { m: 0, mb: 1, fontWeight: 650, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' } }}>
        <dt>Objetivo</dt><dd>{formatarMoeda(meta.valorObjetivoCentavos)}</dd>
        <dt>Acumulado</dt><dd>{formatarMoeda(resumo.acumulado)}</dd>
        <dt>Restante</dt><dd>{formatarMoeda(resumo.restante)}</dd>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>{resumo.percentual.toLocaleString('pt-BR')}% do objetivo</Typography>
        <LinearProgress variant="determinate" value={resumo.percentual} aria-label={`Progresso da meta ${meta.nome}`} aria-valuetext={`${resumo.percentual.toLocaleString('pt-BR')} por cento`} sx={{ height: 8, borderRadius: 2 }} />
      </Box>
      <Typography variant="body2" color="text.secondary">{formatarData(meta.dataInicio)} a {formatarData(meta.dataLimite)}</Typography>
      <Box><Typography variant="subtitle2">Para guardar agora</Typography><Typography sx={{ overflowWrap: 'anywhere' }}>{resumo.situacao === 'Concluída' ? 'Objetivo alcançado!' : resumo.situacao === 'Prazo encerrado' ? 'Prorrogue o prazo para gerar um novo roteiro.' : recomendacaoMeta(resumo.atualizado)}</Typography></Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button variant="contained" onClick={onDetalhes} aria-label={`Ver detalhes e aportes: ${meta.nome}`} sx={{ minHeight: 44 }}>Detalhes e aportes</Button>
        <Button onClick={onEditar} aria-label={`Editar meta: ${meta.nome}`} sx={{ minHeight: 44 }}>Editar</Button>
        <Button color="error" onClick={onExcluir} aria-label={`Excluir meta: ${meta.nome}`} sx={{ minHeight: 44 }}>Excluir</Button>
      </Box>
    </Stack>
  </Box>
}
