import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './Auth.jsx'


import { App } from './App.jsx'
import { Login } from './Login.jsx'
import { Registro } from './Registro.jsx'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>

      </BrowserRouter>  
      </AuthProvider>
  </StrictMode>
)
