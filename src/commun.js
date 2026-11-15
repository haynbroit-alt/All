// G5 — une loi commune à plusieurs petits jeux, des constantes propres à chacun (voir PROTOCOLE_G5.md).
//
// Entrée : K jeux { x: [...], y: [...] } de même nature (une variable explicative, groupe donné).
// Sortie : UNE forme (même arbre d'expression) ; chacune de ses constantes libres est soit PARTAGÉE (une valeur
// pour tous les jeux), soit PROPRE (une valeur par jeu) ; et un verdict honnête sur des mesures mises de côté.
//
// Démarche (réutilise la recherche et l'ajustement du moteur, sans les modifier) :
//  1. formes candidates : fronts de Pareto de la recherche du moteur (Search) sur quelques jeux pris un à un, sur
//     tous les jeux réunis et sur les jeux réunis après normalisation de y ; plus une petite bibliothèque de formes
//     classiques (dont les cinq formes des mondes à réponse connue : ce biais est déclaré, voir `origine`) ;
//  2. chaque forme est ajustée jeu par jeu (toutes constantes propres) ; une forme qui ne s'ajuste pas sur TOUS
//     les jeux (prédiction non finie) est écartée ;
//  3. séparation et évaluation : par borne optimiste croissante, chaque forme passe au partage glouton — on rend
//     partagée la constante dont le partage fait le plus baisser le critère (type BIC, ajustement conjoint
//     Levenberg–Marquardt de toutes les constantes de tous les jeux), tant qu'il baisse ; on garde le meilleur critère ;
//  4. verdict (voir `verdict`) : la loi doit battre, sur les mesures mises de côté, la droite ET la constante ajustées
//     jeu par jeu, avoir au moins une constante partagée, et être préférée au modèle « une forme par jeu ».
import { C, V, U, B, clone, simplify, size, constants, niceForm, compile, usesVar } from './expr.js';
import { rng, fitConstants, makeData, linearFit, variance, solve } from './fit.js';
import { Search } from './search.js';

const LN = Math.log;

/** Met de côté un quart de chaque jeu (au moins 1 point), tirage reproductible. */
export function mettreDeCote(jeux, graine = 1) {
  const r = rng(graine * 7919 + 3);
  const vus = [], cotes = [];
  for (const j of jeux) {
    const n = j.x.length, k = Math.max(1, Math.round(n / 4));
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const t = r.int(i + 1); [idx[i], idx[t]] = [idx[t], idx[i]]; }
    const c = new Set(idx.slice(0, k));
    const pick = (keep) => ({ x: j.x.filter((_, i) => c.has(i) !== keep), y: j.y.filter((_, i) => c.has(i) !== keep) });
    vus.push(pick(true)); cotes.push(pick(false));
  }
  return { vus, cotes };
}

/** Marque comme libres les constantes non « simples » (les simples restent fixes) ; la marque survit à l'ajustement. */
export function marquer(e) { for (const c of constants(e)) c.libre = !niceForm(c.v); return e; }
export const libres = (e) => constants(e).filter((c) => c.libre);
/** Copie qui conserve la marque des constantes libres. */
export function copier(e) {
  if (e.t === 'c') return { t: 'c', v: e.v, libre: e.libre };
  if (e.t === 'v') return { t: 'v', i: e.i };
  if (e.t === 'u') return { t: 'u', op: e.op, a: copier(e.a) };
  return { t: 'b', op: e.op, a: copier(e.a), b: copier(e.b) };
}

/** Clé d'une forme : structure, constantes simples comprises, constantes libres anonymisées. */
export function cleForme(e) {
  if (e.t === 'c') return e.libre ? 'k' : String(e.v);
  if (e.t === 'v') return 'x';
  if (e.t === 'u') return `${e.op}(${cleForme(e.a)})`;
  let a = cleForme(e.a), b = cleForme(e.b);
  if ((e.op === '+' || e.op === '*') && a > b) [a, b] = [b, a];
  return `(${a}${e.op}${b})`;
}

