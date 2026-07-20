/* ==========================================================================
   hydra fund — enhancement layer  (additive, progressive, Webflow-safe)
   Scroll reveals, "ledger" divider draws, a hero line-mask entrance, a
   scroll-aware nav, a red scroll-progress hairline, cursor-follow card glow,
   magnetic CTAs and smooth anchor scrolling — layered on the existing
   mirrored Webflow site without ever fighting its IX2 engine.

   Safety contract:
   - Reveal hidden-states live under html.enh (set here). If this script never
     runs, .enh is absent and nothing is ever hidden.
   - Every candidate is filtered against Webflow ownership (data-w-id / inline
     opacity) so we never double-animate or re-hide an IX2 element.
   - A hard failsafe force-reveals everything after 3.5s, and load/pageshow
     hooks catch bfcache restores, so no element can stick hidden.
   ========================================================================== */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  docEl.classList.add("enh-js");          // scopes hover/focus CSS (always on)
  if (!reduce) docEl.classList.add("enh"); // gates reveal hidden-states

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---- Webflow / skip guards ------------------------------------------- */

  function webflowOwned(el) {
    if (el.hasAttribute("data-w-id")) return true;
    if (el.style && el.style.opacity !== "") return true;
    var p = el.closest("[data-w-id]");
    if (p && (p === el || p === el.parentElement)) return true;
    return false;
  }

  function inSkipZone(el) {
    return !!el.closest(
      ".navbar, .footer-top, .w-slider, .fs-cc-banner_component, " +
      ".header-bg-video, .w-nav-menu, .section.hide"
    );
  }

  function hasTaggedAncestor(el) {
    var p = el.parentElement;
    while (p) {
      if (p.hasAttribute && p.hasAttribute("data-enh")) return true;
      p = p.parentElement;
    }
    return false;
  }

  /* ---- 1. scroll reveal ------------------------------------------------- */

  var REVEAL = [
    { sel: ".section-hero-wrap" },
    { sel: ".home_media-wrap" },
    { sel: ".news-card", stagger: true },
    { sel: ".team-member-card", stagger: true },
    { sel: ".p-team-card" },
    { sel: ".content-img" },
    { sel: ".content-with-border" },
    { sel: ".contact-info-wrap", stagger: true },
    { sel: ".contact-form-block" },
    { sel: ".article-info-inner" },
    { sel: ".article-middle-img-video" },
    { sel: ".article-quote-wrap" },
    { sel: ".article-rich-text" },
    { sel: ".footer-form" },
    { sel: ".footer-highlighted-area" },
    { sel: ".title-h2" },
    { sel: ".title-h3" }
  ];

  var pending = [];

  function tag(el, delay) {
    el.setAttribute("data-enh", "");
    if (delay) el.style.setProperty("--enh-d", delay + "ms");
    pending.push(el);
  }

  function collectReveals() {
    var seen = new Set();
    REVEAL.forEach(function (rule) {
      var i = 0;
      document.querySelectorAll(rule.sel).forEach(function (el) {
        if (seen.has(el) || webflowOwned(el) || inSkipZone(el) || hasTaggedAncestor(el)) return;
        seen.add(el);
        tag(el, rule.stagger ? Math.min(i, 6) * 70 : 0);
        i++;
      });
    });
  }

  function collectDividers() {
    document.querySelectorAll(".divider").forEach(function (el) {
      if (webflowOwned(el)) return;
      if (el.closest(".field-wrap, .form, .form-fields-horizontal, .w-slider, .navbar, .footer, .slide, .tabs, .contact-info-wrap")) return;
      el.classList.add("enh-rule");
      el.setAttribute("data-enh", "");
      pending.push(el);
    });
  }

  function revealNow(el) {
    el.classList.add("enh-in");
  }

  function initReveal() {
    if (reduce) return;
    collectReveals();
    collectDividers();
    if (!pending.length) return;

    if (!("IntersectionObserver" in window)) {
      pending.forEach(revealNow);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            revealNow(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    pending.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) revealNow(el);
      else io.observe(el);
    });
  }

  /* ---- 2. hero line-mask entrance -------------------------------------- */
  // Only the hero H1 (Webflow does NOT animate it). Split on its <br> into
  // masked lines that rise. Gated on the Intellimize anti-flicker clearing.

  function whenPaintReady(cb) {
    if (!docEl.classList.contains("anti-flicker")) {
      requestAnimationFrame(cb);
      return;
    }
    var done = false;
    function fire() { if (!done) { done = true; mo.disconnect(); requestAnimationFrame(cb); } }
    var mo = new MutationObserver(function () {
      if (!docEl.classList.contains("anti-flicker")) fire();
    });
    mo.observe(docEl, { attributes: true, attributeFilter: ["class"] });
    setTimeout(fire, 1600);
  }

  function initHero() {
    if (reduce) return;
    var header = document.querySelector(".header");
    if (!header) return;
    var h1 = header.querySelector(".title-h1");
    if (!h1 || webflowOwned(h1)) return;

    // Only split when the H1 is plain text + <br> (no nested markup to lose).
    var safe = Array.prototype.every.call(h1.childNodes, function (n) {
      return n.nodeType === 3 || (n.nodeType === 1 && n.tagName === "BR");
    });

    if (!safe) return; // nested markup — leave the heading untouched

    // Split on <br> into masked lines (a single-line H1 yields one line and
    // still gets a clean rise, so every hero entrance is consistent).
    var lines = [];
    var cur = "";
    h1.childNodes.forEach(function (n) {
      if (n.nodeType === 1 && n.tagName === "BR") { lines.push(cur); cur = ""; }
      else cur += n.textContent;
    });
    lines.push(cur);
    if (!lines.join("").trim()) return;

    h1.textContent = "";
    lines.forEach(function (t) {
      var line = document.createElement("span");
      line.className = "enh-line";
      var inner = document.createElement("span");
      inner.textContent = t;
      line.appendChild(inner);
      h1.appendChild(line);
    });
    h1.classList.add("enh-hero");
    whenPaintReady(function () { h1.classList.add("enh-in"); });
  }

  /* ---- 3. scroll-aware nav + progress hairline ------------------------- */

  function initNav() {
    var nav = document.querySelector(".navbar");
    var bar = document.createElement("div");
    bar.className = "enh-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (nav) nav.classList.toggle("enh-nav-scrolled", y > 40);
      var h = docEl.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 60 ? Math.min(y / h, 1) : 0) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---- 4. cursor-follow glow ------------------------------------------- */

  function initGlow() {
    if (!canHover || reduce) return;
    var sel = ".offer-card, .contact-card, .news-card, .p-team-card, .team-member-card";
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(sel);
      if (!card) return;
      if (!card.classList.contains("enh-glow")) card.classList.add("enh-glow");
      var r = card.getBoundingClientRect();
      card.style.setProperty("--gx", (e.clientX - r.left) + "px");
      card.style.setProperty("--gy", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---- 5. magnetic primary CTAs ---------------------------------------- */

  function initMagnetic() {
    if (!canHover || reduce) return;
    document.querySelectorAll(".button.is-nav, .header-text-wrap .button-outline").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + mx * 0.14 + "px," + my * 0.22 + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---- 6. smooth in-page anchors --------------------------------------- */

  function initSmoothAnchors() {
    if (reduce) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      var t;
      try { t = document.querySelector(id); } catch (err) { return; }
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---- 7. entry disclaimer notice --------------------------------------- */
  // Shown once per browser session on entry to hydrafund.ch: hydra fund is
  // not a registered fund and holds no financial licences.

  function initDisclaimer() {
    var KEY = "hf-disclaimer-ack";
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch (e) { /* storage unavailable — still show the notice */ }

    var overlay = document.createElement("div");
    overlay.className = "enh-disclaimer-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "enh-disclaimer-title");

    var panel = document.createElement("div");
    panel.className = "enh-disclaimer-panel";

    var title = document.createElement("h2");
    title.id = "enh-disclaimer-title";
    title.className = "enh-disclaimer-title";
    title.textContent = "Important Notice";

    var body = document.createElement("div");
    body.className = "enh-disclaimer-body";
    body.innerHTML =
      "<p><strong>hydra fund is not a registered fund</strong> and does not hold any " +
      "financial licences, authorisations, registrations or rights to function as a fund, " +
      "manage client money or assets, provide investment advice, or carry out any other " +
      "regulated financial activity in any jurisdiction. hydra fund is not supervised by " +
      "the SEC, FINMA, the FCA or any other financial regulator.</p>" +
      "<p>The .ch domain signifies the Swiss quality and character of the hydra fund brand " +
      "only; hydra fund is not based in Switzerland. Nothing on this website is an offer, " +
      "solicitation or investment advice. Your capital is at risk when investing and you may " +
      "get back less than you invest. Please read our " +
      '<a href="/legal-and-regulatory.html">Legal &amp; Regulatory</a> disclosures, ' +
      '<a href="/terms-and-conditions.html">Terms &amp; Conditions</a> and ' +
      '<a href="/privacy-policy.html">Privacy Policy</a>, and conduct your own checks ' +
      "before making any decision.</p>";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "enh-disclaimer-button";
    btn.textContent = "I understand";
    btn.addEventListener("click", function () {
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      overlay.classList.remove("enh-disclaimer-open");
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 350);
      docEl.classList.remove("enh-disclaimer-lock");
    });

    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(btn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    docEl.classList.add("enh-disclaimer-lock");
    requestAnimationFrame(function () {
      overlay.classList.add("enh-disclaimer-open");
      btn.focus();
    });
  }

  /* ---- failsafe: never leave anything hidden --------------------------- */

  function forceRevealAll() {
    pending.forEach(function (el) { el.classList.add("enh-in"); });
    var hero = document.querySelector(".enh-hero");
    if (hero) hero.classList.add("enh-in");
  }

  /* ---- boot ------------------------------------------------------------ */

  ready(function () {
    try { initReveal(); } catch (e) {}
    try { initHero(); } catch (e) {}
    try { initNav(); } catch (e) {}
    try { initGlow(); } catch (e) {}
    try { initMagnetic(); } catch (e) {}
    try { initSmoothAnchors(); } catch (e) {}
    try { initDisclaimer(); } catch (e) {}
    setTimeout(forceRevealAll, 3500);
  });

  // bfcache / back-forward restores
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) forceRevealAll();
  });
})();
