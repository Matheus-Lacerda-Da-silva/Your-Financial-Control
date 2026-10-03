import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Your Financial Control
        </Typography>

        <Button color="inherit" component={Link} to="/">
          Início
        </Button>

        <Button color="inherit" component={Link} to="/transacoes">
          Transações
        </Button>

        <Button color="inherit" component={Link} to="/categorias">
          Categorias
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar