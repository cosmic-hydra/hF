/* hydra fund — interactions & animation */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- page load ---------- */

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("is-loaded");
    });

    initNav();
    initReveals();
    initCounters();
    initCardGlow();
    initForms();
    initHeroCanvas();

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  });

  /* ---------- nav: blur on scroll, hide on scroll down ---------- */

  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;

    var lastY = window.scrollY;

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      if (y > 320 && y > lastY + 4 && !document.body.classList.contains("menu-open")) {
        nav.classList.add("is-hidden");
      } else if (y < lastY - 4 || y < 320) {
        nav.classList.remove("is-hidden");
      }
      lastY = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var burger = document.querySelector(".nav-burger");
    if (burger) {
      burger.addEventListener("click", function () {
        var open = document.body.classList.toggle("menu-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.querySelectorAll(".mobile-menu a").forEach(function (a) {
        a.addEventListener("click", function () {
          document.body.classList.remove("menu-open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------- scroll reveal ---------- */

  function initReveals() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- animated counters ---------- */

  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var duration = 1800;
      var start = null;

      if (reduceMotion) {
        el.textContent = format(target);
        return;
      }

      function format(v) {
        return v.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      }

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = format(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach(animate);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- cursor-follow card glow ---------- */

  function initCardGlow() {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest ? e.target.closest(".card") : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }

  /* ---------- ajax forms (formsubmit.co) ---------- */

  function initForms() {
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        var original = btn ? btn.value || btn.textContent : "";
        function setBtn(v) {
          if (!btn) return;
          if (btn.tagName === "INPUT") btn.value = v;
          else btn.textContent = v;
        }
        setBtn("Please wait…");
        if (btn) btn.disabled = true;

        var wrap = form.closest("[data-form-wrap]") || form.parentElement;
        var done = wrap.querySelector(".form-done");
        var fail = wrap.querySelector(".form-fail");
        if (fail) fail.style.display = "none";

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.success === "true" || data.success === true) {
              form.style.display = "none";
              if (done) done.style.display = "block";
            } else if (fail) {
              fail.style.display = "block";
            }
          })
          .catch(function () {
            if (fail) fail.style.display = "block";
          })
          .finally(function () {
            setBtn(original);
            if (btn) btn.disabled = false;
          });
      });
    });
  }

  /* ---------- hero canvas: flow-field particles ---------- */

  function initHeroCanvas() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext("2d", { alpha: false });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, particles, running = true, t = 0;
    var pointer = { x: -9999, y: -9999 };

    var BG = "#09090b";
    var COUNT;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      COUNT = Math.min(320, Math.max(120, Math.round((W * H) / 6500)));
      seed();
    }

    function spawn() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        px: 0,
        py: 0,
        speed: 0.5 + Math.random() * 1.4,
        life: 60 + Math.random() * 260,
        red: Math.random() < 0.1
      };
    }

    function seed() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        var p = spawn();
        p.px = p.x;
        p.py = p.y;
        particles.push(p);
      }
    }

    // layered-sine pseudo noise field
    function fieldAngle(x, y, t) {
      var s = 0.0016;
      return (
        Math.sin(x * s + t * 0.28) * 1.4 +
        Math.cos(y * s * 1.3 - t * 0.22) * 1.4 +
        Math.sin((x + y) * s * 0.6 + t * 0.12) * 0.8
      );
    }

    function step() {
      if (!running) return;
      t += 0.008;

      // translucent wash → fading trails
      ctx.fillStyle = "rgba(9, 9, 11, 0.085)";
      ctx.fillRect(0, 0, W, H);

      ctx.lineWidth = 1;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var a = fieldAngle(p.x, p.y, t);

        var vx = Math.cos(a) * p.speed;
        var vy = Math.sin(a) * p.speed;

        // gentle pointer repulsion
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          var d = Math.sqrt(d2) || 1;
          var f = (1 - d / 150) * 2.2;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }

        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy;
        p.life--;

        if (p.life <= 0 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
          particles[i] = spawn();
          continue;
        }

        ctx.strokeStyle = p.red
          ? "rgba(255, 32, 32, 0.5)"
          : "rgba(244, 244, 241, 0.14)";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      requestAnimationFrame(step);
    }

    canvas.parentElement.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("pointerleave", function () {
      pointer.x = -9999;
      pointer.y = -9999;
    });

    // pause offscreen / hidden tab
    document.addEventListener("visibilitychange", function () {
      var wasRunning = running;
      running = !document.hidden && visible;
      if (running && !wasRunning) requestAnimationFrame(step);
    });

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        var wasRunning = running;
        running = visible && !document.hidden;
        if (running && !wasRunning) requestAnimationFrame(step);
      }).observe(canvas);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    requestAnimationFrame(step);
  }
})();
