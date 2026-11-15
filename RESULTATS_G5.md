# Résultats G5 — une loi commune à plusieurs petits jeux

Exécution unique du 15 novembre 2026, graines 9001 à 9200 (200 mondes à loi commune, 200 sans), en quatre tranches
lancées ensemble. Protocole `PROTOCOLE_G5.md`, avec ses décisions et corrections A et B écrites avant le test.
Sorties brutes : `bench/g5/test-*.json`. Mondes simulés à réponse connue.

## 1. Critères — mesure principale, sans la bibliothèque de formes

| Critère | Résultat | Verdict |
|---|---|---|
| **C1** — mieux que GALILÉE actuel jeu par jeu | 195 mondes contre 5 (p ≈ 2·10⁻⁵¹) | **tenu** |
| **C1** — mieux que GALILÉE actuel, jeux réunis | 188 contre 12 (p ≈ 4·10⁻⁴²) | **tenu** |
| **C2** — mieux qu'Operon jeu par jeu et réuni | calcul en cours (§ 3) | à venir |
| **C3** — forme vraie retrouvée, bruit 5 % (seuil 60 %) | 24 sur 50 (48 %) | **manqué** |
| **C4** — mondes sans loi commune refusés (seuil 90 %) | 196 sur 200 (98 %) | **tenu** |
| C5 — `bench/run.js` inchangé | vérifié par la relecture ; aucun fichier existant modifié depuis | tenu |

Erreurs médianes sur les points mis de côté (normalisées par la variance des points vus) : loi commune 0,30 ;
GALILÉE jeu par jeu 1,45 ; GALILÉE réuni 4,18 ; meilleur témoin (droite ou constante) 0,46. La loi commune est
devant le meilleur témoin dans 180 mondes sur 200.

## 2. Variante avec la bibliothèque (publiée à côté, jamais à la place)

C1 : 193 contre 7 et 185 contre 15. **C3 : 45 sur 50 (90 %)**. C4 : 196 sur 200. Erreur médiane 0,31.
La bibliothèque contient les cinq formes qui génèrent ces mondes : son C3 mesure un choix dans une liste qui contient
la réponse. Sa prédiction n'est pas meilleure que sans elle (0,31 contre 0,30).

