import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LayoutAcesso from '../layouts/LayoutAcesso'
import CampoSenha from '../components/CampoSenha'
import { validarEmail } from '../utils/validacaoAcesso'

export default function Acesso({ auth }: { auth: Pick<SupabaseClient['auth'], 'signInWithPassword'> }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mensagemErro, setMensagemErro] = useState('')

  const entrar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (carregando) return
    setEnviado(true)
    setMensagemErro('')
    if (!validarEmail(email) || !senha.trim()) return
    setCarregando(true)
    try {
      const { error } = await auth.signInWithPassword({ email: email.trim(), password: senha })
      if (error?.code === 'email_not_confirmed') {
        setMensagemErro('Confirme seu e-mail antes de entrar.')
      } else if (error?.code === 'invalid_credentials') {
        setMensagemErro('E-mail ou senha incorretos.')
      } else if (error) {
        setMensagemErro('Não foi possível entrar agora. Tente novamente.')
      } else {
        setSenha('')
      }
    } catch {
      setMensagemErro('Não foi possível entrar agora. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return <LayoutAcesso>
    <Typography variant="overline" color="primary.main">BEM-VINDO AO YFC</Typography>
    <Typography variant="h4" component="h1" sx={{ mt: 1 }}>Seu próximo passo começa aqui</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Entre para acompanhar seu controle financeiro.</Typography>
    <Stack spacing={2}>
      {mensagemErro && <Alert severity="error">{mensagemErro}</Alert>}
      <Box component="form" onSubmit={entrar} aria-busy={carregando} noValidate>
        <Stack spacing={2.5}>
          <TextField id="email-acesso" name="email" label="E-mail" type="email" value={email} onChange={evento => setEmail(evento.target.value)} autoComplete="email" autoCapitalize="none" required fullWidth error={enviado && !validarEmail(email)} helperText={enviado && !validarEmail(email) ? 'Informe um e-mail válido.' : undefined} />
          <CampoSenha id="senha-acesso" value={senha} onChange={setSenha} autoComplete="current-password" error={enviado && !senha.trim()} helperText={enviado && !senha.trim() ? 'Informe sua senha.' : undefined} />
          <Button type="submit" variant="contained" size="large" fullWidth loading={carregando}>Entrar</Button>
        </Stack>
      </Box>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>Ainda não tem cadastro? <Link component={RouterLink} to="/cadastro" sx={{ fontWeight: 700 }}>Criar cadastro</Link></Typography>
    </Stack>
  </LayoutAcesso>
}
