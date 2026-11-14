#!/usr/bin/env node
// Mesure de référence : GALILÉE en mode « données fournies » sur le catalogue de lois. Le moteur n'est pas modifié.
// L'agent reçoit n points tirés au hasard dans le domaine, avec bruit, et ne peut faire aucune expérience.
// Usage : node bench/donnees.js [--seeds 1-5] [--n 20,40] [--out fichier.json]
import { writeFileSync } from 'node:fs';
import { CATALOG, getWorld } from '../src/worlds.js';
import { Agent, verify } from '../src/agent.js';
import { rng } from '../src/fit.js';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const [s0, s1] = arg('seeds', '1-5').split('-').map(Number), tailles = arg('n', '20,40').split(',').map(Number);
const out = { date: new Date().toISOString(), node: process.version, graines: [s0, s1], tailles, runs: [] };
for (const noise of [0.01, 0.05]) for (const n of tailles) for (const spec of CATALOG) for (let seed = s0; seed <= s1; seed++) {
  const world = getWorld(spec.id, { seed, noise }), r = rng(seed * 7919 + n);
  const X = [], y = [];
  while (X.length < n) { const x = world.domain.map(([a, b]) => a + r() * (b - a)), v = world.measure(x); if (isFinite(v)) { X.push(x); y.push(v); } }
  const agent = new Agent(null, { seed, data: { names: world.names, target: world.target, X, y } });
  const best = agent.run(), v = verify(world, best.expr);
  out.runs.push({ world: spec.id, noise, n, seed, found: best.text, inDomain: v.inDomain, extrapolation: v.extrapolation, recovered: v.recovered, sameForm: v.sameForm, verdict: agent.bilan.verdict });
}
out.resume = [];
for (const noise of [0.01, 0.05]) for (const n of tailles) {
  const R = out.runs.filter((x) => x.noise === noise && x.n === n), faux = R.filter((x) => !x.sameForm), emp = R.filter((x) => x.verdict === 'empirique');
  out.resume.push({ noise, n, essais: R.length, precises: R.filter((x) => x.recovered).length, bonne_forme: R.length - faux.length,
    justes_dans_le_domaine: R.filter((x) => x.inDomain < 0.005).length, dites_empirique: emp.length, empirique_et_fausse: emp.filter((x) => !x.sameForm).length,
    incertaine_et_bonne: R.filter((x) => x.verdict === 'incertaine' && x.sameForm).length });
}
if (arg('out')) writeFileSync(arg('out'), JSON.stringify(out, null, 1));
for (const s of out.resume) console.log(JSON.stringify(s));
