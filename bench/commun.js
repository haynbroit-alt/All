#!/usr/bin/env node
// Banc G5 (PROTOCOLE_G5.md) : loi commune à K petits jeux, comparée à GALILÉE actuel et aux témoins.
//
// Usage : node bench/commun.js [--graines 1-10] [--sortie fichier.json] [--sans-galilee] [--sans-bibliotheque]
//   --sans-galilee      : ne lance pas GALILÉE actuel (b, c) — rapide, ne permet pas de calculer C1 ;
//   --sans-bibliotheque : la loi commune ne part que des formes trouvées par la recherche du moteur.
// Graines de MISE AU POINT : 1 à 100. Graines de TEST 9001 à 9200 : refusées sauf si G5_TEST=exécution-unique.
//
// Format de la sortie JSON (les valeurs non définies — prédiction infinie ou NaN — sont écrites null) :
// { protocole: 'G5', date, node, graines: [a, b], options,
//   mondes: [ { graine, type: 'commun' | 'sans-loi', bruit, K,
//     famille            : forme vraie commune (type 'commun') ; null pour 'sans-loi',
//     partageVrai        : { nomConstante: true si partagée } (type 'commun'),
//     jeux: [ { famille, constantes: { nom: valeur }, domaine: [lo, hi], vus: { x, y }, cotes: { x, y } } ],
//     loi: { cle, texteJeu0, partage, origine, candidates } | null,
//     verdict: { retenue, batTemoins, communePreferee, dependDeX, marge, majorite, partagees, jeuxGagnes } (voir src/commun.js),
//     erreurs: { <méthode>: { moyenne, parJeu } } — erreur quadratique moyenne sur les points mis de côté du jeu,
//              divisée par la variance des y vus de ce jeu ; méthodes : commun, galileeParJeu, galileeReuni,
//              droite, constante ; meilleurTemoin = la meilleure des deux moyennes droite/constante (choix a posteriori,
//              donc favorable au témoin),
//     memeForme: { forme, partage } (type 'commun'), ms: { commun, galileeParJeu, galileeReuni } } ],
//   criteres: { C1, C3, C4 } }
// Avec --les-deux (mesure du test, PROTOCOLE_G5.md « Décisions ») : la loi principale est cherchée SANS bibliothèque ;
// la variante AVEC bibliothèque est cherchée dans la même exécution, sur les mêmes mondes, et rangée dans
// mondes[].bibliotheque = { loi, verdict, erreur, memeForme, ms } ; ses critères dans criteresBibliotheque.
import { writeFileSync } from 'node:fs';
import { rng, fitConstants, makeData } from '../src/fit.js';
import { clone, toString, constants } from '../src/expr.js';
import { Agent } from '../src/agent.js';
import { mettreDeCote, chercherLoiCommune, verdict, erreurCote, predire, cleForme, BIBLIOTHEQUE, libres, marquer, copier }
  from '../src/commun.js';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes('--' + n);
const [g0, g1] = arg('graines', '1-10').split('-').map(Number);
const sortie = arg('sortie', null), sansGalilee = flag('sans-galilee'), lesDeux = flag('les-deux'), bibliotheque = !lesDeux && !flag('sans-bibliotheque');
if (!(Number.isInteger(g0) && Number.isInteger(g1) && g0 >= 1 && g1 >= g0)) { console.error('--graines a-b attendu (entiers)'); process.exit(1); }
// relecture : seules les graines 1 à 100 (mise au point) et 9001 à 9200 (test) existent ; toute autre graine est refusée
const miseAuPoint = g1 <= 100, test = g0 >= 9001 && g1 <= 9200;
if (!miseAuPoint && !(test && process.env.G5_TEST === 'exécution-unique')) {
  console.error('Graines de mise au point : 1 à 100. Graines 9001 à 9200 réservées au test (exécution unique, G5_TEST=exécution-unique). Toute autre graine : refusée.');
  process.exit(1);
}

