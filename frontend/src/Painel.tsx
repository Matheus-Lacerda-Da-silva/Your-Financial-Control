import { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react'
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
import { aplicarAcaoFinanceira, criarEstadoFinanceiro, reduzirEstadoFinanceiro, selecionarTransacoes, validarAlteracaoCategoria } from './utils/estadoFinanceiro'
import type { AcaoFinanceira } from './utils/estadoFinanceiro'
import { criarApiCategorias, ErroCategoriasApi } from './services/categoriasApi'
import type { OperacaoCategoria } from './services/categoriasApi'
import type { Categoria } from './types/categoria'
import { consultarIdentidade } from './services/identidadeApi'
import type { ResultadoIdentidade } from './services/identidadeApi'

type Props = {
  sessao: Session
  versaoToken: number
  auth: Pick<SupabaseClient['auth'], 'signOut'>
}

type SessaoCategorias = {
  chave: string
  controle: AbortController
  api: ReturnType<typeof criarApiCategorias>
  pronta: boolean
  leitura: number
}

type EstadoCargaCategorias = { chave: string; erro: string | null }
type GravacaoCategoria = {
  controle: AbortController
  alvo?: { id: string; tipo: Categoria['tipo'] | null }
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
  const [tentativaSaida, setTentativaSaida] = useState(0)
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
    setTentativaSaida(valor => valor + 1)
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
  const sessaoCategorias = useRef<SessaoCategorias | null>(null)
  const gravacao = useRef<GravacaoCategoria | null>(null)
  const vinculosIncertos = useRef(new Map<string, Categoria['tipo'] | null>())
  const chaveCategorias = `${versaoToken}:${tentativa}:${tentativaSaida}`
  const [cargaCategorias, setCargaCategorias] = useState<EstadoCargaCategorias>()
  const [gravandoCategoria, setGravandoCategoria] = useState(false)
  const carregandoCategorias = cargaCategorias?.chave !== chaveCategorias
  const erroCategorias = cargaCategorias?.chave === chaveCategorias ? cargaCategorias.erro : null
  const categoriasProntas = resultado === 'confirmada' && !carregandoCategorias && !erroCategorias && !saindo

  const carregarCategorias = useCallback(async (atual: SessaoCategorias) => {
    const leitura = ++atual.leitura
    const descartada = () => atual.controle.signal.aborted || leitura !== atual.leitura
    try {
      const categorias = await atual.api.listar()
      if (descartada()) return false
      dispatch({ tipo: 'categorias/carregar', categorias })
      for (const [id, tipo] of vinculosIncertos.current) {
        const categoria = categorias.find(c => c.id === id)
        if (!categoria || categoria.tipo === tipo) vinculosIncertos.current.delete(id)
      }
      atual.pronta = true
      setCargaCategorias({ chave: atual.chave, erro: null })
      return true
    } catch {
      if (!descartada()) {
        setCargaCategorias({ chave: atual.chave, erro: 'Não foi possível carregar as categorias. Tente novamente.' })
      }
      return false
    }
  }, [])

  useLayoutEffect(() => () => gravacao.current?.controle.abort(), [])

  useLayoutEffect(() => {
    if (resultado !== 'confirmada' || saindo) return
    const controle = new AbortController()
    const atual: SessaoCategorias = {
      chave: chaveCategorias,
      controle,
      api: criarApiCategorias(import.meta.env.VITE_API_URL, token, controle.signal),
      pronta: false,
      leitura: 0,
    }
    sessaoCategorias.current = atual
    queueMicrotask(() => {
      if (!controle.signal.aborted) void carregarCategorias(atual)
    })
    return () => {
      controle.abort()
      sessaoCategorias.current = null
    }
  }, [carregarCategorias, chaveCategorias, resultado, token, saindo])

  const recarregarCategorias = () => {
    const atual = sessaoCategorias.current
    if (!atual || gravacao.current || carregandoCategorias) return
    setCargaCategorias(undefined)
    void carregarCategorias(atual)
  }

  const gravarCategoria = async (operacao: OperacaoCategoria): Promise<string | null | undefined> => {
    const atual = sessaoCategorias.current
    if (!atual?.pronta || gravacao.current) return 'Aguarde a atualização das categorias.'
    const pendente: GravacaoCategoria = { controle: new AbortController() }
    try {
      if (operacao.metodo === 'DELETE') {
        validarAlteracaoCategoria(estado, operacao.id, null)
        pendente.alvo = { id: operacao.id, tipo: null }
      }
      if (operacao.metodo === 'PATCH') {
        validarAlteracaoCategoria(estado, operacao.id, operacao.campos.tipo)
        if (operacao.campos.tipo) pendente.alvo = { id: operacao.id, tipo: operacao.campos.tipo }
      }
    } catch (erro) {
      return erro instanceof Error ? erro.message : 'Não foi possível validar a categoria.'
    }

    if (pendente.alvo && vinculosIncertos.current.has(pendente.alvo.id)
      && vinculosIncertos.current.get(pendente.alvo.id) !== pendente.alvo.tipo) {
      return 'Confirme a operação anterior nesta categoria antes de alterar seu tipo ou excluí-la.'
    }
    gravacao.current = pendente
    setGravandoCategoria(true)
    const reconciliar = async () => {
      const vigente = sessaoCategorias.current
      if (!vigente) return false
      vigente.pronta = false
      setCargaCategorias(undefined)
      return carregarCategorias(vigente)
    }
    try {
      const api = criarApiCategorias(import.meta.env.VITE_API_URL, token, pendente.controle.signal)
      const categoria = await api.gravar(operacao)
      if (pendente.controle.signal.aborted) return
      if (pendente.alvo) vinculosIncertos.current.delete(pendente.alvo.id)
      if (atual.controle.signal.aborted) {
        await reconciliar()
        return
      }
      if (operacao.metodo === 'DELETE') {
        dispatch({ tipo: 'categoria/confirmarExclusao', id: operacao.id })
      } else if (categoria) {
        dispatch({ tipo: 'categoria/confirmar', categoria })
      }
      return null
    } catch (erro) {
      if (pendente.controle.signal.aborted) return
      if (erro instanceof ErroCategoriasApi && [400, 409].includes(erro.status)) {
        return atual.controle.signal.aborted ? undefined : erro.message
      }
      if (pendente.alvo && !(erro instanceof ErroCategoriasApi && [401, 404].includes(erro.status))) {
        vinculosIncertos.current.set(pendente.alvo.id, pendente.alvo.tipo)
      }
      const atualizada = await reconciliar()
      if (atual.controle.signal.aborted) return
      if (erro instanceof ErroCategoriasApi && erro.status === 404) return erro.message
      return atualizada
        ? 'Confira a lista atualizada antes de tentar novamente. A gravação pode ter sido concluída.'
        : 'Não foi possível confirmar a gravação. Recarregue as categorias antes de tentar novamente.'
    } finally {
      if (!pendente.controle.signal.aborted) {
        gravacao.current = null
        setGravandoCategoria(false)
      }
    }
  }

  // Pré-valida para manter formulários abertos em caso de recusa.
  // O reducer também valida a ação sobre o estado mais recente.
  const executarAcao = (acao: AcaoFinanceira): string | null => {
    try {
      if (acao.tipo === 'transacao' && acao.operacao.tipo !== 'excluir') {
        const atual = sessaoCategorias.current
        if (!atual?.pronta) return 'Aguarde o carregamento das categorias para vincular a transação.'
        const idCategoria = acao.operacao.transacao.categoriaId
        if (idCategoria === gravacao.current?.alvo?.id || vinculosIncertos.current.has(idCategoria)) {
          return 'Aguarde a operação pendente nesta categoria.'
        }
      }
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
              categoriasProntas={categoriasProntas}
              erroCategorias={erroCategorias}
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
          erroCarga={erroCategorias}
          carregando={carregandoCategorias || resultado !== 'confirmada'}
          pronta={categoriasProntas}
          gravando={gravandoCategoria}
          onRecarregar={recarregarCategorias}
          onGravar={gravarCategoria}
        />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
