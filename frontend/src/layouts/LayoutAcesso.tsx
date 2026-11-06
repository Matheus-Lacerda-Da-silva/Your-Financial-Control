import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { AccountBalanceWalletOutlined, CheckCircleOutlined } from '@mui/icons-material'

export default function LayoutAcesso({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' } }}>
      <Box component="aside" sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: { md: 5, lg: 8 }, background: 'linear-gradient(145deg, #083e38, #087f68)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <AccountBalanceWalletOutlined sx={{ fontSize: 36 }} />
          <Box><Typography variant="h5">YFC.</Typography><Typography variant="caption">Your Financial Control</Typography></Box>
        </Stack>
        <Box sx={{ py: 8, position: 'relative', zIndex: 1, maxWidth: 520 }}>
          <Typography variant="overline" sx={{ color: '#adebdc' }}>MAIS CLAREZA. NOVAS POSSIBILIDADES.</Typography>
          <Typography component="h2" sx={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)', fontWeight: 750, lineHeight: 1.12, letterSpacing: '-0.045em', my: 3 }}>Seus planos começam com um novo olhar para o seu dinheiro.</Typography>
          <Typography sx={{ color: '#d2eee7', fontSize: '1.1rem', mb: 4 }}>Um espaço simples para acompanhar suas finanças e organizar cada próximo passo.</Typography>
          <Stack spacing={2}>
            {['Receitas e despesas em um só lugar', 'Uma visão clara do seu saldo', 'Seu estilo, no tema claro ou escuro'].map(texto => (
              <Stack key={texto} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><CheckCircleOutlined sx={{ color: '#91e2cd' }} /><Typography>{texto}</Typography></Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ color: '#d2eee7' }}>Um passo de cada vez. Um futuro com mais organização.</Typography>
        <Box aria-hidden="true" sx={{ position: 'absolute', width: 450, height: 450, border: '1px solid #ffffff16', borderRadius: '50%', bottom: -220, right: -180 }} />
      </Box>
      <Box component="main" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 2, sm: 5, lg: 8 }, pt: { xs: 11, md: 12 }, pb: 5 }}>
        <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 4, color: 'primary.main' }}><AccountBalanceWalletOutlined /><Typography variant="h5">YFC.</Typography></Stack>
          {children}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>Your Financial Control · Organize hoje, planeje amanhã.</Typography>
        </Box>
      </Box>
    </Box>
  )
}
