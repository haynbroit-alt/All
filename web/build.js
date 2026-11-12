#!/usr/bin/env node
// Assemble la page autonome dist/galilee.html : le moteur (src/*.js) est inséré tel quel dans le gabarit.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
const root = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const engine = ['expr', 'fit', 'search', 'worlds', 'agent']
  .map((m) => read(`src/${m}.js`).replace(/^import[\s\S]*?from\s+'[^']+';\n/gm, '').replace(/^export /gm, ''))
  .join('\n');
const api = 'CATALOG, SIMULATORS, PLANETS, PHASES, Agent, verify, getWorld, customWorld, parseCsv, freeNames, parse, simplify, toString, evalPoint';
let bench = 'null';
if (existsSync(new URL('bench/results.json', root))) {
  const b = JSON.parse(read('bench/results.json'));
  bench = JSON.stringify({ date: b.date, seeds: b.seeds, noises: b.noises, summary: b.summary, sims: b.sims || [] });
}
const html = read('web/template.html')
  .replace('/*__ENGINE__*/', () => `const G = (() => {\n${engine}\nreturn { ${api} };\n})();`)
  .replace('/*__BENCH__*/null', () => bench);
mkdirSync(new URL('dist/', root), { recursive: true });
writeFileSync(new URL('dist/galilee.html', root), html);
console.log(`dist/galilee.html : ${(html.length / 1024).toFixed(0)} Ko`);
