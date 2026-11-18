import { Box, Typography } from '@mui/material'

export default function MarcaYFC({ variante }: { variante: 'completa' | 'compacta' }) {
  const completa = variante === 'completa'

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box sx={{
        display: 'grid',
        placeItems: 'center',
        width: completa ? 44 : 36,
        height: completa ? 40 : 32,
        flexShrink: 0,
        color: 'primary.main',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}>
        <Typography component="span" sx={{ fontSize: completa ? 17 : 14, fontWeight: 800, lineHeight: 1 }}>
          YFC
        </Typography>
      </Box>
      {completa && (
        <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
          Your Financial Control
        </Typography>
      )}
    </Box>
  )
}
