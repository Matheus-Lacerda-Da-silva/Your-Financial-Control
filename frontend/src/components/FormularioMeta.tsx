import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import type { Meta } from '../types/meta'
import type { AcaoMetas } from '../utils/estadoMetas'
import { centavosParaEntrada, converterParaCentavos } from '../utils/dinheiro'
import { criarIdMeta } from '../utils/metas'

export default function FormularioMeta({ meta, hoje, onExecutar, onFechar }: {
  meta: Meta | null; hoje: string; onExecutar: (acao: AcaoMetas) => string | null; onFechar: () => void
}) {
  const [nome, setNome] = useState(meta?.nome ?? '')
  const [objetivo, setObjetivo] = useState(meta ? centavosParaEntrada(meta.valorObjetivoCentavos) : '')
  const [inicial, setInicial] = useState(meta ? centavosParaEntrada(meta.valorInicialCentavos) : '0.00')
  const [inicio, setInicio] = useState(meta?.dataInicio ?? hoje)
  const [limite, setLimite] = useState(meta?.dataLimite ?? hoje)
  const [erro, setErro] = useState<string | null>(null)
  const salvar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    try {
      const valorObjetivoCentavos = converterParaCentavos(objetivo)
      let mensagem: string | null
      if (meta) mensagem = onExecutar({ tipo: 'editar', meta: { id: meta.id, nome, valorObjetivoCentavos, dataLimite: limite }, hoje })
      else {
        const valorInicialCentavos = /^0+(?:\.0{1,2})?$/.test(inicial.trim()) ? 0 : converterParaCentavos(inicial)
        mensagem = onExecutar({ tipo: 'criar', meta: { id: criarIdMeta(), nome, valorObjetivoCentavos, valorInicialCentavos, dataInicio: inicio, dataLimite: limite }, hoje })
      }
      if (mensagem) { setErro(mensagem); return }
      onFechar()
    } catch (falha) { setErro(falha instanceof Error ? falha.message : 'Não foi possível salvar a meta.') }
  }
  return <Dialog open onClose={onFechar} fullWidth maxWidth="sm" aria-labelledby="titulo-formulario-meta">
    <DialogTitle id="titulo-formulario-meta">{meta ? 'Editar meta' : 'Nova meta'}</DialogTitle>
    <Box component="form" onSubmit={salvar} noValidate sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {erro && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{erro}</Alert>}
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5, pt: 1 }}>
          <TextField autoFocus required label="Nome da meta" value={nome} onChange={e => setNome(e.target.value)} sx={{ gridColumn: '1 / -1' }} />
          <TextField required label="Objetivo (R$)" type="number" value={objetivo} onChange={e => setObjetivo(e.target.value)} slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }} />
          <TextField required label="Reserva inicial (R$)" type="number" disabled={!!meta} value={inicial} onChange={e => setInicial(e.target.value)} helperText={meta ? 'A reserva inicial é preservada na edição.' : 'Pode ser zero.'} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
          <TextField required label="Data de início" type="date" disabled={!!meta} value={inicio} onChange={e => setInicio(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField required label="Prazo final" type="date" value={limite} onChange={e => setLimite(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
        <Alert severity="info" sx={{ mt: 2 }}>O planejamento considera os meses de início e término por inteiro, sem proporção por dias. Limite de 120 meses. Aportes existentes serão preservados.</Alert>
      </DialogContent>
      <DialogActions><Button onClick={onFechar}>Cancelar</Button><Button variant="contained" type="submit">Salvar meta</Button></DialogActions>
    </Box>
  </Dialog>
}
