import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

import {
  Home,
  AccountBalanceWallet,
  Category,
} from '@mui/icons-material'

import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/"
            sx={{
              '&.active': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <ListItemIcon>
              <Home />
            </ListItemIcon>

            <ListItemText primary="Início" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/transacoes"
            sx={{
              '&.active': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <ListItemIcon>
              <AccountBalanceWallet />
            </ListItemIcon>

            <ListItemText primary="Transações" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/categorias"
            sx={{
              '&.active': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <ListItemIcon>
              <Category />
            </ListItemIcon>

            <ListItemText primary="Categorias" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

export default Sidebar