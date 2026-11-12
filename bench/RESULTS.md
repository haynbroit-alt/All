# Résultats du banc d'essai

Généré par `node bench/run.js` le 2026-11-12 (Node v22.23.4), 5 graines par configuration.

Deux critères, tous deux jugés sans que l'agent y ait accès. **Précise** : sur 2000 points neufs, erreur normalisée < 0,5 % dans le domaine et < 1 % en extrapolation. **Bonne forme** : après réajustement des constantes sur la vérité sans bruit, l'erreur tombe sous 0,1 % (la structure est la bonne, même si le bruit a faussé une constante).

## Bruit de mesure : 1 % de l'amplitude

| Loi cachée | Vérité | Agent : précise | bonne forme | exp. | Hasard : précise | bonne forme | exp. |
|---|---|---:|---:|---:|---:|---:|---:|
| Pendule simple | `2*pi*sqrt(L/g)` | 5/5 | 5/5 | 26 | 5/5 | 5/5 | 26 |
| Gravitation universelle | `m1*m2/r^2` | 5/5 | 5/5 | 32 | 5/5 | 5/5 | 37 |
| Gaz parfait | `8.314*n*T/V` | 5/5 | 5/5 | 36 | 5/5 | 5/5 | 40 |
| Lentille mince | `a*b/(a+b)` | 4/5 | 4/5 | 31 | 5/5 | 5/5 | 30 |
| Facteur de Lorentz | `1/sqrt(1-v^2)` | 5/5 | 5/5 | 30 | 1/5 | 1/5 | 42 |
| Charge d’un condensateur | `5*(1-exp(-t/2))` | 5/5 | 5/5 | 22 | 5/5 | 5/5 | 20 |
| Michaelis–Menten | `3*S/(S+0.8)` | 5/5 | 5/5 | 23 | 4/5 | 4/5 | 27 |
| Loi d’Arrhenius | `50*exp(-8/T)` | 4/5 | 5/5 | 21 | 5/5 | 5/5 | 21 |
| Oscillateur harmonique | `2*cos(3*t)` | 5/5 | 5/5 | 20 | 5/5 | 5/5 | 20 |
| Oscillateur amorti | `exp(-t/2)*cos(3*t)` | 5/5 | 5/5 | 25 | 5/5 | 5/5 | 30 |
| Capteur qui sature | `x/(1+x/40)` | 4/5 | 5/5 | 40 | 0/5 | 0/5 | 33 |
| Chute libre | `v*t-4.905*t^2` | 5/5 | 5/5 | 45 | 5/5 | 5/5 | 29 |
| Énergie cinétique | `m*v^2/2` | 5/5 | 5/5 | 26 | 5/5 | 5/5 | 25 |
| Potentiel de Yukawa | `exp(-r)/r` | 5/5 | 5/5 | 23 | 5/5 | 5/5 | 28 |
| Rayonnement du corps noir | `5.67*A*T^4` | 5/5 | 5/5 | 33 | 5/5 | 5/5 | 28 |
| **Total** | | **96 %** | **99 %** | 29 | **87 %** | **87 %** | 29 |

Durée moyenne par découverte : 1.4 s. Arrêts « convaincu » sur une forme fausse : 1 (actif), 9 (aléatoire).

<details><summary>Formes fausses (11)</summary>

| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Arrêt |
|---|---|---:|---|---:|---:|---|
| lentille | actif | 5 | `(0.2207·(0.8126 − (b + a)^(1/3)) + b^0.1125·a^0.1123)^7` | 0.57 % | 1.50 % | convaincu |
| relativite | aléatoire | 1 | `exp(0.525 / (1 / v^2 − 2·v / 3))` | 3.93 % | 4.16 % | convaincu |
| relativite | aléatoire | 2 | `0.3369·exp(5·v^9.66 / 2) + 2·exp(v^2.283) / 3` | 0.70 % | 0.71 % | budget |
| relativite | aléatoire | 4 | `0.7823·((v^35.25 + v)^(4/3) + v^8)^(7/4) + 1` | 0.65 % | 0.65 % | convaincu |
| relativite | aléatoire | 5 | `1 / cos(1.613·v)^0.3965` | 9.73 % | 10.23 % | convaincu |
| enzyme | aléatoire | 3 | `(exp(−1 / (S^(2/3) + S)) + 0.6526)^2.217` | 3.04 % | 2.65 % | convaincu |
| saturation | aléatoire | 1 | `x·exp(−0.02527·x)` | 0.25 % | 9.57 % | convaincu |
| saturation | aléatoire | 2 | `4·sin(0.2471·x)` | 0.47 % | 204.33 % | convaincu |
| saturation | aléatoire | 3 | `x − 0.02799·x^(7/4)` | 0.44 % | 14.43 % | convaincu |
| saturation | aléatoire | 4 | `9·sin(0.218·x) / 2` | 0.50 % | 173.69 % | convaincu |
| saturation | aléatoire | 5 | `4·sin(0.2467·x)` | 0.49 % | 203.93 % | convaincu |

</details>

## Bruit de mesure : 5 % de l'amplitude

