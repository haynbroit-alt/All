// THEORIE_B1.md, deuxième tour : calcul unique de R1 à R5.
import { writeFileSync } from 'node:fs';
const G = 0.5772156649015329;
const pr = []; { const c = new Uint8Array(40001); for (let i = 2; i <= 40000; i++) if (!c[i]) { pr.push(i); for (let j = i * i; j <= 40000; j += i) c[j] = 1; } }
function d(a) { let r = 1; for (let k = 0; k < pr.length; k++) { const p = pr[k]; if (p * p > a) break; if (a % p === 0) { let e = 0; while (a % p === 0) { a /= p; e++; } r *= e + 1; } } return a > 1 ? r * 2 : r; }
// suite principale jusqu'à 3·10^7 ; ajustement sur les rangs 10^4 à 10^7 (classe piège) ; mesures sur 10^7 à 3·10^7
let a = 1, n1 = 0, sx = 0, sy = 0, sxx = 0, sxy = 0, a7 = 0, c2 = 0, c1 = 0, tot = 0, m3 = 0;
const principale = new Set();                       // termes de rang ≤ 10^6, pour la confluence
for (let n = 1; n <= 3e7; n++) {
  const pas = d(a);
  if (n <= 1e6) principale.add(a);
  if (n >= 1e4 && n < 1e7 && a % 4 === 2) { const x = Math.log(a); n1++; sx += x; sy += pas; sxx += x * x; sxy += x * pas; }
  if (n === 1e7) a7 = a;
  if (n >= 1e7) { tot++; if (a % 4 === 2) { c2++; if ((a / 2) % 3 === 0) m3++; } else if (a % 2 === 1) c1++; }
  if (n < 3e7) a += pas;
}
const kappa = (n1 * sxy - sx * sy) / (n1 * sxx - sx * sx), c = (sy - kappa * sx) / n1;
const integre = (k, c0) => { let x = a7; for (let n = 1e7; n < 3e7; n++) x += k * Math.log(x) + c0; return x; };
const revisee = integre(kappa, c), ancienne = integre(1, 2 * G + Math.LN2);
// autres départs
const departs = [3, 5, 6, 10, 11, 13, 100, 1001].map((s) => {
  let x = s, rejoint = null, k2 = 0, k = 0;
  for (let n = 1; n <= 1e6; n++) { if (rejoint == null && principale.has(x)) rejoint = n; if (n >= 1e5) { k++; if (x % 4 === 2) k2++; } x += d(x); }
  return { depart: s, rejoint_au_rang: rejoint, part_2_mod_4: k2 / k };
});
const r = { kappa, c, points_ajustement: n1, terme_1e7: a7, terme_3e7: a, prediction_revisee: revisee, erreur_revisee: Math.abs(revisee - a) / a, prediction_ancienne: ancienne, erreur_ancienne: Math.abs(ancienne - a) / a,
  part_m_multiple_de_3: m3 / c2, part_2_mod_4: c2 / tot, termes_impairs: c1, departs };
console.log(JSON.stringify(r, null, 1));
writeFileSync(new URL('./b1-tour2.json', import.meta.url), JSON.stringify(r, null, 1) + '\n');
