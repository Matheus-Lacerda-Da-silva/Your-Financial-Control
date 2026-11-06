import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TemaProvider from './theme/TemaProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider><App /></TemaProvider>
  </StrictMode>,
)
