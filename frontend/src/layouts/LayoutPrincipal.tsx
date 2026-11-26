import { useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Button, IconButton, useMediaQuery, useTheme } from '@mui/material'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AlternadorTema from '../components/AlternadorTema'
import MarcaYFC from '../components/MarcaYFC'

type Props = {
  onSair: () => void
  saindo: boolean
  aviso: ReactNode
  mostrarConteudo: boolean
}

export default function LayoutPrincipal({ onSair, saindo, aviso, mostrarConteudo }: Props) {
  const [menuAberto, setMenuAberto] = useState(false)
  const desktop = useMediaQuery(useTheme().breakpoints.up('md'))
  // Fecha também o estado modal ao atravessar o breakpoint.
  if (desktop && menuAberto) setMenuAberto(false)
  return <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
    <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <Sidebar aberta={menuAberto} onFechar={() => setMenuAberto(false)} />
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Box component="header" sx={tema => ({ minHeight: 80, px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, borderBottom: `1px solid ${tema.glass.borda}`, bgcolor: tema.glass.opaca, boxShadow: tema.glass.luzInterna })}>
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
          <IconButton aria-label="Abrir menu de navegação" aria-expanded={menuAberto} aria-controls={menuAberto ? 'menu-movel' : undefined} onClick={() => setMenuAberto(true)} sx={{ width: 44, height: 44, flexShrink: 0 }}><MenuIcon /></IconButton>
          <MarcaYFC variante="compacta" />
        </Box>
        <Box sx={{ ml: 'auto', maxWidth: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          <AlternadorTema />
          <Button type="button" onClick={onSair} loading={saindo} startIcon={<LogoutOutlined />} sx={{ flexShrink: 0, minWidth: 44, minHeight: 44, px: { xs: 1.25, sm: 2 } }}>Sair</Button>
        </Box>
      </Box>
      <Box component="main" id="conteudo" tabIndex={-1} sx={{ width: '100%', maxWidth: 1600, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 }, pb: 6 }}>
        {aviso}
        {mostrarConteudo && <Outlet />}
      </Box>
    </Box>
  </Box>
}
