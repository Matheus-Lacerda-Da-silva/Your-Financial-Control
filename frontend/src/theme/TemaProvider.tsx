import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'

type TokensVidro = {
  superficie: string
  opaca: string
  borda: string
  blur: string
  sombra: string
  fundoDashboard: string
  destaque: string
}

declare module '@mui/material/styles' {
  interface Theme { glass: TokensVidro }
  interface ThemeOptions { glass?: TokensVidro }
}

export default function TemaProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<'light' | 'dark'>(() => {
    try {
      const salvo = localStorage.getItem('yfc-tema')
      if (salvo === 'light' || salvo === 'dark') return salvo
    } catch { /* Armazenamento opcional. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const tema = useMemo(() => createTheme({
    glass: {
      superficie: modo === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(31,33,37,0.90)',
      opaca: modo === 'light' ? '#ffffff' : '#1f2125',
      borda: modo === 'light' ? 'rgba(24,24,27,0.12)' : 'rgba(255,255,255,0.14)',
      blur: '8px',
      sombra: modo === 'light' ? '0 8px 24px rgba(24,24,27,0.06)' : '0 8px 24px rgba(0,0,0,0.20)',
      fundoDashboard: modo === 'light'
        ? 'radial-gradient(ellipse at top left, #dceee7, #f4f4f5 70%)'
        : 'radial-gradient(ellipse at top left, #20372f, #18181b 70%)',
      destaque: modo === 'light' ? '#087f68' : '#65dbc0',
    },
    palette: {
      mode: modo,
      primary: { main: modo === 'light' ? '#087f68' : '#65dbc0' },
      background: { default: modo === 'light' ? '#f4f7f8' : '#10191e', paper: modo === 'light' ? '#ffffff' : '#19262d' },
      text: { primary: modo === 'light' ? '#172d36' : '#edf5f6', secondary: modo === 'light' ? '#596f79' : '#adc0c8' },
      success: { main: modo === 'light' ? '#087f68' : '#65dbc0' },
      error: { main: modo === 'light' ? '#c43d55' : '#ff91a3' },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      h4: { fontWeight: 750, fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', letterSpacing: '-0.04em' },
      h5: { fontWeight: 700 }, h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 650 },
    },
    components: {
      MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid', borderColor: modo === 'light' ? '#e1e9ec' : '#2c3d46' } } },
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, padding: '10px 18px' } } },
      MuiCardContent: { styleOverrides: { root: { padding: 24 } } },
      MuiTableCell: { styleOverrides: { head: { fontWeight: 700, whiteSpace: 'nowrap' } } },
    },
  }), [modo])
  return <ThemeProvider theme={tema}>
    <CssBaseline />
    <button className="alternar-tema" aria-label={`Ativar tema ${modo === 'light' ? 'escuro' : 'claro'}`} onClick={() => {
      const proximo = modo === 'light' ? 'dark' : 'light'
      setModo(proximo)
      try { localStorage.setItem('yfc-tema', proximo) } catch { /* Armazenamento opcional. */ }
    }}>{modo === 'light' ? '☾' : '☀'}<span>Tema {modo === 'light' ? 'escuro' : 'claro'}</span></button>
    {children}
  </ThemeProvider>
}
