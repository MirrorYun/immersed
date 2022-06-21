import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    
  },
  build: {
    rollupOptions: {
      input: {
        app: './index.html',
        'service-worker': './sw.ts',
      },
      output: {
        entryFileNames: assetInfo => {
          if(assetInfo.name === 'service-worker') {
            return 'sw.js'
          }

          if(assetInfo.name === 'inject') {
            return 'inject.js'
          }

          return 'assets/[name].[hash].js'
        }
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    }
  },
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  }
})
