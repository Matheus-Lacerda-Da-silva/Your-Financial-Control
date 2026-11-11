import { Box, Button } from '@mui/material'
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import { useTema } from '../theme/ContextoTema'

export default function AlternadorTema() {
  const { modo, alternar } = useTema()
  const destino = modo === 'light' ? 'escuro' : 'claro'
  return <Button type="button" variant="outlined" aria-label={`Ativar tema ${destino}`} onClick={alternar}
    sx={{ minWidth: 44, minHeight: 44, px: { xs: 1, sm: 1.5 }, gap: 1, flexShrink: 0 }}>
    {modo === 'light' ? <DarkModeOutlined aria-hidden="true" /> : <LightModeOutlined aria-hidden="true" />}
    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Tema {destino}</Box>
  </Button>
}
