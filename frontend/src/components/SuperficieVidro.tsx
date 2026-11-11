import { Card } from '@mui/material'
import type { CardProps } from '@mui/material'

// O fallback opaco é a base; o efeito depende de suporte explícito do navegador.
export default function SuperficieVidro({ sx = [], ...props }: CardProps) {
  return <Card {...props} sx={[
    tema => ({
      minWidth: 0,
      backgroundColor: tema.glass.opaca,
      backgroundImage: 'none',
      border: `1px solid ${tema.glass.borda}`,
      boxShadow: tema.glass.sombra,
      '@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
        backgroundColor: tema.glass.superficie,
        backdropFilter: `blur(${tema.glass.blur})`,
        WebkitBackdropFilter: `blur(${tema.glass.blur})`,
      },
      '& > .MuiCardContent-root': {
        p: { xs: 2, sm: 3 },
        '&:last-child': { pb: { xs: 2, sm: 3 } },
      },
    }),
    ...(Array.isArray(sx) ? sx : [sx]),
  ]} />
}
