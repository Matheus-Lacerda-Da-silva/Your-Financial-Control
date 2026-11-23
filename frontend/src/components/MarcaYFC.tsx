import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import emblemaYFC from '../assets/branding/yfc-emblema-120.png'

export default function MarcaYFC({ variante }: { variante: 'completa' | 'compacta' | 'institucional' }) {
  const [imagemIndisponivel, setImagemIndisponivel] = useState(false)
  const institucional = variante === 'institucional'
  const completa = variante !== 'compacta'
  const tamanho = institucional ? 80 : completa ? 40 : 32

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: institucional ? 2 : 1.25, minWidth: 0 }}>
      <Box sx={{
        display: 'grid',
        placeItems: 'center',
        width: institucional ? tamanho : tamanho + 4,
        height: tamanho,
        flexShrink: 0,
      }}>
        {imagemIndisponivel ? (
          <Typography
            component="span"
            role={completa ? undefined : 'img'}
            aria-label={completa ? undefined : 'YFC, Your Financial Control'}
            aria-hidden={completa || undefined}
            sx={{ color: institucional ? 'inherit' : 'primary.main', fontSize: institucional ? 28 : completa ? 17 : 14, fontWeight: 800, lineHeight: 1 }}
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
        <Typography component="span" variant={institucional ? 'h6' : 'body2'} sx={{ fontWeight: 700 }}>
          Your Financial Control
        </Typography>
      )}
    </Box>
  )
}
