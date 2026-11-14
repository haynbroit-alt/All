// THEORIE_B1.md, cinquième tour : la part de multiples de 3 est-elle une constante ?
//  A) limite théorique : chaîne sur la valuation 3-adique quand le reste de m est parfaitement mélangé
//  B) modèle à mémoire modulo 9, évalué sur des entiers de taille choisie (fenêtre [X, 2X])
import { writeFileSync } from 'node:fs';
const LIMP = 2000000, crible = new Uint8Array(LIMP + 1), pr = [];
for (let i = 2; i <= LIMP; i++) if (!crible[i]) { pr.push(i); for (let j = i * i; j <= LIMP; j += i) crible[j] = 1; }
function d(a) { let r = 1; for (let k = 0; k < pr.length; k++) { const p = pr[k]; if (p * p > a) break; if (a % p === 0) { let e = 0; while (a % p === 0) { a /= p; e++; } r *= e + 1; } } return a > 1 ? r * 2 : r; }
const hasard = (g) => () => { g |= 0; g = (g + 0x6D2B79F5) | 0; let x = Math.imul(g ^ (g >>> 15), 1 | g); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const v3 = (n) => { let e = 0; while (n % 3 === 0) { n /= 3; e++; } return e; };

// A) loi limite de g = v3(d(u)), u premier à 6 : produit sur p ≥ 5 de Σ_k (1 − 1/p) p^-k z^v3(k+1)
export function limite(G = 8, E = 40) {
  let q = new Float64Array(G + 1); q[0] = 1;
  for (const p of pr) { if (p < 5) continue; const f = new Float64Array(G + 1); let w = 1 - 1 / p; for (let k = 0; k < 60 && w > 1e-18; k++) { f[Math.min(G, v3(k + 1))] += w; w /= p; }
    const s = f.reduce((a, b) => a + b, 0); const n = new Float64Array(G + 1); for (let a = 0; a <= G; a++) if (q[a]) for (let b = 0; a + b <= G; b++) n[a + b] += q[a] * f[b] / s; q = n; }
  const P = Array.from({ length: E + 1 }, () => new Float64Array(E + 1));
  for (let e = 0; e <= E; e++) for (let g = 0; g <= G; g++) { const f = v3(e + 1) + g, w = q[g]; if (!w) continue;
    if (f > e) P[e][e] += w; else if (f < e) P[e][f] += w; else { P[e][e] += w / 2; let r = w / 2 * (2 / 3); for (let j = 1; e + j <= E; j++) { P[e][e + j] += e + j === E ? r * 1.5 : r; r /= 3; } } }
  let v = new Float64Array(E + 1).fill(1 / (E + 1));
  for (let it = 0; it < 5000; it++) { const w = new Float64Array(E + 1); for (let a = 0; a <= E; a++) for (let b = 0; b <= E; b++) w[b] += v[a] * P[a][b]; v = w; }
  return { q: [...q.slice(0, 4)], part: 1 - v[0], pi: [...v.slice(0, 4)] };
}
// B) modèle à mémoire modulo 3^j sur la fenêtre [X, 2X]
export function modele(K, j, X, n = 40000) {
  // tirage au hasard dans la fenêtre : un pas régulier enfermerait m dans une seule classe modulo ses facteurs
  const M = 3 ** j, P = Array.from({ length: M }, () => new Float64Array(M)), W = Math.floor(X / (2 * M)), alea = hasard(12345 + j);
  for (let r = 0; r < M; r++) { const base = X - (X % (2 * M)) + r + (r % 2 === 0 ? M : 0); let k = 0;
    while (k < n) { const m = base + 2 * M * Math.floor(alea() * W), s = Math.round(Math.sqrt(m)); if (s * s === m) continue; P[r][(m + K * d(m)) % M]++; k++; }
    for (let c = 0; c < M; c++) P[r][c] /= k; }
  let v = new Float64Array(M).fill(1 / M);
  for (let it = 0; it < 600; it++) { const w = new Float64Array(M); for (let a = 0; a < M; a++) { const va = v[a]; if (va) for (let b = 0; b < M; b++) w[b] += va * P[a][b]; } v = w; }
  let p3 = 0; for (let r = 0; r < M; r += 3) p3 += v[r]; return p3;
}
// distribution de d(u) modulo 9 parmi les u premiers à 6 dont d(u) n'est pas multiple de 3, sur [X, 2X]
export function unites(X, n = 200000) { const c = new Float64Array(9), alea = hasard(777); let k = 0; while (k < n) { const u = X + 2 * Math.floor(alea() * X / 2) + 1 - (X % 2); if (u % 3 === 0) continue; const t = d(u); if (t % 3 === 0) continue; c[t % 9]++; k++; } return [1, 2, 4, 5, 7, 8].map((r) => c[r] / k); }
if (process.argv[2] === 'prevoir') { const K = Number(process.argv[3]), X = Number(process.argv[4]); console.log(`k=${K}, m dans [${X}, ${2 * X}] : modulo 9 → ${modele(K, 2, X, 60000).toFixed(4)} ; modulo 27 → ${modele(K, 3, X, 30000).toFixed(4)}`); }
else if (process.argv[2] === 'suite') { // suite a → a + k·d(a), départ 1 : part des moitiés multiples de 3 dans la classe piège, rangs 10^6 à 10^7
  const K = Number(process.argv[3]); let a = 1, n = 0, n3 = 0, tot = 0, sln = 0;
  for (let i = 1; i <= 1e7; i++) { if (i >= 1e6) { tot++; if (a % 4 === 2) { n++; sln += Math.log(a); if ((a / 2) % 3 === 0) n3++; } } a += K * d(a); }
  const r = { k: K, part_multiples_de_3: n3 / n, part_classe_piege: n / tot, ln_a_moyen: sln / n, dernier_terme: a }; console.log(JSON.stringify(r)); writeFileSync(new URL(`./b1-suite-k${K}.json`, import.meta.url), JSON.stringify(r, null, 1) + '\n'); }
else if (import.meta.url === `file://${process.argv[1]}`) {
  const L = limite(); console.log('A) limite : loi de g', L.q.map((x) => x.toFixed(6)).join(' '), '| équilibre', L.pi.map((x) => x.toFixed(6)).join(' '), '| part des multiples de 3 =', L.part.toFixed(6));
  const res = { limite: L, tailles: [] };
  for (const X of [2e5, 2e6, 1e7, 3e7, 1e8, 1e9, 1e10]) { const r = { X, ln_a: Math.log(2 * X * 1.5), mod9: modele(1, 2, X, 60000), mod27: modele(1, 3, X, 30000), unites: unites(X) }; res.tailles.push(r);
    console.log(`B) m dans [${X}, ${2 * X}] (ln a ≈ ${r.ln_a.toFixed(1)}) : modulo 9 → ${r.mod9.toFixed(4)} ; modulo 27 → ${r.mod27.toFixed(4)} | d(u) mod 9 sur 1,2,4,5,7,8 : ${r.unites.map((x) => x.toFixed(3)).join(' ')}`); }
  writeFileSync(new URL('./b1-limite.json', import.meta.url), JSON.stringify(res, null, 1) + '\n');
}
