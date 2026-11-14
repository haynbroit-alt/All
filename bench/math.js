// Protocole G3 (PROTOCOLE_G3.md) : des objets mathématiques exacts comme mondes interrogeables. Le moteur mesure
// y = f(n)/f(N) pour x = n/N dans [0,01 ; 1] ; ses lois sont vérifiées à x = 10 et x = 100. Aucun fichier de
// src/ n'est modifié. Usage : node bench/math.js --lot reglage|test [--bruit 0.001] [--seeds 1-3] [--out f.json]
import { writeFileSync } from 'node:fs';
import { Agent } from '../src/agent.js';
import { makeWorld } from '../src/worlds.js';
import { evalPoint } from '../src/expr.js';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const NS = 100000, NO = 10000;          // N des sommes, N des suites
const LIM = 32000000;                   // crible du plus petit facteur premier

let _crible = null;
function crible() {
  if (_crible) return _crible;
  const spf = new Int32Array(LIM + 1), pr = new Int32Array(2100000); let np = 0;
  for (let i = 2; i <= LIM; i++) {
    if (!spf[i]) { spf[i] = i; pr[np++] = i; }
    for (let j = 0; j < np; j++) { const p = pr[j]; if (p > spf[i] || i * p > LIM) break; spf[i * p] = p; }
  }
  return (_crible = { spf, pr, np });
}
function nbDiviseurs(a) {
  const { spf, pr, np } = crible(); let d = 1;
  if (a <= LIM) { while (a > 1) { const p = spf[a]; let e = 0; while (a % p === 0) { a /= p; e++; } d *= e + 1; } return d; }
  for (let j = 0; j < np && pr[j] * pr[j] <= a; j++) { const p = pr[j]; if (a % p === 0) { let e = 0; while (a % p === 0) { a /= p; e++; } d *= e + 1; } }
  return a > 1 ? d * 2 : d;
}
const serie = (N) => ({ N, petit: new Float64Array(2 * N + 1), loin: {} });
const note = (s, n, v) => { if (n <= 2 * s.N) s.petit[n] = v; if (n === 10 * s.N || n === 100 * s.N) s.loin[n] = v; };

let _sommes = null;
function sommes() {                     // une seule passe jusqu'à 100·NS
  if (_sommes) return _sommes;
  const { spf } = crible(), M = 100 * NS;
  const S = Object.fromEntries(['div', 'phi', 'omega', 'sigma', 'sanscarre', 'premiers', 'jumeaux', 'artin', 'lnfact', 'harmonique'].map((k) => [k, serie(NS)]));
  const c = Object.fromEntries(Object.keys(S).map((k) => [k, 0]));
  const puis = (b, e, m) => { let r = 1; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; };
  for (let k = 1; k <= M; k++) {
    let a = k, d = 1, phi = 1, om = 0, sg = 1, sc = 1;
    while (a > 1) { const p = spf[a]; let e = 0, pe = 1, s = 1; while (a % p === 0) { a /= p; e++; pe *= p; s += pe; } d *= e + 1; phi *= pe - pe / p; om++; sg *= s; if (e > 1) sc = 0; }
    c.div += d; c.phi += phi; c.omega += om; c.sigma += sg; c.sanscarre += sc; c.lnfact += Math.log(k); c.harmonique += 1 / k;
    if (k > 1 && spf[k] === k) {
      c.premiers++;
      if (k > 3 && spf[k - 2] === k - 2) c.jumeaux++;
      if (k > 2) { let q = k - 1, prim = true; while (q > 1 && prim) { const p = spf[q]; while (q % p === 0) q /= p; if (puis(2, (k - 1) / p, k) === 1) prim = false; } if (prim) c.artin++; }
    }
    for (const n in S) note(S[n], k, c[n]);
  }
  return (_sommes = S);
}
let _vol = null;
function syracuse() {
  if (_vol) return _vol;
  const M = 100 * NS, t = new Uint16Array(M + 1), s = serie(NS); let cum = 0;
  for (let k = 2; k <= M; k++) { let x = k, pas = 0; while (x >= k) { x = x % 2 === 0 ? x / 2 : 3 * x + 1; pas++; } t[k] = pas + t[x]; }
  for (let k = 1; k <= M; k++) { cum += t[k]; note(s, k, cum); }
  return (_vol = s);
}
function suite(pas) { const s = serie(NO); let a = 1; for (let n = 1; n <= 100 * NO; n++) { note(s, n, a); a += pas(a); } return s; }
function niemePremier() { const { pr } = crible(), s = serie(NO); for (let n = 1; n <= 100 * NO; n++) note(s, n, pr[n - 1]); return s; }
const bits = (a) => { let c = 0; while (a > 0) { c += a % 2; a = Math.floor(a / 2); } return c; };
const chiffres = (a) => { let c = 0; while (a > 0) { c += a % 10; a = Math.floor(a / 10); } return c; };

