import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function LayoutPrincipal() {
  const [menuAberto, setMenuAberto] = useState(false)
  return <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
    <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <Sidebar aberta={menuAberto} onFechar={() => setMenuAberto(false)} />
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Box component="header" sx={{ height: 80, px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <IconButton aria-label="Abrir menu de navegação" onClick={() => setMenuAberto(true)} sx={{ display: { md: 'none' } }}><MenuIcon /></IconButton>
        <Typography variant="body2" color="text.secondary">Seu dinheiro, com mais clareza.</Typography>
      </Box>
      <Box component="main" id="conteudo" tabIndex={-1} sx={{ width: '100%', maxWidth: 1600, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 }, pb: 6 }}><Outlet /></Box>
    </Box>
  </Box>
}
