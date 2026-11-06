import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { AccountBalanceWalletOutlined, CategoryOutlined, DashboardOutlined } from '@mui/icons-material'
import { NavLink } from 'react-router-dom'

const itens = [
  { caminho: '/', nome: 'Visão geral', icone: DashboardOutlined },
  { caminho: '/transacoes', nome: 'Transações', icone: AccountBalanceWalletOutlined },
  { caminho: '/categorias', nome: 'Categorias', icone: CategoryOutlined },
]

export default function Sidebar({ aberta, onFechar }: { aberta: boolean; onFechar: () => void }) {
  const conteudo = <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 3 }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'background.paper', p: 1.2, borderRadius: 3, display: 'flex' }}><AccountBalanceWalletOutlined /></Box>
      <Box><Typography variant="h6">YFC.</Typography><Typography variant="caption" color="text.secondary">Your Financial Control</Typography></Box>
    </Box>
    <Typography variant="overline" color="text.secondary" sx={{ px: 2, mt: 3, mb: 1 }}>Seu financeiro</Typography>
    <List component="nav" aria-label="Navegação principal">
      {itens.map(({ caminho, nome, icone: Icone }) => <ListItemButton key={caminho} component={NavLink} to={caminho} end={caminho === '/'} onClick={onFechar} sx={{ borderRadius: 2, mb: 1, '&.active': { bgcolor: 'action.selected', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}>
        <ListItemIcon sx={{ minWidth: 40 }}><Icone /></ListItemIcon><ListItemText primary={nome} />
      </ListItemButton>)}
    </List>
    <Box sx={{ mt: 'auto', p: 2, bgcolor: 'action.hover', borderRadius: 3 }}><Typography variant="subtitle2">Um passo de cada vez.</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Organize hoje para conquistar seus planos amanhã.</Typography></Box>
  </Box>
  return <>
    <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, width: 264, flexShrink: 0, '& .MuiDrawer-paper': { width: 264, boxSizing: 'border-box' } }}>{conteudo}</Drawer>
    <Drawer variant="temporary" open={aberta} onClose={onFechar} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, maxWidth: '85vw' } }}>{conteudo}</Drawer>
  </>
}
