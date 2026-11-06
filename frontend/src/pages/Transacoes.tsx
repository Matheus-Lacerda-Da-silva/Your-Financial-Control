import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Alert,
  Snackbar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import EditIcon from '@mui/icons-material/Edit'
import TransacaoCard from '../components/TransacaoCard'
import { dataLocalAtual, formatarData, formatarMoeda } from '../utils/formatadores'

import type { Transacao } from '../types/transacao'

type TransacaoNova = Omit<Transacao, 'id'>

type TransacoesProps = {
  transacoes: Transacao[]
  onCadastrarTransacao: (transacao: TransacaoNova) => void
  onExcluirTransacao: (id: number) => void
  onEditarTransacao: (transacao: Transacao) => void
}

function Transacoes({
  transacoes,
  onCadastrarTransacao,
  onExcluirTransacao,
  onEditarTransacao,
}: TransacoesProps) {
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null)
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('receita')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [data, setData] = useState(dataLocalAtual)
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<Transacao | null>(null)
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null)
  const [descricaoEdicao, setDescricaoEdicao] = useState('')
  const [tipoEdicao, setTipoEdicao] = useState('receita')
  const [valorEdicao, setValorEdicao] = useState('')
  const [categoriaEdicao, setCategoriaEdicao] = useState('')
  const [dataEdicao, setDataEdicao] = useState('')

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
      setAviso({ texto: 'Preencha todos os campos com valores válidos.', erro: true })
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

    setAviso({ texto: 'Transação cadastrada com sucesso!', erro: false })

    setDescricao('')
    setTipo('receita')
    setValor('')
    setCategoria('')
    setData(dataLocalAtual())
  }

  const abrirEdicao = (transacao: Transacao) => {
    setTransacaoEmEdicao(transacao)
    setDescricaoEdicao(transacao.descricao)
    setTipoEdicao(transacao.tipo)
    setValorEdicao(String(Math.abs(transacao.valor)))
    setCategoriaEdicao(transacao.categoria)
    setDataEdicao(transacao.data)
  }

  const salvarEdicao = () => {
    if (!transacaoEmEdicao) {
      return
    }

    const valorNumerico = Number(valorEdicao)

    if (
      !descricaoEdicao.trim() ||
      !categoriaEdicao.trim() ||
      !dataEdicao ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setAviso({ texto: 'Preencha todos os campos com valores válidos.', erro: true })
      return
    }

    onEditarTransacao({
      id: transacaoEmEdicao.id,
      descricao: descricaoEdicao,
      tipo: tipoEdicao as 'receita' | 'despesa',
      valor: tipoEdicao === 'despesa' ? -valorNumerico : valorNumerico,
      categoria: categoriaEdicao,
      data: dataEdicao,
    })

    setTransacaoEmEdicao(null)
  }

  return (
    <Box>
      <Snackbar open={aviso !== null} autoHideDuration={5000} onClose={() => setAviso(null)}>
        <Alert severity={aviso?.erro ? 'error' : 'success'} onClose={() => setAviso(null)} variant="filled">
          {aviso?.texto}
        </Alert>
      </Snackbar>
      <Typography variant="h4" component="h1" gutterBottom>
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
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
              gap: 2.5,
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
            <Box>
              <Box sx={{ display: { xs: 'grid', sm: 'none' }, gap: 2 }}>
                {transacoes.map((transacao) => (
                  <TransacaoCard
                    key={transacao.id}
                    transacao={transacao}
                    onEditar={abrirEdicao}
                    onExcluir={setTransacaoParaExcluir}
                  />
                ))}
              </Box>
              <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
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
                          color: transacao.tipo === 'receita' ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {(formatarMoeda(transacao.valor))}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="Editar transação"
                          color="primary"
                          onClick={() => abrirEdicao(transacao)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="Excluir transação"
                          color="error"
                          onClick={() => setTransacaoParaExcluir(transacao)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={transacaoParaExcluir !== null}
        onClose={() => setTransacaoParaExcluir(null)}
      >
        <DialogTitle>Excluir transação</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir "
            {transacaoParaExcluir?.descricao}"? Essa ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setTransacaoParaExcluir(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (transacaoParaExcluir) {
                onExcluirTransacao(transacaoParaExcluir.id)
              }
              setTransacaoParaExcluir(null)
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={transacaoEmEdicao !== null}
        onClose={() => setTransacaoEmEdicao(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar transação</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Descrição"
              value={descricaoEdicao}
              onChange={(evento) => setDescricaoEdicao(evento.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Tipo de transação"
              value={tipoEdicao}
              onChange={(evento) => setTipoEdicao(evento.target.value)}
              fullWidth
            >
              <MenuItem value="receita">Receita</MenuItem>
              <MenuItem value="despesa">Despesa</MenuItem>
            </TextField>

            <TextField
              label="Valor (R$)"
              type="number"
              value={valorEdicao}
              onChange={(evento) => setValorEdicao(evento.target.value)}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              fullWidth
            />

            <TextField
              label="Categoria"
              value={categoriaEdicao}
              onChange={(evento) => setCategoriaEdicao(evento.target.value)}
              fullWidth
            />

            <TextField
              label="Data"
              type="date"
              value={dataEdicao}
              onChange={(evento) => setDataEdicao(evento.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setTransacaoEmEdicao(null)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarEdicao}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Transacoes
