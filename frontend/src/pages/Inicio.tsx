import { Box, Button, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Add, ArrowDownward, ArrowForward, ArrowUpward, AccountBalanceWalletOutlined } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { formatarData, formatarMoeda } from '../utils/formatadores'
import type { Transacao } from '../types/transacao'
import { calcularResumo } from '../utils/transacoes'
import CartaoResumo from '../components/CartaoResumo'
import SuperficieVidro from '../components/SuperficieVidro'
import SecaoSuasMetas from '../components/SecaoSuasMetas'
import SecaoEvolucaoFinanceira from '../components/SecaoEvolucaoFinanceira'
import SecaoEvolucaoMetas from '../components/SecaoEvolucaoMetas'
import useDataMetas from '../hooks/useDataMetas'
import type { Aporte, Meta } from '../types/meta'

type InicioProps = {
  readonly transacoes: Transacao[]
  readonly metas: readonly Readonly<Meta>[]
  readonly aportes: readonly Readonly<Aporte>[]
}

export default function Inicio({ transacoes, metas, aportes }: InicioProps) {
  const hoje = useDataMetas()
  const { receitas, despesas, saldo } = calcularResumo(transacoes)
  const resumo: ComponentProps<typeof CartaoResumo>[] = [
    { titulo: 'Saldo atual', valor: saldo, detalhe: 'Receitas menos despesas', icone: AccountBalanceWalletOutlined, cor: 'primary.main' },
    { titulo: 'Receitas', valor: receitas, detalhe: 'Total de entradas registradas', icone: ArrowUpward, cor: 'success.main' },
    { titulo: 'Despesas', valor: despesas, detalhe: 'Total de saídas registradas', icone: ArrowDownward, cor: 'error.main' },
  ]
  return <Stack spacing={{ xs: 3, lg: 4 }} sx={tema => ({
    background: tema.glass.fundoDashboard,
    borderRadius: 4,
    p: { xs: 1, sm: 3 },
    minWidth: 0,
  })}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <Box><Typography variant="overline" color="primary.main">SEU PAINEL FINANCEIRO</Typography><Typography variant="h4" component="h1">Uma visão clara do seu dinheiro</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Acompanhe suas movimentações e planeje os próximos passos.</Typography></Box>
      <Button component={Link} to="/transacoes" variant="contained" startIcon={<Add />}>Nova transação</Button>
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, sm: 3 } }}>
      {resumo.map((item, indice) => <CartaoResumo key={item.titulo} {...item} destaque={indice === 0} />)}
    </Box>
    <SecaoSuasMetas metas={metas} aportes={aportes} hoje={hoje} />
    <SecaoEvolucaoFinanceira transacoes={transacoes} hoje={hoje} />
    <SecaoEvolucaoMetas metas={metas} aportes={aportes} hoje={hoje} />
    <SuperficieVidro><CardContent>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}><Box><Typography variant="h6" component="h2">Últimas transações</Typography><Typography variant="body2" color="text.secondary">Suas cinco movimentações cadastradas mais recentemente.</Typography></Box><Button component={Link} to="/transacoes" endIcon={<ArrowForward />}>Ver todas</Button></Stack>
      {transacoes.length === 0 ? <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 }, px: 1, maxWidth: 440, mx: 'auto' }}><Box sx={{ display: 'inline-flex', p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 3 }}><AccountBalanceWalletOutlined aria-hidden="true" sx={{ fontSize: 40, color: 'primary.main' }} /></Box><Typography variant="h6" component="h3">Seu controle começa aqui</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Registre sua primeira receita ou despesa para acompanhar seu saldo.</Typography><Button component={Link} to="/transacoes" variant="outlined" startIcon={<Add />}>Adicionar transação</Button></Box> : <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {transacoes.slice(0, 5).map(t => <Box key={t.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 2, flexWrap: 'wrap' }}>
          <Box sx={{ bgcolor: 'action.hover', color: t.valorCentavos >= 0 ? 'success.main' : 'error.main', p: 1.2, borderRadius: 3, display: { xs: 'none', sm: 'flex' } }}>{t.valorCentavos >= 0 ? <ArrowUpward /> : <ArrowDownward />}</Box>
          <Box sx={{ flex: '1 1 140px', minWidth: 0 }}><Typography sx={{ overflowWrap: 'anywhere', fontWeight: 650 }}>{t.descricao}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{t.categoria} · {formatarData(t.data)}</Typography></Box>
          <Chip size="small" variant="outlined" label={t.tipo === 'receita' ? 'Receita' : 'Despesa'} color={t.tipo === 'receita' ? 'success' : 'error'} />
          <Typography color={t.valorCentavos >= 0 ? 'success.main' : 'error.main'} sx={{ overflowWrap: 'anywhere', fontWeight: 650, fontVariantNumeric: 'tabular-nums', textAlign: { sm: 'right' }, flexBasis: { xs: '100%', sm: 'auto' }, maxWidth: '100%' }}>{formatarMoeda(t.valorCentavos)}</Typography>
        </Box>)}
      </Stack>}
    </CardContent></SuperficieVidro>
    <Typography variant="caption" color="text.secondary">Transações, metas e aportes ficam apenas nesta sessão e são apagados ao recarregar ou sair. Aportes não alteram saldo, receitas ou despesas.</Typography>
  </Stack>
}
