import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initStatusBar, hideSplash, initAppListeners } from './native.js'

// Boot native plugins before rendering
initStatusBar();
initAppListeners({ onBack: () => {} });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Hide splash screen once React has painted
setTimeout(hideSplash, 300);
