import { createRoot } from 'react-dom/client'
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      <Route path='/*' element={<App />}/>
    </Routes>
  </Router>
)
