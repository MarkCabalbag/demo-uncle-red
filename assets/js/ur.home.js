/* UR home: hero intro + slideshow + parallax, services preview, process pipe, CTA parallax + magnet, closing scrub + water. */
(function () {
  "use strict";
  var UR = window.UR, $ = UR.$, $$ = UR.$$;
  var home = (UR.pages.home = {});

  home.intro = function () { if (home.introTl) home.introTl.play(); };

  home.init = function () {
    var mm = gsap.matchMedia();
    mm.add({ all: "(min-width: 0px)", isDesktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)", fine: "(pointer: fine)" }, function (ctx) {
      var c = ctx.conditions;
      var undo = [];
      [hero, services, process, cta, closing, counters].forEach(function (fn) { var r = fn(c); if (typeof r === "function") undo.push(r); });
      return function () { undo.forEach(function (f) { f(); }); };
    });
  };

  /* ---------------- hero ---------------- */
  function hero(c) {
    var root = $(".hero");
    if (!root) return;
    var rm = c.reduce;
    var h1 = $("h1", root);
    var media = $(".hero__media", root);
    var slides = $$(".hero__slide", root), bars = $$(".hero__bar", root);
    var pauseBtn = $(".hero__pause", root), cue = $(".hero__cue", root), drip = cue && $(".hero__cue-line i", cue);
    var eyebrow = $(".eyebrow[data-hero-item]", root), rule = $(".rule", root), lead = $(".lead[data-hero-item]", root);
    var ctas = $$(".btn[data-hero-item]", root), controls = $$(".hero__controls[data-hero-item]", root);
    var kbScale = c.isDesktop ? 1.06 : 1.03;

    var idx = 0, paused = rm, visible = true, started = false, kbTw, fillTw;
    var split = null;
    var tl = gsap.timeline({ paused: true });
    home.introTl = tl;

    if (rm) {
      if (rule) rule.classList.add("is-revealed");
      tl.to([eyebrow, h1, lead].concat(ctas, controls), { autoAlpha: 1, duration: 0.4, ease: "power1.out", stagger: 0.05 });
    } else {
      split = SplitText.create(h1, { type: "lines", mask: "lines", aria: "auto" });
      gsap.set(h1, { autoAlpha: 1 });
      gsap.set(split.lines, { yPercent: 105 });
      if (c.isDesktop && media) tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: UR.E.reveal }, 0);
      tl.fromTo(eyebrow, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: UR.E.out }, 0.1)
        .add(function () { if (rule) rule.classList.add("is-revealed"); }, 0.1)
        .to(split.lines, { yPercent: 0, duration: UR.D.section, ease: UR.E.reveal, stagger: UR.S.lines }, 0.2)
        .fromTo(lead, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: UR.E.out }, 0.6)
        .fromTo(ctas, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: UR.E.out, stagger: 0.08 }, 0.75)
        .fromTo(controls, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.out", stagger: 0.05 }, 1.1);
    }
    tl.eventCallback("onComplete", function () {
      document.documentElement.classList.add("hero-ready");
      if (split) split.revert();
      started = true;
      if (rm) setBars(0); else run();
      sync();
      if (cue && !rm) startCue();
    });

    /* scroll cue: plays three times, then rests; hides once the user scrolls */
    var cueTl;
    function startCue() {
      gsap.set(cue, { autoAlpha: 1 });
      cueTl = gsap.timeline({ repeat: 2, repeatDelay: 0.6 });
      cueTl.fromTo(drip, { y: 0, autoAlpha: 1 }, { y: 32, autoAlpha: 0, duration: 1.4, ease: UR.E.exit });
    }
    if (cue) ScrollTrigger.create({ start: 40, end: "max", onEnter: function () { gsap.to(cue, { autoAlpha: 0, duration: 0.3, overwrite: "auto" }); }, onLeaveBack: function () { if (started && !rm) gsap.to(cue, { autoAlpha: 1, duration: 0.3, overwrite: "auto" }); } });

    /* slideshow */
    gsap.set(slides[0], { autoAlpha: 1, zIndex: 2 });
    function setBars(n) { bars.forEach(function (b, j) { b.classList.toggle("is-done", rm && j === n); b.setAttribute("aria-current", j === n ? "true" : "false"); }); }
    function run() {
      var img = $("img", slides[idx]);
      bars.forEach(function (b, j) { gsap.set($("i", b), { scaleX: 0 }); b.setAttribute("aria-current", j === idx ? "true" : "false"); });
      kbTw = gsap.fromTo(img, { scale: 1 }, { scale: kbScale, duration: 7.2, ease: UR.E.none });
      fillTw = gsap.fromTo($("i", bars[idx]), { scaleX: 0 }, { scaleX: 1, duration: 6, ease: UR.E.none, onComplete: function () { go((idx + 1) % slides.length); } });
      sync();
    }
    function go(n) {
      if (n === idx) return;
      var prev = slides[idx], next = slides[n];
      if (kbTw) kbTw.kill(); if (fillTw) fillTw.kill();
      UR.media.loadDeferred();
      gsap.set(next, { zIndex: 2 }); gsap.set(prev, { zIndex: 1 });
      var d = rm ? 0.3 : 1.2;
      gsap.to(next, { autoAlpha: 1, duration: d, ease: "power2.inOut" });
      gsap.to(prev, { autoAlpha: 0, duration: d, ease: "power2.inOut" });
      idx = n;
      if (rm) setBars(n); else run();
    }
    function sync() {
      if (!started) return;
      [kbTw, fillTw].forEach(function (t) { if (t) (paused || !visible || document.hidden) ? t.pause() : t.play(); });
    }
    bars.forEach(function (b, i) { b.onclick = function () { if (started) go(i); }; });
    if (pauseBtn) {
      pauseBtn.hidden = rm;
      pauseBtn.onclick = function () {
        paused = !paused;
        pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        pauseBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
        sync();
      };
    }
    ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle: function (st) { visible = st.isActive; sync(); } });
    document.addEventListener("visibilitychange", sync);

    /* light parallax on user scroll (desktop only) */
    if (c.isDesktop && !rm) {
      var st = { trigger: root, start: "top top", end: "bottom top", scrub: true };
      gsap.to(media, { yPercent: 9.5, ease: UR.E.none, scrollTrigger: st });
      gsap.to($(".hero__inner", root), { y: -60, autoAlpha: 0.4, ease: UR.E.none, scrollTrigger: st });
    }

    return function () { document.removeEventListener("visibilitychange", sync); if (cueTl) cueTl.kill(); };
  }

  /* ---------------- services: index + sticky preview (desktop) ---------------- */
  function services(c) {
    var rows = $$(".svc"), items = $$(".svc-preview__item");
    if (!c.isDesktop || !items.length) return;
    var cur = 0, timer, label = $(".svc-preview__label");
    var names = rows.map(function (r) { return $(".svc__title", r).textContent; });
    if (rows[0]) rows[0].classList.add("is-active");
    gsap.set(items[0], { autoAlpha: 1, zIndex: 2 });

    function show(i) {
      if (i === cur) return;
      var prev = items[cur], next = items[i];
      rows[cur].classList.remove("is-active"); rows[i].classList.add("is-active");
      gsap.killTweensOf([prev, next, $("img", next)]);
      gsap.set(next, { zIndex: 2 }); gsap.set(prev, { zIndex: 1 });
      if (c.reduce) {
        gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
        gsap.to(prev, { autoAlpha: 0, duration: 0.2, delay: 0.2 });
      } else {
        gsap.fromTo(next, { yPercent: 100, autoAlpha: 1 }, { yPercent: 0, duration: 0.7, ease: UR.E.inOut });
        gsap.fromTo($("img", next), { yPercent: -100, scale: 1.08 }, { yPercent: 0, scale: 1, duration: 0.9, ease: UR.E.out });
        gsap.to(prev, { autoAlpha: 0, duration: 0.4, delay: 0.2, ease: "power1.out" });
      }
      if (label) { gsap.fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, delay: 0.15 }); label.textContent = names[i]; }
      cur = i;
    }
    var bound = [];
    rows.forEach(function (row, i) {
      var link = $("a", row);
      var h = function () { clearTimeout(timer); timer = setTimeout(function () { show(i); }, 60); };
      link.addEventListener("pointerenter", h); link.addEventListener("focus", h);
      bound.push([link, h]);
    });
    return function () { clearTimeout(timer); bound.forEach(function (b) { b[0].removeEventListener("pointerenter", b[1]); b[0].removeEventListener("focus", b[1]); }); };
  }

  /* ---------------- process: pipe line scrubbed with scroll ---------------- */
  function process(c) {
    var track = $(".process__track");
    if (!track) return;
    var svg = $(".process__svg", track), base = $(".process__base", svg), draw = $(".process__draw", svg);
    var nodes = $$(".step__node", track), dots = $$(".step__dot", track), rings = $$(".step__ring", track), bodies = $$(".step__body", track);
    var R = 16, fr = [];

    /* path is computed from measured node centres at a 1:1 viewBox, so elbows keep their radius */
    function build() {
      var tr = track.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + tr.width + " " + tr.height);
      var pts = nodes.map(function (n) { var r = n.getBoundingClientRect(); return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 }; });
      var d = "M" + pts[0].x + " " + pts[0].y, cum = [0], total = 0;
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) < 1) { d += " L" + b.x + " " + b.y; }
        else if (Math.abs(dy) < 1) { d += " L" + b.x + " " + b.y; }
        else {
          var sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, mid = a.x + dx / 2, sweep = sx * sy > 0 ? 1 : 0;
          d += " L" + (mid - sx * R) + " " + a.y + " A" + R + " " + R + " 0 0 " + sweep + " " + mid + " " + (a.y + sy * R) +
               " L" + mid + " " + (b.y - sy * R) + " A" + R + " " + R + " 0 0 " + (1 - sweep) + " " + (mid + sx * R) + " " + b.y + " L" + b.x + " " + b.y;
        }
        total += Math.abs(dx) + Math.abs(dy);
        cum.push(total);
      }
      base.setAttribute("d", d); draw.setAttribute("d", d);
      fr = cum.map(function (v) { return total ? v / total : 0; });
    }
    build();
    ScrollTrigger.addEventListener("refreshInit", build);

    if (c.reduce) {
      gsap.set(draw, { strokeDashoffset: 0 });
      gsap.set(dots, { scale: 1 });
    } else {
      var tl = gsap.timeline({ defaults: { ease: UR.E.none }, scrollTrigger: { trigger: track, start: "top 65%", end: "bottom 70%", scrub: 0.6, invalidateOnRefresh: true } });
      tl.fromTo(draw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0);
      nodes.forEach(function (n, i) {
        var at = Math.max(0, fr[i] - 0.06);
        tl.fromTo(dots[i], { scale: 0 }, { scale: 1, duration: 0.12, ease: "back.out(2)" }, at)
          .fromTo(rings[i], { scale: 0.6, autoAlpha: 0.6 }, { scale: 1.8, autoAlpha: 0, duration: 0.12 }, at)
          .fromTo(bodies[i], { autoAlpha: 0.25, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.12 }, at);
      });
    }
    return function () { ScrollTrigger.removeEventListener("refreshInit", build); };
  }

  /* ---------------- CTA band: parallax + magnetic button ---------------- */
  function cta(c) {
    var band = $(".cta-band");
    if (!band) return;
    var bg = $(".cta-band__bg", band);
    if (c.isDesktop && !c.reduce && bg) {
      gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: UR.E.none, scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true } });
    }
    var btn = $(".magnetic", band);
    if (!btn || !c.fine || c.reduce) return;
    var label = $(".btn__label", btn);
    var qx = gsap.quickTo(btn, "x", { duration: 0.45, ease: UR.E.out }), qy = gsap.quickTo(btn, "y", { duration: 0.45, ease: UR.E.out });
    var lx = gsap.quickTo(label, "x", { duration: 0.45, ease: UR.E.out }), ly = gsap.quickTo(label, "y", { duration: 0.45, ease: UR.E.out });
    var clamp = gsap.utils.clamp(-10, 10), clampL = gsap.utils.clamp(-5, 5);
    function move(e) {
      var r = btn.getBoundingClientRect();
      var inside = e.clientX > r.left - 24 && e.clientX < r.right + 24 && e.clientY > r.top - 24 && e.clientY < r.bottom + 24;
      var dx = inside ? e.clientX - (r.left + r.width / 2) : 0, dy = inside ? e.clientY - (r.top + r.height / 2) : 0;
      qx(clamp(dx * 0.3)); qy(clamp(dy * 0.3)); lx(clampL(dx * 0.15)); ly(clampL(dy * 0.15));
    }
    function leave() { qx(0); qy(0); lx(0); ly(0); }
    band.addEventListener("pointermove", move); band.addEventListener("pointerleave", leave);
    return function () { band.removeEventListener("pointermove", move); band.removeEventListener("pointerleave", leave); gsap.set([btn, label], { x: 0, y: 0 }); };
  }

  /* ---------------- counters: count up once when the stats enter view ---------------- */
  function counters(c) {
    if (c.reduce) return; /* final values are already in the HTML */
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
      var fmt = function (v) { return v.toLocaleString("en-AU", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: function () {
          gsap.to(o, { v: end, duration: 1.4, ease: "power2.out", snap: { v: dec ? 0.1 : 1 }, onUpdate: function () { el.textContent = fmt(o.v); } });
        }
      });
    });
  }

  /* ---------------- closing statement: scrubbed words, then rising water ---------------- */
  function closing(c) {
    var sec = $(".closing");
    if (!sec) return;
    var h2 = $("h2", sec), water = $(".closing__water", sec);
    if (c.reduce) { if (water) gsap.set(water, { scaleY: 1 }); return; }
    var split = SplitText.create(h2, { type: "words", aria: "auto" });
    gsap.set(split.words, { opacity: 0.15 });
    gsap.to(split.words, { opacity: 1, stagger: 0.06, ease: UR.E.none, scrollTrigger: { trigger: h2, start: "top 80%", end: "bottom 45%", scrub: true } });
    if (water) gsap.fromTo(water, { scaleY: 0 }, { scaleY: 1, ease: UR.E.none, scrollTrigger: { trigger: sec, start: "bottom 95%", end: "bottom 40%", scrub: 0.8 } });
  }
})();
