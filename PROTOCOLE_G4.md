# Protocole G4 — en mode « données fournies », GALILÉE sait-il dire quand il se trompe ?

**Statut** : protocole écrit **avant** tout code. Mesure de départ : `bench/DONNEES_BASE.md`.

## La question

Sur des données déjà mesurées, sans expérience possible, le verdict du moteur vaut « empirique » ou « incertaine ».
La mesure de départ montre qu'il dit « empirique » presque toujours, formes fausses comprises (à 5 % de bruit et
40 points : 11 formes fausses, aucune signalée). G4 cherche un verdict qui signale les formes fausses sans se mettre
à douter des bonnes.

## Ce qui peut changer

Le calcul du verdict en mode « données fournies » seulement, derrière une option de l'agent qui vaut l'ancien
comportement par défaut. Le mode avec expériences n'est pas touché : `bench/run.js` doit rendre les mêmes résultats,
à l'identique. La règle doit être générique : rien qui nomme une loi du catalogue ou dépende de sa forme connue.

## Mesures (banc `bench/donnees.js`, ancienne et nouvelle règle sur les mêmes données)

- **signalées** : part des formes fausses dites « incertaine ».
- **confiance gardée** : part des bonnes formes encore dites « empirique ».
- **précises**, **bonne forme** : comme dans `bench/run.js`.

## Graines

- Développement : 1 à 5 et 21 à 40.
- Test : **11 à 20**, exécution unique après gel du code, 20 et 40 points, bruits 1 % et 5 % (150 essais par cas).
- Les graines 6 à 10 ont servi à G1 et ne sont pas réutilisées.

## Critères, fixés ici (nouvelle règle, graines de test)

| | Critère | Seuil |
|---|---|---|
| **V1** | signalées, bruit 5 %, 40 points | au moins la moitié des formes fausses |
| **V2** | confiance gardée, bruit 5 %, 40 points | au moins 90 % |
| **V3** | confiance gardée, bruit 1 %, 40 points | au moins 90 % |
| **V4** | précises et bonne forme, les quatre cas | pas plus de 2 essais de moins qu'avec l'ancienne règle, par cas |

Rapportés sans seuil : les mêmes mesures à 20 points ; le détail par loi.

**Abandon** : si, en développement, aucune règle ne signale un tiers des formes fausses en gardant 90 % de confiance
sur les bonnes, le chantier s'arrête et le constat est publié tel quel.

**Limite connue d'avance** : une vingtaine de formes fausses attendues par cas dans le test ; V1 se joue donc sur
peu d'essais et sera donné avec son décompte exact. Mêmes 15 lois qu'en développement.

## Journal de développement

Mise au point du 14 novembre 2026, sur copie privée, graines 1 à 5 et 21 à 40 seulement.

**Pourquoi l'ancien verdict ne triait pas.** En données fournies il ne regarde que l'écart avec le second avis à
l'intérieur du domaine mesuré. Sur les graines 1 à 5 (50 formes fausses, 250 bonnes), cet écart sépare mal les deux
groupes (aire sous la courbe 0,73) ; le test des suites ne sépare rien (0,41). L'écart **hors du domaine** avec un
second avis crédible, déjà calculé mais jamais utilisé, sépare mieux (0,75), et le rééchantillonnage des données
mieux encore (0,80).

**Trois règles essayées**, derrière l'option `doute` de l'agent (absente = ancien verdict). Elles ne font que passer
« empirique » à « incertaine », jamais l'inverse ; la loi rendue ne change pas.

- **R1** : second avis non écarté qui diverge de plus de 5 % hors du domaine.
- **R2** : R1, ou une rivale de score proche qui diverge de plus de 50 % hors du domaine.
- **R3** : R1, ou rééchantillonnage (30 tirages) : une forme différente l'emporte et diverge de plus de 50 % hors du
  domaine.

Bruit 5 %, 40 points — formes fausses signalées, puis confiance gardée sur les bonnes formes :

| Lot | Ancienne | R1 | R2 | R3 |
|---|---|---|---|---|
| Graines 1 à 5 | 0/11 ; 98,4 % | 4/11 ; 98,4 % | 6/11 ; 93,8 % | 5/11 ; 96,9 % |
| Graines 21 à 40 | 10/44 ; 98,8 % | 17/44 ; 94,9 % | 18/44 ; 91,4 % | 20/44 ; 92,2 % |

Toutes tailles et tous bruits réunis, graines 21 à 40 : ancienne 46/193 signalées (95,9 % de confiance), R1 64/193
(93,8 %), R2 78/193 (92,1 %), R3 88/193 (92,0 %).

- **R2 écartée** : son avantage sur les graines 1 à 5 ne tient pas sur 21 à 40.
- **R3 retenue pour le test** : la plus stable entre les deux lots (45 % puis 45 % de formes fausses signalées).
- **Aucune règle n'atteint V1 en développement** (la moitié). Le critère d'abandon n'est pas atteint non plus
  (plus d'un tiers signalé avec plus de 90 % de confiance) : le test a donc lieu, seuils inchangés.
- **Limite trouvée** : le capteur qui sature reste hors de portée (2 formes fausses signalées sur 80 sur les graines
  21 à 40). Toutes les lois crédibles s'y accordent entre elles ; aucun signal tiré des seules données ne les sépare.
- À 20 points et 5 % de bruit, la confiance gardée par R3 passe sous 90 % sur les graines 21 à 40 (86,7 %) ; ce cas
  est rapporté sans seuil.

Règle déclarée pour le test, avant son exécution : **R3**. Le banc rapporte aussi l'ancienne règle, R1 et R2 sur les
mêmes données, à titre de comparaison.
