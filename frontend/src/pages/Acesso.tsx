import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import LayoutAcesso from '../layouts/LayoutAcesso'
import CampoSenha from '../components/CampoSenha'
import { validarEmail } from '../utils/validacaoAcesso'

export default function Acesso({ onEntrar }: { onEntrar: () => void }) {
  const location = useLocation()
  const origem = location.state as { email?: string; cadastroValidado?: boolean } | null
  const [email, setEmail] = useState(origem?.email ?? '')
  const [senha, setSenha] = useState('')
  const [enviado, setEnviado] = useState(false)

  const entrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviado(true)
    if (!validarEmail(email) || !senha.trim()) return
    setSenha('')
    onEntrar()
  }

  return <LayoutAcesso>
    <Typography variant="overline" color="primary.main">BEM-VINDO AO YFC</Typography>
    <Typography variant="h4" component="h1" sx={{ mt: 1 }}>Seu próximo passo começa aqui</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Entre para acompanhar seu controle financeiro.</Typography>
    <Stack spacing={2}>
      {origem?.cadastroValidado && <Alert severity="success">Cadastro demonstrativo validado. Nenhuma conta foi criada. Preencha os campos para explorar o painel.</Alert>}
      <Alert severity="info">Modo demonstração: use um e-mail válido e uma senha fictícia para entrar. Não há autenticação real e sua senha não será salva.</Alert>
      <Box component="form" onSubmit={entrar} noValidate>
        <Stack spacing={2.5}>
          <TextField id="email-acesso" name="email" label="E-mail" type="email" value={email} onChange={evento => setEmail(evento.target.value)} autoComplete="email" autoCapitalize="none" required fullWidth error={enviado && !validarEmail(email)} helperText={enviado && !validarEmail(email) ? 'Informe um e-mail válido.' : undefined} />
          <CampoSenha id="senha-acesso" value={senha} onChange={setSenha} autoComplete="current-password" error={enviado && !senha.trim()} helperText={enviado && !senha.trim() ? 'Informe uma senha fictícia.' : undefined} />
          <Button type="submit" variant="contained" size="large" fullWidth>Entrar na demonstração</Button>
        </Stack>
      </Box>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>Ainda não tem cadastro? <Link component={RouterLink} to="/cadastro" sx={{ fontWeight: 700 }}>Criar cadastro</Link></Typography>
    </Stack>
  </LayoutAcesso>
}
