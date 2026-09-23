/* ==========================================================
   Agenda : lu depuis un Google Sheet publié au format CSV.
   Agnès modifie le Sheet, le site se met à jour tout seul
   (Google met parfois quelques minutes à publier les changements).

   Colonnes attendues (1re ligne du Sheet, noms exacts) :
   date | heure | titre | organisateur | lieu | adresse | contexte |
   duree_spectacle | duree_echange | visible

   Dans "contexte", on peut mettre un passage en rouge gras avec **texte**
   et un passage en rouge simple avec *texte*.
   ========================================================== */

// TODO : coller ici l'URL "Publier sur le web > CSV" du Google Sheet.
// Tant qu'elle est vide, le site utilise le fichier local data/agenda.csv.
const AGENDA_CSV_URL = "";
const AGENDA_LOCAL = "data/agenda.csv";
const EMAIL_AGENDA = "clownetmental@gmail.com";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
  "août", "septembre", "octobre", "novembre", "décembre"];

/* Lecture CSV robuste : guillemets, virgules et retours à la ligne dans les champs */
function lireCSV(texte) {
  const lignes = []; let ligne = []; let champ = ""; let guillemets = false;
  texte = texte.replace(/^\uFEFF/, "");
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"') {
        if (texte[i + 1] === '"') { champ += '"'; i++; } else { guillemets = false; }
      } else { champ += c; }
    } else if (c === '"') { guillemets = true; }
    else if (c === ",") { ligne.push(champ); champ = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ); lignes.push(ligne); ligne = []; champ = "";
    } else { champ += c; }
  }
  if (champ !== "" || ligne.length) { ligne.push(champ); lignes.push(ligne); }

  const entetes = (lignes.shift() || []).map((h) => h.trim().toLowerCase());
  return lignes
    .filter((l) => l.some((v) => v.trim() !== ""))
    .map((l) => Object.fromEntries(entetes.map((h, i) => [h, (l[i] || "").trim()])));
}

/* "2026-10-09" ou "09/10/2026" -> Date locale (minuit) */
function lireDate(valeur) {
  let m = valeur.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = valeur.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

/* "18:30" -> "18h30" ; "18:00" -> "18h00" */
function formaterHeure(h) {
  const m = h.match(/^(\d{1,2})[:hH](\d{2})?$/);
  return m ? `${m[1]}h${m[2] || "00"}` : h;
}

function el(tag, classe, texte) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte != null) e.textContent = texte;
  return e;
}

/* Ajoute du texte en gérant **rouge gras** et *rouge*, sans jamais utiliser innerHTML */
function ajouterTexteMisEnForme(parent, texte) {
  const morceaux = texte.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const m of morceaux) {
    if (!m) continue;
    if (m.startsWith("**")) { const s = el("strong", "rouge", m.slice(2, -2)); parent.appendChild(s); }
    else if (m.startsWith("*") && m.endsWith("*") && m.length > 2) { parent.appendChild(el("span", "contexte-rouge", m.slice(1, -1))); }
    else parent.appendChild(document.createTextNode(m));
  }
}

function afficherDate(d, anneeCourante) {
  const art = el("article", "date");
  const titre = el("h2");
  let jour = `${d.jour.getDate() === 1 ? "1er" : d.jour.getDate()} ${MOIS[d.jour.getMonth()]}`;
  if (d.jour.getFullYear() !== anneeCourante) jour += ` ${d.jour.getFullYear()}`;
  titre.appendChild(document.createTextNode("Le "));
  titre.appendChild(el("span", "maj", jour));
  if (d.heure) titre.appendChild(document.createTextNode(` à ${formaterHeure(d.heure)}`));
  art.appendChild(titre);

  if (d.titre) art.appendChild(el("p", "titre-date", d.titre));
  if (d.organisateur) art.appendChild(el("p", "", d.organisateur));
  if (d.lieu || d.adresse) {
    const p = el("p");
    if (d.lieu) p.appendChild(el("span", "lieu", d.lieu));
    if (d.lieu && d.adresse) p.appendChild(document.createTextNode(" - "));
    if (d.adresse) p.appendChild(document.createTextNode(d.adresse));
    art.appendChild(p);
  }
  if (d.contexte) { const p = el("p"); ajouterTexteMisEnForme(p, d.contexte); art.appendChild(p); }

  const morceaux = [];
  if (d.duree_spectacle) morceaux.push(`Durée du spectacle : ${d.duree_spectacle} minutes`);
  if (d.duree_echange) morceaux.push(`temps d’échange : ${d.duree_echange} minutes`);
  if (morceaux.length) art.appendChild(el("p", "duree", morceaux.join(" - ")));
  return art;
}

function afficherMessage(conteneur, texte, erreur) {
  conteneur.replaceChildren();
  const p = el("p", "agenda-etat" + (erreur ? " erreur" : ""));
  p.appendChild(document.createTextNode(texte + " "));
  const a = el("a", "", EMAIL_AGENDA); a.href = `mailto:${EMAIL_AGENDA}`;
  p.appendChild(a); p.appendChild(document.createTextNode("."));
  conteneur.appendChild(p);
}

async function chargerAgenda() {
  const conteneur = document.getElementById("agenda-liste");
  if (!conteneur) return;
  try {
    const url = AGENDA_CSV_URL || AGENDA_LOCAL;
    const rep = await fetch(url, { cache: "no-cache" });
    if (!rep.ok) throw new Error(`HTTP ${rep.status}`);
    const lignes = lireCSV(await rep.text());

    const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
    const dates = lignes
      .filter((l) => !/^(non|no|0|faux|false)$/i.test(l.visible || "oui"))
      .map((l) => ({ ...l, jour: lireDate(l.date || "") }))
      .filter((l) => l.jour && l.jour >= aujourdhui)
      .sort((a, b) => a.jour - b.jour || (a.heure || "").localeCompare(b.heure || ""));

    if (!dates.length) {
      afficherMessage(conteneur, "Aucune date n’est annoncée pour le moment. Pour organiser une représentation ou être prévenu des prochaines, écrivez-nous à", false);
      return;
    }
    conteneur.replaceChildren(...dates.map((d) => afficherDate(d, aujourdhui.getFullYear())));
  } catch (err) {
    console.error("Agenda indisponible :", err);
    afficherMessage(conteneur, "L’agenda est momentanément indisponible. Pour connaître nos prochaines dates, écrivez-nous à", true);
  }
}

document.addEventListener("DOMContentLoaded", chargerAgenda);
