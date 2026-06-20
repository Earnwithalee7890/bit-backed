import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@stacks')) {
              return 'vendor-stacks';
            }
            if (id.includes('@walletconnect') || id.includes('@web3modal') || id.includes('reown') || id.includes('ox_esm')) {
              return 'vendor-walletconnect';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
})
