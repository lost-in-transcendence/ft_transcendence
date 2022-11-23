import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {env} from 'process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: env.VITE_FRONT_PORT }
})
