import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nonaca.com.br',
  output: 'hybrid',
  adapter: cloudflare({
    runtime: { mode: 'off' },
  }),
  integrations: [react(), tailwind(), sitemap()],
  vite: {
    ssr: {
      external: ['node:fs', 'fs', 'node:path', 'path', 'node:os', 'os', 'node:crypto', 'crypto'],
    },
  },
});