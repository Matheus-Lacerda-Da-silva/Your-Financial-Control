import { Alert } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LayoutAcesso from './layouts/LayoutAcesso'
import Acesso from './pages/Acesso'
import Cadastro from './pages/Cadastro'
import Painel from './Painel'
import { useSessao } from './hooks/useSessao'
import { supabase } from './services/supabase'

export default function App() {
  const { sessao, versaoConta, versaoToken } = useSessao()

  if (!supabase) {
    return <LayoutAcesso><Alert severity="error">O serviço de acesso precisa ser configurado.</Alert></LayoutAcesso>
  }

  if (sessao === undefined) {
    return <LayoutAcesso><Alert severity="info" role="status">Carregando sua sessão…</Alert></LayoutAcesso>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/acesso" element={sessao ? <Navigate to="/" replace /> : <Acesso auth={supabase.auth} />} />
        <Route path="/cadastro" element={sessao ? <Navigate to="/" replace /> : <Cadastro auth={supabase.auth} />} />
        <Route path="*" element={sessao
          ? <Painel key={versaoConta} sessao={sessao} versaoToken={versaoToken} auth={supabase.auth} />
          : <Navigate to="/acesso" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
