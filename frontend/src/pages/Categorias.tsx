import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import CategoryOutlined from '@mui/icons-material/CategoryOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import SuperficieVidro from '../components/SuperficieVidro'
import type { Categoria } from '../types/categoria'
import type { TransacaoRegistrada } from '../types/transacao'
import { contarVinculosCategoria, criarIdCategoria } from '../utils/categorias'

type Props = {
  categorias: Categoria[]
  transacoes: TransacaoRegistrada[]
  erro: string | null
  onLimparErro: () => void
  onCadastrar: (categoria: Categoria) => string | null
  onEditar: (categoria: Categoria) => string | null
  onExcluir: (id: string) => string | null
}

export default function Categorias({ categorias, transacoes, erro, onLimparErro, onCadastrar, onEditar, onExcluir }: Props) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<Categoria['tipo']>('receita')
  const [emEdicao, setEmEdicao] = useState<Categoria | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Categoria | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')
  const [tipoEdicao, setTipoEdicao] = useState<Categoria['tipo']>('receita')
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null)
  const tituloLista = useRef<HTMLHeadingElement>(null)
  const erroAtual = erro ?? (aviso?.erro ? aviso.texto : null)
  const vinculosEdicao = emEdicao ? contarVinculosCategoria(emEdicao.id, transacoes) : 0
  const vinculosExclusao = paraExcluir ? contarVinculosCategoria(paraExcluir.id, transacoes) : 0

  const limparAvisos = () => { setAviso(null); onLimparErro() }
  const cadastrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    try {
      const mensagem = onCadastrar({ id: criarIdCategoria(), nome, tipo })
      if (mensagem) { setAviso({ texto: mensagem, erro: true }); return }
      setNome('')
      setTipo('receita')
      setAviso({ texto: 'Categoria cadastrada com sucesso!', erro: false })
    } catch (falha) {
      setAviso({ texto: falha instanceof Error ? falha.message : 'Não foi possível cadastrar a categoria.', erro: true })
    }
  }
  const salvarEdicao = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!emEdicao) return
    const mensagem = onEditar({ id: emEdicao.id, nome: nomeEdicao, tipo: tipoEdicao })
    if (mensagem) { setAviso({ texto: mensagem, erro: true }); return }
    setEmEdicao(null)
    setAviso({ texto: 'Categoria atualizada com sucesso!', erro: false })
  }
  const excluir = () => {
    if (!paraExcluir) return
    const mensagem = onExcluir(paraExcluir.id)
    if (mensagem) { setAviso({ texto: mensagem, erro: true }); return }
    setParaExcluir(null)
    setAviso({ texto: 'Categoria excluída com sucesso!', erro: false })
  }

  return <Stack spacing={3} sx={tema => ({ background: tema.glass.fundoDashboard, borderRadius: 4, p: { xs: 1, sm: 3 }, minWidth: 0 })}>
    <Box>
      <Typography variant="overline" color="primary.main">ORGANIZAÇÃO</Typography>
      <Typography variant="h4" component="h1">Categorias</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>Organize suas receitas e despesas para identificar cada movimentação.</Typography>
    </Box>
    {!emEdicao && !paraExcluir && (erroAtual || aviso) && <Alert severity={erroAtual ? 'error' : 'success'} role={erroAtual ? 'alert' : 'status'} onClose={limparAvisos}>{erroAtual ?? aviso?.texto}</Alert>}
    <SuperficieVidro><CardContent>
      <Typography variant="h6" component="h2" id="nova-categoria" sx={{ mb: 3 }}>Nova categoria</Typography>
      <Box component="form" noValidate aria-labelledby="nova-categoria" onSubmit={cadastrar} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'minmax(0, 2fr) minmax(0, 1fr) auto' }, gap: 2.5, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}>
        <TextField label="Nome" value={nome} onChange={e => setNome(e.target.value)} required fullWidth />
        <TextField select label="Tipo" value={tipo} onChange={e => setTipo(e.target.value as Categoria['tipo'])} fullWidth>
          <MenuItem value="receita">Receita</MenuItem><MenuItem value="despesa">Despesa</MenuItem>
        </TextField>
        <Button variant="contained" type="submit" sx={{ minHeight: 48, alignSelf: 'end', justifySelf: { xs: 'stretch', sm: 'start' } }}>Cadastrar categoria</Button>
      </Box>
    </CardContent></SuperficieVidro>
    <SuperficieVidro><CardContent>
      <Typography variant="h6" component="h2" id="lista-categorias" ref={tituloLista} tabIndex={-1} sx={{ mb: 2, '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 3 } }}>Categorias cadastradas</Typography>
      {categorias.length === 0 ? <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 }, px: 1, maxWidth: 440, mx: 'auto' }}>
        <CategoryOutlined aria-hidden="true" sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" component="h3">Comece pelas suas categorias</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Cadastre uma categoria no formulário acima. Depois, selecione-a ao registrar uma receita ou despesa.</Typography>
      </Box> : <Box component="ul" aria-labelledby="lista-categorias" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2 }}>
        {categorias.map(c => {
          const quantidade = contarVinculosCategoria(c.id, transacoes)
          return <Box component="li" key={c.id} sx={tema => ({ bgcolor: tema.glass.opaca, border: `1px solid ${tema.glass.borda}`, borderRadius: 3, p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2, minWidth: 0 })}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="h3" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{c.nome}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{quantidade} {quantidade === 1 ? 'transação vinculada' : 'transações vinculadas'}</Typography>
            </Box>
            <Chip label={c.tipo === 'receita' ? 'Receita' : 'Despesa'} color={c.tipo === 'receita' ? 'success' : 'error'} variant="outlined" size="small" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button startIcon={<EditOutlined />} aria-label={`Editar categoria: ${c.nome} (${c.tipo === 'receita' ? 'Receita' : 'Despesa'})`} sx={{ minHeight: 44 }} onClick={() => { limparAvisos(); setNomeEdicao(c.nome); setTipoEdicao(c.tipo); setEmEdicao(c) }}>Editar</Button>
              <Button startIcon={<DeleteIcon />} color="error" aria-label={`Excluir categoria: ${c.nome} (${c.tipo === 'receita' ? 'Receita' : 'Despesa'})`} sx={{ minHeight: 44 }} onClick={() => { limparAvisos(); setParaExcluir(c) }}>Excluir</Button>
            </Box>
          </Box>
        })}
      </Box>}
    </CardContent></SuperficieVidro>
    <Typography variant="body2" color="text.secondary">Categorias e transações são temporárias. Ao recarregar a aplicação ou sair, elas serão apagadas.</Typography>

    <Dialog open={emEdicao !== null} onClose={() => { setEmEdicao(null); limparAvisos() }} fullWidth maxWidth="sm" aria-labelledby="titulo-edicao-categoria">
      <DialogTitle id="titulo-edicao-categoria">Editar categoria</DialogTitle>
      {erroAtual && <Alert severity="error" sx={{ mx: 3, mb: 2, flexShrink: 0 }}>{erroAtual}</Alert>}
      <Box component="form" noValidate onSubmit={salvarEdicao} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}>
            <TextField autoFocus label="Nome" value={nomeEdicao} onChange={e => setNomeEdicao(e.target.value)} required fullWidth />
            <TextField select label="Tipo" value={tipoEdicao} onChange={e => setTipoEdicao(e.target.value as Categoria['tipo'])} disabled={vinculosEdicao > 0} helperText={vinculosEdicao ? 'O tipo não pode ser alterado enquanto houver transações vinculadas.' : 'Receita ou Despesa.'} fullWidth>
              <MenuItem value="receita">Receita</MenuItem><MenuItem value="despesa">Despesa</MenuItem>
            </TextField>
            <Typography variant="body2" color="text.secondary">Ao renomear, o novo nome também aparecerá nas transações vinculadas.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => { setEmEdicao(null); limparAvisos() }}>Cancelar</Button><Button variant="contained" type="submit">Salvar</Button></DialogActions>
      </Box>
    </Dialog>
    <Dialog open={paraExcluir !== null} onClose={() => { setParaExcluir(null); limparAvisos() }} fullWidth maxWidth="sm" aria-labelledby="titulo-exclusao-categoria" aria-describedby="descricao-exclusao-categoria" slotProps={{ transition: { onExited: () => { if (document.activeElement === document.body) tituloLista.current?.focus() } } }}>
      <DialogTitle id="titulo-exclusao-categoria">Excluir categoria</DialogTitle>
      {erroAtual && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{erroAtual}</Alert>}
      <DialogContent>
        <DialogContentText id="descricao-exclusao-categoria" sx={{ overflowWrap: 'anywhere' }}>
          {vinculosExclusao > 0 ? `A categoria “${paraExcluir?.nome}” possui ${vinculosExclusao} transação(ões) vinculada(s). Reclassifique esses lançamentos em Transações antes de excluir a categoria.` : `Deseja excluir a categoria “${paraExcluir?.nome}”? Essa ação não pode ser desfeita.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions><Button autoFocus onClick={() => { setParaExcluir(null); limparAvisos() }}>Cancelar</Button><Button color="error" disabled={vinculosExclusao > 0} onClick={excluir}>Excluir</Button></DialogActions>
    </Dialog>
  </Stack>
}
