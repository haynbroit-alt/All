# Protocole G5 (haynbroit-alt/All, PROTOCOLE_G5.md) : Operon jeu par jeu et Operon tous jeux réunis, sur les mondes exportés par bench/commun.js.
# Usage : <python avec pyoperon> commun-operon.py <sortie.json> <un ou plusieurs JSON de bench/commun.js> [--temps-jeu S] [--temps-reuni S] [--graines-operon N]
# Budget fixé au protocole (« Décisions ») : 2 s et une graine par petit jeu, 20 s et une graine pour les jeux réunis.
# Puis C2 : test des signes unilatéral à 5 %, loi commune (mesure principale, et variante avec bibliothèque si présente)
# contre Operon jeu par jeu et contre Operon réuni ; une erreur absente (null) compte comme infinie, pour tous.
# Erreur : moyenne des carrés sur les points mis de côté du jeu, divisée par la variance des y vus du jeu, comme bench/commun.js.
import json, sys, time, warnings
warnings.filterwarnings('ignore')
import numpy as np
from pyoperon.sklearn import SymbolicRegressor as Operon

opt = lambda n, d: type(d)(sys.argv[sys.argv.index(n) + 1]) if n in sys.argv else d
SEUL_NORM = '--seulement-normalise' in sys.argv   # n'ajuste que « Operon réuni normalisé » (protocole, jeux réels)
T_JEU, T_REUNI, NG = opt('--temps-jeu', 2), opt('--temps-reuni', 20), opt('--graines-operon', 1)   # entiers : pyoperon refuse un temps non entier
SYMBOLES = 'add,sub,mul,div,exp,log,sqrt,sin,cos,pow,constant,variable'
def var(y): y = np.asarray(y, float); return float(np.mean((y - y.mean()) ** 2)) if len(y) > 1 else 0.0
def erreur(yp, yt, v):
    yp, yt = np.asarray(yp, float), np.asarray(yt, float)
    if not np.all(np.isfinite(yp)) or v <= 0: return None
    return float(np.mean((yp - yt) ** 2) / v)
def ajuster(X, y, t, g):
    m = Operon(random_state=g, max_time=t, allowed_symbols=SYMBOLES, optimizer_iterations=10, max_length=15); m.fit(X, y); return m
def mediane(v): ok = sorted(x for x in v if x is not None); return ok[len(ok) // 2] if len(ok) == len(v) and ok else None

fichiers = [a for a in sys.argv[2:] if a.endswith('.json')]
MONDES = [m for f in fichiers for m in json.load(open(f))['mondes']]; sortie = []
for m in MONDES:
    if m['type'] not in ('commun', 'reel'): continue   # C2 : mondes à loi commune et jeux réels
    t0, J = time.time(), m['jeux']
    # jeu par jeu
    par = []
    for j in ([] if SEUL_NORM else J):
        X, y, Xt, yt = np.array(j['vus']['x'], float).reshape(-1, 1), np.array(j['vus']['y'], float), np.array(j['cotes']['x'], float).reshape(-1, 1), np.array(j['cotes']['y'], float)
        es = []
        for g in range(1, NG + 1):
            try: es.append(erreur(ajuster(X, y, T_JEU, g).predict(Xt), yt, var(y)))
            except Exception as ex: es.append(None); print("panne jeu", repr(ex)[:200], file=sys.stderr)
        par.append(mediane(es))
    # tous jeux réunis (une seule variable x, comme GALILÉE réuni)
    Xa = np.concatenate([np.array(j['vus']['x'], float) for j in J]).reshape(-1, 1); ya = np.concatenate([np.array(j['vus']['y'], float) for j in J])
    reuni = []
    for g in ([] if SEUL_NORM else range(1, NG + 1)):
        try:
            mod = ajuster(Xa, ya, T_REUNI, g)
            reuni.append([erreur(mod.predict(np.array(j['cotes']['x'], float).reshape(-1, 1)), j['cotes']['y'], var(j['vus']['y'])) for j in J])
        except Exception as ex: reuni.append([None] * len(J)); print("panne réuni", repr(ex)[:200], file=sys.stderr)
    re = [mediane([r[k] for r in reuni]) for k in range(len(J))] if reuni else [None] * len(J)
    # réunis normalisés : y vus de chaque jeu divisés par leur moyenne, une formule, prédiction remultipliée
    moyennes = [float(np.mean(j['vus']['y'])) or 1.0 for j in J]
    yn = np.concatenate([np.array(j['vus']['y'], float) / moyennes[k] for k, j in enumerate(J)])
    try:
        mn = ajuster(Xa, yn, T_REUNI, 1)
        nor = [erreur(np.asarray(mn.predict(np.array(j['cotes']['x'], float).reshape(-1, 1))) * moyennes[k], j['cotes']['y'], var(j['vus']['y'])) for k, j in enumerate(J)]
    except Exception as ex: nor = [None] * len(J); print("panne normalisé", repr(ex)[:200], file=sys.stderr)
    moy = lambda v: (float(np.mean(v)) if all(x is not None for x in v) else None)
    sortie.append({'graine': m['graine'], 'type': m['type'], **({} if SEUL_NORM else {'operonParJeu': {'moyenne': moy(par), 'parJeu': par}, 'operonReuni': {'moyenne': moy(re), 'parJeu': re}}), 'operonReuniNormalise': {'moyenne': moy(nor), 'parJeu': nor}, 'secs': round(time.time() - t0, 1)})
    print(m['graine'], m['type'], 'K', len(J), '| operon par jeu', None if not par or moy(par) is None else round(moy(par), 3), '| réuni', None if moy(re) is None else round(moy(re), 3), '| normalisé', None if moy(nor) is None else round(moy(nor), 3), '| commun', m['erreurs']['commun']['moyenne'], '|', sortie[-1]['secs'], 's', flush=True)
from math import comb, inf
val = lambda x: inf if x is None else x
def signes(a, b):
    v = sum(1 for x, y in zip(a, b) if val(x) < val(y)); d = sum(1 for x, y in zip(a, b) if val(x) > val(y)); n = v + d
    p = sum(comb(n, k) for k in range(v, n + 1)) / 2 ** n if n else 1.0
    return {'victoires': v, 'defaites': d, 'p': p, 'tenu': n > 0 and p < 0.05}
par_graine = {(m['graine'], m['type']): m for m in MONDES}
C = sortie
C2 = {}
for nom, lire in [('principale', lambda m: m['erreurs']['commun']['moyenne']), ('bibliotheque', lambda m: (m.get('bibliotheque') or {}).get('erreur', {}).get('moyenne'))]:
    if nom == 'bibliotheque' and not all('bibliotheque' in par_graine[(o['graine'], o['type'])] for o in C): continue
    a = [lire(par_graine[(o['graine'], o['type'])]) for o in C]
    r = {} if SEUL_NORM else {'contreOperonParJeu': signes(a, [o['operonParJeu']['moyenne'] for o in C]), 'contreOperonReuni': signes(a, [o['operonReuni']['moyenne'] for o in C])}
    if not SEUL_NORM: r['tenu'] = r['contreOperonParJeu']['tenu'] and r['contreOperonReuni']['tenu']
    r['contreOperonReuniNormalise'] = signes(a, [o['operonReuniNormalise']['moyenne'] for o in C]); C2[nom] = r
print(json.dumps(C2, indent=1))
json.dump({'protocole': 'PROTOCOLE_G5.md', 'pyoperon': '0.6.2', 'temps_jeu': T_JEU, 'temps_reuni': T_REUNI, 'graines_operon': NG, 'C2': C2, 'mondes': sortie}, open(sys.argv[1], 'w'), indent=1)
