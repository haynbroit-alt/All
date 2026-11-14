# Résultats du banc d'essai

Généré par `node bench/run.js` le 2026-11-14 (Node v22.23.4), 5 graines par configuration.

Deux critères, tous deux jugés sans que l'agent y ait accès. **Précise** : sur 2000 points neufs, erreur normalisée < 0,5 % dans le domaine et < 1 % en extrapolation. **Bonne forme** : après réajustement des constantes sur la vérité sans bruit, l'erreur tombe sous 0,1 % (la structure est la bonne, même si le bruit a faussé une constante).

## Bruit de mesure : 1 % de l'amplitude

| Loi cachée | Vérité | Agent : précise | bonne forme | exp. | Hasard : précise | bonne forme | exp. |
|---|---|---:|---:|---:|---:|---:|---:|
| Pendule simple | `2*pi*sqrt(L/g)` | 5/5 | 5/5 | 39 | 5/5 | 5/5 | 39 |
| Gravitation universelle | `m1*m2/r^2` | 5/5 | 5/5 | 47 | 5/5 | 5/5 | 56 |
| Gaz parfait | `8.314*n*T/V` | 5/5 | 5/5 | 52 | 5/5 | 5/5 | 56 |
| Lentille mince | `a*b/(a+b)` | 5/5 | 5/5 | 49 | 5/5 | 5/5 | 43 |
| Facteur de Lorentz | `1/sqrt(1-v^2)` | 5/5 | 5/5 | 39 | 2/5 | 2/5 | 57 |
| Charge d’un condensateur | `5*(1-exp(-t/2))` | 5/5 | 5/5 | 32 | 5/5 | 5/5 | 31 |
| Michaelis–Menten | `3*S/(S+0.8)` | 5/5 | 5/5 | 36 | 5/5 | 5/5 | 39 |
| Loi d’Arrhenius | `50*exp(-8/T)` | 5/5 | 5/5 | 32 | 5/5 | 5/5 | 32 |
| Oscillateur harmonique | `2*cos(3*t)` | 5/5 | 5/5 | 31 | 5/5 | 5/5 | 31 |
| Oscillateur amorti | `exp(-t/2)*cos(3*t)` | 5/5 | 5/5 | 37 | 5/5 | 5/5 | 41 |
| Capteur qui sature | `x/(1+x/40)` | 4/5 | 5/5 | 47 | 4/5 | 4/5 | 55 |
| Chute libre | `v*t-4.905*t^2` | 5/5 | 5/5 | 53 | 5/5 | 5/5 | 43 |
| Énergie cinétique | `m*v^2/2` | 5/5 | 5/5 | 38 | 5/5 | 5/5 | 38 |
| Potentiel de Yukawa | `exp(-r)/r` | 5/5 | 5/5 | 35 | 5/5 | 5/5 | 39 |
| Rayonnement du corps noir | `5.67*A*T^4` | 5/5 | 5/5 | 49 | 5/5 | 5/5 | 50 |
| **Total** | | **99 %** | **100 %** | 41 | **95 %** | **95 %** | 43 |

Durée moyenne par découverte : 2.4 s. Verdicts « établie » sur une forme fausse : 0 (actif), 0 (aléatoire).

**L'agent sait-il quand il se trompe ?** Son verdict, comparé à la vérité qu'il ne voit pas (stratégie « agent ») :

| Verdict de l'agent | Nombre | Forme réellement bonne | Forme fausse |
|---|---:|---:|---:|
| établie | 58 | 58 | 0 |
| empirique | 9 | 9 | 0 |
| incertaine | 8 | 8 | 0 |

<details><summary>Formes fausses (4)</summary>

| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Verdict de l'agent |
|---|---|---:|---|---:|---:|---|
| relativite | aléatoire | 2 | `exp(v^20.66 + 0.6401·v^2.175) + v^8` | 0.56 % | 0.57 % | incertaine |
| relativite | aléatoire | 4 | `0.6181 / (1 / v^2.129 − v + 0.123) + 1` | 1.15 % | 1.18 % | empirique |
| relativite | aléatoire | 5 | `1 / cos(1.617·v)^0.3935` | 11.54 % | 12.13 % | empirique |
| saturation | aléatoire | 3 | `x − 0.02672·x^1.868` | 0.38 % | 1.50 % | incertaine |

</details>

## Bruit de mesure : 5 % de l'amplitude

| Loi cachée | Vérité | Agent : précise | bonne forme | exp. | Hasard : précise | bonne forme | exp. |
|---|---|---:|---:|---:|---:|---:|---:|
| Pendule simple | `2*pi*sqrt(L/g)` | 5/5 | 5/5 | 39 | 5/5 | 5/5 | 41 |
| Gravitation universelle | `m1*m2/r^2` | 5/5 | 5/5 | 47 | 5/5 | 5/5 | 57 |
| Gaz parfait | `8.314*n*T/V` | 4/5 | 5/5 | 52 | 2/5 | 5/5 | 69 |
| Lentille mince | `a*b/(a+b)` | 5/5 | 5/5 | 51 | 5/5 | 5/5 | 48 |
| Facteur de Lorentz | `1/sqrt(1-v^2)` | 2/5 | 2/5 | 46 | 2/5 | 2/5 | 54 |
| Charge d’un condensateur | `5*(1-exp(-t/2))` | 5/5 | 5/5 | 33 | 5/5 | 5/5 | 33 |
| Michaelis–Menten | `3*S/(S+0.8)` | 1/5 | 5/5 | 46 | 1/5 | 5/5 | 49 |
| Loi d’Arrhenius | `50*exp(-8/T)` | 3/5 | 5/5 | 38 | 1/5 | 5/5 | 41 |
| Oscillateur harmonique | `2*cos(3*t)` | 5/5 | 5/5 | 31 | 5/5 | 5/5 | 31 |
| Oscillateur amorti | `exp(-t/2)*cos(3*t)` | 5/5 | 5/5 | 36 | 5/5 | 5/5 | 49 |
| Capteur qui sature | `x/(1+x/40)` | 3/5 | 4/5 | 51 | 4/5 | 5/5 | 65 |
| Chute libre | `v*t-4.905*t^2` | 4/5 | 5/5 | 59 | 4/5 | 5/5 | 60 |
| Énergie cinétique | `m*v^2/2` | 5/5 | 5/5 | 39 | 5/5 | 5/5 | 38 |
| Potentiel de Yukawa | `exp(-r)/r` | 5/5 | 5/5 | 35 | 5/5 | 5/5 | 40 |
| Rayonnement du corps noir | `5.67*A*T^4` | 5/5 | 5/5 | 50 | 5/5 | 5/5 | 76 |
| **Total** | | **83 %** | **95 %** | 44 | **79 %** | **96 %** | 50 |

