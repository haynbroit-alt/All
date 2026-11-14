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

(à remplir pendant la mise au point : chaque règle essayée, ses mesures, y compris celles qui échouent)
