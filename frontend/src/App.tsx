import { useReducer, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'
import Acesso from './pages/Acesso'
import Cadastro from './pages/Cadastro'

import type { Transacao } from './types/transacao'
import { reduzirTransacoes } from './utils/transacoes'


function App() {
  const [sessaoDemo, setSessaoDemo] = useState(false)
  const [{ transacoes, erro }, dispatch] = useReducer(reduzirTransacoes, { transacoes: [], erro: null })

  const cadastrarTransacao = (
    novaTransacao: Omit<Transacao, 'id'>,
  ) => {
    const transacaoComId: Transacao = {
      ...novaTransacao,
      id: Date.now(),
    }

    dispatch({ tipo: 'cadastrar', transacao: transacaoComId })
  }

  const excluirTransacao = (id: number) => {
    dispatch({ tipo: 'excluir', id })
  }

  const editarTransacao = (transacaoEditada: Transacao) => {
    dispatch({ tipo: 'editar', transacao: transacaoEditada })
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/acesso" element={sessaoDemo ? <Navigate to="/" replace /> : <Acesso onEntrar={() => setSessaoDemo(true)} />} />
        <Route path="/cadastro" element={sessaoDemo ? <Navigate to="/" replace /> : <Cadastro />} />
        <Route element={sessaoDemo ? <LayoutPrincipal onSair={() => {
          setSessaoDemo(false)
          dispatch({ tipo: 'limpar' })
        }} /> : <Navigate to="/acesso" replace />}>
          <Route
            path="/"
            element={<Inicio transacoes={transacoes} />}
          />


          <Route
            path="/transacoes"
            element={
              <Transacoes
                transacoes={transacoes}
                erroFinanceiro={erro}
                onLimparErro={() => dispatch({ tipo: 'limparErro' })}
                onCadastrarTransacao={cadastrarTransacao}
                onExcluirTransacao={excluirTransacao}
                onEditarTransacao={editarTransacao}
              />
            }
          />


          <Route path="/categorias" element={<Categorias />} />
        </Route>
        <Route path="*" element={<Navigate to={sessaoDemo ? '/' : '/acesso'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