Durée moyenne par découverte : 2.3 s. Verdicts « établie » sur une forme fausse : 0 (actif), 1 (aléatoire).

**L'agent sait-il quand il se trompe ?** Son verdict, comparé à la vérité qu'il ne voit pas (stratégie « agent ») :

| Verdict de l'agent | Nombre | Forme réellement bonne | Forme fausse |
|---|---:|---:|---:|
| établie | 50 | 50 | 0 |
| empirique | 18 | 16 | 2 |
| incertaine | 7 | 5 | 2 |

<details><summary>Formes fausses (7)</summary>

| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Verdict de l'agent |
|---|---|---:|---|---:|---:|---|
| relativite | actif | 1 | `exp(7·v^19 / 4) + (0.3714·v + 2/3)^12` | 1.63 % | 1.61 % | incertaine |
| relativite | actif | 2 | `exp(5·v^13 / 3) + v^(5/2)` | 3.77 % | 3.86 % | empirique |
| relativite | actif | 5 | `v^(3/2) / (−5·log(v))^0.6433 + 1` | 0.80 % | 0.81 % | empirique |
| relativite | aléatoire | 1 | `1 / cos(π·v^1.137 / 2)^0.4794` | 1.60 % | 1.61 % | incertaine |
| relativite | aléatoire | 4 | `exp(π·v^12 / 2) + v^2.742` | 1.99 % | 1.97 % | incertaine |
| relativite | aléatoire | 5 | `exp(v^3)` | 26.83 % | 27.67 % | établie |
| saturation | actif | 3 | `x − 0.03253·x^1.785` | 1.76 % | 0.52 % | incertaine |

</details>

## Terra incognita : systèmes sans formule exacte

Seul le micro-mécanisme est codé (une équation différentielle intégrée pas à pas). Il n'y a pas de « bonne forme » à retrouver : on juge la loi proposée sur 400 simulations neuves. Bruit de mesure 1 %.

| Système | Graine | Loi proposée par l'agent | Erreur domaine | Erreur extrapolation | Verdict de l'agent | Exp. |
|---|---:|---|---:|---:|---|---:|
| Portée avec traînée de l’air | 1 | `R = (0.003316·(52.43 / k^0.2227 − v − 11)·(v + 5/2) − 0.01374 / k)^(7/4)` | 2.86 % | 16.14 % | incertaine | 76 |
| Portée avec traînée de l’air | 2 | `R = v^2 / ((v^2·k)^0.8636 + 9.459)` | 0.49 % | 1.04 % | empirique | 39 |
| Portée avec traînée de l’air | 3 | `R = (v^1.32 − 1.894·(k + v)) / (v·k − 9·k / 2 + 0.3817) + 5` | 2.03 % | 4.72 % | incertaine | 76 |
| Pendule aux grands angles | 1 | `T = 0.408 / (1 / θ^2.087 − 0.01873·θ) + 2π` | 0.23 % | 0.82 % | incertaine | 71 |
| Pendule aux grands angles | 2 | `T = 0.005105·θ^6 + 0·θ^20 + 0.4181·θ^2.055 + 2π` | 0.25 % | 0.23 % | incertaine | 80 |
| Pendule aux grands angles | 3 | `T = θ^2·((−1 / ((θ − 3.292)·4))^(2/3) + 0.182) + 2π` | 0.30 % | 0.22 % | empirique | 75 |
| Cycle proies–prédateurs | 1 | `T = (6.173 − 0.1515·(x − 1.605)·sin(a)) / a^0.5078 + x^1.319 − x` | 0.89 % | 5.04 % | incertaine | 80 |
| Cycle proies–prédateurs | 2 | `T = (x^1.242 − x)·(1 / a^0.7909 + a)^0.2137 + 6.212 / a^0.507` | 1.38 % | 1.57 % | incertaine | 80 |
| Cycle proies–prédateurs | 3 | `T = 28.28 / ((x^(3/4) + 5 / a)·a^(3/2)) + 0.5487·x^(4/3) + 1` | 0.93 % | 3.59 % | incertaine | 74 |
| Ressort durcissant | 1 | `T = (0.04549·cos(π·(β^0.2179 − 0.1139)·√(A) / 2 − 1/2) + 1.062)^18` | 1.28 % | 3.92 % | empirique | 70 |
| Ressort durcissant | 2 | `T = exp(A^1.07·(1.227 / A − 0.5788·β^0.5229)) / cos(β^0.02387) + 1.21` | 1.66 % | 3.58 % | incertaine | 76 |
| Ressort durcissant | 3 | `T = 2π·(sin((4 − 4·(β / (1 / A^2 + β))^0.4099)^(1/3)))^(π/2)` | 0.45 % | 0.65 % | empirique | 77 |

