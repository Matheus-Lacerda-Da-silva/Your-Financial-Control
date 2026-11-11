import { Box, Button, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Add, ArrowDownward, ArrowForward, ArrowUpward, AccountBalanceWalletOutlined } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { formatarData, formatarMoeda } from '../utils/formatadores'
import type { Transacao } from '../types/transacao'
import { calcularResumo } from '../utils/transacoes'
import CartaoResumo from '../components/CartaoResumo'
import SuperficieVidro from '../components/SuperficieVidro'

export default function Inicio({ transacoes }: { transacoes: Transacao[] }) {
  const { receitas, despesas, saldo } = calcularResumo(transacoes)
  const resumo: ComponentProps<typeof CartaoResumo>[] = [
    { titulo: 'Saldo atual', valor: saldo, detalhe: 'Receitas menos despesas', icone: AccountBalanceWalletOutlined, cor: 'primary.main' },
    { titulo: 'Receitas', valor: receitas, detalhe: 'Total de entradas registradas', icone: ArrowUpward, cor: 'success.main' },
    { titulo: 'Despesas', valor: despesas, detalhe: 'Total de saídas registradas', icone: ArrowDownward, cor: 'error.main' },
  ]
  return <Stack spacing={{ xs: 2, sm: 3 }} sx={tema => ({
    background: tema.glass.fundoDashboard,
    borderRadius: 4,
    p: { xs: 2, sm: 3 },
    minWidth: 0,
  })}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <Box><Typography variant="overline" color="primary.main">SEU PAINEL FINANCEIRO</Typography><Typography variant="h4" component="h1">Uma visão clara do seu dinheiro</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Acompanhe suas movimentações e planeje os próximos passos.</Typography></Box>
      <Button component={Link} to="/transacoes" variant="contained" startIcon={<Add />}>Nova transação</Button>
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, sm: 3 } }}>
      {resumo.map((item, indice) => <CartaoResumo key={item.titulo} {...item} destaque={indice === 0} />)}
    </Box>
    <SuperficieVidro><CardContent>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}><Box><Typography variant="h6" component="h2">Últimas transações</Typography><Typography variant="body2" color="text.secondary">Suas cinco movimentações cadastradas mais recentemente.</Typography></Box><Button component={Link} to="/transacoes" endIcon={<ArrowForward />}>Ver todas</Button></Stack>
      {transacoes.length === 0 ? <Box sx={{ textAlign: 'center', py: 6, px: 1 }}><AccountBalanceWalletOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} /><Typography variant="h6">Seu controle começa aqui</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Registre sua primeira receita ou despesa para acompanhar seu saldo.</Typography><Button component={Link} to="/transacoes" variant="outlined" startIcon={<Add />}>Adicionar transação</Button></Box> : <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {transacoes.slice(0, 5).map(t => <Box key={t.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 2, flexWrap: 'wrap' }}>
          <Box sx={{ bgcolor: 'action.hover', color: t.valorCentavos >= 0 ? 'success.main' : 'error.main', p: 1.2, borderRadius: 3, display: { xs: 'none', sm: 'flex' } }}>{t.valorCentavos >= 0 ? <ArrowUpward /> : <ArrowDownward />}</Box>
          <Box sx={{ flex: '1 1 140px', minWidth: 0 }}><Typography sx={{ overflowWrap: 'anywhere', fontWeight: 650 }}>{t.descricao}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{t.categoria} · {formatarData(t.data)}</Typography></Box>
          <Chip size="small" variant="outlined" label={t.tipo === 'receita' ? 'Receita' : 'Despesa'} color={t.tipo === 'receita' ? 'success' : 'error'} />
          <Typography color={t.valorCentavos >= 0 ? 'success.main' : 'error.main'} sx={{ overflowWrap: 'anywhere', fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>{formatarMoeda(t.valorCentavos)}</Typography>
        </Box>)}
      </Stack>}
    </CardContent></SuperficieVidro>
    <Typography variant="caption" color="text.secondary">Os lançamentos desta versão ficam disponíveis apenas durante a sessão. Ao recarregar, os dados serão apagados.</Typography>
  </Stack>
}
