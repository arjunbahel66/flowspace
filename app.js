/* Flowspace — restrained interaction layer.
   Everything readable is present at rest; JS only animates from that state. */

(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- score bars: hero metrics and pillar tiles ---------- */

  function fill(root) {
    root.querySelectorAll(".metric").forEach(function (m) {
      var f = m.querySelector(".m-fill");
      if (f) f.style.width = Number(m.dataset.v) + "%";
    });
    root.querySelectorAll(".tile").forEach(function (t) {
      var f = t.querySelector(".t-fill");
      if (f) f.style.width = Number(t.dataset.v) + "%";
    });
  }

  function fillSoon(root) {
    if (!root) return;
    if (calm) { fill(root); return; }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fill(root); });
    });
  }

  fillSoon(document.getElementById("heroMetrics"));
  fillSoon(document.getElementById("fwp-well"));

  /* ---------- score counters ---------- */

  function countUp(el) {
    var target = Number(el.dataset.count);
    // Leave the real number in place when we can't animate it smoothly —
    // reduced motion, or a hidden tab where rAF is throttled to a standstill.
    if (calm || !target || document.hidden) { el.textContent = target; return; }

    var t0 = null, dur = 900, done = false;
    function tick(ts) {
      if (done) return;
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { requestAnimationFrame(tick); } else { done = true; }
    }
    requestAnimationFrame(tick);

    // Failsafe: never leave a partial number on screen.
    setTimeout(function () {
      if (done) return;
      done = true;
      el.textContent = target;
    }, dur + 700);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  // The hero counter runs on load; the platform one waits until it is in view.
  counters.forEach(function (el) {
    var below = el.getBoundingClientRect().top > window.innerHeight;
    if (!below || calm || !("IntersectionObserver" in window)) { countUp(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- pillar tabs in the platform panel ---------- */

  var fwtabs = Array.prototype.slice.call(document.querySelectorAll(".fwtab"));

  function selectPillar(btn) {
    fwtabs.forEach(function (t) {
      var on = t === btn;
      t.setAttribute("aria-selected", String(on));
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    var shown = document.getElementById(btn.getAttribute("aria-controls"));
    if (shown) fillSoon(shown);
  }

  fwtabs.forEach(function (btn, i) {
    btn.addEventListener("click", function () { selectPillar(btn); });
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var next = fwtabs[(i + (e.key === "ArrowRight" ? 1 : fwtabs.length - 1)) % fwtabs.length];
      next.focus();
      selectPillar(next);
    });
  });

  /* ---------- evaluation profile: weighting per buyer profile ---------- */

  var PROFILES = {
    wellness: {
      weights: { wellness: 45, cultural: 25, cost: 30 },
      buyer: "Wellness-led urban family",
      priority: "Light + quiet bedrooms"
    },
    tradition: {
      weights: { wellness: 25, cultural: 50, cost: 25 },
      buyer: "Multigenerational family",
      priority: "Vastu-compliant kitchen + entry"
    },
    value: {
      weights: { wellness: 25, cultural: 20, cost: 55 },
      buyer: "First-time move-up buyer",
      priority: "Cost per square foot"
    }
  };

  var presets = Array.prototype.slice.call(document.querySelectorAll(".pp"));
  var weightRows = document.querySelectorAll("#weights .weight");

  function applyProfile(key) {
    var p = PROFILES[key];
    if (!p) return;

    weightRows.forEach(function (row) {
      var v = p.weights[row.dataset.w];
      if (v === undefined) return;
      row.querySelector(".w-v").textContent = v + "%";
      row.querySelector(".w-fill").style.width = v + "%";
    });

    var buyer = document.querySelector('[data-tile="buyer"]');
    var priority = document.querySelector('[data-tile="priority"]');
    if (buyer) buyer.textContent = p.buyer;
    if (priority) priority.textContent = p.priority;
  }

  presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      presets.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      applyProfile(btn.dataset.profile);
    });
  });

  /* ---------- scroll reveal (only below the first screen) ---------- */

  if (!calm && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      ".sec-head, .step, .app.pl, .strat article, .alts, .fw-cards article, .fw-foot > p, .profile, .layer article, .tech .pull, .cust li, .bens li, .cta-in"
    );
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        rio.unobserve(e.target);
      });
    }, { rootMargin: "300px 0px 300px 0px", threshold: 0 });

    var pending = [];
    targets.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.classList.add("pre", "rv");
      el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + "ms";
      pending.push(el);
      rio.observe(el);
    });

    // Failsafe: nothing stays invisible if the observer is slow to settle
    // (a fast jump down the page, a thumbnail capture, a throttled tab).
    setTimeout(function () {
      pending.forEach(function (el) {
        if (!el.classList.contains("in")) {
          el.style.transitionDelay = "0ms";
          el.classList.add("in");
        }
      });
    }, 2500);
  }
})();
