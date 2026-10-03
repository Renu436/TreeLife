import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TreePage from './pages/TreePage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-forest-dark">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tree/:id" element={<TreePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
