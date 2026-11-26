/* UR page: inner page intros (service / about / contact), footer reveal, front-end-only quote form. */
(function () {
  "use strict";
  var UR = window.UR, $ = UR.$, $$ = UR.$$;

  /* ---- shared inner-page intro ---- */
  function innerIntro() {
    var tl = UR.heroIntro();
    tl.eventCallback("onComplete", function () { document.documentElement.classList.add("hero-ready"); });
    if (!UR.reduced()) {
      var img = $(".page-hero__media img, .about-hero__bg img");
      if (img) gsap.fromTo(img, { scale: 1.1 }, { scale: 1, duration: 1.4, ease: UR.E.out });
    }
  }
  ["service", "about", "contact"].forEach(function (n) { UR.pages[n] = { init: function () { if (n === "contact") UR.form.init(); }, intro: innerIntro }; });

  /* ---- footer reveal (all pages) ---- */
  UR.footer = {
    init: function () {
      var f = $(".site-footer");
      if (!f) return;
      var cols = $$(".footer__col", f), mark = $(".footer__wordmark", f);
      var mm = gsap.matchMedia();
      mm.add({ ok: "(prefers-reduced-motion: no-preference)" }, function () {
        gsap.set(cols, { autoAlpha: 0, y: 32 });
        ScrollTrigger.create({ trigger: f, start: "top 85%", once: true, onEnter: function () { gsap.to(cols, { autoAlpha: 1, y: 0, duration: 0.7, ease: UR.E.out, stagger: UR.S.items }); } });
        if (mark) gsap.fromTo(mark, { yPercent: 40 }, { yPercent: 0, ease: UR.E.none, scrollTrigger: { trigger: f, start: "top bottom", end: "bottom bottom", scrub: true } });
      });
    }
  };

  /* ---- quote form: validation + success animation (no backend) ---- */
  UR.form = {
    init: function () {
      var form = $("#quote-form");
      if (!form) return;
      var summary = $("#form-summary"), submit = $(".form__submit", form), success = $("#form-success");
      var phoneOk = function (v) { return /^(\+?61|0)[2-478]\d{8}$/.test(v.replace(/[\s()-]/g, "")); };
      var rules = {
        name: function (v) { return v.trim().length >= 2 || "Please enter your name."; },
        phone: function (v) { return phoneOk(v) || "Enter an Australian phone number, e.g. 0452 179 216."; },
        email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Enter a valid email address."; },
        service: function (v) { return !!v || "Choose the service you need."; },
        message: function (v) { return v.trim().length >= 10 || "Tell us a little more (at least 10 characters)."; }
      };
      var fields = Object.keys(rules).map(function (n) { return form.elements[n]; });

      function check(el, live) {
        var res = rules[el.name](el.value), wrap = el.closest(".field"), msg = $(".field__error span", wrap);
        var bad = res !== true;
        wrap.classList.toggle("has-error", bad);
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) msg.textContent = res;
        return !bad;
      }
      fields.forEach(function (el) {
        el.addEventListener("blur", function () { if (el.value !== "" || el.dataset.touched) { el.dataset.touched = "1"; check(el); } });
        el.addEventListener("input", function () { if (el.dataset.touched) check(el); });
        el.addEventListener("change", function () { el.dataset.touched = "1"; check(el); });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var bad = fields.filter(function (el) { el.dataset.touched = "1"; return !check(el); });
        if (bad.length) {
          summary.textContent = bad.length === 1 ? "Please fix 1 field below." : "Please fix " + bad.length + " fields below.";
          summary.classList.add("is-on");
          bad[0].focus();
          return;
        }
        summary.classList.remove("is-on"); summary.textContent = "";
        submit.classList.add("is-sending"); submit.setAttribute("aria-disabled", "true"); submit.disabled = true;
        var first = form.elements.name.value.trim().split(/\s+/)[0];
        setTimeout(function () { done(first); }, 900); /* demo: no network */
      });

      function done(first) {
        $("#success-name", success).textContent = "Thanks, " + first + ".";
        var heading = $("h2", success);
        if (UR.reduced()) {
          form.style.display = "none"; success.classList.add("is-on"); heading.focus();
          return;
        }
        var fill = $(".fill", submit), tick = $(".success__tick", success), circle = $(".success__circle", success);
        var tl = gsap.timeline();
        tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: UR.E.inOut })
          .to(submit.querySelector(".spin"), { autoAlpha: 0, duration: 0.15 }, 0)
          .to(form, { autoAlpha: 0, y: -12, duration: 0.35, ease: UR.E.out })
          .add(function () {
            form.style.display = "none"; success.classList.add("is-on");
            gsap.set([heading, $(".success p", success)], { autoAlpha: 0, y: 16 });
            gsap.set(success, { autoAlpha: 1 });
          })
          .fromTo(circle, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.5, ease: UR.E.inOut })
          .fromTo(tick, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.45, ease: UR.E.out }, "-=0.1")
          .fromTo($(".success__ring", success), { scale: 0.8, autoAlpha: 0.6 }, { scale: 1.7, autoAlpha: 0, duration: 0.8, ease: UR.E.out }, "-=0.2")
          .to([heading, $(".success p", success)], { autoAlpha: 1, y: 0, duration: UR.D.std, ease: UR.E.out, stagger: UR.S.items }, "-=0.6")
          .add(function () { heading.focus({ preventScroll: false }); });
      }
    }
  };
})();
