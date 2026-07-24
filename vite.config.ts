import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      // Prevent Vite from watching backend build artifacts (avoids EBUSY errors on Windows)
      ignored: [
        '**/TradeHub.API/**',
        '**/obj/**',
        '**/bin/**',
      ],
    },
  },
})

