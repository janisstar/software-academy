import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Куда dev-сервер переправляет запросы к API. */
const BACKEND_URL = 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Свой порт, чтобы не драться за 5173 с другими проектами.
    // Если он занят, Vite возьмёт следующий — и это НЕ сломает API:
    // благодаря прокси ниже браузер всегда ходит на свой же origin.
    port: 5153,
    proxy: {
      // Всё, что начинается с /api, уходит на бэкенд руками Vite.
      // Для браузера это запрос на тот же адрес, что и страница, поэтому
      // никакого CORS в разработке нет — и httpOnly-cookie сессии
      // ходит как обычная same-origin cookie.
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
})