// Bibliothèque de formes classiques (valeurs initiales volontairement « non simples » : ce sont des constantes libres).
const x = () => V(0);
export const BIBLIOTHEQUE = [
  ['puissance', B('*', C(1.3), B('^', x(), C(0.7)))],
  ['exponentielle', B('*', C(1.3), U('exp', B('*', C(0.13), x())))],
  ['saturation', B('/', B('*', C(1.3), x()), B('+', x(), C(1.7)))],
  ['logistique', B('/', C(1.3), B('+', C(1), U('exp', B('+', B('*', C(-0.7), x()), C(1.7)))))],
  ['droite', B('+', B('*', C(1.3), x()), C(0.7))],
  ['logarithme', B('+', B('*', C(1.3), U('log', x())), C(0.7))],
  ['puissance+c', B('+', B('*', C(1.3), B('^', x(), C(0.7))), C(0.3))],
  ['exponentielle+c', B('+', B('*', C(1.3), U('exp', B('*', C(-0.13), x()))), C(0.3))],
  ['parabole', B('+', B('+', B('*', C(1.3), B('^', x(), C(2))), B('*', C(0.3), x())), C(0.7))],
  ['inverse', B('+', B('/', C(1.3), x()), C(0.7))],
];

const nmse = (p, y, v) => { let s = 0; for (let k = 0; k < y.length; k++) s += (p[k] - y[k]) ** 2; return s / y.length / v; };
const echelle = (y) => variance(y) || (y.reduce((a, b) => a + b * b, 0) / y.length) || 1;
/** Prédit y aux points xs avec l'expression e ; null si une valeur n'est pas finie. */
export function predire(e, xs) {
  const out = compile(e)([Float64Array.from(xs)], xs.length, new Float64Array(xs.length));
  return out.every(isFinite) ? Array.from(out) : null;
}

/**
 * Ajustement conjoint (Levenberg–Marquardt, jacobien numérique) de la forme sur tous les jeux.
 * copies[g] : arbre propre au jeu g ; partage[j] : la constante libre j est-elle partagée ?
 * Minimise Σ_g SSE_g / v_g. Modifie les copies en place ; renvoie les SSE par jeu (Infinity si échec).
 */
function ajusterConjoint(copies, partage, jeux, vs, iters = 25) {
  const K = copies.length, cs = copies.map(libres), m = partage.length;
  const runs = copies.map((e) => compile(e)), datas = jeux.map((j) => makeData(j.x.map((v) => [v]), j.y));
  const params = [];                                        // { g: -1 (partagé) ou jeu, j }
  for (let j = 0; j < m; j++) if (partage[j]) params.push({ g: -1, j });
  for (let g = 0; g < K; g++) for (let j = 0; j < m; j++) if (!partage[j]) params.push({ g, j });
  const lire = (p) => cs[p.g < 0 ? 0 : p.g][p.j].v;
  const ecrire = (p, v) => { if (p.g < 0) for (let g = 0; g < K; g++) cs[g][p.j].v = v; else cs[p.g][p.j].v = v; };
  const res = (g) => { const d = datas[g], o = runs[g](d.cols, d.n, new Float64Array(d.n)); const w = 1 / Math.sqrt(vs[g]); return o.map((v, k) => (v - d.y[k]) * w); };
  const total = (r) => { let s = 0; for (const rg of r) for (const v of rg) s += v * v; return isFinite(s) ? s : Infinity; };
  let r = jeux.map((_, g) => res(g)), best = total(r), lambda = 1e-2;
  const P = params.length;
  if (P === 0 || !isFinite(best)) return r.map((rg, g) => rg.reduce((a, v) => a + v * v, 0) * vs[g]);
  for (let it = 0; it < iters; it++) {
    const cols = params.map((p) => {                        // colonnes du jacobien, par jeu touché
      const v = lire(p), h = Math.abs(v) * 1e-6 + 1e-8, gs = p.g < 0 ? [...Array(K).keys()] : [p.g];
      ecrire(p, v + h);
      const d = new Map(gs.map((g) => [g, res(g).map((u, k) => (u - r[g][k]) / h)]));
      ecrire(p, v);
      return d;
    });
    const A = Array.from({ length: P }, () => new Array(P).fill(0)), gr = new Array(P).fill(0);
    for (let a = 0; a < P; a++) {
      for (const [g, ja] of cols[a]) { let s = 0; for (let k = 0; k < ja.length; k++) s += ja[k] * r[g][k]; gr[a] -= s; }
      for (let b = a; b < P; b++) {
        let s = 0;
        for (const [g, ja] of cols[a]) { const jb = cols[b].get(g); if (jb) for (let k = 0; k < ja.length; k++) s += ja[k] * jb[k]; }
        A[a][b] = A[b][a] = s;
      }
    }
    if (!gr.every(isFinite)) break;
    let mieux = false;
    for (let t = 0; t < 6 && !mieux; t++) {
      const step = solve(A.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lambda) + 1e-12 : v))), gr);
      if (!step) { lambda *= 10; continue; }
      const old = params.map(lire);
      params.forEach((p, i) => ecrire(p, old[i] + step[i]));
      const r2 = jeux.map((_, g) => res(g)), cur = total(r2);
      if (cur < best) { const rel = (best - cur) / best; best = cur; r = r2; lambda = Math.max(lambda / 5, 1e-9); mieux = true; if (rel < 1e-9) it = iters; }
      else { params.forEach((p, i) => ecrire(p, old[i])); lambda *= 10; }
    }
    if (!mieux) break;
  }
  return r.map((rg, g) => { const s = rg.reduce((a, v) => a + v * v, 0) * vs[g]; return isFinite(s) ? s : Infinity; });
}

