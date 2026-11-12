#!/usr/bin/env node
// Banc d'essai : chaque loi du catalogue × plusieurs graines × deux stratégies d'expérience.
// Usage : node bench/run.js [--seeds 5] [--noise 0.01] [--quick]
import { writeFileSync } from 'node:fs';
import { CATALOG, getWorld } from '../src/worlds.js';
import { Agent, verify } from '../src/agent.js';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const quick = process.argv.includes('--quick');
const seeds = Number(arg('seeds', quick ? 2 : 5));
const noises = arg('noise', quick ? '0.01' : '0.01,0.05').split(',').map(Number);
const modes = ['actif', 'aléatoire'];
const out = { date: new Date().toISOString(), node: process.version, seeds, noises, runs: [] };

for (const noise of noises) for (const spec of CATALOG) for (const mode of modes) for (let seed = 1; seed <= seeds; seed++) {
  const world = getWorld(spec.id, { seed, noise });
  const t0 = Date.now();
  const agent = new Agent(world, { seed, mode });
  const best = agent.run();
  const v = verify(world, best.expr);
  out.runs.push({ world: spec.id, truth: spec.formula, noise, mode, seed, found: best.text, experiments: world.experiments,
    cycles: agent.cycle, ms: Date.now() - t0, inDomain: v.inDomain, extrapolation: v.extrapolation, recovered: v.recovered,
    stopped: agent.exhausted ? 'budget' : 'convaincu' });
}

const pct = (a) => (a.length ? Math.round((100 * a.filter((r) => r.recovered).length) / a.length) : 0);
const mean = (a, f) => (a.length ? a.reduce((s, r) => s + f(r), 0) / a.length : 0);
let md = `# Résultats du banc d'essai\n\nGénéré par \`node bench/run.js\` le ${out.date.slice(0, 10)} (Node ${out.node}), ${seeds} graines par configuration.\n\n`;
md += `Une loi compte comme **retrouvée** si, sur 2000 points neufs, l'erreur normalisée est < 0,5 % dans le domaine **et** < 1 % en extrapolation (domaine élargi de 50 %).\n\n`;
out.summary = [];
for (const noise of noises) {
  md += `## Bruit de mesure : ${noise * 100} % de l'amplitude\n\n| Loi cachée | Vérité | Actif : retrouvée | exp. | Aléatoire : retrouvée | exp. |\n|---|---|---:|---:|---:|---:|\n`;
  for (const spec of CATALOG) {
    const sel = (mode) => out.runs.filter((r) => r.world === spec.id && r.noise === noise && r.mode === mode);
    const a = sel('actif'), b = sel('aléatoire');
    md += `| ${spec.title} | \`${spec.formula}\` | ${a.filter((r) => r.recovered).length}/${a.length} | ${mean(a, (r) => r.experiments).toFixed(0)} | ${b.filter((r) => r.recovered).length}/${b.length} | ${mean(b, (r) => r.experiments).toFixed(0)} |\n`;
  }
  for (const mode of modes) {
    const all = out.runs.filter((r) => r.noise === noise && r.mode === mode);
    const s = { noise, mode, recovered: pct(all), runs: all.length, experiments: mean(all, (r) => r.experiments), seconds: mean(all, (r) => r.ms) / 1000,
      falseCertainty: all.filter((r) => !r.recovered && r.stopped === 'convaincu').length };
    out.summary.push(s);
  }
  const [sa, sb] = out.summary.slice(-2);
  md += `| **Total** | | **${sa.recovered} %** | ${sa.experiments.toFixed(0)} | **${sb.recovered} %** | ${sb.experiments.toFixed(0)} |\n\n`;
  md += `Durée moyenne par découverte : ${sa.seconds.toFixed(1)} s. Arrêts « convaincu » sur une loi fausse : ${sa.falseCertainty} (actif), ${sb.falseCertainty} (aléatoire).\n\n`;
  const fails = out.runs.filter((r) => r.noise === noise && !r.recovered);
  if (fails.length) {
    md += `<details><summary>Échecs (${fails.length})</summary>\n\n| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Arrêt |\n|---|---|---:|---|---:|---:|---|\n`;
    for (const r of fails) md += `| ${r.world} | ${r.mode} | ${r.seed} | \`${r.found}\` | ${(r.inDomain * 100).toFixed(2)} % | ${(r.extrapolation * 100).toFixed(2)} % | ${r.stopped} |\n`;
    md += `\n</details>\n\n`;
  }
}
if (!quick) { writeFileSync(new URL('./results.json', import.meta.url), JSON.stringify(out, null, 1)); writeFileSync(new URL('./RESULTS.md', import.meta.url), md); }
console.log(md);
