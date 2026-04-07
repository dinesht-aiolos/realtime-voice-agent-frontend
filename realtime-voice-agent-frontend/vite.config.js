import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: { host: true, // allows external access
    allowedHosts: [ "pseudosocial-nasofrontal-eldora.ngrok-free.dev" ]
  },
  // No proxy needed — server.py allows all origins already
})