/**
 * Critère de type BIC : vraisemblance gaussienne à variance propre à chaque jeu ; une constante propre coûte ln(n_g)
 * dans chaque jeu (corrigé pour petits échantillons), une constante partagée ln(N), chaque nœud non libre ln(N).
 */
const terme = (sse, n, v, o) => n * LN(Math.max(sse / n, 1e-8 * v)) + o * LN(n) * (n / Math.max(n - o - 1, 1));
function critere(sse, jeux, vs, nPartage, nPropre, forme) {
  const N = jeux.reduce((a, j) => a + j.x.length, 0);
  let s = 0;
  jeux.forEach((j, g) => { s += terme(sse[g], j.x.length, vs[g], nPropre); });
  return s + (nPartage + size(forme) - libres(forme).length) * LN(N);
}

/** Formes candidates (clé → { e, origine }). */
function candidats(jeux, o) {
  const r = rng(o.graine * 131 + 17), out = new Map();
  const ajoute = (e, origine) => {
    e = marquer(simplify(clone(e)));
    if (!libres(e).length || size(e) > o.tailleMax) return;
    const k = cleForme(e);
    if (!out.has(k)) out.set(k, { e, origine });
  };
  if (o.bibliotheque) for (const [nom, e] of BIBLIOTHEQUE) ajoute(e, 'bibliothèque:' + nom);
  const cherche = (xs, ys, origine, pas) => {
    const s = new Search({ d: 1, seed: r.int(1e9) + 1, maxSize: o.tailleMax });
    s.setData(makeData(xs.map((v) => [v]), ys));
    for (let i = 0; i < 4; i++) s.step(Math.round(pas / 4));
    s.polish();
    for (const m of s.front()) ajoute(m.e, origine);
  };
  const ordre = jeux.map((_, g) => g).sort(() => r() - 0.5).slice(0, o.jeuxCherches);
  for (const g of ordre) if (jeux[g].x.length >= 4) cherche(jeux[g].x, jeux[g].y, 'recherche:jeu', o.pasJeu);
  const X = jeux.flatMap((j) => j.x);
  cherche(X, jeux.flatMap((j) => j.y), 'recherche:réunis', o.pasReunis);
  cherche(X, jeux.flatMap((j) => { const m = j.y.reduce((a, b) => a + b, 0) / j.y.length || 1; return j.y.map((v) => v / m); }),
    'recherche:réunis-normalisés', o.pasReunis);
  return [...out.values()];
}

