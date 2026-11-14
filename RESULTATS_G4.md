# Résultats G4 — verdict en mode « données fournies »

Protocole : `PROTOCOLE_G4.md`, écrit avant le code ; règle R3 déclarée avant le test. Code gelé au commit `0c59d37`.
Exécution unique du 14 novembre 2026 : `node bench/donnees.js --seeds 11-20 --out bench/g4-test.json`, 150 essais par
cas. Avant le test, deux vérifications sur ce dépôt : `bench/run.js` rend 300 essais identiques avec et sans le
changement, et la mesure de développement se reproduit à l'identique.

| | Critère (règle R3) | Seuil | Mesuré | Verdict |
|---|---|---|---|---|
| **V1** | formes fausses signalées, bruit 5 %, 40 points | au moins la moitié | 13 sur 28 (46 %) | **manqué, à un essai près** |
| **V2** | confiance gardée, bruit 5 %, 40 points | au moins 90 % | 117 sur 122 (96 %) | atteint |
| **V3** | confiance gardée, bruit 1 %, 40 points | au moins 90 % | 127 sur 131 (97 %) | atteint |
| **V4** | précises et bonne forme | pas plus de 2 essais de moins | identiques : la loi rendue ne change pas | atteint |

**V1 est manqué : G4 n'atteint pas son objectif.** L'option `doute` reste absente par défaut ; le verdict livré est
l'ancien. Les seuils ne sont pas retouchés après coup.

## Ce que la règle apporte quand même

Formes fausses signalées, puis confiance gardée sur les bonnes formes, graines de test :

| Bruit | Points | Formes fausses | Ancienne règle | R1 | R2 | R3 |
|---|---:|---:|---|---|---|---|
| 1 % | 20 | 22 | 7 ; 119/128 | 7 ; 117/128 | 8 ; 117/128 | 10 ; 117/128 |
| 1 % | 40 | 19 | 3 ; 128/131 | 6 ; 127/131 | 6 ; 127/131 | 8 ; 127/131 |
| 5 % | 20 | 36 | 5 ; 108/114 | 8 ; 104/114 | 11 ; 98/114 | 13 ; 99/114 |
| 5 % | 40 | 28 | 5 ; 121/122 | 11 ; 117/122 | 11 ; 114/122 | 13 ; 117/122 |

À 5 % de bruit et 40 points, R3 signale 13 formes fausses au lieu de 5, pour 4 bonnes formes de plus mises en doute.
Les trois lots (graines 1 à 5, 21 à 40, 11 à 20) donnent le même ordre de grandeur : 45 %, 45 %, 46 %.

## Pourquoi cela plafonne

Sur les 28 formes fausses du cas principal, 10 viennent du capteur qui sature et 8 du facteur relativiste. Pour le
capteur qui sature, toutes les lois crédibles s'accordent entre elles, dans le domaine comme au-delà : aucun signal
tiré des seules données fournies ne les sépare. Tant que ce cas pèse un tiers des formes fausses, la moitié est hors
d'atteinte par cette voie. La distinguer demanderait des mesures hors du domaine — ce que le mode avec expériences
fait déjà.

## Ce que ce résultat ne dit pas

- À 20 points et 5 % de bruit, R3 met en doute 15 bonnes formes sur 114 (confiance 87 %) : trop pour ce cas.
- Mêmes 15 lois qu'en développement ; données tirées au hasard dans le domaine, ce qu'un jeu de données réel ne
  garantit pas.
- Les graines 11 à 20 sont consommées.
