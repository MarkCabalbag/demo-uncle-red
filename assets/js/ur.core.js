/* UR core: namespace, motion tokens, scroll (Lenis + ScrollToPlugin), media helpers, generic page intro.
   Classic script (no modules) so the site works from file://. */
(function () {
  "use strict";
  var UR = (window.UR = window.UR || {});

  /* ---- motion tokens (see plan §6) ---- */
  UR.E = { out: "power3.out", inOut: "power3.inOut", reveal: "expo.out", exit: "power2.in", none: "none" };
  UR.D = { micro: 0.2, std: 0.6, section: 1, wipeOut: 0.5, wipeIn: 0.6 };
  UR.S = { lines: 0.09, items: 0.08, menu: 0.06, micro: 0.03 };

  UR.$ = function (s, c) { return (c || document).querySelector(s); };
  UR.$$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  UR.reduced = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  UR.pages = {};
  UR.lenis = null;

  UR.store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); return sessionStorage.getItem(k) === v; } catch (e) { return false; } },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ---- scroll: Lenis on fine-pointer + motion-ok, otherwise native; ScrollToPlugin is the fallback path ---- */
  UR.scroll = {
    init: function () {
      var fine = window.matchMedia("(pointer: fine)").matches;
      if (UR.reduced() || !fine || typeof window.Lenis !== "function") return;
      var lenis = new window.Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false });
      UR.lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  };
  /* One helper picks the path: Lenis when active, ScrollToPlugin otherwise (instant under reduced motion). */
  UR.scrollTo = function (target) {
    if (UR.lenis) { UR.lenis.scrollTo(target, { duration: 1.2 }); return; }
    if (UR.reduced()) { var el = typeof target === "string" ? UR.$(target) : target; window.scrollTo(0, typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY : 0); return; }
    gsap.to(window, { scrollTo: target, duration: 0.8, ease: "power2.inOut" });
  };

  /* ---- media: deferred slides + ScrollTrigger refresh after images/fonts ---- */
  UR.media = {
    loadDeferred: function () {
      UR.$$("img[data-src], img[data-srcset]").forEach(function (img) {
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        if (img.dataset.sizes) img.sizes = img.dataset.sizes;
        if (img.dataset.src) img.src = img.dataset.src;
      });
    },
    watchRefresh: function () {
      var t;
      function later() { clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); }, 200); }
      UR.$$("main img, footer img").forEach(function (img) {
        if (!img.complete) img.addEventListener("load", later, { once: true });
      });
    }
  };

  /* ---- generic page intro for inner pages (data-hero-item elements, H1 line reveal) ---- */
  UR.heroIntro = function (root) {
    root = root || document;
    var items = UR.$$("[data-hero-item]", root);
    var h1 = UR.$("h1[data-hero-item]", root);
    var rm = UR.reduced();
    var tl = gsap.timeline({ delay: 0.05 });
    var others = items.filter(function (el) { return el !== h1; });
    if (rm) {
      UR.$$(".rule", root).forEach(function (r) { r.classList.add("is-revealed"); });
      tl.to(items, { autoAlpha: 1, duration: 0.4, ease: "power1.out", stagger: 0.05 });
      return tl;
    }
    var rules = UR.$$(".rule", root);
    rules.forEach(function (r) { r.classList.add("is-revealed"); });
    var eyebrow = others.filter(function (el) { return el.classList.contains("eyebrow"); });
    var rest = others.filter(function (el) { return eyebrow.indexOf(el) < 0; });
    tl.fromTo(eyebrow, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: UR.E.out }, 0.1);
    if (h1) {
      var split = SplitText.create(h1, { type: "lines", mask: "lines", aria: "auto" });
      gsap.set(h1, { autoAlpha: 1 });
      tl.fromTo(split.lines, { yPercent: 105 }, { yPercent: 0, duration: UR.D.section, ease: UR.E.reveal, stagger: UR.S.lines, onComplete: function () { split.revert(); } }, 0.2);
    }
    tl.fromTo(rest, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: UR.E.out, stagger: UR.S.items }, 0.6);
    return tl;
  };

  UR.fail = function () {
    var d = document.documentElement;
    d.classList.add("no-motion", "motion-ready");
    d.classList.remove("is-entering", "is-intro");
  };
})();