// ------------------------------------------------------------------ mondes à réponse connue
// Chaque famille : constantes [nom, min, max, signé ?], fonction vraie, domaine des x d'un jeu (début, largeur).
const FAMILLES = {
  puissance: { k: [['a', 0.5, 5], ['b', 0.3, 1.8, true]], f: (c, x) => c.a * x ** c.b, dom: [[0.5, 3], [3, 7]] },
  exponentielle: { k: [['a', 0.5, 5], ['b', 0.1, 0.4, true]], f: (c, x) => c.a * Math.exp(c.b * x), dom: [[0, 3], [3, 7]] },
  saturation: { k: [['a', 1, 10], ['b', 0.5, 5]], f: (c, x) => (c.a * x) / (c.b + x), dom: [[0.2, 2], [3, 8]] },
  logistique: { k: [['a', 1, 10], ['b', 0.6, 2], ['c', 3, 6]], f: (c, x) => c.a / (1 + Math.exp(-c.b * (x - c.c))), dom: [[0, 2], [5, 8]] },
  droite: { k: [['a', 0.5, 5], ['b', 0.2, 2]], f: (c, x) => c.a + c.b * x, dom: [[0, 3], [3, 7]] },
};
const NOMS = Object.keys(FAMILLES);
const BRUITS = [0.05, 0.10, 0.15, 0.20];
const tire = (r, [lo, hi]) => lo + r() * (hi - lo);

function genererMonde(graine, type) {
  const r = rng(graine * 1009 + (type === 'commun' ? 11 : 23));
  const K = 5 + r.int(56), bruit = r.pick(BRUITS);
  const famille = type === 'commun' ? r.pick(NOMS) : null;
  const signes = {}, partages = {}, valeurs = {};
  for (const nom of NOMS) for (const [k] of FAMILLES[nom].k) signes[nom + k] = r() < 0.5 ? -1 : 1;
  const partageVrai = {};
  if (famille) {
    const ks = FAMILLES[famille].k;
    ks.forEach(([k]) => { partageVrai[k] = r() < 0.5; });
    if (ks.every(([k]) => partageVrai[k])) partageVrai[ks[r.int(ks.length)][0]] = false;  // au moins une propre
    if (ks.every(([k]) => !partageVrai[k])) partageVrai[ks[r.int(ks.length)][0]] = true;   // au moins une partagée
    for (const [k, lo, hi, s] of ks) { partages[k] = partageVrai[k]; valeurs[k] = tire(r, [lo, hi]) * (s ? signes[famille + k] : 1); }
  }
  let fams = Array.from({ length: K }, () => famille || r.pick(NOMS));
  if (!famille) while (new Set(fams).size < Math.min(3, K)) fams = fams.map(() => r.pick(NOMS));
  const jeux = fams.map((nom) => {
    const F = FAMILLES[nom], c = {};
    for (const [k, lo, hi, s] of F.k) c[k] = famille && partages[k] ? valeurs[k] : tire(r, [lo, hi]) * (s ? signes[nom + k] : 1);
    const lo = tire(r, F.dom[0]), hi = lo + tire(r, F.dom[1]), n = 6 + r.int(15);
    const x = Array.from({ length: n }, () => lo + r() * (hi - lo)).sort((a, b) => a - b);
    return { famille: nom, constantes: c, domaine: [lo, hi], x, y: x.map((v) => F.f(c, v) * (1 + bruit * r.normal())) };
  });
  return { graine, type, bruit, K, famille, partageVrai: famille ? partageVrai : null, jeux };
}

// ------------------------------------------------------------------ C3 : « même forme »
// Règle : la forme rendue F et la forme vraie T sont équivalentes à constantes près si, pour CHAQUE jeu, sur 100 points
// régulièrement espacés de son domaine, (i) F réajustée (toutes constantes libres, départ = constantes rendues)
// reproduit la courbe vraie sans bruit à moins de 1 % (RMS relatif), (ii) T réajustée (départ = constantes vraies)
// reproduit la courbe de la loi rendue à moins de 1 %, et (iii) F n'a pas plus de constantes que T n'en a de libres.
// Correction A : dans (i), les constantes que la recherche a figées sont libérées aussi ; dans (iii), on compte toutes
// les constantes de F, libres ou figées, sauf celles figées à 0, 1 ou −1.
const gabarit = (nom) => marquer(clone(BIBLIOTHEQUE.find(([n]) => n === nom)[1]));
function reproduit(e, xs, cible) {
  const d = makeData(xs.map((v) => [v]), cible);
  const m = fitConstants(e, d, 40, libres(e)), rms = Math.sqrt(cible.reduce((a, v) => a + v * v, 0) / cible.length);
  return isFinite(m) && Math.sqrt(m) / rms < 0.01;
}
function vraieExpr(nom, c) {                     // gabarit de la bibliothèque, constantes vraies
  const e = gabarit(nom), ks = libres(e);
  const v = nom === 'puissance' || nom === 'exponentielle' || nom === 'saturation' ? [c.a, c.b]
    : nom === 'logistique' ? [c.a, -c.b, c.b * c.c] : [c.b, c.a];
  ks.forEach((k, i) => { k.v = v[i]; });
  return e;
}
function memeForme(monde, loi) {
  if (!loi) return { forme: false, partage: false };
  const T = gabarit(monde.famille);
  const compte = constants(loi.forme).filter((c) => c.libre || ![0, 1, -1].includes(c.v)).length;
  if (compte > libres(T).length) return { forme: false, partage: false };
  const liberee = (e) => { const f = copier(e); for (const c of constants(f)) c.libre = true; return f; };
  const forme = monde.jeux.every((j, g) => {
    const xs = Array.from({ length: 100 }, (_, i) => j.domaine[0] + (i / 99) * (j.domaine[1] - j.domaine[0]));
    const vrai = xs.map((v) => FAMILLES[j.famille].f(j.constantes, v)), rendu = predire(loi.copies[g], xs);
    return rendu && reproduit(liberee(loi.copies[g]), xs, vrai) && reproduit(vraieExpr(j.famille, j.constantes), xs, rendu);
  });
  const nP = loi.partage.filter(Boolean).length, nV = Object.values(monde.partageVrai).filter(Boolean).length;
  return { forme, partage: forme && nP === nV };   // nombre de constantes partagées égal (repérage exact non tenté)
}

