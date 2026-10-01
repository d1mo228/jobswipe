import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initTelegram } from './integrations/telegram/telegram'
import './index.css'

// Если приложение открыто в Telegram — сообщаем ему, что UI готов, и разворачиваем окно.
initTelegram()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
