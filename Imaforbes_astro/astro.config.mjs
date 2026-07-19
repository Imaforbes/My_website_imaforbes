import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8888/My_website_imaforbes/api_db',
          changeOrigin: true,
          secure: false,
        },
        '/api_db_portfolio': {
          target: 'http://localhost:8888',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:8888/My_website_imaforbes/api_db',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
});
