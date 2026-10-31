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
import { formatarData, formatarMoeda } from '../utils/formatadores'

type Transacao = {
  id: number
  descricao: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  data: string
}

type InicioProps = {
  transacoes: Transacao[]
}

function Inicio({ transacoes }: InicioProps) {

  const receitas = transacoes
    .filter((transacao) => transacao.valor > 0)
    .reduce((total, transacao) => total + transacao.valor, 0)

  const despesas = transacoes
    .filter((transacao) => transacao.valor < 0)
    .reduce((total, transacao) => total + Math.abs(transacao.valor), 0)

  const saldoAtual = receitas - despesas
  const ultimasTransacoes = transacoes.slice(0, 5)
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
    <Box>
      <Grid container spacing={3}>
      </Grid>
    </Box>
 <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Últimas transações
      </Typography>

      {ultimasTransacoes.length === 0 ? (
        <Typography color="text.secondary">
          Nenhuma transação cadastrada ainda.
        </Typography>
      ) : (
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
                {ultimasTransacoes.map((transacao) => (
                  <TableRow key={transacao.id}>
                    <TableCell>{transacao.descricao}</TableCell>
                    <TableCell>{transacao.categoria}</TableCell>
                    <TableCell>{formatarData(transacao.data)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color:
                          transacao.valor >= 0 ? 'success.main' : 'error.main',
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
        )}
      </Box>
    </Box>
  )
}

export default Inicio