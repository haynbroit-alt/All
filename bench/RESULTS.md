# Résultats du banc d'essai

Généré par `node bench/run.js` le 2026-11-12 (Node v22.23.4), 5 graines par configuration.

Une loi compte comme **retrouvée** si, sur 2000 points neufs, l'erreur normalisée est < 0,5 % dans le domaine **et** < 1 % en extrapolation (domaine élargi de 50 %).

## Bruit de mesure : 1 % de l'amplitude

| Loi cachée | Vérité | Actif : retrouvée | exp. | Aléatoire : retrouvée | exp. |
|---|---|---:|---:|---:|---:|
| Pendule simple | `2*pi*sqrt(L/g)` | 5/5 | 26 | 5/5 | 25 |
| Gravitation universelle | `m1*m2/r^2` | 5/5 | 31 | 5/5 | 31 |
| Gaz parfait | `8.314*n*T/V` | 5/5 | 32 | 5/5 | 37 |
| Lentille mince | `a*b/(a+b)` | 5/5 | 30 | 4/5 | 33 |
| Facteur de Lorentz | `1/sqrt(1-v^2)` | 4/5 | 31 | 1/5 | 32 |
| Charge d’un condensateur | `5*(1-exp(-t/2))` | 5/5 | 20 | 5/5 | 20 |
| Michaelis–Menten | `3*S/(S+0.8)` | 5/5 | 25 | 4/5 | 28 |
| Loi d’Arrhenius | `50*exp(-8/T)` | 4/5 | 21 | 4/5 | 21 |
| Oscillateur harmonique | `2*cos(3*t)` | 5/5 | 20 | 5/5 | 20 |
| Oscillateur amorti | `exp(-t/2)*cos(3*t)` | 4/5 | 29 | 3/5 | 33 |
| Chute libre | `v*t-4.905*t^2` | 5/5 | 26 | 5/5 | 34 |
| Énergie cinétique | `m*v^2/2` | 5/5 | 25 | 5/5 | 25 |
| Potentiel de Yukawa | `exp(-r)/r` | 5/5 | 20 | 5/5 | 22 |
| Rayonnement du corps noir | `5.67*A*T^4` | 5/5 | 25 | 5/5 | 27 |
| **Total** | | **96 %** | 26 | **87 %** | 28 |

Durée moyenne par découverte : 1.0 s. Arrêts « convaincu » sur une loi fausse : 3 (actif), 7 (aléatoire).

<details><summary>Échecs (12)</summary>

| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Arrêt |
|---|---|---:|---|---:|---:|---|
| lentille | aléatoire | 1 | `((b^1.763·a)^(1/4) − 0.05507·a − 0.3046·b^(π/4))^(7/4)` | 2.53 % | 4.77 % | budget |
| relativite | actif | 4 | `3 / (cos(π·v / 2)^0.5388·4) + 1/4` | 0.61 % | 0.60 % | convaincu |
| relativite | aléatoire | 1 | `(1 / (1 / v^(3π/4) − 1)^0.9065 + 1)^0.5836` | 0.53 % | 0.56 % | convaincu |
| relativite | aléatoire | 2 | `2·v^13 + exp(3·v^(3π/4) / 4)` | 4.80 % | 5.09 % | convaincu |
| relativite | aléatoire | 4 | `0.6527·(v^7 + v)^(2π/3) + 1` | 7.96 % | 8.44 % | convaincu |
| relativite | aléatoire | 5 | `1.911·v^3π + sin(v)^(5/2) + 1` | 10.61 % | 11.20 % | convaincu |
| enzyme | aléatoire | 3 | `3 − 2.417 / (S + 0.8137)` | 0.75 % | 0.65 % | convaincu |
| arrhenius | actif | 3 | `49.84·exp(−8 / T)` | 0.57 % | 0.64 % | convaincu |
| arrhenius | aléatoire | 3 | `49.85·exp(−8 / T)` | 0.55 % | 0.61 % | convaincu |
| amorti | actif | 2 | `−(1 / (t + 5/3)^0.4404 − 1 / t − 1/4)·cos(3·t)·t` | 0.90 % | 5.36 % | convaincu |
| amorti | aléatoire | 2 | `sin(−3·t − π/2)·(sin(t·(3/2 − (t + π/3)^0.132)) − 1)` | 0.47 % | 2.66 % | convaincu |
| amorti | aléatoire | 4 | `21.14·exp(−0.03056·t^(4π/3)) − 5·(t + 8)·exp(−0.06691·t^(7/2)) / 2` | 19.60 % | 19.79 % | budget |

