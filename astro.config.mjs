import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://frequences-croisees.fr',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
  trailingSlash: 'always',
  vite: {
    server: {
      allowedHosts: ['frequences-croisees.dev.jschonbakler.fr']
    }
  }
});
