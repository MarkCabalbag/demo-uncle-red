/* UR boot sequence (plan §7.3). Classic script, loaded last with `defer`. */
(function () {
  "use strict";
  var UR = window.UR;
  var html = document.documentElement;

  function boot() {
    if (!window.gsap || !window.ScrollTrigger || !window.SplitText) { if (UR && UR.fail) UR.fail(); else html.classList.add("no-motion"); return; }
    try {
      gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin, DrawSVGPlugin);
      ScrollTrigger.config({ ignoreMobileResize: true });
      UR.scroll.init();
      UR.header.init();
      UR.transition.init();

      var ready = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 500); })]);
      ready.then(function () {
        var page = UR.pages[document.body.dataset.page];
        if (page && page.init) page.init();
        UR.reveal.init();
        UR.footer.init();
        html.classList.add("motion-ready");
        UR.transition.enter(page);
        ScrollTrigger.refresh();
      }).catch(function (err) { console.error("[UR] boot error", err); UR.fail(); });

      window.addEventListener("load", function () {
        UR.media.loadDeferred();
        UR.media.watchRefresh();
        ScrollTrigger.refresh();
      });
    } catch (err) {
      console.error("[UR] init error", err);
      UR.fail();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
