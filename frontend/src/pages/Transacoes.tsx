
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

function Transacoes() {
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

    const novaTransacao = {
      descricao,
      tipo,
      valor: tipo === 'despesa' ? -valorNumerico : valorNumerico,
      categoria,
      data,
    }

    console.log('Nova transação:', novaTransacao)

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
    </Box>
  )
}

export default Transacoes