/**
 * Cherche une loi commune sur les jeux « vus ». Renvoie { forme, partage, copies, critere, origine, ecartees }.
 * forme : arbre (constantes partagées à leur valeur, propres à la valeur du jeu 0) ; copies[g] : arbre du jeu g.
 */
export function chercherLoiCommune(jeux, opts = {}) {
  const o = { graine: 1, bibliotheque: true, jeuxCherches: 8, pasJeu: 1600, pasReunis: 4000, tailleMax: 15, finalistes: 25, rivales: 16, ...opts };
  const vs = jeux.map((j) => echelle(j.y));
  const minN = Math.min(...jeux.map((j) => j.x.length));
  const notes = [];
  let ecartees = 0;
  for (const c of candidats(jeux, o)) {
    const m = libres(c.e).length;
    if (m > minN - 1) { ecartees++; continue; }              // trop de constantes propres pour le plus petit jeu
    const copies = jeux.map(() => copier(c.e));
    let reussi = null;
    const sse = copies.map((e, g) => {
      const d = makeData(jeux[g].x.map((v) => [v]), jeux[g].y);
      let v = fitConstants(e, d, 20, libres(e));
      if (!isFinite(v) && reussi) {                           // relance depuis les constantes d'un jeu réussi
        const src = libres(reussi);
        libres(e).forEach((k, i) => { k.v = src[i].v; });
        v = fitConstants(e, d, 20, libres(e));
      }
      if (isFinite(v)) reussi = e;
      return v * d.n;
    });
    if (!sse.every(isFinite)) { ecartees++; continue; }
    // borne optimiste : la SSE « toutes propres » est la plus basse possible, la pénalité « toutes partagées » aussi
    notes.push({ ...c, copies, sse, sse0: sse, critere0: critere(sse, jeux, vs, 0, m, c.e), partage: new Array(m).fill(false), critere: critere(sse, jeux, vs, 0, m, c.e),
      borne: Math.min(critere(sse, jeux, vs, 0, m, c.e), critere(sse, jeux, vs, m, 0, c.e)) });
  }
  if (!notes.length) return null;
  notes.sort((a, b) => a.borne - b.borne);
  let record = Infinity, traitees = 0;
  for (const n of notes) {                                    // partage glouton, par séparation et évaluation
    if (n.borne >= record || traitees >= o.finalistes) break;
    traitees++;
    for (;;) {
      let meilleur = null;
      n.partage.forEach((p, j) => {
        if (p) return;
        const partage = n.partage.map((q, i) => q || i === j);
        const copies = n.copies.map(copier);
        const vals = copies.map((e) => libres(e)[j].v).sort((a, b) => a - b);
        for (const e of copies) libres(e)[j].v = vals[vals.length >> 1];   // départ : médiane des jeux
        const sse = ajusterConjoint(copies, partage, jeux, vs);
        if (!sse.every(isFinite)) return;
        const ns = partage.filter(Boolean).length;
        const cr = critere(sse, jeux, vs, ns, partage.length - ns, n.e);
        if (cr < n.critere && (!meilleur || cr < meilleur.critere)) meilleur = { partage, copies, sse, critere: cr };
      });
      if (!meilleur) break;
      Object.assign(n, meilleur);
    }
    record = Math.min(record, n.critere);
  }
  notes.sort((a, b) => a.critere - b.critere);
  const b = notes[0];
  // Modèle concurrent « une forme par jeu » (hypothèse « pas de loi commune ») : chaque jeu choisit sa meilleure forme
  // parmi les L premières candidates (classées « toutes constantes propres »), constantes propres, et paie ln(L) pour
  // ce choix ; s'y ajoute une fois le coût de structure de la plus complexe de ces L formes.
  const top = [...notes].sort((a, c) => a.critere0 - c.critere0).slice(0, o.rivales);
  const N = jeux.reduce((a, j) => a + j.x.length, 0);
  const rival = jeux.reduce((a, j, g) => a + LN(top.length)
    + Math.min(...top.map((n) => terme(n.sse0[g], j.x.length, vs[g], libres(n.e).length))), 0)
    + Math.max(...top.map((n) => size(n.e) - libres(n.e).length)) * LN(N);
  return { forme: b.copies[0], partage: b.partage, copies: b.copies, critere: b.critere, origine: b.origine,
    marge: rival - b.critere, candidates: notes.length, ecartees,
    classement: notes.slice(0, 8).map((n) => ({ cle: cleForme(n.e), critere: n.critere, partage: n.partage, origine: n.origine })) };
}

