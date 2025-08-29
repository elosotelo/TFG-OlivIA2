import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // usa vue() si es Vue

export default defineConfig({
  plugins: [react()],
  base: '/TFG-OlivIA2/'   // <-- ruta del repo
})
