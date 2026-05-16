import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' // c 18 версии реакта для рендеринга
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
