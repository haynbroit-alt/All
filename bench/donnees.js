#!/usr/bin/env node
// GALILÉE en mode « données fournies » sur le catalogue de lois : ancienne règle de verdict et règles de doute G4,
// sur les mêmes données et le même essai (le verdict se calcule après la recherche, qui n'en dépend pas).
// L'agent reçoit n points tirés au hasard dans le domaine, avec bruit, et ne peut faire aucune expérience.
// Usage : node bench/donnees.js [--seeds 1-5] [--n 20,40] [--noise 0.01,0.05] [--out fichier.json]
import { writeFileSync } from 'node:fs';
import { CATALOG, getWorld } from '../src/worlds.js';
import { Agent, verify, doutePassif, DOUTE_REGLES } from '../src/agent.js';
import { rng } from '../src/fit.js';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const [s0, s1] = arg('seeds', '1-5').split('-').map(Number), tailles = arg('n', '20,40').split(',').map(Number);
const bruits = arg('noise', '0.01,0.05').split(',').map(Number);
const out = { date: new Date().toISOString(), node: process.version, graines: [s0, s1], tailles, regles: DOUTE_REGLES, runs: [] };
for (const noise of bruits) for (const n of tailles) for (const spec of CATALOG) for (let seed = s0; seed <= s1; seed++) {
  const world = getWorld(spec.id, { seed, noise }), r = rng(seed * 7919 + n);
  const X = [], y = [];
  while (X.length < n) { const x = world.domain.map(([a, b]) => a + r() * (b - a)), v = world.measure(x); if (isFinite(v)) { X.push(x); y.push(v); } }
  const agent = new Agent(null, { seed, data: { names: world.names, target: world.target, X, y }, doute: 'toutes' });
  const best = agent.run(), v = verify(world, best.expr), b = agent.bilan;
  const verdicts = { ancien: b.verdictAncien };
  for (const R of DOUTE_REGLES) verdicts[R] = b.verdictAncien === 'empirique' && doutePassif(b.doute, R) ? 'incertaine' : b.verdictAncien;
  out.runs.push({ world: spec.id, noise, n, seed, found: best.text, inDomain: v.inDomain, extrapolation: v.extrapolation, recovered: v.recovered, sameForm: v.sameForm, verdict: b.verdictAncien, verdicts, signaux: b.doute });
}
out.resume = [];
for (const noise of bruits) for (const n of tailles) {
  const R = out.runs.filter((x) => x.noise === noise && x.n === n), faux = R.filter((x) => !x.sameForm), bons = R.filter((x) => x.sameForm);
  const s = { noise, n, essais: R.length, precises: R.filter((x) => x.recovered).length, bonne_forme: bons.length, formes_fausses: faux.length };
  for (const k of ['ancien', ...DOUTE_REGLES]) s[k] = { signalees: faux.filter((x) => x.verdicts[k] === 'incertaine').length,
    confiance_gardee: bons.filter((x) => x.verdicts[k] === 'empirique').length };
  out.resume.push(s);
}
if (arg('out')) writeFileSync(arg('out'), JSON.stringify(out, null, 1));
for (const s of out.resume) console.log(JSON.stringify(s));