| Loi cachée | Vérité | Agent : précise | bonne forme | exp. | Hasard : précise | bonne forme | exp. |
|---|---|---:|---:|---:|---:|---:|---:|
| Pendule simple | `2*pi*sqrt(L/g)` | 5/5 | 5/5 | 25 | 5/5 | 5/5 | 28 |
| Gravitation universelle | `m1*m2/r^2` | 5/5 | 5/5 | 32 | 5/5 | 5/5 | 37 |
| Gaz parfait | `8.314*n*T/V` | 3/5 | 5/5 | 38 | 1/5 | 5/5 | 54 |
| Lentille mince | `a*b/(a+b)` | 4/5 | 4/5 | 37 | 5/5 | 5/5 | 34 |
| Facteur de Lorentz | `1/sqrt(1-v^2)` | 1/5 | 1/5 | 32 | 1/5 | 1/5 | 38 |
| Charge d’un condensateur | `5*(1-exp(-t/2))` | 5/5 | 5/5 | 22 | 5/5 | 5/5 | 22 |
| Michaelis–Menten | `3*S/(S+0.8)` | 0/5 | 5/5 | 27 | 1/5 | 5/5 | 33 |
| Loi d’Arrhenius | `50*exp(-8/T)` | 2/5 | 5/5 | 29 | 1/5 | 5/5 | 30 |
| Oscillateur harmonique | `2*cos(3*t)` | 5/5 | 5/5 | 20 | 5/5 | 5/5 | 20 |
| Oscillateur amorti | `exp(-t/2)*cos(3*t)` | 5/5 | 5/5 | 25 | 4/5 | 4/5 | 34 |
| Capteur qui sature | `x/(1+x/40)` | 1/5 | 1/5 | 34 | 0/5 | 0/5 | 29 |
| Chute libre | `v*t-4.905*t^2` | 3/5 | 5/5 | 48 | 0/5 | 5/5 | 41 |
| Énergie cinétique | `m*v^2/2` | 5/5 | 5/5 | 27 | 5/5 | 5/5 | 25 |
| Potentiel de Yukawa | `exp(-r)/r` | 5/5 | 5/5 | 24 | 4/5 | 4/5 | 30 |
| Rayonnement du corps noir | `5.67*A*T^4` | 4/5 | 5/5 | 39 | 1/5 | 5/5 | 41 |
| **Total** | | **71 %** | **88 %** | 31 | **57 %** | **85 %** | 33 |

Durée moyenne par découverte : 1.4 s. Arrêts « convaincu » sur une forme fausse : 9 (actif), 11 (aléatoire).

<details><summary>Formes fausses (20)</summary>

| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Arrêt |
|---|---|---:|---|---:|---:|---|
| lentille | actif | 2 | `(sin((b^0.1956 − a^(1/3) / 4)^2.411))·a^(3/4)` | 4.40 % | 8.08 % | convaincu |
| relativite | actif | 1 | `exp(7·v^19 / 4) + (0.3714·v + 2/3)^12` | 1.63 % | 1.61 % | convaincu |
| relativite | actif | 2 | `exp(5·v^13 / 3) + v^(5/2)` | 3.77 % | 3.86 % | convaincu |
| relativite | actif | 4 | `v^2.73 + exp(π·v^12 / 2)` | 1.91 % | 1.89 % | convaincu |
| relativite | actif | 5 | `exp(v^3 + v^22.86)` | 3.58 % | 3.52 % | convaincu |
| relativite | aléatoire | 1 | `v^2.708 + exp(3·v^12 / 2)` | 2.47 % | 2.52 % | convaincu |
| relativite | aléatoire | 2 | `exp(5·v^13 / 3) + v^(5/2)` | 3.77 % | 3.86 % | convaincu |
| relativite | aléatoire | 4 | `exp((v + v^29.58)^3)` | 34.05 % | 35.92 % | convaincu |
| relativite | aléatoire | 5 | `exp(v^3)` | 26.83 % | 27.67 % | convaincu |
| amorti | aléatoire | 5 | `(π/2 − t^(1/4))·cos(3·t)` | 9.94 % | 20.84 % | convaincu |
| saturation | actif | 1 | `0.9571·x` | 2.33 % | 54.90 % | convaincu |
| saturation | actif | 2 | `0.9699·x` | 2.29 % | 58.46 % | convaincu |
| saturation | actif | 3 | `x − 0.03253·x^1.785` | 1.76 % | 0.52 % | convaincu |
| saturation | actif | 4 | `0.9533·x` | 2.87 % | 53.85 % | convaincu |
| saturation | aléatoire | 1 | `0.9615·x` | 1.93 % | 56.12 % | convaincu |
| saturation | aléatoire | 2 | `0.97·x` | 2.30 % | 58.47 % | convaincu |
| saturation | aléatoire | 3 | `0.9555·x` | 2.54 % | 54.45 % | convaincu |
| saturation | aléatoire | 4 | `0.9568·x` | 2.37 % | 54.81 % | convaincu |
| saturation | aléatoire | 5 | `0.9633·x` | 1.88 % | 56.61 % | convaincu |
| coulomb-ecran | aléatoire | 5 | `1 / (exp(r) − 0.7786)^(3/2)` | 3.61 % | 3.30 % | convaincu |

</details>

