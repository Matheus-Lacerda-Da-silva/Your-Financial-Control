import { useReducer, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'
import Acesso from './pages/Acesso'
import Cadastro from './pages/Cadastro'

import type { TransacaoRegistrada } from './types/transacao'
import { aplicarAcaoFinanceira, criarEstadoFinanceiro, reduzirEstadoFinanceiro, selecionarTransacoes } from './utils/estadoFinanceiro'
import type { AcaoFinanceira } from './utils/estadoFinanceiro'


function App() {
  const [sessaoDemo, setSessaoDemo] = useState(false)
  const [estado, dispatch] = useReducer(reduzirEstadoFinanceiro, undefined, criarEstadoFinanceiro)
  const transacoes = selecionarTransacoes(estado)

  // Pré-valida para manter formulários abertos em caso de recusa.
  // O reducer também valida a ação sobre o estado mais recente.
  const executarAcao = (acao: AcaoFinanceira): string | null => {
    try {
      aplicarAcaoFinanceira(estado, acao)
      dispatch(acao)
      return null
    } catch (erro) {
      return erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.'
    }
  }

  const cadastrarTransacao = (
    novaTransacao: Omit<TransacaoRegistrada, 'id'>,
  ) => {
    const transacaoComId: TransacaoRegistrada = {
      ...novaTransacao,
      id: Date.now(),
    }

    return executarAcao({ tipo: 'transacao', operacao: { tipo: 'cadastrar', transacao: transacaoComId } })
  }

  const excluirTransacao = (id: number) => {
    return executarAcao({ tipo: 'transacao', operacao: { tipo: 'excluir', id } })
  }

  const editarTransacao = (transacaoEditada: TransacaoRegistrada) => {
    return executarAcao({ tipo: 'transacao', operacao: { tipo: 'editar', transacao: transacaoEditada } })
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
                categorias={estado.categorias}
                erroFinanceiro={estado.erro}
                onLimparErro={() => dispatch({ tipo: 'limparErro' })}
                onCadastrarTransacao={cadastrarTransacao}
                onExcluirTransacao={excluirTransacao}
                onEditarTransacao={editarTransacao}
              />
            }
          />


          <Route path="/categorias" element={<Categorias
            categorias={estado.categorias}
            transacoes={estado.transacoes}
            erro={estado.erro}
            onLimparErro={() => dispatch({ tipo: 'limparErro' })}
            onCadastrar={categoria => executarAcao({ tipo: 'categoria/cadastrar', categoria })}
            onEditar={categoria => executarAcao({ tipo: 'categoria/editar', categoria })}
            onExcluir={id => executarAcao({ tipo: 'categoria/excluir', id })}
          />} />
        </Route>
        <Route path="*" element={<Navigate to={sessaoDemo ? '/' : '/acesso'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
