import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SecurityModeProvider } from './context/SecurityModeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SecurityModeProvider>
      <App />
    </SecurityModeProvider>
  </StrictMode>,
)
