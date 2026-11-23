import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import AlternadorTema from '../components/AlternadorTema'
import MarcaYFC from '../components/MarcaYFC'

export default function LayoutAcesso({ children }: { children: ReactNode }) {
  return (
    <Box sx={{
      minHeight: '100dvh',
      display: 'grid',
      gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
      bgcolor: tema => tema.palette.mode === 'light' ? '#f4f4f5' : '#18181b',
    }}>
      <Box component="aside" sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        gap: 5,
        p: { md: 5, lg: 8 },
        background: 'linear-gradient(145deg, #083e38, #087f68)',
        color: '#fff',
      }}>
        <MarcaYFC variante="institucional" />
        <Box sx={{ my: 'auto', maxWidth: 400 }}>
          <Typography variant="h4" component="p">
            Acompanhe suas finanças e organize seus próximos passos.
          </Typography>
          <Typography sx={{ mt: 2, color: '#e6fff7' }}>
            Veja receitas, despesas e saldo em um só lugar.
          </Typography>
        </Box>
      </Box>
      <Box component="main" sx={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: { xs: 2, sm: 5, lg: 8 },
        py: { xs: 2.5, sm: 4 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
          <Box component="header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <MarcaYFC variante="compacta" />
            </Box>
            <Box sx={{ ml: 'auto' }}><AlternadorTema /></Box>
          </Box>
          <Box sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: tema => tema.glass.opaca,
            border: tema => `1px solid ${tema.glass.borda}`,
            borderRadius: 1,
            boxShadow: tema => tema.glass.sombra,
            overflowWrap: 'anywhere',
            '& a:focus-visible': { outlineColor: 'primary.main' },
            '& .MuiInputAdornment-root .MuiIconButton-root': { minWidth: 44, minHeight: 44 },
          }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
