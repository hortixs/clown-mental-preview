# Site Clown & Mental

Site statique (HTML, CSS, JavaScript sans framework). Aucune installation n’est nécessaire.

## Lancer le site en local

Depuis ce dossier :

```
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000. (Ouvrir les fichiers en double-cliquant ne suffit pas : l’agenda a besoin d’un serveur pour lire son fichier.)

## Organisation

```
index.html, association.html, spectacles.html, organiser.html,
agenda.html, contact.html, mentions-legales.html, 404.html
css/fonts.css    polices auto-hébergées (Jost remplace Futura PT, Montserrat Alternates pour le menu)
css/base.css     couleurs, en-tête, menu, titres, boutons, pied de page
css/pages.css    mises en page propres à chaque page
js/nav.js        menu mobile
js/agenda.js     lecture de l’agenda (Google Sheet ou data/agenda.csv)
js/contact.js    envoi du formulaire via Web3Forms
data/agenda.csv  agenda de secours / de test
assets/          logo, illustrations, photos, polices
```

Le menu et le pied de page sont recopiés dans chaque page HTML : si on ajoute une page ou qu’on change un lien, il faut le modifier dans toutes les pages.

## À faire avant la mise en ligne

1. **Agenda** : créer le Google Sheet de l’association avec la ligne d’en-tête
   `date,heure,titre,organisateur,lieu,adresse,contexte,duree_spectacle,duree_echange,visible`,
   puis Fichier > Partager > Publier sur le web > format CSV, et coller l’URL dans `AGENDA_CSV_URL` en haut de `js/agenda.js`.
2. **Formulaire** : créer une clé gratuite sur web3forms.com avec clownetmental@gmail.com, la coller dans `WEB3FORMS_CLE` en haut de `js/contact.js`.
3. **Bouton « Faire un don »** (association.html) : remplacer `href="contact.html"` par le lien de don (repère `data-todo="lien-don"`).
4. **Mentions légales** : compléter les lignes marquées TODO.
5. **Nom de domaine** : remplacer `TODO-nom-de-domaine.fr` dans toutes les pages (balises `canonical` et `og`), `robots.txt` et `sitemap.xml`.
6. **Images** : remplacer par les versions haute définition d’Agnès en gardant les mêmes noms de fichiers, et ajouter la photo de Lucie à la place du bloc « Photo à venir ».

## Mettre à jour l’agenda (pour Agnès)

Ajouter une ligne dans le Google Sheet, une ligne par date :

| colonne | exemple |
|---|---|
| date | 2026-10-09 (ou 09/10/2026) |
| heure | 18:30 |
| titre | Spectacle Resto Dingo + les bords du plateau |
| organisateur | pour l’association Advocacy (facultatif) |
| lieu | Salle Olympe de Gouge |
| adresse | 15 rue Merlin - Paris 11e |
| contexte | à l’occasion des **SISM 26** (facultatif) |
| duree_spectacle | 45 |
| duree_echange | 20 |
| visible | oui (mettre « non » pour cacher la date sans l’effacer) |

Dans « contexte », `**texte**` s’affiche en rouge gras et `*texte*` en rouge. Les dates passées disparaissent toutes seules. Google peut mettre quelques minutes à publier une modification.

## Mise en ligne (gratuite)

Cloudflare Pages ou Netlify : créer un projet, déposer ce dossier (ou le relier à un dépôt GitHub), aucune commande de build. Relier ensuite le nom de domaine acheté par l’association.
