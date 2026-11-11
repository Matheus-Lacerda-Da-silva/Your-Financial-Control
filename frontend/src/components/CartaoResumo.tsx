import { Box, CardContent, Stack, Typography } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'
import { formatarMoeda } from '../utils/formatadores'
import SuperficieVidro from './SuperficieVidro'

type Props = {
  titulo: string
  valor: number
  detalhe: string
  icone: SvgIconComponent
  cor: 'primary.main' | 'success.main' | 'error.main'
  destaque?: boolean
}

export default function CartaoResumo({ titulo, valor, detalhe, icone: Icone, cor, destaque = false }: Props) {
  return <SuperficieVidro sx={tema => ({
    gridColumn: { sm: destaque ? '1 / -1' : 'auto', lg: 'auto' },
    ...(destaque ? { borderTop: `3px solid ${tema.glass.destaque}` } : {}),
  })}>
    <CardContent>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" component="h2">{titulo}</Typography>
        <Box sx={{ p: 1, display: 'flex', borderRadius: 2, bgcolor: 'action.hover', color: cor }}><Icone aria-hidden="true" /></Box>
      </Stack>
      <Typography sx={{ my: 2, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 750, overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}>{formatarMoeda(valor)}</Typography>
      <Typography variant="body2" color="text.secondary">{detalhe}</Typography>
    </CardContent>
  </SuperficieVidro>
}
