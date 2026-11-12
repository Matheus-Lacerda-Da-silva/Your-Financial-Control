import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Aporte, Meta } from '../types/meta'
import type { AcaoMetas } from '../utils/estadoMetas'
import { criarIdMeta, resumirMeta } from '../utils/metas'
import { converterParaCentavos } from '../utils/dinheiro'
import { formatarData, formatarMoeda } from '../utils/formatadores'
import RoteiroMensalMeta from './RoteiroMensalMeta'

export default function DetalhesMeta({ meta, aportes, hoje, onExecutar, onFechar }: {
  meta: Meta; aportes: Aporte[]; hoje: string; onExecutar: (acao: AcaoMetas) => string | null; onFechar: () => void
}) {
  const [valor, setValor] = useState('')
  const [data, setData] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null)
  const [excluir, setExcluir] = useState<Aporte | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const tituloHistorico = useRef<HTMLHeadingElement>(null)
  const celular = useMediaQuery(useTheme().breakpoints.down('sm'))
  const resumo = resumirMeta(meta, aportes, hoje)
  const historico = aportes.filter(a => a.metaId === meta.id).map((aporte, indice) => ({ aporte, indice }))
    .sort((a, b) => b.aporte.data.localeCompare(a.aporte.data) || b.indice - a.indice)
  const registrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    try {
      const erro = onExecutar({ tipo: 'aportar', aporte: { id: criarIdMeta(), metaId: meta.id, valorCentavos: converterParaCentavos(valor), data: data ?? hoje }, hoje })
      if (erro) { setAviso({ texto: erro, erro: true }); return }
      setValor(''); setData(null); setAviso({ texto: 'Aporte registrado. Progresso e planejamento restante atualizados.', erro: false })
    } catch (falha) { setAviso({ texto: falha instanceof Error ? falha.message : 'Aporte inválido.', erro: true }) }
  }
  return <>
    <Dialog open onClose={onFechar} fullWidth fullScreen={celular} maxWidth="md" aria-labelledby="titulo-detalhes-meta">
      <DialogTitle id="titulo-detalhes-meta" sx={{ overflowWrap: 'anywhere' }}>{meta.nome}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography sx={{ overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}>{resumo.situacao} · Acumulado: {formatarMoeda(resumo.acumulado)} · Restante: {formatarMoeda(resumo.restante)}</Typography>
          <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>Objetivo: {formatarMoeda(meta.valorObjetivoCentavos)} · Reserva inicial: {formatarMoeda(meta.valorInicialCentavos)} · {formatarData(meta.dataInicio)} a {formatarData(meta.dataLimite)}</Typography>
          <Alert severity="info">Os aportes são registros independentes: não alteram receitas, despesas, saldo ou histórico de transações. Não há rendimentos, juros ou inflação.</Alert>
          <Box>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Planejamento mensal</Typography>
            <RoteiroMensalMeta id="referencia-meta" titulo="Planejamento de referência — quanto guardar desde o início" descricao="Distribui o objetivo menos a reserva inicial por todos os meses do período. Não desconta aportes. Reflete as configurações atuais da meta, sem guardar versões anteriores do plano." plano={resumo.referencia} />
            <RoteiroMensalMeta id="restante-meta" titulo="Planejamento restante atualizado — quanto falta guardar agora" descricao={`Distribui somente o valor ainda restante pelos meses disponíveis, incluindo o mês atual quando dentro do prazo. Valores já aportados não são cobrados novamente. Referência: ${formatarData(hoje)}.`} plano={resumo.atualizado} />
          </Box>
          <Box component="form" noValidate onSubmit={registrar} aria-labelledby="titulo-novo-aporte">
            <Typography id="titulo-novo-aporte" component="h2" variant="h6" sx={{ mb: 2 }}>Registrar aporte</Typography>
            {aviso && <Alert severity={aviso.erro ? 'error' : 'success'} role={aviso.erro ? 'alert' : 'status'} sx={{ mb: 2 }}>{aviso.texto}</Alert>}
            {resumo.restante === 0 && <Typography sx={{ mb: 2 }}>Meta concluída. Para corrigir o acumulado, exclua um aporte no histórico.</Typography>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              <TextField label="Valor do aporte (R$)" type="number" required value={valor} onChange={e => setValor(e.target.value)} disabled={resumo.restante === 0} slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }} helperText="O aporte não pode ultrapassar o restante." />
              <TextField label="Data do aporte" type="date" required value={data ?? hoje} onChange={e => setData(e.target.value)} disabled={resumo.restante === 0} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: meta.dataInicio, max: hoje < meta.dataLimite ? hoje : meta.dataLimite } }} helperText="Data real, dentro do período e até hoje." />
              <Button type="submit" variant="contained" disabled={resumo.restante === 0} sx={{ justifySelf: 'start' }}>Registrar aporte</Button>
            </Box>
            {resumo.situacao === 'Prazo encerrado' && <Typography color="text.secondary" sx={{ mt: 2 }}>Você pode registrar um aporte ocorrido até o prazo final. Para aportes posteriores, edite e prorrogue a meta.</Typography>}
          </Box>
          <Box>
            <Typography component="h2" variant="h6" id="historico-aportes" ref={tituloHistorico} tabIndex={-1} sx={{ mb: 2, '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }}>Histórico de aportes</Typography>
            {!historico.length ? <Typography color="text.secondary">Nenhum aporte registrado. A reserva inicial é exibida separadamente.</Typography> : <Box component="ul" aria-labelledby="historico-aportes" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {historico.map(({ aporte }) => <Box component="li" key={aporte.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography sx={{ overflowWrap: 'anywhere', maxWidth: '100%', fontVariantNumeric: 'tabular-nums' }}>{formatarData(aporte.data)} · {formatarMoeda(aporte.valorCentavos)}</Typography>
                <Button color="error" aria-label={`Excluir aporte de ${formatarMoeda(aporte.valorCentavos)} em ${formatarData(aporte.data)}`} onClick={() => { setErroExclusao(null); setExcluir(aporte) }}>Excluir aporte</Button>
              </Box>)}
            </Box>}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions><Button autoFocus onClick={onFechar}>Fechar detalhes</Button></DialogActions>
    </Dialog>
    <Dialog open={excluir !== null} onClose={() => setExcluir(null)} aria-labelledby="titulo-excluir-aporte" aria-describedby="descricao-excluir-aporte" slotProps={{ transition: { onExited: () => { if (document.activeElement === document.body) tituloHistorico.current?.focus() } } }}>
      <DialogTitle id="titulo-excluir-aporte">Excluir aporte</DialogTitle>
      {erroExclusao && <Alert severity="error" sx={{ mx: 3 }}>{erroExclusao}</Alert>}
      <DialogContent><DialogContentText id="descricao-excluir-aporte" sx={{ overflowWrap: 'anywhere' }}>Excluir o aporte de {excluir ? formatarMoeda(excluir.valorCentavos) : ''}, registrado em {excluir ? formatarData(excluir.data) : ''}? O acumulado diminuirá e o planejamento restante será recalculado. Esta ação não pode ser desfeita.</DialogContentText></DialogContent>
      <DialogActions><Button autoFocus onClick={() => setExcluir(null)}>Cancelar</Button><Button color="error" onClick={() => {
        if (!excluir) return
        const erro = onExecutar({ tipo: 'excluirAporte', id: excluir.id, metaId: meta.id })
        if (erro) { setErroExclusao(erro); return }
        setExcluir(null); setAviso({ texto: 'Aporte excluído. Progresso e planejamento restante atualizados.', erro: false })
      }}>Excluir aporte</Button></DialogActions>
    </Dialog>
  </>
}
