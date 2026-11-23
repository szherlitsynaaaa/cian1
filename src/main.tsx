import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import MapPage from './MapPage'
import './styles.css'

const Page = window.location.pathname === '/map' ? MapPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
