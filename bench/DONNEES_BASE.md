# Mesure de référence — GALILÉE en mode « données fournies »

`node bench/donnees.js --out bench/donnees-base.json`, 14 novembre 2026, moteur non modifié, graines 1 à 5.
L'agent reçoit n points tirés au hasard dans le domaine, bruités, et ne peut faire aucune expérience. Dans ce mode,
son verdict ne peut valoir que « empirique » (il s'y fie) ou « incertaine » (il doute). 15 lois × 5 graines = 75 essais.

| Bruit | Points | Précises | Bonne forme | Dites « empirique » | dont forme fausse | Formes fausses signalées « incertaine » |
|---|---:|---:|---:|---:|---:|---:|
| 1 % | 20 | 64/75 | 65/75 | 70 | 9 | 1 sur 10 |
| 1 % | 40 | 65/75 | 65/75 | 72 | 8 | 2 sur 10 |
| 5 % | 20 | 38/75 | 56/75 | 69 | 14 | 5 sur 19 |
| 5 % | 40 | 47/75 | 64/75 | 74 | 11 | 0 sur 11 |

## Lecture

- Sans pouvoir expérimenter, le moteur retrouve moins de lois : à 5 % de bruit et 40 points, 47 lois précises sur 75,
  contre 62 quand il choisit ses expériences (`bench/RESULTS.md`).
- **Son verdict ne trie presque rien** : il dit « empirique » dans 69 à 74 essais sur 75, formes fausses comprises.
  À 5 % de bruit et 40 points, aucune des 11 formes fausses n'est signalée.
- Les formes fausses se concentrent sur deux lois, le facteur relativiste et le capteur qui sature, plus un cas sur
  le rayonnement du corps noir.

C'est le mode d'une mission réelle sur des données déjà mesurées : le moteur n'y sait pas dire quand il se trompe.
Mesure sur les graines de mise au point, sans graines neuves : c'est un constat de départ, pas un test.
