import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { sanitizeStoredProducts } from './utils/productStorage'

// ── Boot-time localStorage sanitizer ─────────────────────────────────────────
// Runs synchronously before React renders so corrupted / offensive products
// injected via DevTools are permanently removed from every storage key.
sanitizeStoredProducts();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