export const MONDES = [
  { id: 'R1', lot: 'reglage', titre: 'somme des inverses', connu: 'ln n + γ', f: () => sommes().harmonique },
  { id: 'R2', lot: 'reglage', titre: 'entiers sans facteur carré', connu: '6n/π²', f: () => sommes().sanscarre },
  { id: 'R3', lot: 'reglage', titre: 'somme des sommes de diviseurs', connu: 'π²n²/12', f: () => sommes().sigma },
  { id: 'A1', lot: 'A', titre: 'somme des nombres de diviseurs', connu: 'n·ln n + (2γ−1)·n', f: () => sommes().div },
  { id: 'A2', lot: 'A', titre: 'somme de l’indicatrice d’Euler', connu: '3n²/π²', f: () => sommes().phi },
  { id: 'A3', lot: 'A', titre: 'nombre de premiers', connu: 'n/ln n au premier ordre', f: () => sommes().premiers },
  { id: 'A4', lot: 'A', titre: 'logarithme de n!', connu: 'n·ln n − n + ½·ln(2πn)', f: () => sommes().lnfact },
  { id: 'A5', lot: 'A', titre: 'n-ième nombre premier', connu: 'n·(ln n + ln ln n − 1)', f: niemePremier },
  { id: 'A6', lot: 'A', titre: 'somme des nombres de facteurs premiers distincts', connu: 'n·ln ln n + 0,2615·n', f: () => sommes().omega },
  { id: 'B1', lot: 'B', titre: 'suite a → a + nombre de diviseurs', connu: null, f: () => suite(nbDiviseurs) },
  { id: 'B2', lot: 'B', titre: 'suite a → a + nombre de 1 en binaire', connu: null, f: () => suite(bits) },
  { id: 'B3', lot: 'B', titre: 'suite a → a + somme des chiffres', connu: null, f: () => suite(chiffres) },
  { id: 'B4', lot: 'B', titre: 'somme des temps de vol de Syracuse', connu: 'estimation probabiliste, non démontrée', f: syracuse },
  { id: 'B5', lot: 'B', titre: 'premiers jumeaux', connu: 'conjecture de Hardy et Littlewood', f: () => sommes().jumeaux },
  { id: 'B6', lot: 'B', titre: 'premiers dont 2 est racine primitive', connu: 'conjecture d’Artin', f: () => sommes().artin },
];

function temoins(y) {                   // droite et loi de puissance sur 50 points de [0,01 ; 1]
  const xs = Array.from({ length: 50 }, (_, i) => 0.01 + (0.99 * i) / 49), ys = xs.map(y);
  const mc = (u, v) => { const n = u.length, mu = u.reduce((a, b) => a + b) / n, mv = v.reduce((a, b) => a + b) / n; const b = u.reduce((s, x, i) => s + (x - mu) * (v[i] - mv), 0) / u.reduce((s, x) => s + (x - mu) ** 2, 0); return [mv - b * mu, b]; };
  const [a, b] = mc(xs, ys), [la, lb] = mc(xs.map(Math.log), ys.map(Math.log));
  return { droite: (x) => a + b * x, puissance: (x) => Math.exp(la + lb * Math.log(x)), exposant: lb };
}

export function executer(m, seed, bruit) {
  const s = m.f(), fN = s.petit[s.N], y = (x) => s.petit[Math.max(1, Math.min(2 * s.N, Math.round(x * s.N)))] / fN;
  const world = makeWorld({ id: m.id, title: m.titre, sim: (x) => y(x[0]), vars: [{ name: 'x', min: 0.01, max: 1 }], noise: bruit, seed, extend: 2 });
  const t0 = Date.now(), agent = new Agent(world, { seed }), best = agent.run();
  const v10 = s.loin[10 * s.N] / fN, v100 = s.loin[100 * s.N] / fN, er = (f, x, v) => { const p = f(x); return Number.isFinite(p) ? Math.abs(p - v) / Math.abs(v) : null; };
  const t = temoins(y), loi = best ? (x) => evalPoint(best.expr, [x]) : () => NaN;
  const e10 = er(loi, 10, v10), e100 = er(loi, 100, v100);
  return { monde: m.id, titre: m.titre, graine: seed, loi: best?.text ?? null, verdict: agent.bilan?.verdict ?? null, experiences: world.experiments, secs: (Date.now() - t0) / 1000,
    vrai_10: v10, vrai_100: v100, erreur_10: e10, erreur_100: e100, reussite: e10 != null && e100 != null && e10 <= 0.01 && e100 <= 0.02,
    droite: [er(t.droite, 10, v10), er(t.droite, 100, v100)], puissance: [er(t.puissance, 10, v10), er(t.puissance, 100, v100)], exposant_puissance: t.exposant };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const lot = arg('--lot', 'reglage'), bruit = Number(arg('--bruit', '0')), [g0, g1] = arg('--seeds', '1-3').split('-').map(Number), out = arg('--out', null);
  const pc = (v) => (v == null ? '  échec' : (100 * v).toFixed(2).padStart(7) + ' %');
  const res = [];
  for (const m of MONDES.filter((w) => (lot === 'test' ? w.lot !== 'reglage' : w.lot === lot))) for (let g = g0; g <= g1; g++) {
    const r = executer(m, g, bruit); res.push(r);
    console.log(`${r.monde} g${g} ${r.reussite ? 'RÉUSSI' : 'manqué'} à 10× ${pc(r.erreur_10)} à 100× ${pc(r.erreur_100)} | puissance ${pc(r.puissance[0])} ${pc(r.puissance[1])} | ${String(r.verdict).padEnd(10)} ${r.experiences} exp. ${r.secs.toFixed(0)} s | ${String(r.loi).slice(0, 80)}`);
  }
  if (out) writeFileSync(out, JSON.stringify({ lot, bruit, graines: [g0, g1], executions: res }, null, 1) + '\n');
}
