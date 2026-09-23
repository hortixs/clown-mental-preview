/* ==========================================================
   Formulaire de contact : envoi via Web3Forms (gratuit)
   1. Créer une clé sur https://web3forms.com avec l'adresse clownetmental@gmail.com
   2. La coller ci-dessous à la place de TODO
   ========================================================== */
const WEB3FORMS_CLE = "TODO"; // TODO : clé d'accès Web3Forms
const EMAIL_CONTACT = "clownetmental@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulaire-contact");
  const retour = document.getElementById("retour-formulaire");
  if (!form) return;
  const bouton = form.querySelector('button[type="submit"]');

  const messages = {
    prenom: "Indiquez votre prénom.",
    nom: "Indiquez votre nom.",
    email: "Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.",
  };

  function marquer(champ, message) {
    const bloc = champ.closest(".champ");
    let aide = bloc.querySelector(".erreur-champ");
    if (message) {
      champ.setAttribute("aria-invalid", "true");
      if (!aide) { aide = document.createElement("p"); aide.className = "erreur-champ"; aide.id = `${champ.id}-erreur`; bloc.appendChild(aide); }
      aide.textContent = message;
      champ.setAttribute("aria-describedby", aide.id);
    } else {
      champ.removeAttribute("aria-invalid"); champ.removeAttribute("aria-describedby");
      if (aide) aide.remove();
    }
  }

  function valider() {
    let premier = null;
    for (const id of Object.keys(messages)) {
      const champ = form.elements[id];
      const ok = champ.value.trim() !== "" && champ.checkValidity();
      marquer(champ, ok ? null : messages[id]);
      if (!ok && !premier) premier = champ;
    }
    if (premier) premier.focus();
    return !premier;
  }

  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity() && e.target.value.trim()) marquer(e.target, null);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    retour.className = "formulaire-retour"; retour.textContent = "";
    if (!valider()) return;
    if (form.elements.botcheck.checked) return; // robot

    const d = Object.fromEntries(new FormData(form));
    if (!WEB3FORMS_CLE || WEB3FORMS_CLE === "TODO") {
      retour.classList.add("ko");
      retour.textContent = `Le formulaire n’est pas encore activé. Écrivez-nous directement à ${EMAIL_CONTACT}.`;
      return;
    }

    bouton.disabled = true; bouton.textContent = "Envoi…";
    try {
      const rep = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_CLE,
          subject: `Site Clown & Mental : ${d.sujet}`,
          from_name: `${d.prenom} ${d.nom}`,
          prenom: d.prenom, nom: d.nom, email: d.email, sujet: d.sujet, message: d.message,
          botcheck: false,
        }),
      });
      const res = await rep.json();
      if (!rep.ok || !res.success) throw new Error(res.message || rep.status);
      form.reset();
      retour.classList.add("ok");
      retour.textContent = "Message envoyé. Nous vous répondrons très vite, merci !";
    } catch (err) {
      console.error(err);
      retour.classList.add("ko");
      retour.textContent = `L’envoi n’a pas abouti. Réessayez dans un instant ou écrivez-nous à ${EMAIL_CONTACT}.`;
    } finally {
      bouton.disabled = false; bouton.textContent = "Envoyer";
    }
  });
});
