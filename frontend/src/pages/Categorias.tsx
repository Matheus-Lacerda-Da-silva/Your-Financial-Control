import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import CategoryOutlined from '@mui/icons-material/CategoryOutlined'
import { Link } from 'react-router-dom'

export default function Categorias() {
  return <Stack spacing={3}>
    <Box><Typography variant="overline" color="primary.main">ORGANIZAÇÃO</Typography><Typography variant="h4" component="h1">Categorias</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Mais clareza para entender para onde seu dinheiro vai.</Typography></Box>
    <Card><CardContent sx={{ textAlign: 'center', py: 7 }}>
      <CategoryOutlined sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6">Um espaço para organizar suas categorias</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mt: 1, mb: 3 }}>O gerenciamento de categorias está em preparação. Por enquanto, informe a categoria diretamente ao cadastrar uma transação.</Typography>
      <Button component={Link} to="/transacoes" variant="outlined">Ir para transações</Button>
    </CardContent></Card>
  </Stack>
}
