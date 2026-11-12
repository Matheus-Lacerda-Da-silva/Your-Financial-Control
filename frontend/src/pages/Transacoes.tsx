import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import {
  Alert,
  Snackbar,
  Box,
  Button,
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
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import SuperficieVidro from '../components/SuperficieVidro'
import TransacaoCard from '../components/TransacaoCard'
import { dataLocalAtual, formatarData, formatarMoeda } from '../utils/formatadores'

import type { TransacaoExibicao, TransacaoRegistrada } from '../types/transacao'
import type { Categoria } from '../types/categoria'
import { converterParaCentavos, centavosParaEntrada } from '../utils/dinheiro'

type TransacaoNova = Omit<TransacaoRegistrada, 'id'>

type TransacoesProps = {
  transacoes: TransacaoExibicao[]
  categorias: Categoria[]
  erroFinanceiro: string | null
  onLimparErro: () => void
  onCadastrarTransacao: (transacao: TransacaoNova) => string | null
  onExcluirTransacao: (id: number) => string | null
  onEditarTransacao: (transacao: TransacaoRegistrada) => string | null
}

function Transacoes({
  transacoes,
  categorias,
  erroFinanceiro,
  onLimparErro,
  onCadastrarTransacao,
  onExcluirTransacao,
  onEditarTransacao,
}: TransacoesProps) {
  const tituloHistorico = useRef<HTMLHeadingElement>(null)
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null)
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TransacaoRegistrada['tipo']>('receita')
  const [valor, setValor] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [data, setData] = useState(dataLocalAtual)
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<TransacaoExibicao | null>(null)
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<TransacaoExibicao | null>(null)
  const [descricaoEdicao, setDescricaoEdicao] = useState('')
  const [tipoEdicao, setTipoEdicao] = useState<TransacaoRegistrada['tipo']>('receita')
  const [valorEdicao, setValorEdicao] = useState('')
  const [categoriaIdEdicao, setCategoriaIdEdicao] = useState('')
  const [dataEdicao, setDataEdicao] = useState('')
  const categoriasCadastro = categorias.filter(c => c.tipo === tipo)
  const categoriasEdicao = categorias.filter(c => c.tipo === tipoEdicao)

  const cadastrarTransacao = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    let valorCentavos: number
    try {
      valorCentavos = converterParaCentavos(valor)
    } catch (erro) {
      setAviso({ texto: erro instanceof Error ? erro.message : 'Valor inválido.', erro: true })
      return
    }

    if (
      !descricao.trim() ||
      !categoriaId.trim() ||
      !data ||
      !Number.isFinite(valorCentavos) ||
      valorCentavos <= 0
    ) {
      setAviso({ texto: 'Preencha todos os campos com valores válidos.', erro: true })
      return
    }

    const novaTransacao: TransacaoNova = {
      descricao,
      tipo,
      valorCentavos: tipo === 'despesa' ? -valorCentavos : valorCentavos,
      categoriaId,
      data,
    }

    const erroCadastro = onCadastrarTransacao(novaTransacao)
    if (erroCadastro) {
      setAviso({ texto: erroCadastro, erro: true })
      return
    }

    setAviso({ texto: 'Transação cadastrada com sucesso!', erro: false })

    setDescricao('')
    setTipo('receita')
    setValor('')
    setCategoriaId('')
    setData(dataLocalAtual())
  }

  const abrirEdicao = (transacao: TransacaoExibicao) => {
    setAviso(null)
    onLimparErro()
    setTransacaoEmEdicao(transacao)
    setDescricaoEdicao(transacao.descricao)
    setTipoEdicao(transacao.tipo)
    setValorEdicao(centavosParaEntrada(transacao.valorCentavos))
    setCategoriaIdEdicao(transacao.categoriaId)
    setDataEdicao(transacao.data)
  }

  const abrirExclusao = (transacao: TransacaoExibicao) => {
    setAviso(null)
    onLimparErro()
    setTransacaoParaExcluir(transacao)
  }

  const salvarEdicao = () => {
    if (!transacaoEmEdicao) {
      return
    }

    let valorCentavos: number
    try {
      valorCentavos = converterParaCentavos(valorEdicao)
    } catch (erro) {
      setAviso({ texto: erro instanceof Error ? erro.message : 'Valor inválido.', erro: true })
      return
    }

    if (
      !descricaoEdicao.trim() ||
      !categoriaIdEdicao.trim() ||
      !dataEdicao ||
      !Number.isFinite(valorCentavos) ||
      valorCentavos <= 0
    ) {
      setAviso({ texto: 'Preencha todos os campos com valores válidos.', erro: true })
      return
    }

    const transacaoEditada: TransacaoRegistrada = {
      id: transacaoEmEdicao.id,
      descricao: descricaoEdicao,
      tipo: tipoEdicao,
      valorCentavos: tipoEdicao === 'despesa' ? -valorCentavos : valorCentavos,
      categoriaId: categoriaIdEdicao,
      data: dataEdicao,
    }

    const erroEdicao = onEditarTransacao(transacaoEditada)
    if (erroEdicao) {
      setAviso({ texto: erroEdicao, erro: true })
      return
    }
    setAviso(null)
    setTransacaoEmEdicao(null)
  }

  return (
    <Box sx={tema => ({ background: tema.glass.fundoDashboard, borderRadius: 4, p: { xs: 1, sm: 3 }, minWidth: 0 })}>
      <Snackbar open={transacaoEmEdicao === null && transacaoParaExcluir === null && (aviso !== null || erroFinanceiro !== null)} autoHideDuration={5000} onClose={() => { setAviso(null); onLimparErro() }}>
        <Alert severity={erroFinanceiro || aviso?.erro ? 'error' : 'success'} onClose={() => { setAviso(null); onLimparErro() }} variant="filled">
          {erroFinanceiro ?? aviso?.texto}
        </Alert>
      </Snackbar>
      <Typography variant="h4" component="h1" gutterBottom>
        Transações
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Cadastre e acompanhe suas movimentações financeiras.
      </Typography>

      <SuperficieVidro>
        <CardContent>
          <Typography variant="h6" component="h2" id="nova-transacao" sx={{ mb: 3 }}>
            Nova transação
          </Typography>

          <Box
            component="form"
            aria-labelledby="nova-transacao"
            onSubmit={cadastrarTransacao}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
              gap: 2.5,
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
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
              onChange={(evento) => { setTipo(evento.target.value as TransacaoRegistrada['tipo']); setCategoriaId('') }}
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
              select
              label="Categoria"
              value={categoriaId}
              onChange={(evento) => setCategoriaId(evento.target.value)}
              required
              fullWidth
              helperText={categoriasCadastro.length ? 'Selecione uma categoria do tipo escolhido.' : 'Nenhuma categoria para este tipo. Cadastre uma em Categorias.'}
              slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxWidth: 'calc(100vw - 32px)' } } } } } }}
            >
              <MenuItem value="" disabled>Selecione uma categoria</MenuItem>
              {categoriasCadastro.map(c => <MenuItem key={c.id} value={c.id} sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{c.nome}</MenuItem>)}
            </TextField>

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

            <Button variant="contained" type="submit" sx={{ minHeight: 48, alignSelf: 'end', justifySelf: { xs: 'stretch', sm: 'start' } }}>
              Cadastrar transação
            </Button>
          </Box>
          {categoriasCadastro.length === 0 && <Button component={Link} to="/categorias" sx={{ mt: 1, minHeight: 44 }}>Cadastrar categorias</Button>}
        </CardContent>
      </SuperficieVidro>
      <SuperficieVidro sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" id="historico-transacoes" ref={tituloHistorico} tabIndex={-1} sx={{ mb: 2, '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 3 } }}>
            Histórico de transações
          </Typography>

          {transacoes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 }, px: 1, maxWidth: 440, mx: 'auto' }}>
              <ReceiptLongOutlined aria-hidden="true" sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h3">Seu histórico começa aqui</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Cadastre sua primeira receita ou despesa no formulário acima.</Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: { xs: 'grid', sm: 'none' }, gap: 2 }}>
                {transacoes.map((transacao) => (
                  <TransacaoCard
                    key={transacao.id}
                    transacao={transacao}
                    onEditar={() => abrirEdicao(transacao)}
                    onExcluir={() => abrirExclusao(transacao)}
                  />
                ))}
              </Box>
              <TableContainer tabIndex={0} role="region" aria-labelledby="historico-transacoes" sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: '100%', overflowX: 'auto', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: -3 } }}>
              <Table aria-labelledby="historico-transacoes" sx={{ minWidth: 880, tableLayout: 'fixed', '& th, & td': { verticalAlign: 'top' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '22%' }}>Descrição</TableCell>
                    <TableCell sx={{ width: '16%' }}>Categoria</TableCell>
                    <TableCell sx={{ width: '14%' }}>Data</TableCell>
                    <TableCell sx={{ width: '12%' }}>Tipo</TableCell>
                    <TableCell align="right" sx={{ width: '22%' }}>Valor</TableCell>
                    <TableCell align="center" sx={{ width: '14%' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {transacoes.map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell component="th" scope="row" sx={{ overflowWrap: 'anywhere', fontWeight: 650 }}>{transacao.descricao}</TableCell>
                      <TableCell sx={{ overflowWrap: 'anywhere' }}>{transacao.categoria}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatarData(transacao.data)}</TableCell>
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
                          fontVariantNumeric: 'tabular-nums',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {(formatarMoeda(transacao.valorCentavos))}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label={`Editar transação: ${transacao.descricao}`}
                          sx={{ width: 44, height: 44 }}
                          color="primary"
                          onClick={() => abrirEdicao(transacao)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label={`Excluir transação: ${transacao.descricao}`}
                          sx={{ width: 44, height: 44 }}
                          color="error"
                          onClick={() => abrirExclusao(transacao)}
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
      </SuperficieVidro>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>As transações são temporárias e ficam apenas nesta sessão. Ao recarregar a aplicação ou sair, elas serão apagadas.</Typography>
      <Dialog
        open={transacaoParaExcluir !== null}
        onClose={() => setTransacaoParaExcluir(null)}
        aria-labelledby="titulo-exclusao"
        aria-describedby="descricao-exclusao"
        slotProps={{ transition: { onExited: () => {
          // O botão de origem deixa de existir após confirmar a exclusão.
          if (!document.activeElement || document.activeElement === document.body) tituloHistorico.current?.focus()
        } } }}
      >
        <DialogTitle id="titulo-exclusao">Excluir transação</DialogTitle>
        {(erroFinanceiro || aviso?.erro) && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{erroFinanceiro ?? aviso?.texto}</Alert>}

        <DialogContent>
          <DialogContentText id="descricao-exclusao" sx={{ overflowWrap: 'anywhere' }}>
            Tem certeza de que deseja excluir "
            {transacaoParaExcluir?.descricao}"? Essa ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button autoFocus onClick={() => setTransacaoParaExcluir(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (transacaoParaExcluir) {
                const erroExclusao = onExcluirTransacao(transacaoParaExcluir.id)
                if (erroExclusao) { setAviso({ texto: erroExclusao, erro: true }); return }
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
        aria-labelledby="titulo-edicao"
      >
        <DialogTitle id="titulo-edicao">Editar transação</DialogTitle>

        {(erroFinanceiro || aviso?.erro) && (
            <Alert severity="error" sx={{ mx: 3, mb: 2, flexShrink: 0 }} onClose={() => { setAviso(null); onLimparErro() }}>
              {erroFinanceiro ?? aviso?.texto}
            </Alert>
          )}
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2.5,
              pt: 1,
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
            }}
          >
            <TextField
              label="Descrição"
              value={descricaoEdicao}
              autoFocus
              required
              sx={{ gridColumn: '1 / -1' }}
              onChange={(evento) => setDescricaoEdicao(evento.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Tipo de transação"
              value={tipoEdicao}
              onChange={(evento) => { setTipoEdicao(evento.target.value as TransacaoRegistrada['tipo']); setCategoriaIdEdicao('') }}
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
              required
              fullWidth
            />

            <TextField
              select
              label="Categoria"
              value={categoriaIdEdicao}
              required
              onChange={(evento) => setCategoriaIdEdicao(evento.target.value)}
              fullWidth
              helperText={categoriasEdicao.length ? 'Selecione uma categoria do tipo escolhido.' : 'Nenhuma categoria para este tipo. Cadastre uma em Categorias.'}
              slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxWidth: 'calc(100vw - 32px)' } } } } } }}
            >
              <MenuItem value="" disabled>Selecione uma categoria</MenuItem>
              {categoriasEdicao.map(c => <MenuItem key={c.id} value={c.id} sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{c.nome}</MenuItem>)}
            </TextField>

            <TextField
              label="Data"
              type="date"
              value={dataEdicao}
              onChange={(evento) => setDataEdicao(evento.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
              fullWidth
            />
          </Box>
          {categoriasEdicao.length === 0 && <Button component={Link} to="/categorias" sx={{ mt: 1, minHeight: 44 }}>Ir para Categorias (descarta esta edição)</Button>}
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
