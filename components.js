const BOOKING_APP_PRODUCTION = "https://buchung.ladyfitness-bremgarten.ch";
const BOOKING_APP_LOCAL = "http://localhost:3001";

/** Öffentliche URL der Next.js-Buchungs-App: lokal (localhost / 127.0.0.1) → :3001, sonst Produktion. */
function getBookingAppBase() {
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  if (h === "localhost" || h === "127.0.0.1") return BOOKING_APP_LOCAL;
  return BOOKING_APP_PRODUCTION;
}

/** Hart kodierte Produktions-Links in statischem HTML auf lokale Buchungs-App umbiegen. */
function rewriteBookingLinksToLocal() {
  const prod = BOOKING_APP_PRODUCTION;
  const local = BOOKING_APP_LOCAL;
  const h = window.location.hostname;
  if (h !== "localhost" && h !== "127.0.0.1") return;
  document.querySelectorAll(`a[href^="${prod}"]`).forEach((a) => {
    try {
      const u = new URL(a.href);
      a.href = local + u.pathname + u.search + u.hash;
    } catch {
      a.href = a.href.replace(prod, local);
    }
  });
}

function renderHeader(activePage) {
  const pages = [
    ["/index.html", "Home"],
    ["/angebot.html", "Angebot"],
    ["/probetraining.html", "Probetraining"],
    ["/betreuungszeiten.html", "Betreuungszeiten"],
    ["/team.html", "Team"],
    ["/bilder.html", "Bilder"],
    ["/preise.html", "Preise"],
    ["/kontakt.html", "Kontakt"],
  ];
  const links = pages
    .map(
      ([href, label]) =>
        `<a href="${href}"${href === "/" + activePage ? ' class="active"' : ""}>${label}</a>`
    )
    .join("");
  return `
  <header class="header">
    <div class="container header__inner">
      <a class="header__brand" href="/index.html"><img src="/images/logo.png" alt="Lady Fitness Bremgarten" class="header__logo" /></a>
      <button class="header__toggle" aria-label="Menü öffnen" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="header__nav" aria-label="Hauptnavigation">${links}</nav>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="footer" id="kontakt-footer">
    <div class="container split">
      <div>
        <h2>Lady Fitness Bremgarten</h2>
        <p>Fitness Gallery Bremgarten GmbH<br>Zürcherstrasse 7<br>5620 Bremgarten</p>
        <p>Tel: <a href="tel:+41566316809">056 631 68 09</a><br><a href="mailto:info@ladyfitness-bremgarten.ch">info@ladyfitness-bremgarten.ch</a></p>
        <p><a href="https://www.instagram.com/ladyfitnessbremgarten" target="_blank" rel="noopener">Instagram @ladyfitnessbremgarten</a></p>
      </div>
      <div class="footer__cta">
        <h3>Bereit für den ersten Schritt?</h3>
        <p>Vereinbaren Sie jetzt Ihr kostenloses Probetraining.</p>
        <a class="btn" href="${getBookingAppBase()}/buchen">Probetraining anfragen</a>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>
        &copy; ${new Date().getFullYear()} Lady Fitness Bremgarten — Umsetzung &amp; technische Umgebung <a href="https://webtotal.info" target="_blank" rel="noopener">WEBtotal.info</a>
        <span class="footer__legal">
          <a href="/impressum.html">Impressum</a>
          <span aria-hidden="true"> · </span>
          <a href="/datenschutz.html">Datenschutz</a>
          <span aria-hidden="true"> · </span>
          <a href="${getBookingAppBase()}/admin/login" rel="nofollow">Admin</a>
        </span>
      </p>
    </div>
  </footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  rewriteBookingLinksToLocal();

  const headerSlot = document.getElementById("site-header");
  const footerSlot = document.getElementById("site-footer");
  const active = document.documentElement.dataset.page || "index.html";
  if (headerSlot) headerSlot.innerHTML = renderHeader(active);
  if (footerSlot) footerSlot.innerHTML = renderFooter();

  const toggle = document.querySelector(".header__toggle");
  const nav = document.querySelector(".header__nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  const particleContainer = document.querySelector(".hero__particles");
  if (particleContainer) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("span");
      p.className = "hero__particle";
      const size = 2 + Math.random() * 3;
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = -(Math.random() * 30) + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = 10 + Math.random() * 15 + "s";
      p.style.animationDelay = Math.random() * 12 + "s";
      if (Math.random() > .7) p.style.background = "rgba(255,255,255,.3)";
      particleContainer.appendChild(p);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const terminBetreffs = ["Probetraining", "Personal Training"];

  document.querySelectorAll('select[name="betreff"]').forEach((sel) => {
    const form = sel.closest("form");
    if (!form) return;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    const fallback = btn.textContent;
    const id = sel.id;
    const prefix = id ? id.replace("-betreff", "") : null;
    const terminBlock = prefix ? document.getElementById(prefix + "-termin") : null;
    const nachrichtBlock = prefix ? document.getElementById(prefix + "-nachricht") : null;

    function update() {
      const v = sel.value;
      btn.textContent = v ? "Jetzt " + v + " sichern" : fallback;
      const showTermin = terminBetreffs.includes(v);
      if (terminBlock) terminBlock.style.display = showTermin ? "" : "none";
      if (nachrichtBlock) nachrichtBlock.style.display = showTermin ? "none" : "";
    }

    sel.addEventListener("change", update);
    update();
  });
});
