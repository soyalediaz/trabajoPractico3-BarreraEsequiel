import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './Auth.jsx'
import './index.css'


import { App } from './App.jsx'
import { Login } from './Login.jsx'
import { Registro } from './Registro.jsx'
import { Layout } from './Layout.jsx'
import { Alumnos } from './Alumnos.jsx'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/alumnos" element={<Alumnos />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
