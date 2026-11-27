import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { createServer } from 'vite'

test('renovação preserva rascunhos, isola categorias e reconcilia gravações incertas', { timeout: 60_000 }, async () => {
  const chrome = process.env.YFC_CHROME_PATH ?? (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : 'google-chrome')
  const temporarios = resolve(tmpdir())
  const perfil = await mkdtemp(join(temporarios, 'yfc-renovacao-'))
  let navegador
  let servidor
  let limite

  try {
    const resultado = Promise.withResolvers()
    servidor = await createServer({
      envDir: false,
      cacheDir: 'node_modules/.vite-renovacao',
      define: { 'import.meta.env.VITE_API_URL': JSON.stringify('https://api.example') },
      server: { host: '127.0.0.1', port: 0 },
      plugins: [{
        name: 'resultado-renovacao',
        configureServer(vite) {
          vite.middlewares.use('/__resultado-renovacao', async (req, res) => {
            let mensagem = ''
            for await (const trecho of req) mensagem += trecho
            res.statusCode = 204
            res.end()
            resultado.resolve(mensagem)
          })
        },
      }],
    })
    await servidor.listen()
    const { port } = servidor.httpServer.address()
    navegador = spawn(chrome, [
      '--headless', '--disable-gpu', '--no-first-run', '--window-size=1280,900',
      `--user-data-dir=${perfil}`,
      `http://127.0.0.1:${port}/tests/renovacao.browser.html`,
    ], { stdio: 'ignore', windowsHide: true })
    navegador.once('error', resultado.reject)
    navegador.once('exit', codigo => resultado.reject(new Error(`Chrome encerrou com código ${codigo}.`)))
    limite = setTimeout(() => resultado.reject(new Error('O navegador não retornou o resultado do teste.')), 40_000)
    assert.equal(await resultado.promise, 'ok')
  } finally {
    clearTimeout(limite)
    navegador?.kill()
    await servidor?.close()
    if (dirname(perfil) === temporarios) {
      await rm(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    }
  }
})
