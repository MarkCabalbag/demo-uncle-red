# Uncle Red's Plumbing: redesign demo

Plain HTML, CSS and vanilla JS. GSAP 3.15.1 (core, ScrollTrigger, SplitText, ScrollToPlugin, DrawSVGPlugin) and Lenis 1.3.27 load from jsDelivr. No build step.

## Run it
- Double-click `index.html`, or run `python -m http.server 8765` in this folder and open http://127.0.0.1:8765/.
- Needs internet: GSAP/Lenis (jsDelivr), fonts (Google Fonts) and photos (hotlinked from uncleredsplumbing.com.au).

## Pages
`index.html` · `about.html` · `domestic-plumbing.html` · `commercial-plumbing.html` · `hot-water-systems.html` · `blocked-drains.html` · `gas-fitting.html` · `contact.html`

Header and footer markup is duplicated on every page between `UR:HEADER` / `UR:FOOTER` comment markers, so it works from `file://` with no JS includes. Edit all 8 files when changing them.

## Sample content (demo only, replace before launch)
Everything below is tagged on-page with a dashed red "sample" / "confirm" marker:
- Stats counters (12+ years, 3,500+ jobs, 4.9 rating, 60+ suburbs)
- Three sample customer reviews
- Sample suburb list
- QBCC and gas licence numbers (`0000000`), insurance, hours
- Email `info@uncleredsplumbing.com.au` (obfuscated on the live site), quote reply timeframe
- Team names and roles, OG share image (`harley_logo.png` returns 404; `UCR5` is used instead)
- JSON-LD blocks (`TODO-CONFIRM` values) on Home and Contact
- New headlines and copy (live-site wording is reused where it exists)
- Banner photo licensing (looks like a stock or CGI render)
- ABN 21 779 939 740 is from the live Contact page; confirm it is current
