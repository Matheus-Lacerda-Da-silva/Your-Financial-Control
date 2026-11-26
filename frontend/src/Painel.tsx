import { useLayoutEffect, useReducer, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Alert, Button, Stack } from '@mui/material'
import type { Session, SupabaseClient } from '@supabase/supabase-js'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'
import Metas from './pages/Metas'
import { aplicarAcaoMetas, criarEstadoMetas, reduzirMetas } from './utils/estadoMetas'
import type { AcaoMetas } from './utils/estadoMetas'

import type { TransacaoRegistrada } from './types/transacao'
import { aplicarAcaoFinanceira, criarEstadoFinanceiro, reduzirEstadoFinanceiro, selecionarTransacoes } from './utils/estadoFinanceiro'
import type { AcaoFinanceira } from './utils/estadoFinanceiro'
import { consultarIdentidade } from './services/identidadeApi'
import type { ResultadoIdentidade } from './services/identidadeApi'

type Props = {
  sessao: Session
  versaoToken: number
  auth: Pick<SupabaseClient['auth'], 'signOut'>
}

export default function Painel({ sessao, versaoToken, auth }: Props) {
  const { access_token: token, user: { id } } = sessao
  const [tentativa, setTentativa] = useState(0)
  const [validacao, setValidacao] = useState<{
    versaoToken: number
    tentativa: number
    resultado: ResultadoIdentidade
  }>()
  const [saindo, setSaindo] = useState(false)
  const [erroSaida, setErroSaida] = useState(false)
  const resultado = validacao?.versaoToken === versaoToken && validacao.tentativa === tentativa
    ? validacao.resultado
    : undefined
  // O painel é remontado por conta. Só uma confirmação anterior desta conta libera a revalidação em segundo plano.
  const mostrarConteudo = (resultado ?? validacao?.resultado) === 'confirmada'

  useLayoutEffect(() => {
    const controle = new AbortController()
    const limite = AbortSignal.any([controle.signal, AbortSignal.timeout(10_000)])
    void consultarIdentidade(import.meta.env.VITE_API_URL, { access_token: token, user: { id } }, limite)
      .then(resultado => {
        if (!controle.signal.aborted) setValidacao({ versaoToken, tentativa, resultado })
      })

    return () => controle.abort()
  }, [id, token, versaoToken, tentativa])

  const sair = async () => {
    if (saindo) return
    setSaindo(true)
    setErroSaida(false)
    try {
      const { error } = await auth.signOut({ scope: 'local' })
      setErroSaida(Boolean(error))
    } catch {
      setErroSaida(true)
    } finally {
      setSaindo(false)
    }
  }

  const aviso = <Stack spacing={2}>
    {erroSaida && <Alert severity="error">Não foi possível sair. Tente novamente.</Alert>}
    {!resultado && <Alert severity="info" role="status">Verificando sua sessão na API…</Alert>}
    {resultado === 'invalida' && <Alert severity="warning">
      A API não aceitou esta sessão. Saia e entre novamente.
    </Alert>}
    {resultado === 'indisponivel' && <Alert severity="warning" action={
      <Button color="inherit" onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</Button>
    }>
      A API está temporariamente indisponível. Sua sessão continua ativa.
    </Alert>}
  </Stack>

  const [estadoMetas, dispatchMetas] = useReducer(reduzirMetas, undefined, criarEstadoMetas)
  const executarAcaoMetas = (acao: AcaoMetas): string | null => {
    try {
      aplicarAcaoMetas(estadoMetas, acao)
      dispatchMetas(acao)
      return null
    } catch (erro) {
      return erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.'
    }
  }
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
    <Routes>
      <Route element={<LayoutPrincipal onSair={sair} saindo={saindo} aviso={aviso} mostrarConteudo={mostrarConteudo} />}>
        <Route path="/metas" element={<Metas estado={estadoMetas} onExecutar={executarAcaoMetas} />} />
        <Route
          path="/"
          element={<Inicio transacoes={transacoes} metas={estadoMetas.metas} aportes={estadoMetas.aportes} />}
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
