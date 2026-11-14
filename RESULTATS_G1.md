# Résultats G1 — confirmation sur graines neuves

Protocole : `PROTOCOLE_G1.md`, poussé avant l'exécution (commit `43c1d56`). Exécution unique du 14 novembre 2026 :
`node bench/g1-confirmation.js`, graines 6 à 10, 15 lois, moteur non modifié. Données brutes : `bench/g1-confirmation.json`.

| | Critère (stratégie « agent ») | Seuil | Mesuré | Verdict |
|---|---|---|---|---|
| **K1** | verdicts « établie » sur une forme fausse, bruit 5 % | au plus 2 sur 75 | 0 sur 75 | atteint |
| **K2** | lois retrouvées avec précision, bruit 5 % | au moins 80 % | 62 sur 75 (83 %) | atteint |
| **K3** | lois retrouvées avec précision, bruit 1 % | au moins 95 % | 73 sur 75 (97 %) | atteint |

Les trois critères sont atteints : **le chantier G1 est clos sans modification du moteur.**

## Mesures rapportées sans seuil

| | Bruit 1 %, agent | Bruit 1 %, hasard | Bruit 5 %, agent | Bruit 5 %, hasard |
|---|---:|---:|---:|---:|
| Précises | 73/75 | 72/75 | 62/75 | 62/75 |
| Bonne forme | 73/75 | 72/75 | 69/75 | 70/75 |
| Formes fausses dites « établie » | 0 | 1 | 0 | 2 |
| Formes fausses dites « empirique » | 1 | 0 | 4 | 2 |
| Formes fausses dites « incertaine » | 1 | 2 | 2 | 1 |
| Expériences par découverte | 47,6 | 49,7 | 48,3 | 54,1 |

## Ce que ce résultat ne dit pas

- À 5 % de bruit, la stratégie « agent » rend encore 6 formes fausses sur 75, toutes sur deux lois : le facteur
  relativiste (3) et le capteur qui sature (3). Quatre sont dites « empirique » : le moteur ne les certifie pas, mais
  il ne les signale pas non plus comme douteuses.
- En stratégie « hasard », 2 formes fausses sont dites « établie » à 5 % de bruit et 1 à 1 % : le garde-fou tient
  quand le moteur choisit ses expériences, moins quand il les subit. C'est le cas d'usage sur données fournies.
- Mêmes 15 lois que le banc de mise au point : seules les graines sont neuves.
- Le moteur actuel fait environ 48 expériences par découverte, contre 31 pour le banc publié avant l'auto-évaluation.
- Les graines 6 à 10 sont consommées.
