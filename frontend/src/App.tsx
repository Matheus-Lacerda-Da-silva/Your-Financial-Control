import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import Inicio from './pages/Inicio'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPrincipal />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/categorias" element={<Categorias />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App