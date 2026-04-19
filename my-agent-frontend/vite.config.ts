import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, 'environment'), 'VITE_')

  return {
    plugins: [react()],
    envDir: 'environment',
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: mode === 'production' ? '[hash:base64:6]' : '[name]__[local]__[hash:base64:4]',
      },
      preprocessorOptions: {
        scss: {
          loadPaths: [path.resolve(__dirname, 'src/styles')],
        },
      },
    },
    server: {
      port: 5173,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            apollo: ['@apollo/client', 'graphql'],
          },
        },
      },
    },
  }
})
