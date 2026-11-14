#!/usr/bin/env node
// Confirmation G1 (PROTOCOLE_G1.md) : le banc de bench/run.js sur les graines 6 à 10, exécution unique.
// Usage : node bench/g1-confirmation.js
import { writeFileSync } from 'node:fs';
import { CATALOG, getWorld } from '../src/worlds.js';
import { Agent, verify } from '../src/agent.js';

const GRAINES = [6, 7, 8, 9, 10], out = { date: new Date().toISOString(), node: process.version, graines: GRAINES, runs: [] };
for (const noise of [0.01, 0.05]) for (const spec of CATALOG) for (const mode of ['actif', 'aléatoire']) for (const seed of GRAINES) {
  const world = getWorld(spec.id, { seed, noise });
  const agent = new Agent(world, { seed, mode });
  const best = agent.run();
  const v = verify(world, best.expr);
  out.runs.push({ world: spec.id, noise, mode, seed, found: best.text, experiments: world.experiments, recovered: v.recovered, sameForm: v.sameForm, verdict: agent.bilan.verdict });
}
out.resume = [];
for (const noise of [0.01, 0.05]) for (const mode of ['actif', 'aléatoire']) {
  const R = out.runs.filter((r) => r.noise === noise && r.mode === mode), faux = R.filter((r) => !r.sameForm);
  out.resume.push({ noise, mode, n: R.length, precises: R.filter((r) => r.recovered).length, bonne_forme: R.length - faux.length,
    fausses_etablie: faux.filter((r) => r.verdict === 'établie').length, fausses_empirique: faux.filter((r) => r.verdict === 'empirique').length,
    fausses_incertaine: faux.filter((r) => r.verdict === 'incertaine').length, experiences: +(R.reduce((s, r) => s + r.experiments, 0) / R.length).toFixed(1) });
}
writeFileSync(new URL('./g1-confirmation.json', import.meta.url), JSON.stringify(out, null, 1));
for (const s of out.resume) console.log(JSON.stringify(s));
