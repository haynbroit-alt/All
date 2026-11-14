// THEORIE_B1.md, quatrième tour. Modèle sans paramètre : chaîne de Markov sur le résidu de m modulo 3^j, le reste
// de m étant quelconque. Usage :
//   node bench/b1-tour4.js modele <k> [j]     prédiction seule (ne calcule pas la suite)
//   node bench/b1-tour4.js test               les quatre suites sœurs a → a + k·d(a), k = 5, 7, 11, 13
import { writeFileSync } from 'node:fs';
const pr = []; { const c = new Uint8Array(70001); for (let i = 2; i <= 70000; i++) if (!c[i]) { pr.push(i); for (let j = i * i; j <= 70000; j += i) c[j] = 1; } }
function d(a) { let r = 1; for (let k = 0; k < pr.length; k++) { const p = pr[k]; if (p * p > a) break; if (a % p === 0) { let e = 0; while (a % p === 0) { a /= p; e++; } r *= e + 1; } } return a > 1 ? r * 2 : r; }
export function predire(K, j, n = 60000, X = 1e8) {
  const M = 3 ** j, P = Array.from({ length: M }, () => new Float64Array(M));
  for (let r = 0; r < M; r++) { let m = X - (X % (2 * M)) + r + (r % 2 === 0 ? M : 0), k = 0;       // m ≡ r (mod M), impair
    while (k < n) { m += 2 * M * 1009; const s = Math.round(Math.sqrt(m)); if (s * s === m) continue; P[r][(m + K * d(m)) % M]++; k++; }
    for (let c = 0; c < M; c++) P[r][c] /= n; }
  let v = new Float64Array(M).fill(1 / M);
  for (let it = 0; it < 400; it++) { const w = new Float64Array(M); for (let a = 0; a < M; a++) { const va = v[a]; if (va) for (let b = 0; b < M; b++) w[b] += va * P[a][b]; } v = w; }
  let p3 = 0; for (let r = 0; r < M; r += 3) p3 += v[r]; return p3;
}
export function suite(K, N = 1e7, N0 = 1e6) {
  let a = 1, n = 0, n3 = 0, tot = 0;
  for (let i = 1; i <= N; i++) { if (i >= N0) { tot++; if (a % 4 === 2) { n++; if ((a / 2) % 3 === 0) n3++; } } a += K * d(a); }
  return { k: K, part_multiples_de_3: n3 / n, part_classe_piege: n / tot, termes: n, dernier_terme: a };
}
if (process.argv[2] === 'modele') { const K = Number(process.argv[3]); for (let j = 1; j <= Number(process.argv[4] || 3); j++) console.log(`k=${K} modulo 3^${j} : ${predire(K, j, j >= 4 ? 15000 : 60000).toFixed(4)}`); }
else if (process.argv[2] === 'test') {
  const res = [5, 7, 11, 13].map((k) => { const s = suite(k); console.log(JSON.stringify(s)); return s; });
  writeFileSync(new URL('./b1-tour4.json', import.meta.url), JSON.stringify(res, null, 1) + '\n');
}
