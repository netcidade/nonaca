import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nonaca.com.br',
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    ssr: {
      external: ['node:fs', 'fs', 'node:path', 'path', 'node:os', 'os', 'node:crypto', 'crypto'],
    },
  },
});