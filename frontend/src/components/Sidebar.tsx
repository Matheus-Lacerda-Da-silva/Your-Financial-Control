import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { AccountBalanceWalletOutlined, CategoryOutlined, DashboardOutlined } from '@mui/icons-material'
import { NavLink } from 'react-router-dom'
import { alpha, IconButton } from '@mui/material'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import FlagOutlined from '@mui/icons-material/FlagOutlined'

const itens = [
  { caminho: '/', nome: 'Visão geral', icone: DashboardOutlined },
  { caminho: '/transacoes', nome: 'Transações', icone: AccountBalanceWalletOutlined },
  { caminho: '/categorias', nome: 'Categorias', icone: CategoryOutlined },
  { caminho: '/metas', nome: 'Metas', icone: FlagOutlined },
]

export default function Sidebar({ aberta, onFechar }: { aberta: boolean; onFechar: () => void }) {
  const conteudo = <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 3 }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'background.paper', p: 1.2, borderRadius: 3, display: 'flex' }}><AccountBalanceWalletOutlined /></Box>
      <Box><Typography variant="h6">YFC.</Typography><Typography variant="caption" color="text.secondary">Your Financial Control</Typography></Box>
    </Box>
    <Typography variant="overline" color="text.secondary" sx={{ px: 2, mt: 3, mb: 1 }}>Seu financeiro</Typography>
    <List component="nav" aria-label="Navegação principal">
      {itens.map(({ caminho, nome, icone: Icone }) => <ListItemButton key={caminho} component={NavLink} to={caminho} end={caminho === '/'} onClick={onFechar} sx={tema => ({
        borderRadius: 2, mb: 1, minHeight: 48, borderLeft: '3px solid transparent', px: 1.5,
        '&:hover': { bgcolor: 'action.hover' },
        '&.active': {
          bgcolor: alpha(tema.palette.primary.main, 0.10), color: 'primary.main', borderLeftColor: 'primary.main',
          '& .MuiListItemText-primary': { fontWeight: 700 },
          '& .MuiListItemIcon-root': { color: 'primary.main' },
          '&:hover': { bgcolor: alpha(tema.palette.primary.main, 0.16) },
        },
        '&:focus-visible, &.Mui-focusVisible': { outline: `3px solid ${tema.palette.primary.main}`, outlineOffset: 2 },
      })}>
        <ListItemIcon sx={{ minWidth: 36 }}><Icone aria-hidden="true" sx={{ fontSize: 24 }} /></ListItemIcon><ListItemText primary={nome} />
      </ListItemButton>)}
    </List>
    <Box sx={{ mt: 'auto', p: 2, bgcolor: 'action.hover', borderRadius: 3 }}><Typography variant="subtitle2">Um passo de cada vez.</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Organize hoje para conquistar seus planos amanhã.</Typography></Box>
  </Box>
  return <>
    <Drawer variant="permanent" sx={tema => ({ display: { xs: 'none', md: 'block' }, width: 264, flexShrink: 0, '& .MuiDrawer-paper': { width: 264, boxSizing: 'border-box', bgcolor: tema.glass.opaca, backgroundImage: 'none', borderRight: `1px solid ${tema.glass.borda}`, boxShadow: tema.glass.luzInterna } })}>{conteudo}</Drawer>
    <Drawer variant="temporary" open={aberta} onClose={onFechar} slotProps={{ paper: { id: 'menu-movel', role: 'dialog', 'aria-modal': true, 'aria-label': 'Menu de navegação' } }} sx={tema => ({ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, maxWidth: '85vw', bgcolor: tema.glass.opaca, backgroundImage: 'none' } })}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 1 }}><IconButton aria-label="Fechar menu de navegação" onClick={onFechar} sx={{ width: 44, height: 44 }}><CloseOutlined /></IconButton></Box>
      {conteudo}
    </Drawer>
  </>
}