</details>

## Bruit de mesure : 5 % de l'amplitude

| Loi cachée | Vérité | Actif : retrouvée | exp. | Aléatoire : retrouvée | exp. |
|---|---|---:|---:|---:|---:|
| Pendule simple | `2*pi*sqrt(L/g)` | 5/5 | 25 | 5/5 | 26 |
| Gravitation universelle | `m1*m2/r^2` | 5/5 | 31 | 5/5 | 31 |
| Gaz parfait | `8.314*n*T/V` | 4/5 | 32 | 3/5 | 40 |
| Lentille mince | `a*b/(a+b)` | 4/5 | 27 | 5/5 | 28 |
| Facteur de Lorentz | `1/sqrt(1-v^2)` | 0/5 | 29 | 0/5 | 30 |
| Charge d’un condensateur | `5*(1-exp(-t/2))` | 5/5 | 20 | 5/5 | 21 |
| Michaelis–Menten | `3*S/(S+0.8)` | 0/5 | 23 | 0/5 | 28 |
| Loi d’Arrhenius | `50*exp(-8/T)` | 0/5 | 21 | 0/5 | 22 |
| Oscillateur harmonique | `2*cos(3*t)` | 5/5 | 20 | 5/5 | 20 |
| Oscillateur amorti | `exp(-t/2)*cos(3*t)` | 4/5 | 27 | 3/5 | 33 |
| Chute libre | `v*t-4.905*t^2` | 2/5 | 33 | 1/5 | 27 |
| Énergie cinétique | `m*v^2/2` | 5/5 | 25 | 5/5 | 25 |
| Potentiel de Yukawa | `exp(-r)/r` | 3/5 | 21 | 5/5 | 23 |
| Rayonnement du corps noir | `5.67*A*T^4` | 2/5 | 33 | 2/5 | 33 |
| **Total** | | **63 %** | 26 | **63 %** | 28 |

Durée moyenne par découverte : 0.9 s. Arrêts « convaincu » sur une loi fausse : 26 (actif), 26 (aléatoire).

<details><summary>Échecs (52)</summary>

| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Arrêt |
|---|---|---:|---|---:|---:|---|
| gaz | actif | 3 | `8·n·T / V^1.008` | 1.29 % | 1.31 % | convaincu |
| gaz | aléatoire | 1 | `8.271·T·n / V` | 0.74 % | 0.70 % | convaincu |
| gaz | aléatoire | 3 | `8.269·T·n / V` | 0.77 % | 0.72 % | convaincu |
| lentille | actif | 4 | `sin(2·a^0.08203 − b^0.1488)^(4π/3)·b` | 2.77 % | 5.11 % | convaincu |
| relativite | actif | 1 | `v^2.643 + exp(π·v^4π / 2)` | 2.34 % | 2.36 % | convaincu |
| relativite | actif | 2 | `exp(π·v^11 / 2) + sin(v^2.719)` | 2.26 % | 2.21 % | convaincu |
| relativite | actif | 3 | `1 / (1 / v^(9/2) − v)^(2/3) + 1` | 5.05 % | 5.04 % | convaincu |
| relativite | actif | 4 | `exp(v^22.66 + v^3)` | 3.48 % | 3.44 % | convaincu |
| relativite | actif | 5 | `v / (0.2018 − 9·log(v) / 2) + 1` | 2.87 % | 2.76 % | convaincu |
| relativite | aléatoire | 1 | `v^2.696 + exp(3·v^12 / 2)` | 2.38 % | 2.43 % | convaincu |
| relativite | aléatoire | 2 | `(v + π·v^4π / 4)^(5/2) + 1` | 3.50 % | 3.58 % | convaincu |
| relativite | aléatoire | 3 | `exp(1 / (1 / v^12 − 4/3)^(1/4))` | 3.99 % | 3.96 % | convaincu |
| relativite | aléatoire | 4 | `exp(v^6)·v^3 + 1` | 11.33 % | 11.86 % | convaincu |
| relativite | aléatoire | 5 | `exp(v^3)` | 26.83 % | 27.67 % | convaincu |
| enzyme | actif | 1 | `3·S / (S + π/4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | actif | 2 | `3·S / (S + π/4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | actif | 3 | `2.983 − 3π / ((S + π/4)·4)` | 1.86 % | 2.47 % | convaincu |
| enzyme | actif | 4 | `3 − 3π / ((S + π/4)·4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | actif | 5 | `3 − 3π / ((S + π/4)·4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | aléatoire | 1 | `3·S / (S + π/4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | aléatoire | 2 | `3·S / (S + π/4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | aléatoire | 3 | `3 − 3π / ((S + π/4)·4)` | 1.52 % | 1.50 % | convaincu |
| enzyme | aléatoire | 4 | `3 − 5 / ((S + 0.8448)·2)` | 2.86 % | 2.85 % | convaincu |
| enzyme | aléatoire | 5 | `3 − 3π / ((S + π/4)·4)` | 1.52 % | 1.50 % | convaincu |
| arrhenius | actif | 1 | `49.78·exp(−8 / T)` | 0.82 % | 0.91 % | convaincu |
| arrhenius | actif | 2 | `50.4·exp(−8 / T)` | 1.47 % | 1.62 % | convaincu |
| arrhenius | actif | 3 | `49.3·exp(−8 / T)` | 2.58 % | 2.85 % | convaincu |
| arrhenius | actif | 4 | `49.77·exp(−8 / T)` | 0.85 % | 0.94 % | convaincu |
| arrhenius | actif | 5 | `49.85·exp(−8 / T)` | 0.55 % | 0.61 % | convaincu |
| arrhenius | aléatoire | 1 | `49.68·exp(−8 / T)` | 1.19 % | 1.32 % | convaincu |
| arrhenius | aléatoire | 2 | `50.36·exp(−8 / T)` | 1.31 % | 1.45 % | convaincu |
| arrhenius | aléatoire | 3 | `49.35·exp(−8 / T)` | 2.39 % | 2.65 % | convaincu |
| arrhenius | aléatoire | 4 | `49.7·exp(−8 / T)` | 1.10 % | 1.22 % | convaincu |
| arrhenius | aléatoire | 5 | `49.84·exp(−8 / T)` | 0.59 % | 0.65 % | convaincu |
| amorti | actif | 1 | `cos(7·(t + 1/4)^0.9333 / 2) − cos(2.905·t + 2)` | 5.41 % | 22.99 % | convaincu |
| amorti | aléatoire | 3 | `(1 − 0.02563·t)^19·cos(3·t)` | 1.34 % | 1.76 % | convaincu |
| amorti | aléatoire | 5 | `cos(3·t) / (0.03069·t + 1)^17` | 1.25 % | 1.68 % | convaincu |
| chute | actif | 2 | `v·t − 3π·t^2.026 / 2` | 1.06 % | 1.72 % | convaincu |
| chute | actif | 3 | `t·(v − 5·t)` | 3.49 % | 3.60 % | convaincu |
| chute | actif | 4 | `t·(v − 5·t)` | 3.49 % | 3.60 % | convaincu |
| chute | aléatoire | 1 | `(v − 3/4)·t − 3π·t^2 / 2` | 1.74 % | 2.84 % | convaincu |
| chute | aléatoire | 2 | `v·t − 4.866·t^2` | 1.44 % | 1.48 % | convaincu |
| chute | aléatoire | 3 | `t·(v − 5·t)` | 3.49 % | 3.60 % | convaincu |
| chute | aléatoire | 4 | `t·(v − 5·t)` | 3.49 % | 3.60 % | convaincu |
| coulomb-ecran | actif | 3 | `exp(−r − 0.01041) / r` | 1.15 % | 1.11 % | convaincu |
| coulomb-ecran | actif | 5 | `1 / (exp(r) − π/4)^(π/2)` | 3.66 % | 3.71 % | convaincu |
| stefan | actif | 1 | `11·A·T^4.015 / 2` | 0.71 % | 0.19 % | convaincu |
| stefan | actif | 2 | `2π·T^3.943·A` | 1.18 % | 1.76 % | convaincu |
| stefan | actif | 4 | `5.618·T^4·A` | 1.14 % | 1.11 % | convaincu |
| stefan | aléatoire | 1 | `11·A·T^4 / 2` | 3.75 % | 3.66 % | convaincu |
| stefan | aléatoire | 2 | `2π·T^3.942·A` | 1.05 % | 1.99 % | convaincu |
| stefan | aléatoire | 3 | `3π·T^4.11·A / 2` | 1.52 % | 5.12 % | convaincu |

</details>

