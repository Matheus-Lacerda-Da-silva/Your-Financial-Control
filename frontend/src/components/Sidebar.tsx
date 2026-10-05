import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'

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
          <ListItemButton component={NavLink} to="/">
            <ListItemText primary="Início" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/transacoes">
            <ListItemText primary="Transações" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/categorias">
            <ListItemText primary="Categorias" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

export default Sidebar