// ------------------------------------------------------------------ GALILÉE actuel
function galilee(vus, graine) {
  try {
    const a = new Agent(null, { seed: graine, data: { names: ['x'], target: 'y', X: vus.x.map((v) => [v]), y: vus.y } });
    const h = a.run();
    return h ? (xs) => predire(h.expr, xs) : () => null;
  } catch { return () => null; }
}

// ------------------------------------------------------------------ banc
const signes = (a, b) => {                       // test des signes unilatéral : a < b plus souvent que le hasard ?
  let v = 0, d = 0;
  a.forEach((x, i) => { const y = b[i]; if (x === y || (!isFinite(x) && !isFinite(y))) return; if (x < y) v++; else d++; });
  const n = v + d;
  let p = 0, c = 1;
  for (let k = 0; k <= n; k++) { if (k >= v) p += c; c = (c * (n - k)) / (k + 1); }
  p /= 2 ** n;
  return { victoires: v, defaites: d, p: n ? p : 1, tenu: n > 0 && p < 0.05 };
};
const out = { protocole: 'G5', date: new Date().toISOString(), node: process.version, graines: [g0, g1],
  options: { sansGalilee, bibliotheque, lesDeux }, mondes: [] };
for (let graine = g0; graine <= g1; graine++) for (const type of ['commun', 'sans-loi']) {
  const monde = genererMonde(graine, type);
  const { vus, cotes } = mettreDeCote(monde.jeux, graine);
  let t = Date.now();
  const loi = chercherLoiCommune(vus, { graine, bibliotheque });
  const v = verdict(loi, vus, cotes), ms = { commun: Date.now() - t };
  const E = v.erreurs, erreurs = { commun: E.loi, droite: E.droite, constante: E.constante };
  erreurs.meilleurTemoin = E.droite.moyenne <= E.constante.moyenne ? E.droite : E.constante;
  if (type === 'commun' && !sansGalilee) {
    t = Date.now();
    erreurs.galileeParJeu = erreurCote(vus.map((j, g) => galilee(j, graine * 100 + g)), vus, cotes);
    ms.galileeParJeu = Date.now() - t; t = Date.now();
    const reuni = galilee({ x: vus.flatMap((j) => j.x), y: vus.flatMap((j) => j.y) }, graine);
    erreurs.galileeReuni = erreurCote(vus.map(() => reuni), vus, cotes);
    ms.galileeReuni = Date.now() - t;
  }
  const mf = type === 'commun' ? memeForme(monde, loi) : null;
  let bib = null;
  if (lesDeux) {                                    // variante avec bibliothèque, mêmes mondes, mêmes points
    const t2 = Date.now(), loiB = chercherLoiCommune(vus, { graine, bibliotheque: true }), vB = verdict(loiB, vus, cotes);
    bib = { loi: loiB && { cle: cleForme(loiB.forme), texteJeu0: toString(loiB.copies[0], ['x']), partage: loiB.partage, origine: loiB.origine, candidates: loiB.candidates },
      verdict: { retenue: vB.retenue, batTemoins: vB.batTemoins, communePreferee: vB.communePreferee, dependDeX: vB.dependDeX, marge: vB.marge, partagees: vB.partagees, communesUtiles: vB.communesUtiles },
      erreur: vB.erreurs.loi, memeForme: type === 'commun' ? memeForme(monde, loiB) : null, ms: Date.now() - t2 };
  }
  out.mondes.push({ graine, type, bruit: monde.bruit, K: monde.K, famille: monde.famille, partageVrai: monde.partageVrai,
    jeux: monde.jeux.map((j, g) => ({ famille: j.famille, constantes: j.constantes, domaine: j.domaine, vus: vus[g], cotes: cotes[g] })),
    loi: loi && { cle: cleForme(loi.forme), texteJeu0: toString(loi.copies[0], ['x']), partage: loi.partage, origine: loi.origine, candidates: loi.candidates },
    verdict: { retenue: v.retenue, batTemoins: v.batTemoins, communePreferee: v.communePreferee, dependDeX: v.dependDeX, marge: v.marge, majorite: v.majorite, partagees: v.partagees, communesUtiles: v.communesUtiles, jeuxGagnes: v.jeuxGagnes, communes: loi?.communes ?? null }, erreurs, memeForme: mf, ms, ...(bib ? { bibliotheque: bib } : {}) });
  const e = (k) => (erreurs[k] ? erreurs[k].moyenne.toPrecision(3) : '—');
  console.log(`${String(graine).padStart(4)} ${type.padEnd(8)} K=${String(monde.K).padStart(2)} bruit=${monde.bruit} ${String(monde.famille || '').padEnd(13)}`
    + ` ${v.retenue ? 'RETENUE' : 'non retenue'}(${v.batTemoins ? 'T' : 't'}${v.communePreferee ? 'P' : 'p'}${v.majorite ? 'M' : 'm'} s=${v.partagees}) forme=${mf ? (mf.forme ? 'oui' : 'non') : '-'} ${loi ? toString(loi.copies[0], ['x']) : '∅'} [${loi ? loi.origine : ''}]`
    + ` | commun ${e('commun')} parJeu ${e('galileeParJeu')} réuni ${e('galileeReuni')} témoin ${e('meilleurTemoin')} | ${ms.commun} ms`);
}
const C = out.mondes.filter((m) => m.type === 'commun'), S = out.mondes.filter((m) => m.type === 'sans-loi');
const moy = (m, k) => (m.erreurs[k] ? m.erreurs[k].moyenne : Infinity);
// get(m) → { erreur, verdict, memeForme } de la variante jugée ; C1 contre GALILÉE, C3, C4 et le reste se calculent pareil
function criteres(get) {
  const e = (m) => get(m).erreur.moyenne, c5 = C.filter((m) => m.bruit === 0.05), forme = (m) => get(m).memeForme.forme;
  const r = {
    C1: sansGalilee ? 'non mesuré (--sans-galilee)' : { contreParJeu: signes(C.map(e), C.map((m) => moy(m, 'galileeParJeu'))), contreReuni: signes(C.map(e), C.map((m) => moy(m, 'galileeReuni'))) },
    C3: { mondes5pc: c5.length, formeVraie: c5.filter(forme).length, taux: c5.length ? c5.filter(forme).length / c5.length : null, seuil: 0.6 },
    C3tousBruits: { mondes: C.length, formeVraie: C.filter(forme).length },
    C3parmiRetenues: { retenues: C.filter((m) => get(m).verdict.retenue).length, formeVraie: C.filter((m) => get(m).verdict.retenue && forme(m)).length },
    C4: { mondes: S.length, nonRetenue: S.filter((m) => !get(m).verdict.retenue).length, taux: S.length ? S.filter((m) => !get(m).verdict.retenue).length / S.length : null, seuil: 0.9,
      nonRetenueSansGarde: S.filter((m) => !get(m).verdict.batTemoins).length },
    communRetenue: C.filter((m) => get(m).verdict.retenue).length,
    contreTemoin: signes(C.map(e), C.map((m) => moy(m, 'meilleurTemoin'))),
  };
  if (r.C1 !== 'non mesuré (--sans-galilee)') r.C1.tenu = r.C1.contreParJeu.tenu && r.C1.contreReuni.tenu;
  r.C3.tenu = r.C3.taux !== null && r.C3.taux >= 0.6;
  r.C4.tenu = r.C4.taux !== null && r.C4.taux >= 0.9;
  return r;
}
out.criteres = criteres((m) => ({ erreur: m.erreurs.commun, verdict: m.verdict, memeForme: m.memeForme }));
if (lesDeux) out.criteresBibliotheque = criteres((m) => m.bibliotheque);
if (lesDeux) console.log('— variante avec bibliothèque —\n' + JSON.stringify(out.criteresBibliotheque, null, 1) + '\n— mesure principale, sans bibliothèque —');
console.log(JSON.stringify(out.criteres, null, 1));
if (sortie) writeFileSync(sortie, JSON.stringify(out));
