/* UR reveal: data-attribute driven scroll reveals.
   data-reveal="fade | up | lines | mask-img | rule | scale"   data-reveal-delay="0.1"   data-reveal-start="top 85%"
   data-reveal-group on a parent staggers its [data-reveal] children (data-reveal-stagger overrides .08). */
(function () {
  "use strict";
  var UR = window.UR, $$ = UR.$$;

  function play(list, rm, stagger, delay) {
    var plain = list.filter(function (el) { var t = el.dataset.reveal; return t === "fade" || t === "up" || t === "scale" || t === "mask-img"; });
    var lines = list.filter(function (el) { return el.dataset.reveal === "lines"; });
    var rules = list.filter(function (el) { return el.dataset.reveal === "rule"; });

    list.forEach(function (el) { el.classList.add("is-revealed"); }); /* CSS-driven rules/lines key off this */

    list.filter(function (el) { return el.dataset.reveal === "draw"; }).forEach(function (el, i) {
      gsap.set(el, { autoAlpha: 1 });
      if (!rm) gsap.fromTo(el.querySelectorAll("path, circle"), { drawSVG: "0%" }, { drawSVG: "100%", duration: UR.D.section, ease: UR.E.inOut, delay: delay + 0.1 + i * stagger });
    });

    if (rm) {
      gsap.to(plain.concat(lines), { autoAlpha: 1, duration: 0.4, ease: "power1.out", stagger: 0.05, delay: delay, overwrite: "auto" });
      gsap.set(plain, { y: 0, scale: 1 });
      return;
    }
    plain.forEach(function (el, i) {
      var t = el.dataset.reveal;
      var d = delay + i * stagger + (parseFloat(el.dataset.revealDelay) || 0);
      if (t === "mask-img") {
        gsap.to(el, { autoAlpha: 1, y: 0, duration: UR.D.section * 0.9, ease: UR.E.out, delay: d, overwrite: "auto" });
        var img = el.querySelector("img");
        if (img) gsap.fromTo(img, { scale: 1.1 }, { scale: 1, duration: UR.D.section * 0.9, ease: UR.E.out, delay: d });
      } else if (t === "scale") {
        gsap.to(el, { autoAlpha: 1, scale: 1, duration: UR.D.std, ease: UR.E.out, delay: d, overwrite: "auto" });
      } else if (t === "fade") {
        gsap.to(el, { autoAlpha: 1, duration: UR.D.std, ease: UR.E.out, delay: d, overwrite: "auto" });
      } else {
        gsap.to(el, { autoAlpha: 1, y: 0, duration: UR.D.std, ease: UR.E.out, delay: d, overwrite: "auto" });
      }
    });
    lines.forEach(function (el, i) {
      el._shown = true;
      if (el._lines) gsap.to(el._lines, { yPercent: 0, duration: UR.D.section, ease: UR.E.reveal, stagger: UR.S.lines, delay: delay + i * stagger, overwrite: "auto" });
    });
    rules.forEach(function () {}); /* rules animate via .is-revealed CSS transition */
  }

  UR.reveal = {
    init: function () {
      var mm = gsap.matchMedia();
      /* `all` always matches: matchMedia skips the callback when no listed query matches */
      mm.add({ all: "(min-width: 0px)", reduce: "(prefers-reduced-motion: reduce)" }, function (ctx) {
        var rm = ctx.conditions.reduce;
        var all = $$("[data-reveal]");

        /* split headlines once; re-split on resize/font swap via autoSplit */
        if (!rm) {
          all.filter(function (el) { return el.dataset.reveal === "lines"; }).forEach(function (el) {
            SplitText.create(el, {
              type: "lines", mask: "lines", aria: "auto", autoSplit: true,
              onSplit: function (self) {
                el._lines = self.lines;
                if (!el._shown) gsap.set(self.lines, { yPercent: 105 });
                gsap.set(el, { autoAlpha: 1 });
              }
            });
          });
        }

        var grouped = [];
        $$("[data-reveal-group]").forEach(function (g) {
          var kids = $$("[data-reveal]", g);
          grouped = grouped.concat(kids);
          if (!kids.length) return;
          var stagger = parseFloat(g.dataset.revealStagger) || UR.S.items;
          if (kids.length > 6) stagger = Math.min(stagger, 0.5 / kids.length);
          ScrollTrigger.create({ trigger: g, start: g.dataset.revealStart || "top 85%", once: true, onEnter: function () { play(kids, rm, stagger, 0); } });
        });
        all.filter(function (el) { return grouped.indexOf(el) < 0; }).forEach(function (el) {
          ScrollTrigger.create({
            trigger: el, start: el.dataset.revealStart || "top 85%", once: true,
            onEnter: function () { play([el], rm, 0, parseFloat(el.dataset.revealDelay) || 0); }
          });
        });
        return function () { all.forEach(function (el) { el._lines = null; }); };
      });
    }
  };
})();
