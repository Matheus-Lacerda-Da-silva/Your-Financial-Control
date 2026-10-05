import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'

function App() {
  return (
    <BrowserRouter>
      <Sidebar />

      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/categorias" element={<Categorias />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App