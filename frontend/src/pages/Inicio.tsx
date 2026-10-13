import {
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material'

function Inicio() {
  const transacoes = [
  {
    descricao: 'Salário',
    categoria: 'Trabalho',
    data: '05/10/2026',
    valor: 3500,
  },
  {
    descricao: 'Supermercado',
    categoria: 'Alimentação',
    data: '04/10/2026',
    valor: -250,
  },
  {
    descricao: 'Internet',
    categoria: 'Contas',
    data: '03/10/2026',
    valor: -100,
  },
]
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }
  const receitas = transacoes
    .filter((transacao) => transacao.valor > 0)
    .reduce((total, transacao) => total + transacao.valor, 0)

  const despesas = transacoes
    .filter((transacao) => transacao.valor < 0)
    .reduce((total, transacao) => total + Math.abs(transacao.valor), 0)

  const saldoAtual = receitas - despesas
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Visão geral
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                Saldo atual
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                {formatarMoeda(saldoAtual)}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Saldo disponível
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                Receitas
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                {formatarMoeda(receitas)}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total recebido
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                Despesas
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                {formatarMoeda(despesas)}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total gasto
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Descrição</TableCell>
        <TableCell>Categoria</TableCell>
        <TableCell>Data</TableCell>
        <TableCell align="right">Valor</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {transacoes.map((transacao) => (
        <TableRow key={transacao.descricao}>
          <TableCell>
            {transacao.descricao}
          </TableCell>

          <TableCell>
            {transacao.categoria}
          </TableCell>

          <TableCell>
            {transacao.data}
          </TableCell>

        <TableCell
          align="right"
          sx={{
            color: transacao.valor >= 0 ? 'success.main' : 'error.main',
            fontWeight: 600,
          }}
        >
          {formatarMoeda(transacao.valor)}
        </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      <Box sx={{ mt: 4 }}>
  <Typography variant="h5" gutterBottom>
    Últimas transações
  </Typography>
      </Box>
    </Box>
  )
}

export default Inicio