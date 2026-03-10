import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'; // Importa el Router aquí
import { SettingsProvider } from './contexts/SettingsContext.jsx'
import App from './App.jsx'
import './index.css'
import './i18n'; // Asegúrate de que la configuración de i18n esté aquí
import './utils/consoleCleanup.js'; // Suppress WebSocket and other console noise

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* El Router envuelve a toda la aplicación App una sola vez */}
    <Router>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </Router>
  </React.StrictMode>,
)