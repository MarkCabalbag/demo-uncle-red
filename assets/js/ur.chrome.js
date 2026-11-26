/* UR chrome: header (solid/hide/show, dropdown, mobile menu, call bar + pill) and MPA page transitions (panel wipe + preloader). */
(function () {
  "use strict";
  var UR = window.UR, $ = UR.$, $$ = UR.$$;
  var html = document.documentElement;

  /* ================= header ================= */
  UR.header = {
    revealed: false,
    menuOpen: false,
    ddOpen: false,

    init: function () {
      var self = this;
      var header = $(".site-header");
      var bar = $(".call-bar");
      var pill = $(".call-pill");
      if (!header) return;
      var rm = UR.reduced();
      this.header = header;
      this.bar = bar;

      /* solid + hide on scroll down / show on scroll up */
      var hidden = false;
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: function (st) {
          var y = st.scroll();
          header.classList.toggle("is-solid", y > 80);
          if (self.menuOpen || self.ddOpen || header.contains(document.activeElement)) return;
          if (st.direction === 1 && y > 400 && !hidden) {
            hidden = true;
            gsap.to(header, { yPercent: -100, duration: 0.35, ease: UR.E.exit, overwrite: "auto" });
          } else if (st.direction === -1 && hidden) {
            hidden = false;
            gsap.to(header, { yPercent: 0, duration: 0.45, ease: UR.E.out, overwrite: "auto" });
          }
        }
      });
      header.addEventListener("focusin", function () {
        if (hidden) { hidden = false; gsap.to(header, { yPercent: 0, duration: 0.3, ease: UR.E.out, overwrite: "auto" }); }
      });

      /* call bar (mobile): slides in after intro, never hides on scroll */
      if (bar) gsap.set(bar, { yPercent: 100 });

      /* desktop call pill appears once the hero is passed */
      if (pill) {
        gsap.set(pill, { autoAlpha: 0, scale: rm ? 1 : 0.8 });
        ScrollTrigger.create({
          trigger: document.body, start: function () { return Math.round(window.innerHeight * 0.8); }, end: "max",
          onToggle: function (st) {
            gsap.to(pill, { autoAlpha: st.isActive ? 1 : 0, scale: st.isActive || rm ? 1 : 0.8, duration: rm ? 0.2 : 0.3, ease: UR.E.out, overwrite: "auto" });
          }
        });
      }

      this.initDropdown();
      this.initMenu();
    },

    reveal: function () {
      if (this.revealed) return;
      this.revealed = true;
      if (this.bar) gsap.to(this.bar, { yPercent: 0, duration: UR.reduced() ? 0.2 : 0.45, ease: UR.E.out });
    },

    initDropdown: function () {
      var self = this;
      var wrap = $(".has-dd");
      if (!wrap) return;
      var btn = $(".dd-toggle", wrap), panel = $(".dd-panel", wrap), items = $$("a", panel);
      var tIn, tOut;
      gsap.set(panel, { autoAlpha: 0, y: -8 });

      function open() {
        clearTimeout(tOut);
        if (self.ddOpen) return;
        self.ddOpen = true;
        btn.setAttribute("aria-expanded", "true");
        gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.22, ease: UR.E.out, overwrite: "auto" });
        if (!UR.reduced()) gsap.fromTo(items, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: UR.E.out, stagger: UR.S.micro });
      }
      function close(returnFocus) {
        clearTimeout(tIn);
        if (!self.ddOpen) return;
        self.ddOpen = false;
        btn.setAttribute("aria-expanded", "false");
        gsap.to(panel, { autoAlpha: 0, y: -8, duration: 0.15, ease: "power1.in", overwrite: "auto" });
        if (returnFocus) btn.focus();
      }
      btn.addEventListener("click", function () { self.ddOpen ? close() : open(); });
      var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      wrap.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && fine.matches) { clearTimeout(tOut); tIn = setTimeout(open, 120); } });
      wrap.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && fine.matches) { clearTimeout(tIn); tOut = setTimeout(close, 200); } });
      wrap.addEventListener("focusout", function (e) { if (!wrap.contains(e.relatedTarget)) close(); });
      wrap.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && self.ddOpen) { e.preventDefault(); close(true); }
        else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          var cur = items.indexOf(document.activeElement);
          if (e.target === btn && e.key === "ArrowDown") { e.preventDefault(); open(); items[0].focus(); }
          else if (cur > -1) { e.preventDefault(); items[(cur + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus(); }
        }
      });
      document.addEventListener("click", function (e) { if (self.ddOpen && !wrap.contains(e.target)) close(); });
    },

    initMenu: function () {
      var self = this;
      var burger = $(".burger"), menu = $("#mobile-menu");
      if (!burger || !menu) return;
      var rm = UR.reduced();
      var items = $$(".mobile-menu__list > li, .mobile-menu__actions .btn", menu);
      var lines = $$("span", burger);
      var tl = gsap.timeline({
        paused: true,
        onReverseComplete: function () { gsap.set(menu, { visibility: "hidden" }); }
      });
      gsap.set(menu, { yPercent: -100 });
      if (rm) {
        gsap.set(menu, { yPercent: 0, autoAlpha: 0 });
        tl.to(menu, { autoAlpha: 1, duration: 0.2 });
      } else {
        tl.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: 0.55, ease: UR.E.inOut }, 0)
          .fromTo(items, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: UR.E.out, stagger: UR.S.menu }, 0.25)
          .to(lines[0], { y: 8, rotate: 45, duration: 0.3, ease: UR.E.out }, 0)
          .to(lines[1], { autoAlpha: 0, duration: 0.15 }, 0)
          .to(lines[2], { y: -8, rotate: -45, duration: 0.3, ease: UR.E.out }, 0);
      }
      var inertEls = $$("main, footer, .call-bar");

      function setOpen(on) {
        self.menuOpen = on;
        html.classList.toggle("menu-open", on);
        burger.setAttribute("aria-expanded", on ? "true" : "false");
        burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
        inertEls.forEach(function (el) { if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
        if (on) {
          gsap.set(menu, { visibility: "visible" });
          gsap.to(self.header, { yPercent: 0, duration: 0.2, overwrite: "auto" });
          tl.timeScale(1).play();
          if (UR.lenis) UR.lenis.stop();
          document.body.style.overflow = "hidden";
          var first = $("a", menu); if (first) first.focus({ preventScroll: true });
        } else {
          tl.timeScale(1.25).reverse();
          if (UR.lenis) UR.lenis.start();
          document.body.style.overflow = "";
          burger.focus({ preventScroll: true });
        }
      }
      this.closeMenu = function () { if (self.menuOpen) { tl.progress(0).pause(); gsap.set(menu, { visibility: "hidden" }); self.menuOpen = false; html.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); inertEls.forEach(function (el) { el.removeAttribute("inert"); }); document.body.style.overflow = ""; if (UR.lenis) UR.lenis.start(); } };
      burger.addEventListener("click", function () { setOpen(!self.menuOpen); });
      document.addEventListener("keydown", function (e) {
        if (!self.menuOpen) return;
        if (e.key === "Escape") { setOpen(false); return; }
        if (e.key === "Tab") { /* trap focus between the sheet's links and the burger */
          var f = $$("a, button", menu).concat([burger]);
          var i = f.indexOf(document.activeElement);
          if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      });
      window.matchMedia("(min-width: 1024px)").addEventListener("change", function (m) { if (m.matches) self.closeMenu(); });
    }
  };

  /* ================= page transitions (MPA panel wipe) ================= */
  UR.transition = {
    leaving: false,

    init: function () {
      var self = this;
      var wipe = $(".page-wipe");
      this.wipe = wipe;
      if (!wipe) return;
      this.plate = $(".page-wipe__plate", wipe);
      this.pipe = $(".page-wipe__pipe", wipe);
      gsap.set(wipe, { yPercent: html.classList.contains("is-entering") ? 0 : 100 });

      document.addEventListener("click", function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest ? e.target.closest("a[href]") : null;
        if (!a) return;
        if ((a.target && a.target !== "_self") || a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;
        var raw = a.getAttribute("href");
        if (!raw || /^(tel:|mailto:|sms:|javascript:)/i.test(raw)) return;
        var url;
        try { url = new URL(a.href, location.href); } catch (err) { return; }
        if (url.protocol !== location.protocol) return;
        if (url.protocol !== "file:" && url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) {
          e.preventDefault();
          var t = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
          if (t) { UR.scrollTo(t); try { history.pushState(null, "", url.hash); } catch (er) {} t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
          else UR.scrollTo(0);
          return;
        }
        e.preventDefault();
        self.leave(a.href);
      });

      /* prefetch on intent (http/https only) */
      if (location.protocol !== "file:") {
        var seen = {};
        var pre = function (e) {
          var a = e.target.closest && e.target.closest("a[href]");
          if (!a || a.origin !== location.origin || seen[a.href] || a.pathname === location.pathname) return;
          seen[a.href] = 1;
          var l = document.createElement("link"); l.rel = "prefetch"; l.href = a.href; document.head.appendChild(l);
        };
        document.addEventListener("pointerover", pre, { passive: true });
        document.addEventListener("touchstart", pre, { passive: true });
      }

      /* bfcache back/forward: reset overlay and state */
      window.addEventListener("pageshow", function (e) {
        if (!e.persisted) return;
        self.leaving = false;
        html.classList.remove("is-entering", "is-intro");
        gsap.set(wipe, { yPercent: 100, autoAlpha: 1, visibility: "hidden" });
        if (UR.header && UR.header.closeMenu) UR.header.closeMenu();
        if (UR.lenis) UR.lenis.start();
        ScrollTrigger.refresh();
      });
    },

    leave: function (href) {
      var self = this, wipe = this.wipe;
      if (this.leaving) return;
      this.leaving = true;
      if (UR.lenis) UR.lenis.stop();
      var dest = href;
      if (!UR.store.set("urNav", "1")) { /* storage blocked (e.g. strict file:// origins): carry the flag in the URL */
        try { var u = new URL(href, location.href); u.searchParams.set("w", "1"); dest = u.href; } catch (e) {}
      }
      var went = false;
      function go() { if (went) return; went = true; location.href = dest; }
      setTimeout(go, 800); /* safety: navigate even if the tween stalls */
      if (!wipe) { go(); return; }
      gsap.set(wipe, { visibility: "visible" });
      if (UR.reduced()) {
        gsap.fromTo(wipe, { yPercent: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out", onComplete: go });
      } else {
        gsap.set(this.plate, { autoAlpha: 0 });
        gsap.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: UR.D.wipeOut, ease: UR.E.inOut, onComplete: go });
        gsap.to(this.plate, { autoAlpha: 1, duration: 0.25, delay: 0.25, ease: UR.E.out });
      }
    },

    /* called once the page module is initialised: plays preloader / wipe-in, then the page intro */
    enter: function (page) {
      var self = this, wipe = this.wipe;
      var introCalled = false;
      function intro() {
        if (introCalled) return; introCalled = true;
        if (UR.header) UR.header.reveal();
        if (page && page.intro) page.intro();
      }
      if (!wipe || !html.classList.contains("is-entering")) { intro(); return; }

      var isIntro = html.classList.contains("is-intro");
      var rm = UR.reduced();
      UR.store.del("urNav");
      gsap.set(wipe, { visibility: "visible", yPercent: 0, autoAlpha: 1 });
      html.classList.remove("is-entering");
      html.classList.remove("is-intro");
      function done() { gsap.set(wipe, { yPercent: 100, visibility: "hidden", autoAlpha: 1 }); }

      if (rm) {
        intro();
        gsap.to(wipe, { autoAlpha: 0, duration: 0.25, ease: "power1.out", onComplete: done });
        return;
      }
      if (isIntro) {
        UR.store.set("urIntroSeen", "1");
        var path = $("path", this.pipe);
        gsap.set(this.plate, { autoAlpha: 0 });
        gsap.set(this.pipe, { autoAlpha: 0 });
        var tl = gsap.timeline({ onComplete: done });
        tl.fromTo(this.plate, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: UR.E.out }, 0)
          .set(this.pipe, { autoAlpha: 1 }, 0.15)
          .fromTo(path, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.55, ease: UR.E.inOut }, 0.15)
          .to(wipe, { yPercent: -100, duration: 0.6, ease: UR.E.inOut }, 0.6)
          .call(intro, null, 0.75);
        /* hard cap: never block content past 2s */
        gsap.delayedCall(2, function () { tl.kill(); done(); intro(); });
        return;
      }
      /* normal internal navigation: wipe up after fonts (max 400ms wait), overlap the page intro */
      Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 400); })]).then(function () {
        var tl = gsap.timeline({ onComplete: done });
        tl.to(self.plate, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, 0)
          .to(wipe, { yPercent: -100, duration: UR.D.wipeIn, ease: UR.E.inOut }, 0.1)
          .call(intro, null, 0.4);
      });
    }
  };
})();
