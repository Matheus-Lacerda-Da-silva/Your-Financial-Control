import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'

import type { Transacao } from './types/transacao'


function App() {
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
        <Route element={<LayoutPrincipal />}>
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
