import { Box, Button, Chip, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { Transacao } from '../types/transacao'
import { formatarData, formatarMoeda } from '../utils/formatadores'

type Props = {
  transacao: Transacao
  onEditar: (transacao: Transacao) => void
  onExcluir: (transacao: Transacao) => void
}

export default function TransacaoCard({ transacao, onEditar, onExcluir }: Props) {
  const receita = transacao.tipo === 'receita'
  return (
    <Box component="article" sx={tema => ({ p: 2, border: `1px solid ${tema.glass.borda}`, bgcolor: tema.glass.opaca, borderRadius: 3, minWidth: 0 })}>
      <Typography sx={{ overflowWrap: 'anywhere', fontWeight: 700 }}>{transacao.descricao}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
        {transacao.categoria} · {formatarData(transacao.data)}
      </Typography>
      <Chip size="small" variant="outlined" color={receita ? 'success' : 'error'} label={receita ? 'Receita' : 'Despesa'} sx={{ mt: 1 }} />
      <Typography color={receita ? 'success.main' : 'error.main'} sx={{ mt: 1.5, overflowWrap: 'anywhere', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '1.125rem' }}>
        {formatarMoeda(transacao.valorCentavos)}
      </Typography>
      <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button aria-label={`Editar transação: ${transacao.descricao}`} sx={{ minHeight: 44 }} startIcon={<EditIcon />} onClick={() => onEditar(transacao)}>Editar</Button>
        <Button aria-label={`Excluir transação: ${transacao.descricao}`} sx={{ minHeight: 44 }} color="error" startIcon={<DeleteIcon />} onClick={() => onExcluir(transacao)}>Excluir</Button>
      </Box>
    </Box>
  )
}
