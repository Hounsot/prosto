import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  base: process.env.GH_PAGES ? '/prosto/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        project1: '/project-1.html',
        project2: '/project-2.html',
        project3: '/project-3.html',
      },
    },
  },
})