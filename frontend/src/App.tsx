import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'
import Acesso from './pages/Acesso'
import Cadastro from './pages/Cadastro'

import type { Transacao } from './types/transacao'


function App() {
  const [sessaoDemo, setSessaoDemo] = useState(false)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])

  const cadastrarTransacao = (
    novaTransacao: Omit<Transacao, 'id'>,
  ) => {
    const transacaoComId: Transacao = {
      ...novaTransacao,
      id: Date.now(),
    }

    setTransacoes((transacoesAtuais) => [
      transacaoComId,
      ...transacoesAtuais,
    ])
  }

  const excluirTransacao = (id: number) => {
    setTransacoes((transacoesAtuais) =>
      transacoesAtuais.filter((transacao) => transacao.id !== id),
    )
  }

  const editarTransacao = (transacaoEditada: Transacao) => {
    setTransacoes((transacoesAtuais) =>
      transacoesAtuais.map((transacao) =>
        transacao.id === transacaoEditada.id ? transacaoEditada : transacao,
      ),
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/acesso" element={sessaoDemo ? <Navigate to="/" replace /> : <Acesso onEntrar={() => setSessaoDemo(true)} />} />
        <Route path="/cadastro" element={sessaoDemo ? <Navigate to="/" replace /> : <Cadastro />} />
        <Route element={sessaoDemo ? <LayoutPrincipal onSair={() => {
          setSessaoDemo(false)
          setTransacoes([])
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
