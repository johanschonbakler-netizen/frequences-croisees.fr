import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../dist/client/sitemap-index.xml', import.meta.url), 'utf8');

test('la page d’accueil contient le contenu et les métadonnées essentiels', () => {
  assert.match(html, /<title>Fréquences Croisées/);
  assert.match(html, /Un lieu de rencontre/);
  assert.match(html, /musiciens\./);
  assert.match(html, /<link rel="canonical" href="https:\/\/frequences-croisees\.fr\//);
  assert.match(html, /application\/ld\+json/);
});

test('le sitemap publie l’URL canonique', () => {
  assert.match(sitemap, /https:\/\/frequences-croisees\.fr\/sitemap-0\.xml/);
});
