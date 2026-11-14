// THEORIE_B1.md, troisième tour : R6, confluence de seize suites parties de 10^8 + 1 … 10^8 + 16.
import { writeFileSync } from 'node:fs';
const pr = []; { const c = new Uint8Array(40001); for (let i = 2; i <= 40000; i++) if (!c[i]) { pr.push(i); for (let j = i * i; j <= 40000; j += i) c[j] = 1; } }
function d(a) { let r = 1; for (let k = 0; k < pr.length; k++) { const p = pr[k]; if (p * p > a) break; if (a % p === 0) { let e = 0; while (a % p === 0) { a /= p; e++; } r *= e + 1; } } return a > 1 ? r * 2 : r; }
// chaque suite vivante : valeur courante, pas faits, départs qu'elle porte. On avance toujours la plus petite ;
// deux suites de même valeur n'en font plus qu'une.
let S = Array.from({ length: 16 }, (_, i) => ({ v: 1e8 + 1 + i, pas: 0, departs: [1e8 + 1 + i] }));
const fusions = [], LIM = 500000;
while (S.length > 1 && S.some((s) => s.pas < LIM)) {
  let i = -1; for (let k = 0; k < S.length; k++) if (S[k].pas < LIM && (i < 0 || S[k].v < S[i].v)) i = k;
  const s = S[i]; s.v += d(s.v); s.pas++;
  const j = S.findIndex((t, k) => k !== i && t.v === s.v);
  if (j >= 0) { fusions.push({ valeur: s.v, pas: Math.max(s.pas, S[j].pas), restantes: S.length - 1 }); S[j].departs.push(...s.departs); S[j].pas = Math.max(s.pas, S[j].pas); S.splice(i, 1); }
}
const r = { departs: 16, limite_pas: LIM, suites_distinctes_a_la_fin: S.length, plus_grand_groupe: Math.max(...S.map((s) => s.departs.length)), fusions, groupes: S.map((s) => ({ departs: s.departs.map((x) => x - 1e8), valeur: s.v, classe: s.v % 2 ? 'impair' : s.v % 4 === 2 ? '2 mod 4' : '0 mod 4' })) };
console.log(JSON.stringify(r));
writeFileSync(new URL('./b1-tour3.json', import.meta.url), JSON.stringify(r, null, 1) + '\n');
