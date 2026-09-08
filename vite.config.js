import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { APP_NAME } from './src/config/brand.js'
import { commerceDevPlugin } from './server/vite-commerce.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react(), commerceDevPlugin(env), { name: 'app-brand', transformIndexHtml: html => html.replaceAll('__APP_NAME__', APP_NAME.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')) }],
    define: {
      'import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY': JSON.stringify(env.MERCADOPAGO_PUBLIC_KEY || ''),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || (env.SUPABASE_PROJECT_ID ? `https://${env.SUPABASE_PROJECT_ID}.supabase.co` : '')),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || ''),
    },
  }
})
