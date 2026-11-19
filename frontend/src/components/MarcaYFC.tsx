import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import emblemaYFC from '../assets/branding/yfc-emblema-120.png'

export default function MarcaYFC({ variante }: { variante: 'completa' | 'compacta' }) {
  const [imagemIndisponivel, setImagemIndisponivel] = useState(false)
  const completa = variante === 'completa'
  const tamanho = completa ? 40 : 32

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box sx={{
        display: 'grid',
        placeItems: 'center',
        width: completa ? 44 : 36,
        height: tamanho,
        flexShrink: 0,
      }}>
        {imagemIndisponivel ? (
          <Typography
            component="span"
            role={completa ? undefined : 'img'}
            aria-label={completa ? undefined : 'YFC, Your Financial Control'}
            aria-hidden={completa || undefined}
            sx={{ color: 'primary.main', fontSize: completa ? 17 : 14, fontWeight: 800, lineHeight: 1 }}
          >
            YFC
          </Typography>
        ) : (
          <Box
            component="img"
            src={emblemaYFC}
            alt={completa ? '' : 'YFC, Your Financial Control'}
            width={tamanho}
            height={tamanho}
            onError={() => setImagemIndisponivel(true)}
            sx={{ display: 'block', objectFit: 'contain' }}
          />
        )}
      </Box>
      {completa && (
        <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
          Your Financial Control
        </Typography>
      )}
    </Box>
  )
}
