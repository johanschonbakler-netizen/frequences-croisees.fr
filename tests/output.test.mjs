import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../dist/client/sitemap-index.xml', import.meta.url), 'utf8');
const pagesSitemap = await readFile(new URL('../dist/client/sitemap-0.xml', import.meta.url), 'utf8');
const legal = await readFile(new URL('../dist/client/mentions-legales-confidentialite/index.html', import.meta.url), 'utf8');
const stylesheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => match[1]);
const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]);
const css = [...await Promise.all(stylesheets.map((href) => readFile(new URL(`../dist/client${href}`, import.meta.url), 'utf8'))), ...inlineStyles].join('\n');

test('la page d’accueil contient le contenu et les métadonnées essentiels', () => {
  assert.match(html, /<title>Fréquences Croisées/);
  assert.match(html, /Un lieu de rencontre/);
  assert.match(html, /musiciens\./);
  assert.match(html, /<span class="hero-title-intro">Un lieu de rencontre<br\s*\/?>pour les<\/span>/);
  assert.match(html, /<span class="hero-title-accent">musiciens\.<\/span>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/frequences-croisees\.fr\//);
  assert.match(html, /application\/ld\+json/);
});

test('le sitemap publie l’URL canonique', () => {
  assert.match(sitemap, /https:\/\/frequences-croisees\.fr\/sitemap-0\.xml/);
  assert.match(pagesSitemap, /https:\/\/frequences-croisees\.fr\/mentions-legales-confidentialite\//);
});

test('la navigation et les contenus éditoriaux sont à jour', () => {
  assert.match(html, /href="#rencontres">Les sessions croisées hebdos<\/a>/);
  assert.match(html, /href="#village">Évènements<\/a>/);
  assert.match(html, /href="#participer">Rejoignez-nous<\/a>/);
  assert.match(html, /Précy-sur-Oise et alentours\./);
  assert.match(html, /faire vivre la musique localement\./);
  assert.match(html, /<p class="eyebrow">Des rencontres pour jouer vraiment\.<\/p>/);
  assert.match(html, /<h2 id="meetings-title">Les sessions <em>croisées<\/em> hebdomadaires<\/h2>/);
  assert.match(html, /Faire vivre la musique<br\s*\/?>localement\./);
  assert.match(html, /Participer aux manifestations communales \(fête de la musique, fête communale, brocante, etc\.\)\./);
  assert.doesNotMatch(html, /section-number|activity-index|Le projet est en cours de création|Suivre le projet/);
});

test('les sessions affichent leur lieu, leurs horaires et quatre icônes SVG', () => {
  assert.match(html, /Château des Érables/);
  assert.match(html, /Mardi soir/);
  assert.match(html, /Samedi après-midi/);
  for (const time of ['19:00', '21:00', '15:00', '17:00']) {
    assert.ok(html.includes(`datetime="${time}"`));
  }
  assert.equal((html.match(/class="activity-icon" aria-hidden="true"><svg/g) ?? []).length, 4);
});

test('les deux contacts sont directement utilisables', () => {
  assert.match(html, /<h2 id="join-title">Rejoignez-nous\.<\/h2>/);
  assert.match(html, /Entrez simplement en contact avec nous et on vous explique tout\./);
  assert.match(html, /href="mailto:contact@frequences-croisees\.fr"/);
  const contact = html.match(/<div class="contact-actions">[\s\S]*?<\/div>/)?.[0];
  assert.ok(contact);
  assert.equal((contact.match(/class="contact-icon" aria-hidden="true"><svg/g) ?? []).length, 2);
  assert.match(contact, /href="mailto:contact@frequences-croisees\.fr"/);
  assert.match(contact, /href="tel:\+33678155326"/);
  assert.match(contact, /<span class="contact-label">contact@frequences-croisees\.fr<\/span>/);
  assert.match(contact, /<span class="contact-label">06 78 15 53 26<\/span>/);
});

test('les informations pratiques demandent de faire valider sa venue', () => {
  const sessions = html.match(/<section class="meetings"[\s\S]*?<\/section>/)?.[0];
  assert.ok(sessions);
  assert.match(sessions, /<h3 class="session-label">Où \?<\/h3>/);
  assert.match(sessions, /<h3 class="session-label">Quand \?<\/h3>/);
  const notice = sessions.match(/<aside class="session-notice"[\s\S]*?<\/aside>/)?.[0];
  assert.ok(notice);
  assert.match(notice, /class="notice-icon" aria-hidden="true"><svg/);
  assert.match(notice, /Avant de venir, faites valider votre participation\./);
  assert.match(notice, /href="#participer">Contactez-nous<\/a> et attendez notre confirmation avant chaque session\./);
  assert.match(notice, /limiter le nombre de participants/);
});

test('le pied de page rappelle les deux contacts cliquables sur chaque page', () => {
  for (const page of [html, legal]) {
    const footer = page.match(/<footer>[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer);
    assert.match(footer, /href="mailto:contact@frequences-croisees\.fr">contact@frequences-croisees\.fr<\/a>/);
    assert.match(footer, /href="tel:\+33678155326">06 78 15 53 26<\/a>/);
  }
});

test('la page légale est liée uniquement depuis le pied de page et préserve la navigation', () => {
  for (const page of [html, legal]) {
    const link = 'href="/mentions-legales-confidentialite/"';
    const footer = page.match(/<footer>[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer?.includes(link));
    assert.equal(page.split(link).length - 1, 1);
  }
  assert.match(legal, /<link rel="canonical" href="https:\/\/frequences-croisees\.fr\/mentions-legales-confidentialite\/"/);
  assert.match(legal, /href="\/#rencontres"/);
  assert.match(legal, /href="\/#village"/);
  assert.match(legal, /href="\/#participer"/);
  for (const content of ['Fréquences Croisées Précy-sur-Oise', '53 rue Charles de Gaulle', 'Johan Schonbakler', 'OVH SAS', '2 rue Kellermann', 'Umami', 'Google Fonts', 'CNIL']) {
    assert.ok(legal.includes(content));
  }
});

test('Umami est chargé une seule fois et en différé sur chaque page', () => {
  for (const page of [html, legal]) {
    assert.equal((page.match(/src="https:\/\/umami\.jschonbakler\.fr\/script\.js"/g) ?? []).length, 1);
    assert.match(page, /<script defer src="https:\/\/umami\.jschonbakler\.fr\/script\.js" data-website-id="fcf3af84-5466-45d5-a883-850a5902e4bc"><\/script>/);
  }
});

test('le hero affiche une carte vectorielle accessible et non une image agrandie', () => {
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  const map = hero.match(/<figure class="hero-map"[\s\S]*?<\/figure>/)?.[0];
  assert.ok(map);
  assert.match(map, /viewBox="0 0 640 660"/);
  assert.match(map, /role="img"/);
  assert.match(map, /aria-labelledby="local-map-title local-map-description"/);
  assert.match(map, /<title id="local-map-title"/);
  assert.match(map, /<desc id="local-map-description"/);
  assert.match(map, /pathLength="1"/);
  for (const name of ['Précy-sur-Oise', 'Neuilly-en-Thelle', 'Creil', 'Gouvieux', 'Chantilly', 'Chambly', 'Lamorlaye', 'Oise']) {
    assert.ok(map.includes(name));
  }
  assert.doesNotMatch(map, /<(?:image|img|canvas|script)\b/);
  assert.doesNotMatch(map, /<figcaption\b/);
  assert.doesNotMatch(hero, /class="disc"|class="wave wave-one"/);
});

test('l’animation de la carte est finie et respecte la réduction des mouvements', () => {
  assert.ok(stylesheets.length > 0);
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /@keyframes river-arrive/);
  assert.match(css, /@keyframes map-resonate/);
  assert.doesNotMatch(css, /infinite|repeating-radial-gradient/);
});

test('l’ancien visuel et ses styles sont conservés dans un composant indépendant', async () => {
  const planet = await readFile(new URL('../src/components/HeroPlanet.astro', import.meta.url), 'utf8');
  assert.match(planet, /class="disc"/);
  assert.match(planet, /class="wave wave-one"/);
  assert.match(planet, /repeating-radial-gradient/);
  assert.match(planet, /@media\(max-width:800px\)/);
});

test('la section locale affiche la photo fournie avec des versions optimisées', async () => {
  const local = html.match(/<section class="local"[\s\S]*?<\/section>/)?.[0];
  assert.ok(local);
  const photo = local.match(/<figure class="local-photo">[\s\S]*?<\/figure>/)?.[0];
  assert.ok(photo);
  assert.match(photo, /<picture>/);
  assert.match(photo, /type="image\/webp"/);
  assert.match(photo, /alt="Musiciens sur scène lors d’un concert en plein air"/);
  assert.match(photo, /loading="lazy"/);
  assert.match(photo, /decoding="async"/);
  assert.match(photo, /width="2000"/);
  assert.match(photo, /height="1333"/);
  assert.match(photo, /sizes="\(max-width: 800px\) 90vw, 40vw"/);
  for (const width of [400, 640, 960, 1280, 1600]) {
    assert.ok(photo.includes(`${width}w`));
  }
  assert.doesNotMatch(local, /local-art|aria-hidden="true"|[♪♩♫]/);
  assert.doesNotMatch(css, /local-art/);
  const assets = [...new Set(photo.match(/\/_astro\/[^"\s,<>]+\.(?:webp|jpg)/g) ?? [])];
  assert.ok(assets.some((path) => path.endsWith('.webp')));
  assert.ok(assets.some((path) => path.endsWith('.jpg')));
  for (const path of assets) {
    const image = await readFile(new URL(`../dist/client${path}`, import.meta.url));
    assert.ok(image.byteLength > 0);
  }
});