/** Témoins jeu par jeu : droite et constante ajustées sur les points vus. */
export function temoins(vus) {
  return vus.map((j) => {
    const n = j.x.length, m = j.y.reduce((a, b) => a + b, 0) / n;
    const w = n >= 2 ? linearFit([new Float64Array(n).fill(1), Float64Array.from(j.x)], Float64Array.from(j.y), n) : null;
    return { constante: (xs) => xs.map(() => m), droite: w ? (xs) => xs.map((v) => w[0] + w[1] * v) : (xs) => xs.map(() => m) };
  });
}

/**
 * Erreur normalisée sur les points mis de côté, jeu par jeu : mean((p − y)²) / v_g (v_g : échelle des points vus).
 * predicteurs[g](xs) → tableau ou null. Renvoie { parJeu, moyenne } (Infinity si une prédiction n'est pas définie).
 */
export function erreurCote(predicteurs, vus, cotes) {
  const parJeu = cotes.map((c, g) => { const p = predicteurs[g](c.x); return p && p.every(isFinite) ? nmse(p, c.y, echelle(vus[g].y)) : Infinity; });
  return { parJeu, moyenne: parJeu.reduce((a, b) => a + b, 0) / parJeu.length };
}

/**
 * Verdict honnête. « retenue » seulement si les trois conditions tiennent :
 *  - sur les points mis de côté, erreur moyenne de la loi < celle de la droite ET < celle de la constante (jeu par jeu) ;
 *  - la loi dépend de x (une constante, même partagée, n'est pas une loi) et a au moins une constante partagée
 *    (sinon rien n'est commun hormis l'écriture) ;
 *  - sur les points vus, le critère préfère la loi commune au modèle « une forme par jeu » (marge > 0).
 * `majorite` (la loi bat le meilleur témoin dans plus de la moitié des jeux) est rendu à titre d'information.
 */
export function verdict(loi, vus, cotes) {
  const t = temoins(vus);
  const eL = erreurCote(loi ? loi.copies.map((e) => (xs) => predire(e, xs)) : vus.map(() => () => null), vus, cotes);
  const eD = erreurCote(t.map((w) => w.droite), vus, cotes), eC = erreurCote(t.map((w) => w.constante), vus, cotes);
  const gagnes = eL.parJeu.filter((v, g) => v < Math.min(eD.parJeu[g], eC.parJeu[g])).length;
  const bat = !!loi && isFinite(eL.moyenne) && eL.moyenne < eD.moyenne && eL.moyenne < eC.moyenne;
  const partagees = loi ? loi.partage.filter(Boolean).length : 0, preferee = !!loi && loi.marge > 0;
  const dependDeX = !!loi && usesVar(loi.forme, 0);
  return { retenue: bat && partagees >= 1 && preferee && dependDeX, dependDeX, batTemoins: bat, partagees, communePreferee: preferee,
    marge: loi ? loi.marge : null, majorite: gagnes > vus.length / 2, jeuxGagnes: gagnes,
    erreurs: { loi: eL, droite: eD, constante: eC } };
}

/** Chaîne complète : mise de côté, recherche sur les points vus, verdict sur les points mis de côté. */
export function loiCommune(jeux, opts = {}) {
  const { vus, cotes } = mettreDeCote(jeux, opts.graine || 1);
  const loi = chercherLoiCommune(vus, opts);
  return { loi, ...verdict(loi, vus, cotes) };
}
