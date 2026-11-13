import { useRef, useState } from 'react'
import { Alert, Box, Button, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material'
import FlagOutlined from '@mui/icons-material/FlagOutlined'
import type { EstadoMetas } from '../types/meta'
import type { AcaoMetas } from '../utils/estadoMetas'
import useDataMetas from '../hooks/useDataMetas'
import SuperficieVidro from '../components/SuperficieVidro'
import CartaoMeta from '../components/CartaoMeta'
import FormularioMeta from '../components/FormularioMeta'
import DetalhesMeta from '../components/DetalhesMeta'

export default function Metas({ estado, onExecutar }: { estado: EstadoMetas; onExecutar: (acao: AcaoMetas) => string | null }) {
  const hoje = useDataMetas()
  const [formulario, setFormulario] = useState<string | null>(null)
  const [detalhesId, setDetalhesId] = useState<string | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const editar = estado.metas.find(m => m.id === formulario) ?? null
  const detalhes = estado.metas.find(m => m.id === detalhesId)
  const excluir = estado.metas.find(m => m.id === excluirId)
  const limparErro = () => onExecutar({ tipo: 'limparErro' })
  return <Stack spacing={3} sx={tema => ({ background: tema.glass.fundoDashboard, borderRadius: 4, p: { xs: 1, sm: 3 }, minWidth: 0 })}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <Box><Typography component="h1" variant="h4" ref={titulo} tabIndex={-1} sx={{ '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }}>Metas</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Transforme seus objetivos em um plano mensal e acompanhe cada aporte.</Typography></Box>
      <Button variant="contained" startIcon={<FlagOutlined />} onClick={() => { limparErro(); setFormulario('nova') }}>Nova meta</Button>
    </Box>
    {aviso && <Alert severity="success" role="status" onClose={() => setAviso(null)}>{aviso}</Alert>}
    {estado.erro && !excluir && <Alert severity="error" onClose={limparErro}>{estado.erro}</Alert>}
    <SuperficieVidro><CardContent>
      {estado.metas.length === 0 ? <Box sx={{ textAlign: 'center', py: 5, maxWidth: 440, mx: 'auto' }}><FlagOutlined aria-hidden="true" sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} /><Typography component="h2" variant="h6">Qual é o seu próximo objetivo?</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Crie sua primeira meta pelo botão Nova meta. Defina o valor, o prazo e o que já tem guardado.</Typography></Box> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
        {estado.metas.map(meta => <CartaoMeta key={meta.id} meta={meta} aportes={estado.aportes} hoje={hoje} onDetalhes={() => { limparErro(); setDetalhesId(meta.id) }} onEditar={() => { limparErro(); setFormulario(meta.id) }} onExcluir={() => { limparErro(); setExcluirId(meta.id) }} />)}
      </Box>}
    </CardContent></SuperficieVidro>
    <Typography variant="body2" color="text.secondary">Metas e aportes ficam apenas nesta sessão e são apagados ao recarregar ou sair. Aportes não alteram o saldo nem as transações.</Typography>
    {formulario !== null && <FormularioMeta key={formulario} meta={editar} hoje={hoje} onExecutar={onExecutar} onFechar={() => setFormulario(null)} />}
    {detalhes && <DetalhesMeta key={detalhes.id} meta={detalhes} aportes={estado.aportes} hoje={hoje} onExecutar={onExecutar} onFechar={() => setDetalhesId(null)} />}
    <Dialog open={!!excluir} onClose={() => setExcluirId(null)} aria-labelledby="titulo-excluir-meta" aria-describedby="descricao-excluir-meta" slotProps={{ transition: { onExited: () => { if (document.activeElement === document.body) titulo.current?.focus() } } }}>
      <DialogTitle id="titulo-excluir-meta">Excluir meta</DialogTitle>
      {estado.erro && <Alert severity="error" sx={{ mx: 3 }}>{estado.erro}</Alert>}
      <DialogContent><DialogContentText id="descricao-excluir-meta" sx={{ overflowWrap: 'anywhere' }}>Excluir “{excluir?.nome}” e seus {estado.aportes.filter(a => a.metaId === excluirId).length} aportes? Esta ação não pode ser desfeita e não altera transações.</DialogContentText></DialogContent>
      <DialogActions><Button autoFocus onClick={() => setExcluirId(null)}>Cancelar</Button><Button color="error" onClick={() => {
        if (!excluir) return
        const erro = onExecutar({ tipo: 'excluir', id: excluir.id })
        if (!erro) { setExcluirId(null); setAviso('Meta e seus aportes excluídos.') }
      }}>Excluir meta</Button></DialogActions>
    </Dialog>
  </Stack>
}
