import { useState } from 'react'
import { Box, Button, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AlternadorTema from '../components/AlternadorTema'

export default function LayoutPrincipal({ onSair }: { onSair: () => void }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const desktop = useMediaQuery(useTheme().breakpoints.up('md'))
  // Fecha também o estado modal ao atravessar o breakpoint.
  if (desktop && menuAberto) setMenuAberto(false)
  return <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
    <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <Sidebar aberta={menuAberto} onFechar={() => setMenuAberto(false)} />
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Box component="header" sx={tema => ({ minHeight: 80, px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, borderBottom: `1px solid ${tema.glass.borda}`, bgcolor: tema.glass.opaca, boxShadow: tema.glass.luzInterna })}>
        <IconButton aria-label="Abrir menu de navegação" aria-expanded={menuAberto} aria-controls={menuAberto ? 'menu-movel' : undefined} onClick={() => setMenuAberto(true)} sx={{ display: { md: 'none' }, width: 44, height: 44 }}><MenuIcon /></IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>Seu dinheiro, com mais clareza.</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlternadorTema />
          <Button onClick={onSair} startIcon={<LogoutOutlined />} sx={{ flexShrink: 0, minHeight: 44 }}>Sair</Button>
        </Box>
      </Box>
      <Box component="main" id="conteudo" tabIndex={-1} sx={{ width: '100%', maxWidth: 1600, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 }, pb: 6 }}><Outlet /></Box>
    </Box>
  </Box>
}
