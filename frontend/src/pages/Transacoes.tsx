
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'

  type Transacao = {
    id: number
    descricao: string
    tipo: 'receita' | 'despesa'
    valor: number
    categoria: string
    data: string
  }

  type TransacaoNova = Omit<Transacao, 'id'>

  type TransacoesProps = {
    transacoes: Transacao[]
    onCadastrarTransacao: (transacao: TransacaoNova) => void
    onExcluirTransacao: (id: number) => void
  }

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function Transacoes({
    transacoes,
    onCadastrarTransacao,
    onExcluirTransacao,
  }: TransacoesProps) {
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('receita')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [data, setData] = useState('2026-10-08')

  const cadastrarTransacao = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    const valorNumerico = Number(valor)

    if (
      !descricao.trim() ||
      !categoria.trim() ||
      !data ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      alert('Preencha todos os campos com valores válidos.')
      return
    }

  const novaTransacao: TransacaoNova = {
    descricao,
    tipo: tipo as 'receita' | 'despesa',
    valor: tipo === 'despesa' ? -valorNumerico : valorNumerico,
    categoria,
    data,
  }

    onCadastrarTransacao(novaTransacao)

    alert('Transação cadastrada com sucesso!')

    setDescricao('')
    setTipo('receita')
    setValor('')
    setCategoria('')
    setData('2026-10-08')
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transações
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Cadastre e acompanhe suas movimentações financeiras.
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Nova transação
          </Typography>

          <Box
            component="form"
            onSubmit={cadastrarTransacao}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 600,
            }}
          >
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              required
              fullWidth
            />

            <TextField
              select
              label="Tipo de transação"
              value={tipo}
              onChange={(evento) => setTipo(evento.target.value)}
              fullWidth
            >
              <MenuItem value="receita">Receita</MenuItem>
              <MenuItem value="despesa">Despesa</MenuItem>
            </TextField>

            <TextField
              label="Valor (R$)"
              type="number"
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              required
              fullWidth
            />

            <TextField
              label="Categoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Data"
              type="date"
              value={data}
              onChange={(evento) => setData(evento.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              required
              fullWidth
            />

            <Button variant="contained" type="submit">
              Cadastrar transação
            </Button>
          </Box>
        </CardContent>
      </Card>
       <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Histórico de transações
          </Typography>

          {transacoes.length === 0 ? (
            <Typography color="text.secondary">
              Nenhuma transação cadastrada ainda.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="center">Ação</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {transacoes.map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell>{transacao.descricao}</TableCell>
                      <TableCell>{transacao.categoria}</TableCell>
                      <TableCell>{formatarData(transacao.data)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                          color={transacao.tipo === 'receita' ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell 
                      align="right"
                      sx={{
                        color: transacao.tipo === 'receita' ? 'sucess.main' : 'error.main',
                        fontWeight: 'bold',
                      }}
                      >
                        {formatarValor(transacao.valor)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="Excluir transação"
                          color="error"
                          onClick={() => onExcluirTransacao(transacao.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Transacoes
