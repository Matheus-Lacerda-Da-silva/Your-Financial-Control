import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LayoutAcesso from '../layouts/LayoutAcesso'
import CampoSenha from '../components/CampoSenha'
import { validarCadastro } from '../utils/validacaoAcesso'

export default function Cadastro({ auth }: { auth: Pick<SupabaseClient['auth'], 'signUp'> }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false)
  const [mensagemErro, setMensagemErro] = useState('')
  const erros = validarCadastro(nome, email, senha, confirmacao)

  const cadastrar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (carregando) return
    setEnviado(true)
    setMensagemErro('')
    setAguardandoConfirmacao(false)
    if (Object.values(erros).some(Boolean)) return
    setCarregando(true)
    try {
      const { data, error } = await auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: { nome: nome.trim() },
          emailRedirectTo: new URL('/acesso', window.location.origin).href,
        },
      })
      if (error?.code === 'weak_password') {
        setMensagemErro('A senha não atende aos requisitos do serviço. Escolha uma senha mais forte.')
      } else if (error) {
        setMensagemErro('Não foi possível concluir o cadastro. Confira os dados e tente novamente.')
      } else {
        setEnviado(false)
        setSenha('')
        setConfirmacao('')
        setAguardandoConfirmacao(!data.session)
      }
    } catch {
      setMensagemErro('Não foi possível concluir o cadastro agora. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return <LayoutAcesso>
    <Typography variant="overline" color="primary.main">COMECE SUA JORNADA</Typography>
    <Typography variant="h4" component="h1" sx={{ mt: 1 }}>Mais organização para os seus planos</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Preencha seus dados para criar sua conta.</Typography>
    <Stack spacing={2}>
      {mensagemErro && <Alert severity="error">{mensagemErro}</Alert>}
      {aguardandoConfirmacao && <Alert severity="success">Solicitação de cadastro recebida. Confira seu e-mail para confirmar a conta antes de entrar.</Alert>}
      <Box component="form" onSubmit={cadastrar} aria-busy={carregando} noValidate>
        <Stack spacing={2.5}>
          <TextField id="nome-cadastro" name="name" label="Seu nome" value={nome} onChange={evento => setNome(evento.target.value)} autoComplete="name" required fullWidth error={enviado && !!erros.nome} helperText={enviado ? erros.nome : undefined} />
          <TextField id="email-cadastro" name="email" label="E-mail" type="email" value={email} onChange={evento => setEmail(evento.target.value)} autoComplete="email" autoCapitalize="none" required fullWidth error={enviado && !!erros.email} helperText={enviado ? erros.email : undefined} />
          <CampoSenha id="senha-cadastro" value={senha} onChange={setSenha} autoComplete="new-password" error={enviado && !!erros.senha} helperText={enviado && erros.senha ? erros.senha : 'Use pelo menos 8 caracteres.'} />
          <CampoSenha id="confirmacao-senha" label="Confirme a senha" value={confirmacao} onChange={setConfirmacao} autoComplete="new-password" error={enviado && !!erros.confirmacao} helperText={enviado ? erros.confirmacao : undefined} />
          <Button type="submit" variant="contained" size="large" fullWidth loading={carregando}>Criar conta</Button>
        </Stack>
      </Box>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>Já tem cadastro? <Link component={RouterLink} to="/acesso" sx={{ fontWeight: 700 }}>Ir para acesso</Link></Typography>
    </Stack>
  </LayoutAcesso>
}
