/* Menu : ouverture mobile, défilement vers les sections,
   et lien du menu en jaune selon la section affichée. */
document.addEventListener("DOMContentLoaded", () => {
  const bouton = document.querySelector(".bouton-menu");
  const menu = document.getElementById("menu-principal");

  const fermer = () => {
    if (!bouton || !menu) return;
    bouton.setAttribute("aria-expanded", "false");
    menu.classList.remove("ouvert");
  };

  if (bouton && menu) {
    bouton.addEventListener("click", () => {
      const ouvert = bouton.getAttribute("aria-expanded") === "true";
      bouton.setAttribute("aria-expanded", String(!ouvert));
      menu.classList.toggle("ouvert", !ouvert);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("ouvert")) { fermer(); bouton.focus(); }
    });
    window.matchMedia("(min-width: 64.01rem)").addEventListener("change", fermer);
  }

  // Clic sur un lien d'ancre : on ferme le menu mobile et on place le focus sur la section
  document.querySelectorAll('a[href^="#"]').forEach((lien) => {
    lien.addEventListener("click", () => {
      fermer();
      const cible = document.getElementById(lien.getAttribute("href").slice(1));
      if (cible) {
        if (!cible.hasAttribute("tabindex")) cible.setAttribute("tabindex", "-1");
        setTimeout(() => cible.focus({ preventScroll: true }), 0);
      }
    });
  });

  // Surbrillance du lien de la section visible
  const liens = [...document.querySelectorAll('.menu a[href^="#"]')];
  const sections = liens.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const activer = (id) => {
    liens.forEach((a) => {
      if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };
  const accueil = document.getElementById("accueil");
  const observees = accueil ? [accueil, ...sections] : sections;
  const obs = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => { if (e.isIntersecting) activer(e.target.id); });
  }, { rootMargin: "-35% 0px -60% 0px" });
  observees.forEach((s) => obs.observe(s));
});
