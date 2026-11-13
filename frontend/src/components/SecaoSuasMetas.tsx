import { Box, Button, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import ArrowForward from '@mui/icons-material/ArrowForward'
import FlagOutlined from '@mui/icons-material/FlagOutlined'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import type { Aporte, Meta } from '../types/meta'
import { resumirMeta } from '../utils/metas'
import { formatarMoeda } from '../utils/formatadores'
import SuperficieVidro from './SuperficieVidro'

type SecaoSuasMetasProps = {
  readonly metas: readonly Readonly<Meta>[]
  readonly aportes: readonly Readonly<Aporte>[]
  readonly hoje: string
}

export default function SecaoSuasMetas({ metas, aportes, hoje }: SecaoSuasMetasProps) {
  const tituloId = useId()

  return (
    <SuperficieVidro component="section" aria-labelledby={tituloId}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography id={tituloId} variant="h6" component="h2">Suas metas</Typography>
            <Typography variant="body2" color="text.secondary">Acompanhe o progresso dos seus objetivos. Até quatro metas na ordem de cadastro.</Typography>
          </Box>
          <Button component={Link} to="/metas" endIcon={<ArrowForward />} sx={{ minHeight: 44 }}>Ver todas as metas</Button>
        </Stack>
        {metas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 }, px: 1, maxWidth: 440, mx: 'auto' }}>
            <FlagOutlined aria-hidden="true" sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h3" variant="h6">Você ainda não tem metas</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Acesse “Ver todas as metas” e use “Nova meta” para definir seu objetivo, prazo e valor já guardado.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
            {metas.slice(0, 4).map(meta => {
              const resumo = resumirMeta(meta, aportes, hoje)
              const percentual = resumo.percentual.toLocaleString('pt-BR')
              return (
                <Box key={meta.id} component="article" sx={tema => ({ bgcolor: tema.glass.opaca, border: `1px solid ${tema.glass.borda}`, borderRadius: 3, p: { xs: 2, sm: 3 }, minWidth: 0 })}>
                  <Stack spacing={2}>
                    <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>{meta.nome}</Typography>
                    <Chip label={resumo.situacao} color={resumo.situacao === 'Concluída' ? 'success' : resumo.situacao === 'Prazo encerrado' ? 'warning' : 'default'} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                    <Box component="dl" sx={{ m: 0, '& dt': { color: 'text.secondary', typography: 'body2' }, '& dd': { m: 0, mb: 1, fontWeight: 650, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' } }}>
                      <dt>Objetivo</dt><dd>{formatarMoeda(meta.valorObjetivoCentavos)}</dd>
                      <dt>Acumulado</dt><dd>{formatarMoeda(resumo.acumulado)}</dd>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontVariantNumeric: 'tabular-nums' }}>{percentual}% do objetivo</Typography>
                      <LinearProgress variant="determinate" value={resumo.percentual} aria-label={`Progresso da meta ${meta.nome}`} aria-valuetext={`${percentual} por cento`} sx={{ height: 8, borderRadius: 2, '& .MuiLinearProgress-bar': { transition: 'none' } }} />
                    </Box>
                  </Stack>
                </Box>
              )
            })}
          </Box>
        )}
      </CardContent>
    </SuperficieVidro>
  )
}
