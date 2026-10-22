import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.imaforbes.com',
  integrations: [
    react(),
    tailwind()
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  }
});
