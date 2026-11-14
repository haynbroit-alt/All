// Banc G2 : lois de demande observées par des comptages (PROTOCOLE_G2.md). Le moteur n'est pas modifié.
// Usage : node bench/comptages.js --seeds 1-200 [--out fichier.json] [--md fichier.md]
import { writeFileSync } from 'node:fs';
import { Agent } from '../src/agent.js';
import { toString } from '../src/expr.js';
import { rng } from '../src/fit.js';

const SEMAINES = 39;
export const CLASSES = ['sans effet', 'puissance', 'exponentielle', 'lineaire'];
function poisson(r, lam) { if (lam > 40) return Math.max(0, Math.round(lam + Math.sqrt(lam) * r.normal())); const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }

export function monde(seed) {
  const r = rng(seed * 6007 + 11), u = (a, b) => a + r() * (b - a), classe = CLASSES[seed % 4];
  const lam = Math.exp(u(Math.log(5), Math.log(80))), a = classe === 'puissance' ? u(0.8, 2.5) : classe === 'exponentielle' ? u(0.8, 3) : u(0.6, 1.8);
  const f = classe === 'sans effet' ? () => 1 : classe === 'puissance' ? (p) => p ** -a : classe === 'exponentielle' ? (p) => Math.exp(-a * (p - 1)) : (p) => Math.max(0.1, 1 - a * (p - 1));
  const niveaux = Array.from({ length: 3 + Math.floor(r() * 7) }, () => Math.round(u(0.7, 1.4) * 100) / 100);
  const X = [], y = [];
  let reste = 0, p = niveaux[0], i = 0;
  for (let w = 0; w < SEMAINES; w++) { if (reste <= 0) { p = niveaux[i++ % niveaux.length]; reste = 2 + Math.floor(r() * 5); } reste--; X.push([p]); y.push(poisson(r, lam * f(p))); }
  return { observe: { names: ['p'], target: 'q', X, y }, verite: { classe, lam, a, moyenne: (q) => lam * f(q), niveaux: new Set(X.map((x) => x[0])).size } };
}

const dev = (y, mu) => 2 * y.reduce((s, v, i) => s + (v > 0 ? v * Math.log(v / mu[i]) : 0) - (v - mu[i]), 0);
export function noter(w, loi) {
  const { X, y } = w.observe, ps = X.map((x) => x[0]), lo = Math.min(...ps), hi = Math.max(...ps);
  const m = y.reduce((a, b) => a + b, 0) / y.length;
  const detectable = w.verite.classe !== 'sans effet' && dev(y, y.map(() => Math.max(m, 1e-9))) - dev(y, ps.map((p) => w.verite.moyenne(p))) >= 6.63;
  if (!loi) return { detectable, constante: true, bonne: false, r2: null };
  const obs = ps.map((p) => loi([p])), constante = !(Math.max(...obs) - Math.min(...obs) > 1e-9 * (Math.abs(obs[0]) + 1));
  const g = Array.from({ length: 50 }, (_, i) => lo + ((hi - lo) * i) / 49), t = g.map((p) => w.verite.moyenne(p)), tm = t.reduce((a, b) => a + b, 0) / 50;
  const st = t.reduce((s, v) => s + (v - tm) ** 2, 0), se = g.reduce((s, p, i) => { const v = loi([p]); return s + (Number.isFinite(v) ? (v - t[i]) ** 2 : Infinity); }, 0);
  const r2 = st > 1e-12 ? 1 - se / st : null;
  return { detectable, constante, bonne: !constante && r2 != null && r2 >= 0.8, r2 };
}

export function passer(seed, chercher) {
  const w = monde(seed), t0 = Date.now(), res = chercher(w.observe, seed);
  return { seed, classe: w.verite.classe, niveaux: w.verite.niveaux, lam: w.verite.lam, texte: res?.texte ?? null, ...noter(w, res?.f ?? null), secs: (Date.now() - t0) / 1000 };
}

// moteur actuel, mode « données fournies »
export function moteurActuel(observe, seed) {
  const a = new Agent(null, { seed, data: observe }), h = a.run();
  if (!h) return null;
  return { texte: toString(h.expr, observe.names), f: (x) => evalAt(h.expr, x) };
}
import { evalPoint } from '../src/expr.js';
const evalAt = (e, x) => evalPoint(e, x);

export function rapport(rows, titre) {
  const pct = (a, b) => (b ? `${a}/${b} (${Math.round((100 * a) / b)} %)` : '—');
  const L = [`# ${titre}`, '', '| Classe | Mondes | Effet détectable | Bonnes lois parmi les détectables | Constantes | Lois non constantes fausses |', '|---|---:|---:|---:|---:|---:|'];
  for (const c of [...CLASSES, 'tout']) { const r = rows.filter((x) => c === 'tout' || x.classe === c), d = r.filter((x) => x.detectable); L.push(`| ${c} | ${r.length} | ${d.length} | ${pct(d.filter((x) => x.bonne).length, d.length)} | ${pct(r.filter((x) => x.constante).length, r.length)} | ${pct(r.filter((x) => !x.constante && !x.bonne).length, r.length)} |`); }
  const nul = rows.filter((x) => x.classe === 'sans effet');
  L.push('', `Mondes sans effet : ${nul.filter((x) => !x.constante).length} loi(s) non constante(s) sur ${nul.length}.`, `Temps moyen : ${(rows.reduce((s, x) => s + x.secs, 0) / rows.length).toFixed(1)} s par monde.`);
  return L.join('\n') + '\n';
}

if (process.argv[1]?.endsWith('comptages.js')) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const [a, b] = arg('--seeds', '1-20').split('-').map(Number);
  if (b > 200) { console.error('Graines de test refusées : exécution unique après le gel (PROTOCOLE_G2.md).'); process.exit(1); }
  const rows = [];
  for (let s = a; s <= b; s++) { rows.push(passer(s, moteurActuel)); process.stderr.write(`\r${s}`); }
  if (arg('--out')) writeFileSync(arg('--out'), JSON.stringify(rows));
  const md = rapport(rows, `Banc G2 — moteur actuel (gaussien), graines ${a} à ${b} (développement)`);
  if (arg('--md')) writeFileSync(arg('--md'), md);
  console.log('\n' + md);
}
