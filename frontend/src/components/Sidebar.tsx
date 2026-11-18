import { alpha, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { AccountBalanceWalletOutlined, CategoryOutlined, DashboardOutlined } from '@mui/icons-material'
import { NavLink } from 'react-router-dom'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import FlagOutlined from '@mui/icons-material/FlagOutlined'
import MarcaYFC from './MarcaYFC'

const itens = [
  { caminho: '/', nome: 'Visão geral', icone: DashboardOutlined },
  { caminho: '/transacoes', nome: 'Transações', icone: AccountBalanceWalletOutlined },
  { caminho: '/categorias', nome: 'Categorias', icone: CategoryOutlined },
  { caminho: '/metas', nome: 'Metas', icone: FlagOutlined },
]

export default function Sidebar({ aberta, onFechar }: { aberta: boolean; onFechar: () => void }) {
  const navegacao = <List component="nav" aria-label="Navegação principal" disablePadding sx={{ display: 'grid', gap: 0.5 }}>
      {itens.map(({ caminho, nome, icone: Icone }) => <ListItemButton key={caminho} component={NavLink} to={caminho} end={caminho === '/'} onClick={onFechar} sx={tema => ({
        borderRadius: 2, minWidth: 44, minHeight: 48, borderLeft: '3px solid transparent', px: 1.5,
        '&:hover': { bgcolor: 'action.hover' },
        '&.active': {
          bgcolor: alpha(tema.palette.primary.main, 0.10), color: 'text.primary', borderLeftColor: 'primary.main',
          '& .MuiListItemText-primary': { fontWeight: 700 },
          '& .MuiListItemIcon-root': { color: 'primary.main' },
          '&:hover': { bgcolor: alpha(tema.palette.primary.main, 0.16) },
        },
        '&:focus-visible, &.Mui-focusVisible': { outline: `3px solid ${tema.palette.primary.main}`, outlineOffset: 2 },
      })}>
        <ListItemIcon sx={{ minWidth: 36 }}><Icone aria-hidden="true" sx={{ fontSize: 24 }} /></ListItemIcon><ListItemText primary={nome} />
      </ListItemButton>)}
    </List>

  return <>
    <Drawer variant="permanent" sx={tema => ({ display: { xs: 'none', md: 'block' }, width: 264, flexShrink: 0, '& .MuiDrawer-paper': { width: 264, boxSizing: 'border-box', bgcolor: tema.glass.opaca, backgroundImage: 'none', borderRight: `1px solid ${tema.glass.borda}`, boxShadow: tema.glass.luzInterna } })}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ px: 1, pt: 0.5, pb: 2.5 }}><MarcaYFC variante="completa" /></Box>
        {navegacao}
      </Box>
    </Drawer>
    <Drawer variant="temporary" open={aberta} onClose={onFechar} slotProps={{ paper: { id: 'menu-movel', role: 'dialog', 'aria-modal': true, 'aria-label': 'Menu de navegação' } }} sx={tema => ({ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, maxWidth: '85vw', bgcolor: tema.glass.opaca, backgroundImage: 'none' } })}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
          <MarcaYFC variante="completa" />
          <IconButton aria-label="Fechar menu de navegação" onClick={onFechar} sx={{ width: 44, height: 44, flexShrink: 0 }}><CloseOutlined /></IconButton>
        </Box>
        {navegacao}
      </Box>
    </Drawer>
  </>
}
