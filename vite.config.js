import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite configuration – https://vite.dev/config/
// react() enables JSX and fast refresh while developing.
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // open the browser automatically on `npm run dev`
  },
})
