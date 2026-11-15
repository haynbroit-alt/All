# Résultats G5 — une loi commune à plusieurs petits jeux

Exécution unique du 15 novembre 2026, graines 9001 à 9200 (200 mondes à loi commune, 200 sans), en quatre tranches
lancées ensemble. Protocole `PROTOCOLE_G5.md`, avec ses décisions et corrections A et B écrites avant le test.
Sorties brutes : `bench/g5/test-*.json`. Mondes simulés à réponse connue.

## 1. Critères — mesure principale, sans la bibliothèque de formes

| Critère | Résultat | Verdict |
|---|---|---|
| **C1** — mieux que GALILÉE actuel jeu par jeu | 195 mondes contre 5 (p ≈ 2·10⁻⁵¹) | **tenu** |
| **C1** — mieux que GALILÉE actuel, jeux réunis | 188 contre 12 (p ≈ 4·10⁻⁴²) | **tenu** |
| **C2** — mieux qu'Operon jeu par jeu | 200 mondes contre 0 (p ≈ 6·10⁻⁶¹) | **tenu** |
| **C2** — mieux qu'Operon, jeux réunis | 189 contre 11 (p ≈ 3·10⁻⁴³) | **tenu** |
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

## 3. Face à Operon (C2)

Operon 0.6.2, longueur plafonnée à 15 nœuds, 2 s et une graine par petit jeu, 20 s et une graine pour les jeux
réunis, comme décidé au protocole avant le test. Aucune panne. Sorties : `bench/g5/operon-*.json`, `bench/g5/c2.json`.

- Erreurs médianes : Operon jeu par jeu **14,6** ; Operon réuni **4,78** ; loi commune 0,30.
- Le résultat tient à chaque niveau de bruit (à 5 % : 49 mondes sur 50 contre Operon réuni ; à 20 % : 40 sur 43).
- Variante avec bibliothèque : 198 contre 2 et 187 contre 13.

**À lire avec ses limites.** Ce n'est pas « GALILÉE bat Operon » :

- jeu par jeu, Operon ajuste une formule libre sur 4 à 15 points : il colle au bruit et prédit très mal hors des
  points vus. Une simple droite fait bien mieux que lui (0,46). Contre lui, la victoire est facile ;
- réunis, Operon cherche **une seule** formule pour tous les jeux, sans constante propre à chacun : il ne peut pas
  représenter des mondes où chaque jeu a son échelle. Il n'a pas été conçu pour ce problème ;
- son budget a été réduit (2 s au lieu de 20 s, une graine au lieu de trois) pour tenir en temps de calcul ;
- une comparaison plus juste donnerait à Operon une variable indiquant le jeu ; elle n'a pas été faite.

Ce que la mesure établit : **sur des petits jeux de même nature, la loi commune prédit mieux que les deux façons
habituelles de s'en servir avec un outil de régression symbolique, et mieux qu'une droite ou une constante jeu
par jeu** (180 mondes sur 200).

## 4. Ce que cela dit

- **GALILÉE a une capacité qu'il n'avait pas** : il tire parti de beaucoup de petits jeux. Son erreur médiane passe
  de 1,45 (jeu par jeu) à 0,30.
- **Il prédit bien sans savoir nommer la forme** : la forme vraie n'est retrouvée qu'une fois sur deux à faible
  bruit sans aide. Pour décider d'un prix, c'est la prédiction qui compte ; pour expliquer une loi, ce n'est pas
  encore assez.
- **Il reste honnête** : 196 mondes sans loi commune sur 200 sont refusés.

## 5. Attendus, relus

| Attendu (écrit avant le code) | Constat |
|---|---|
| C1 tenu | tenu — **juste** |
| C2 tenu face à Operon jeu par jeu, incertain face à Operon réuni | tenu les deux — **juste**, et trop prudent pour le second |
| C3 autour de 60 %, sans marge | 48 % sans bibliothèque, manqué — **faux** |
| C4 tenu | 98 % — **juste** |
| C5 tenu | **juste** |
| Cas d'usage : gain modeste | **non mesuré** |

## 6. Limites

- Mondes simulés, tirés par nous, cinq familles de formes, une variable. Les **jeux réels groupés** et le **cas
  d'usage** (historiques de ventes de l'espace commun) prévus au protocole **ne sont pas encore mesurés**.
- Operon : budget réduit, et pas de variable de jeu (§ 3).
- Les gardes du verdict ont été réglées sur les graines 1 à 40 ; elles ont tenu au test (C4 à 98 %).

## 7. Ce que cela change

1. G5 donne à GALILÉE la place qui lui manquait dans l'intelligence collective : **la loi de demande commune aux
   produits d'une même entreprise**, chacun ayant trop peu de ventes. C'est la mesure à trois moteurs proposée
   dans l'espace commun ; elle peut maintenant se protocoler.
2. Avant toute vente de cette capacité : la mesurer sur les jeux réels groupés.
3. Le C3 sans bibliothèque reste à améliorer : la recherche du moteur ne retrouve presque jamais la saturation ni la
   logistique.
