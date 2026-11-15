#!/usr/bin/env node
// G5 — jeux réels groupés (PROTOCOLE_G5.md, « Jeux réels groupés ») : liste figée bench/g5/reels-liste.json.
// Usage : node bench/commun-reels.js <dossier des CSV Rdatasets> [--rangs a-b] [--sortie f.json]
// Par jeu : au plus 60 groupes (les plus fournis ; à égalité, ordre du nom), au plus 40 lignes par groupe tirées au
// hasard (graine = rang du jeu), points mis de côté par mettreDeCote. Même format de sortie que bench/commun.js
// (type « reel »), pour que bench/commun-operon.py s'y applique.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rng } from '../src/fit.js';
import { toString } from '../src/expr.js';
import { Agent } from '../src/agent.js';
import { mettreDeCote, chercherLoiCommune, verdict, erreurCote, predire, cleForme } from '../src/commun.js';
import { lireCsv } from './commun-jeux.js';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const dossier = process.argv[2], liste = JSON.parse(readFileSync(new URL('./g5/reels-liste.json', import.meta.url), 'utf8')).jeux;
const [r0, r1] = arg('rangs', `0-${liste.length - 1}`).split('-').map(Number);
const manquant = (v) => v === '' || v === 'NA';
function jeuxDe(entree, rang) {
  const [tete, ...corps] = lireCsv(readFileSync(join(dossier, entree.fichier), 'utf8'));
  const c = (nom) => tete.indexOf(nom), [jy, jx, jf] = [c(entree.reponse), c(entree.explicative), c(entree.facteur)];
  const g = new Map();
  for (const r of corps) { if (manquant(r[jy]) || manquant(r[jx]) || manquant(r[jf])) continue; if (!g.has(r[jf])) g.set(r[jf], []); g.get(r[jf]).push([Number(r[jx]), Number(r[jy])]); }
  const ok = [...g].filter(([, p]) => p.length >= 5 && new Set(p.map((q) => q[0])).size >= 2)
    .sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).slice(0, 60);
  const u = rng(rang + 1);
  return ok.map(([nom, p]) => {
    const m = p.map((q) => [u(), q]).sort((a, b) => a[0] - b[0]).slice(0, 40).map((q) => q[1]);
    return { groupe: nom, x: m.map((q) => q[0]), y: m.map((q) => q[1]) };
  });
}
function galilee(vus, graine) {
  try { const a = new Agent(null, { seed: graine, data: { names: ['x'], target: 'y', X: vus.x.map((v) => [v]), y: vus.y } }); const h = a.run(); return h ? (xs) => predire(h.expr, xs) : () => null; }
  catch { return () => null; }
}
const resume = (loi, v) => ({ loi: loi && { cle: cleForme(loi.forme), texteJeu0: toString(loi.copies[0], ['x']), partage: loi.partage, origine: loi.origine },
  verdict: { retenue: v.retenue, batTemoins: v.batTemoins, communePreferee: v.communePreferee, dependDeX: v.dependDeX, partagees: v.partagees, communesUtiles: v.communesUtiles } });
const out = { protocole: 'G5 — jeux réels groupés', liste: 'bench/g5/reels-liste.json', date: new Date().toISOString(), node: process.version, rangs: [r0, r1], mondes: [] };
for (let rang = r0; rang <= r1; rang++) {
  const e = liste[rang], t0 = Date.now(), jeux = jeuxDe(e, rang), { vus, cotes } = mettreDeCote(jeux, rang + 1);
  const loi = chercherLoiCommune(vus, { graine: rang + 1, bibliotheque: false }), v = verdict(loi, vus, cotes);
  const loiB = chercherLoiCommune(vus, { graine: rang + 1, bibliotheque: true }), vB = verdict(loiB, vus, cotes);
  const E = v.erreurs, erreurs = { commun: E.loi, droite: E.droite, constante: E.constante, meilleurTemoin: E.droite.moyenne <= E.constante.moyenne ? E.droite : E.constante };
  erreurs.galileeParJeu = erreurCote(vus.map((j, g) => galilee(j, (rang + 1) * 100 + g)), vus, cotes);
  const reuni = galilee({ x: vus.flatMap((j) => j.x), y: vus.flatMap((j) => j.y) }, rang + 1);
  erreurs.galileeReuni = erreurCote(vus.map(() => reuni), vus, cotes);
  out.mondes.push({ graine: rang, type: 'reel', fichier: e.fichier, colonnes: { reponse: e.reponse, explicative: e.explicative, facteur: e.facteur }, K: jeux.length,
    jeux: jeux.map((j, g) => ({ groupe: j.groupe, vus: vus[g], cotes: cotes[g] })), ...resume(loi, v), erreurs,
    bibliotheque: { ...resume(loiB, vB), erreur: vB.erreurs.loi }, secs: (Date.now() - t0) / 1000 });
  const f = (x) => (x == null || !isFinite(x) ? '∞' : x.toPrecision(3));
  console.log(`${String(rang).padStart(2)} ${e.fichier.padEnd(32)} K=${String(jeux.length).padStart(2)} ${v.retenue ? 'RETENUE' : 'non retenue'} | commun ${f(E.loi.moyenne)} parJeu ${f(erreurs.galileeParJeu.moyenne)} réuni ${f(erreurs.galileeReuni.moyenne)} témoin ${f(erreurs.meilleurTemoin.moyenne)} | ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
const s = arg('sortie', null);
if (s) writeFileSync(s, JSON.stringify(out));
