import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import LayoutAcesso from '../layouts/LayoutAcesso'
import CampoSenha from '../components/CampoSenha'
import { validarCadastro } from '../utils/validacaoAcesso'

export default function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviado, setEnviado] = useState(false)
  const erros = validarCadastro(nome, email, senha, confirmacao)

  const cadastrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviado(true)
    if (Object.values(erros).some(Boolean)) return
    setSenha('')
    setConfirmacao('')
    navigate('/acesso', { replace: true, state: { email: email.trim(), cadastroValidado: true } })
  }

  return <LayoutAcesso>
    <Typography variant="overline" color="primary.main">COMECE SUA JORNADA</Typography>
    <Typography variant="h4" component="h1" sx={{ mt: 1 }}>Mais organização para os seus planos</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Preencha seus dados para conhecer o fluxo de cadastro.</Typography>
    <Stack spacing={2}>
      <Alert severity="info">Este cadastro é demonstrativo. Nenhuma conta será criada e os dados não serão salvos. Use uma senha fictícia.</Alert>
      <Box component="form" onSubmit={cadastrar} noValidate>
        <Stack spacing={2.5}>
          <TextField id="nome-cadastro" name="name" label="Seu nome" value={nome} onChange={evento => setNome(evento.target.value)} autoComplete="name" required fullWidth error={enviado && !!erros.nome} helperText={enviado ? erros.nome : undefined} />
          <TextField id="email-cadastro" name="email" label="E-mail" type="email" value={email} onChange={evento => setEmail(evento.target.value)} autoComplete="email" autoCapitalize="none" required fullWidth error={enviado && !!erros.email} helperText={enviado ? erros.email : undefined} />
          <CampoSenha id="senha-cadastro" value={senha} onChange={setSenha} autoComplete="new-password" error={enviado && !!erros.senha} helperText={enviado && erros.senha ? erros.senha : 'Use pelo menos 8 caracteres.'} />
          <CampoSenha id="confirmacao-senha" label="Confirme a senha" value={confirmacao} onChange={setConfirmacao} autoComplete="new-password" error={enviado && !!erros.confirmacao} helperText={enviado ? erros.confirmacao : undefined} />
          <Button type="submit" variant="contained" size="large" fullWidth>Validar cadastro demonstrativo</Button>
        </Stack>
      </Box>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>Já tem cadastro? <Link component={RouterLink} to="/acesso" sx={{ fontWeight: 700 }}>Ir para acesso</Link></Typography>
    </Stack>
  </LayoutAcesso>
}
