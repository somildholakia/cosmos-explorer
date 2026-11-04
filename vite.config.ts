import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three') || id.includes('three-stdlib')) return 'three-scene'
          if (id.includes('node_modules/lucide-react')) return 'icons'
        }
      }
    }
  }
})