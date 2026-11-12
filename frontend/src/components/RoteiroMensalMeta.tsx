import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { formatarMoeda } from '../utils/formatadores'
import { somarCentavos } from '../utils/dinheiro'
import { recomendacaoMeta } from '../utils/metas'

export default function RoteiroMensalMeta({ id, titulo, descricao, plano }: {
  id: string; titulo: string; descricao: string; plano: { mes: string; valorCentavos: number }[]
}) {
  return <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
    <AccordionSummary expandIcon={<ExpandMore />} id={`${id}-titulo`} aria-controls={`${id}-conteudo`}>
      <Box sx={{ minWidth: 0 }}><Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>{titulo}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{recomendacaoMeta(plano)}</Typography></Box>
    </AccordionSummary>
    <AccordionDetails id={`${id}-conteudo`}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{descricao}</Typography>
      {plano.length ? <>
        <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {plano.map(p => <Box component="li" key={p.mes} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, py: 1, borderBottom: 1, borderColor: 'divider' }}><Typography>{p.mes.slice(5)}/{p.mes.slice(0, 4)}</Typography><Typography sx={{ fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere', maxWidth: '100%' }}>{formatarMoeda(p.valorCentavos)}</Typography></Box>)}
        </Box>
        <Typography sx={{ mt: 2, fontWeight: 700, overflowWrap: 'anywhere' }}>{plano.length} meses · Total: {formatarMoeda(plano.reduce((s, p) => somarCentavos(s, p.valorCentavos), 0))}</Typography>
      </> : <Typography>Não há parcelas futuras: a meta foi concluída ou o prazo terminou.</Typography>}
    </AccordionDetails>
  </Accordion>
}
