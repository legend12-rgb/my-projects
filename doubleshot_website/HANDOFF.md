# DOUBLESHOT website — handoff to next session

Written 2026-09-10. Read this **plus** `BRAND-BOARD.md` before touching anything.
Standing constraints: single-file/static HTML, vanilla JS, **no build step, no React,
no npm**. Python venv at `code/venv` for all tooling. It is a café — **no e-commerce**.

---

## 1. Where the build actually is

| File | State |
|---|---|
| `code/index.html` | Homepage "the film". Three.js 0.180 via import map, 140-frame scroll-scrub on one `CanvasTexture`, ACES filmic tonemap in the fragment shader, scroll-dwell engine, 6 chapters. **Working and good.** |
| `code/assets/site.css` | Shared design system. Single source of truth for tokens. |
| `code/assets/site.js` | Shared behaviour. All page-bound work inside `initPage()` so swup can re-run it. |
| `code/build_pages.py` | Rerunnable generator for the 4 inner pages. Edit this, never the generated HTML. |
| `code/menu.html` `roastery.html` `bakery.html` `locations.html` | Generated. **Stacked centred blocks — this is the weak part.** |
| `code/frames/desktop\|mobile` | 140 WebP each (7.8MB / 3.4MB). |
| `image order/frames_final/` | 312 QA'd JPGs + `manifest.csv`. |
| `brand-photos/` | **NEW** — 11 real photos pulled from the client's Instagram. See §4. |

### >>> START HERE (2026-09-13): phone pass 2 + the doughnut (client asleep, full permissions)
Client: phones are the main audience; "the upper buttons are not visible, I cannot switch
between tabs"; spacing/organisation off; every section and feature on the laptop must also be on
the phone; then "I do not like the person" (the runner): nothing beside "Amritsar runs on
Doubleshot", and a DOUGHNUT rolling along the bottom while scrolling. Desktop must not break.
Harnesses (all in `qa/2026-09-13_mobile_nav/`): `phone_check.js` (4 phones x 5 pages; ENGINE=webkit
for the iPhone engine; ONLY=<page>), `desk_shots.js` + `desk_diff.py` (desktop before/after pixel
diff, MOTION=1 for full motion), plus the old `qa/2026-09-12_mobile/mobile_qa.js` (label after3_2026-09-13).
- **Phone navigation** (`assets/mnav.js`, CSS in site.css "phone navigation"): below 820px a
  two-line button (44x44) after the order box opens `#mnav`, a full-screen page list (Home, Menu,
  Bakery, Roastery, Locations + hours, phone, Instagram) that wipes down; current page in camel;
  scroll lock, rest of the page `inert`, Escape/back-button/resize close it; tapping the current
  page closes it. `#mnav` is a SIBLING of `#nav` (never inside: `#nav.deep`'s backdrop-filter
  would become the containing block of a fixed child). Markup lives in build_pages.py `MNAV` +
  NAV and in index.html (keep in sync). Button shows only once JS adds `html.has-mnav`.
  mnav.js also publishes `--navh` and `html.nav-hidden` (sticky bars use them).
  Gotcha hit: a double rAF to start the wipe fired late in WebKit (after close); now a forced
  reflow (`void panel.offsetWidth`) then `.open`.
- **Header on phones**: hidden state `html #nav.hide{top:-160px}` (-9vw left ~35px of the bar
  showing); inner pages turn the bar solid after 24px of scroll on <=820 (text scrolled through the
  see-through bar). Homepage threshold unchanged (film). Inner hero top padding `calc(18vw+48px)`.
- **Menu rail** sits under the header while it shows (`html:not(.nav-hidden) .mrail{top:var(--navh)}`).
- **Parity with the laptop**: Menu signature moment now runs on phones (phone layout in
  MENU_EXTRA: name 10vw, cup centred, rail = row of short bars beside the kicker); Roastery
  horizontal three-act pin runs on phones (`.acts3.h`, sized to fit a 667px iPhone SE; the
  bottom bar is hidden on phones because the doughnut track sits right under it; no GSAP /
  reduced motion = vertical stack); homepage chapter dots shown on phones (right:10px).
  Hover-only effects (menu hover image, cursor tilt, velocity bend) cannot exist on touch.
- **Footer on phones**: blurb full width, Visit | Contact side by side, 44px rows (13px pad).
- **Runner removed, doughnut added**: `.runner-hero` markup + CSS deleted from index.html;
  runner.js / runner-paths.js no longer loaded (files kept on disk, not deleted). `assets/donut.js`
  draws an SVG doughnut (toasted ring with a real hole, wavy bone glaze, camel/green sprinkles)
  on the old `#run-track`; rotation = distance / radius (rolls without slipping, rolls back when
  scrolling up), arrives at the steaming cup. 30px desktop, 24px phones; phone fade 78 -> 54px.
  This is the one intended desktop change.
- **Verified**: phone_check Chromium 4 phones x 5 pages ALL PASS (header fits at 360, 5/5 links
  on screen, navigation + back, header hides/returns, rail, signature 6 steps, horizontal acts
  fit the screen, doughnut rolls, 0 overflow, 0 console errors). WebKit: all pass except the
  header-hide timing on Menu/iPhone 14 (the hide lands ~1.5s late while the signature pin is
  busy in headless WebKit; logic verified: class set, reaches -160px). Desktop: reduced-motion
  diff = identical except the 38x44 track patch (doughnut); nav height/link positions identical;
  full-motion Bakery differed only in scrub progress (the new build's trigger start 444 = true
  layout; the baseline had a stale measure).
- Still recommended: a look on a real iPhone (Safari) and a real Android before the presentation.

### (previous) START HERE (new chat, 2026-09-12): where the last session stopped
**Open question from the user: "I am unable to open the site on my phone."** Diagnosis done:
- The site only runs locally (python http.server). "localhost" on a phone is the phone itself.
- This PC: Wi-Fi `auup.amity.edu.in` (university network, profile Public), IP was
  `10.104.186.210` (changes per network). Server on :8091 listens on all interfaces (`::`),
  firewall has an inbound Allow rule for python.exe on Public, and
  `http://10.104.186.210:8091/index.html` returns 200 from the PC itself. No `localhost` links
  in the code. So the site is fine; the phone just cannot reach the PC (campus Wi-Fi client
  isolation is the likely block, or the phone is not on the same Wi-Fi).
- **Ports 8090/8091 are servers started by an older chat's preview**; they can stop at any
  time. Start your own (`.claude/launch.json` in creative-library has `doubleshot-8091` /
  `doubleshot-scrollscrub`; or `code\venv\Scripts\python.exe -m http.server <port>
  --directory code`).
- Options offered, user had not picked yet: (1) same Wi-Fi LAN URL (may be blocked by campus
  isolation), (2) phone hotspot -> PC joins it -> new LAN IP, (3) publish online (Vercel
  connector is available) = public, **needs the user's explicit yes before deploying**.
  For the presentation, (3) is the robust choice.
- Everything else from the previous sessions is done and verified (see the updates below:
  mobile pass, runner, order box, scroll fix, premium moves, heroes, polish).

### UPDATE 2026-09-13: full mobile pass (client: "no single-minute error on mobile")
Harness `qa/2026-09-12_mobile/mobile_qa.js`: 4 phones (iPhone 14 390@3x, Pixel 7 412, Android
360, iPhone SE 375) x 5 pages, REAL touch swipes (CDP dispatchTouchEvent; note
synthesizeScrollGesture's touch source does not scroll in headless Chrome, it gave a false
"stuck" everywhere), 4x CPU throttle, jank/long tasks by scroll position, errors, failed
requests, overflow, <12px text, <44px targets, address-bar resize jump test, screenshots ->
`sheets.py` contact sheets. iPhone engine: Playwright WebKit installed with the user's OK
(`webkit_journey.js`; mobile WebKit has no wheel input, it scrolls with scrollBy).
Research: GSAP starter (`ScrollTrigger.config({ignoreMobileResize:true})`), darkroom playbook
(gate Lenis to desktop), impeccable adapt.md + harden.md.
Found + fixed:
- **Lenis on touch fought native scroll** (`scrollBy(0,500)` moved 4px): Lenis now only for
  `(pointer:fine)` (site.js + index.html). Touch = native scroll; ScrollTrigger unchanged.
- **Address bar**: `ScrollTrigger.config({ ignoreMobileResize: true })` both files; the film
  canvas and the particles canvas no longer rebuild on a height-only resize on coarse pointers;
  `#sticky` 100dvh -> 100lvh (dvh re-laid out the film stage every frame of the bar sliding).
  Pixel 7 homepage bar jump 405px -> 0.
- **Menu at 360px was 385px wide** (layout viewport grew; body overflow-x hid it): the phone
  rail's link row set the single grid column's min-content. `.mgrid` -> `minmax(0,1fr)` + a
  `min-width:0` rule on phone grid children. Nav + order box overflowed 3px at 360: the box
  shows just "Order" at <=380px (the pop still offers both).
- **Bakery macro opened on a fully ink-covered screen** on phones (read as stuck/empty): the
  tiles now clear on their own trigger from `top 85%`, before the pin.
- Clean after the fixes: every page scrolls to the bottom on all 4 phones, 0 console errors /
  failed requests, no small text or small tap targets, bar jump 0-5px.
- **WebKit (iPhone engine) found the homepage 10px too wide**: the 3D-turned bakery cut-outs in
  `#house` poked past the edge, and iOS Safari ignores `overflow-x` on body. `#house` now has
  `overflow-x:clip` (Chrome never showed it). After: WebKit 5/5 pages ovX 0, scroll to the
  bottom, runner arrives; the hero runner finishes drawing on WebKit (fill-opacity 1).
- Final numbers (after2, 4 phones x 5 pages, touch, 4x CPU): p95 16.8-25ms; frames >50ms 0-6 per
  full page (homepage end: wall + step zoom); bar jump 0 except 25px on Menu/360 (emulation
  artefact: vh units change in emulation, not on real phones); 0 errors anywhere. Desktop audit
  re-run: clean apart from the known fixed-pin lab CLS.
- Known/left: iPhone-14 "max frame" numbers include screenshot stalls. Real-device check still
  recommended before the presentation (Safari on an actual iPhone), since emulation cannot
  reproduce momentum scrolling or real GPU memory limits.

### UPDATE 2026-09-12 (night): the heart = the runner (client pick)
The client's own wall mural (line-art runner, "Amritsar runs on Doubleshot", full-res IG
`DPOBDYnCc6g`) is now the site's signature. Verified in real renders
(`qa/2026-09-12_runner/rt2_*.png`, `runner_test2.js`), 0 console errors; audit clean apart
from the known fixed-pin lab CLS.
- **Trace** `qa/2026-09-12_runner/trace_v2.py`: white-only mask (min channel > 232, sat < 30:
  mural = 255, dispenser/chrome/frame peak ~150), split into 5 rig parts by crop-space polygons
  (legB, armB, body, legF, armF; legs cut along the shorts hem so the white shorts hide the
  joint), 3x upscale + blur contours -> `assets/runner-paths.js` (generated, 26 KB, do not
  hand-edit; re-run the script). `parts_v2.png` = colour-coded cut check.
- **Runtime** `assets/runner.js` (all 5 pages, after logo.js; also index.html):
  `[data-runner="hero"]` (homepage `#runs`, right half that was empty green) draws itself
  (outline dash, then fill) at 35% in view, then strides whenever the page scrolls. The
  **track** (`#run-track`, every page): hairline at the bottom; runner x = page progress
  (homepage: from `#runs`, after the film), stride = scroll (phase by distance, amplitude by
  speed, eases to the mural pose at rest), flips when scrolling up, arrives at the steaming cup
  (DSMark) at the bottom (`.arrived`, p > .985). On GSAP's ticker. Reduced motion: drawn, no stride.
- **Gotchas hit:** (1) each part must be ONE `<path>` (evenodd holes only work within a path;
  as separate paths every outline ring filled and he became a white silhouette). (2) the
  hero's IO needs threshold 0 for visibility (0.35 only for the draw), or he froze mid-stride
  when half off screen. (3) footer got `padding-bottom: calc(6vw + 64px)` + an ink fade under
  the track so the track never sits on content.

### UPDATE 2026-09-12 (evening): order box works; "the heart" diagnosed (not built)
- **Order box** (was two dead `href="#" data-needs-url` links; open item closed): a
  `<details class="order">` in the nav on all 5 pages (build_pages.py NAV + index.html; keep in
  sync), `assets/order.js` makes it two steps: Zomato or Swiggy, then the outlet; each link opens
  that page in a new tab. Closes on Escape, outside click, or scrolling away; opens with no JS.
  Every URL loaded in real Chrome (`qa/2026-09-12_order/`):
  Zomato (delivery): Ranjit Avenue `amritsar/doubleshot-coffee-roasters-1-ranjit-avenue/order`,
  Kabir Park `amritsar/doubleshot-coffee-roasters-kabir-park/order`, GT Road
  `amritsar/doubleshot-coffee-roasters-gt-road/order`, Mohali Sector 78
  `chandigarh/doubleshot-coffee-roasters-sector-78-mohali/order` (the sector-70 slug redirects
  here), Jalandhar Model Town `jalandhar/doubleshot-coffee-roasters-3-model-town/order`.
  **Swiggy lists these cafes only on Dineout (table booking)**: GT Road Amritsar #680189 and
  Mohali Sector 78 #693808; the delivery URLs return Swiggy's error page, so the UI says
  "Book a table (Dineout)" and points delivery to Zomato. Ask the client for Swiggy delivery
  links if they have them. Note: Zomato's "GT Road" outlet is probably our "Amritsar Colony,
  opposite GNDU" (GNDU is on GT Road): inferred, confirm.
- Gotcha fixed: the homepage still had `#nav nav a:not(.cta){display:none}` on phones (the
  descendant form the handoff warned about); it hid the order links. Now `#nav nav > a`.
  `#nav .order-pop .op-list a` resets the nav link styling inside the pop.
- **Heart diagnosis** (13 journey shots `qa/2026-09-12_heart/`): the film is the only authored
  peak; after "Amritsar runs on Doubleshot" the page becomes calm photo+text blocks with lots of
  empty green, the visitor never acts, and it ends on an Instagram grid (weak peak-end). The
  brand's most ownable assets are underused: the cup-and-steam mark poured as latte art, and
  their own wall mural (line-art runner, "Amritsar runs on Doubleshot", `00_mural_...` and
  full-res `DPOBDYnCc6g`). Options put to the client: the runner, pour-your-own latte art, one
  cup that travels the page, a single-take film re-generation (credits). Waiting on a pick.

### UPDATE 2026-09-12 (later): scroll smoothness fix (client: "glitching a lot")
Sources: Lenis README (darkroomengineering/lenis, GSAP integration section), official GSAP
performance + ScrollTrigger skills, darkroomengineering/cc-settings (MIT, vendored to
`cloud skills/web-animation/darkroomengineering_cc-settings`, see SOURCES.md). ume0207's Lenis
skill read but not vendored (no licence). Benchmark `qa/2026-09-12_scroll/jank.js` (real wheel
input, 100px notches / 16ms, real GPU: headless Chrome here runs ANGLE D3D11 on the Intel Arc,
not SwiftShader) + CPU profile `profile.js`.
- **Causes found:** (1) Lenis ran its own rAF loop, the homepage film another, GSAP a third:
  scroll, film frame, pins and scrubs updated a frame apart. (2) `pinType:'transform'` (my
  2026-09-11 CLS "fix") moved pinned sections by JS transform against the browser's scroll:
  shake. (3) Parallax loops interleaved getBoundingClientRect reads with transform writes
  (thrash, every frame). (4) The film texture canvas was sized up to 2x viewport and
  re-uploaded per frame (texSubImage2D). (5) Duration-based Lenis restarted an eased tween per
  wheel notch.
- **Fixes:** Lenis `{ lerp: 0.1 }` driven by `gsap.ticker` + `lagSmoothing(0)` (site.js and
  index.html); homepage film `tick` now also on `gsap.ticker` (after lenis.raf, same frame);
  pins back to `position:fixed` (defaults line removed in both files); reads-then-writes in both
  parallax loops (site.js on the ticker too); film texture canvas capped at the source width
  (`tdpr`), WebGL output at 1.5x; Lenis' official CSS added to site.css; velocity bend gentler
  (cap 2deg, slower, no stretch); asset stamps bumped.
- **Result (homepage):** long tasks 20 (1760ms) -> 1 (61ms); frames >50ms 32 -> 8; p95 33.4 ->
  16.7ms. Inner pages were already fine on frame time (their glitch was the transform pins).
  Remaining homepage cost is texture upload of the film (~0.4s over a full film scroll).
- **Trade-off, known:** with fixed pins the lab CLS is back to 1-2.7 on pinned pages (the
  audit scrolls programmatically; each pin start/end counts). Smoothness chosen. The way to have
  both is converting the pins to CSS `position:sticky` sections: NOT done, offer it.

### UPDATE 2026-09-12: premium moves A + B + D built (client: "just animate, make it more premium")
Research this round: GreenSock's skew-on-velocity demo + forum (gsap.com), Codrops Sticky Grid
Scroll (Mar 2026) and SVG Mask Transitions (Mar 2026). Techniques rebuilt, no demo code copied
(their repos state no licence). Verified in real renders (`qa/2026-09-11_polish/premium.js`,
`A_step_*.png`, `B_macro_*.png`); audit re-run: all 20 runs clean, CLS ~0.004.
- **A. Photo wall -> Step inside** (`index.html` `#step .wall`): nine client photos in a 3x3
  grid inside the step pin. Cells are 28vw x 28vh (the viewport's own aspect), so scaling the
  grid by 100/28 leaves the centre cell exactly full-bleed; that cell is `room-storefront` with
  the same center/cover + filter as the first `.lyr`, so the wall fades onto an identical frame
  (no seam). Columns assemble while the section scrolls in (outer rise, middle drops); the pin
  grew 240% -> 390% and the old zoom timeline is shifted by W=.9 (pace unchanged). `.wall` is
  display:none until JS adds `.on` (failed CDN / reduced motion = old section). Centring uses
  the CSS `translate` property; GSAP folds it into its own transform (x -568px = -50%), verified
  centred.
- **B. Crumb assembles out of squares** (Bakery `.macro-tiles`, site.js): 14 cols (7 on phones)
  x rows from the viewport aspect of ink tiles over the photo; shuffled, they shrink away as the
  pin scrubs (pin 130% -> 150%). Replaces the clip-path window. `.macro-copy` is hidden by JS
  now (it used to be CSS opacity:0, i.e. invisible without JS).
- **D. Photos bend with scroll speed** (`assets/velocity.js`, loaded on all 5 pages): smoothed
  per-frame scroll delta -> skewY (cap 3.5deg) + a tiny scaleY, written only to on-screen photo
  frames nothing else transforms (`.act figure, .rs-frame, .loc-photo, .city-ph, .band-ph,
  .ig-tile`; NOT `.pair-img` (data-reveal owns it) or anything GSAP moves). Idle = nothing
  written. Fine pointers only; reduced motion off. Verified: -2.7deg mid-scroll, cleared at rest.
  Test gotcha: a fast fling on Roastery lands inside the pinned acts3 (no targets), test on
  Locations.

### UPDATE 2026-09-11 (after midnight): two heroes + impeccable polish; premium options pending
Client: Locations hero cut the sign ("UBLESHO"); Bakery gloved-cake cut-out "not premium
at all"; wants more premium + "crazy" moves, web research, then a full impeccable polish.
- **Locations hero** -> `loc-hero.webp` (DCLhu-KxgEZ, Jalandhar: dark glass, the WHOLE sign,
  lit arches). `room-storefront.webp`'s own source cuts the "DO", so no re-crop could fix it
  (it stays on the homepage `#step`, full-bleed, where the cut does not read).
- **Bakery hero** -> framed `bakery-hero.webp` (DUQD8HBCYHQ: cookie held in two hands on black,
  hard light; no overlay, no watermark). `cut-cake.webp` is now unused. Crops:
  `qa/2026-09-11_images/crop_heroes.py`. Note: this is a hero change the handoff called
  final; the client asked for it directly.
- **Premium options A-F** sent to the client (`qa/2026-09-11_research/PREMIUM-OPTIONS.md`):
  A photo wall that folds into one image (Codrops Sticky Grid, Mar 2026), B images assembling
  out of squares (Codrops SVG Mask Transitions, Mar 2026), C 3D photo wave (Codrops, Jun 2026),
  D liquid photos reacting to scroll speed, E swaying menu lists (Codrops Dual-Wave, Jan 2026),
  F steam page transitions. Recommended A+B+D. **Nothing built yet: waiting for the pick.**
  Research: Best Bean Best Cup (Awwwards HM Aug 2026) inspected live: no GSAP/WebGL, 2 videos,
  one grotesk, a discount pop-up (what not to do). Flora Cafe timed out. Codrops demo repos
  state no licence: implement the technique, do not copy the code.
- **Polish (impeccable polish.md + audit.md)**, measured by `qa/2026-09-11_polish/audit.js`
  (5 pages x 1280x667 / 1440x900 / 768 / 390 touch, after scrolling the full page):
  * **CLS 1.3-5.4 per page -> ~0.004.** Cause (`cls.js`): every GSAP pin start/end counted as
    a full-viewport layout shift. Fix: `ScrollTrigger.defaults({ pinType: 'transform' })` in
    site.js AND index.html. Verified pins still hold (`pins.js`: pinned element top 0,
    translate follows scroll; note the spacer wrapper itself scrolls, measure the pin element).
  * Contrast: marquee `.dim` .34 -> .55 bone (2.81:1 -> ~4.9), marquee `|` opacity .6 -> .8,
    order `/` .4 -> .75 (2.48 -> 4.8). Map labels resized in SVG units so they render >= 12px
    on phones too (subs were ~9px). Footer address tracking .12em -> .04em.
  * `.act-link` moved from index.html into site.css: the Menu "The bakery" link had no style
    and a 81x21 tap target on inner pages; now styled with the 44px ::after hit area.
  * Homepage site.css `?v=` stamp bumped.
  * Result: 0 overflow, 0 heading skips, 0 missing alt/size, 0 console errors/warnings/failed
    requests, 0 contrast failures, 0 small text, 0 small tap targets on all 20 runs.
  * Detector (`sh scripts/impeccable detect`, 27 flags) triaged as intentional/false positive:
    hero eyebrows (heroes final), display negative tracking (house style), step layers at
    opacity 0 (they fade in on scroll), short caps labels, nav padding transition (fires once).

### UPDATE 2026-09-11 (late night): three motion builds (client picked them)
Client: "more animations, more stuff, use skills". Skills applied: build-3d-website
(named-step rail), impeccable `reference/animate.md` (one focal moment per surface, hidden
states gated behind JS), official GSAP ScrollTrigger skill (page-order creation, pin a
wrapper, onEnter for fast flings). All real content; verified in real renders
(`qa/2026-09-11_images/shots2.js`, `m_*` desktop 1280x667, `p_*` phone 390): 0 console
errors, warnings, page errors or failed requests.
- **Menu signature moment** (`.sig`, `bindSig`): desktop-only pinned section (6 x 0.6vh of
  scroll). Each of the 6 signatures fills upward behind a wave line: a CSS mask 3x the
  box whose `mask-position` transitions 0% -> 100% (`.on`/`.past` classes, no rAF work).
  Name rises out of a mask, price + one line bottom-left, named rail bottom-right.
  `body.has-sig` (set by JS) swaps it in for `.featured`; phones, reduced motion and no-JS
  keep the old row. Descriptions come from the menu or from what the client's own photo
  shows (`SIG_DESC` in build_pages.py).
- **Roastery bands** (`bindRoastery`): each `.band-ph` opens from a slit
  (`inset(46% 0 46% 0)` -> 0, on the FIGURE, not the img) while the img eases 1.3 -> 1.1
  and drifts; `.bn` joined the char-rise split. `.band-ph img` is deliberately NOT in
  liquid.js (clip + IO-driven ripple on one target = the known never-reveals bug).
- **Locations redesign** (`.lmap`, `bindLocations`): the identical card grid is gone
  (impeccable ban). A sketch map of Punjab (positions projected from real lat/lon,
  captioned as a sketch, not a boundary map) is sticky left; per city a route draws out
  of the Amritsar roaster (pathLength=1 + dashoffset, scrubbed) as its row arrives, the
  city lights, and the row opens its photo (clip-path) with outlets staggering in.
  Phones: static map, all routes draw once. Everything hidden sits under `.lmap.js`.
  Chandigarh has no directions link (not open yet).
- **Storefront city RESOLVED (was open item 2 below):** `room-storefront.webp`
  (DGKmjTxxCJT, arched windows) is **Jalandhar**: the same facade is in two
  Jalandhar-captioned posts (C_VPtASS6Qi, DCLhu-KxgEZ). The Locations hero alt now says
  Jalandhar. **Still wrong: the homepage `#step` labels it Ranjit Avenue** (not changed;
  ask the client, then relabel or make it city-neutral).
- City photos (`qa/2026-09-11_images/crop_locations.py`): Amritsar = Ranjit Avenue sign
  (existing ig-C0oRnxCxsBD crop), Jalandhar = `loc-jalandhar.webp` (C_VPtASS6Qi),
  Chandigarh = `loc-chandigarh.webp` (the 361px Brewing Soon card: small, a bit soft).
  **Mohali has no photo we can place there**: C3ueJDsxtvi ("our newest location", blue
  building) has no city in its caption, so it was not used; the row shows the living steam
  mark. Ask the client for a Mohali photo and the city of C3ueJDsxtvi.

### UPDATE 2026-09-11 (night): images sized back up + photos in the brew bands
Client (screenshots at ~1280x667): "images a bit too small", and the stacking brew
bands on Roastery are "good, but empty". The two scale-down passes overshot: photos were
253x317 on a 667px screen. New middle ground (~430-480px tall, below the 538-551px that
read as "zoomed"). Sizes only, no motion/timing changes. Measured at 1280x667:
- Inner hero frame `min(21vw,38vh)` -> `min(27vw,54vh)` (Roastery + Locations 346x432);
  hero cut-out 40vh -> 52vh (Menu + Bakery 347 tall).
- Roastery strip: 4-in-a-row (~250px wide) -> staggered 2+2 on 12 columns (369-466 wide,
  cap 64vh). Roastery act photos `min(20vw,38vh)` -> `min(30vw,56vh)` (374x467).
- Menu feats `clamp(220px,21vw,320px)` -> `clamp(240px,26vw,380px)`; from-the-counter
  15vw -> 19vw (cap 260); Bakery counter items 30vh -> 40vh (bagels left small: 231px sources).
- Homepage (`index.html`): act photos `min(20vw,40vh)` -> `min(30vw,58vh)` (384x480);
  bakery cut-outs 34vh -> 46vh; Step-inside interior `min(20vw,36vh)` -> `min(30vw,56vh)`.
- **Brew bands now carry a photo** (`.band-ph`, right side under the label strip; the next
  band covers it as it stacks; liquid.js ripple applies). Crops by
  `qa/2026-09-11_images/crop_bands.py` -> `assets/img/band-*.webp`. **Only V60
  (Cyq5RpChjmL) and Aeropress (Cxzhp2-RVVa) show the actual method.** Kalita = grinders
  (C4XSH7-xMnz top, above the heart sticker), French press = latte by the rain window
  (CxSFZLhRrvq), Cold brew = gloved cut-glass tumbler (C70iSlGxwyL); alts describe the
  photo, not the method. Ask the client for real Kalita / French press / cold brew shots.
- Homepage Sourcing photo (`sourcing.webp`) now looks visibly soft at 384px wide (a known
  520px source limit): needs a better bean/cherry photo.
- Verification: the Playwright MCP was locked by another chat, so real renders came from
  `qa/2026-09-11_images/shots.js` (cached playwright-core + installed Chrome, headless,
  fresh profile, wheel-scrolled so Lenis/reveals run). Shots: `qa/2026-09-11_images/after_*.png`.
  0 console errors. Next (client's words): "more animations, more stuff": not started.

### UPDATE 2026-09-11 (evening): signature motion + real-content fill + brain ingest
Client: after the scale-down, "empty green space at a lot of images ... some images very
small", wants "the most remarkable thing" in motion, "add more stuff into it". Chose:
**living logo + steam** and **liquid photo reveals**; fill with REAL content only.
- `assets/logo-paths.js` (generated) + `assets/logo.js`: the client's cup-and-steam mark,
  traced from their shopfront sign (IG C0oRnxCxsBD: luma>140, 7x7 opening kills the LED
  wires, skimage contours + Catmull-Rom). Loader: the outline draws WITH the real frame-load
  progress over a faint ghost, then the fill lands before the loader lifts. Nav mark on every
  page, footer sign-off mark, steam-only dividers (`data-part="steam"`). Steam above the rim
  (rim y=405 of 734) curls via feTurbulence/feDisplacementMap and leans toward the cursor;
  animates only while on screen; reduced motion gets the finished mark.
  GOTCHA: the homepage loads logo.js synchronously right after the loader, before the nav
  exists, so auto-mount waits for DOMContentLoaded (first build mounted only the loader).
- `assets/liquid.js`: per-photo SVG displacement ripple on entry (90 -> 0 over 2s,
  outCubic) and a small ripple on hover; filter removed when settled; Safari + reduced
  motion get a plain fade. Applies to photos only (acts, Roastery, pair, Step-in interior,
  Locations, Instagram, Roastery strip), never cut-outs or pinned full-screen scenes.
- Fill: pour cup 38 -> 52vh with a pin of items*0.5vh (was 0.75); Instagram strip (6 real
  posts, staggered, links to each post) before the footer; Menu "From the counter" (4
  cut-outs, links to Bakery); Roastery photo strip (roaster, beans, V60, bar pour; capped
  52vh); Bakery counter 4+3 with bigger items; Locations "All of them" gets the cafe photo.
  Crops live in `qa/2026-09-11_space/crops`; posts with IG text/sticker overlays
  (DHm1rYnoAc3, DFg-Js1yGkt top, DAk-mWjyS4j) were rejected or cropped below the overlay.
- Script of record: `qa/2026-09-11_space/build_signature.py` (exact-count guard).
- Brain: card `2026-09-11_doubleshot-website-build-sessions` (20 claims, 9 decisions) +
  `brain/decisions/2026-09-11.md`; 21 DOUBLESHOT sessions identified on disk; index rebuilt
  (84 cards / 1173 claims), chapters + skills synced. The digest filter missed the
  "zoomed in" complaints: recorded as a lesson in the card.

### UPDATE 2026-09-11 (later): scale-down, client said "looks zoomed in, cheap"
**The client's viewport is ~1280x667** (1920 laptop at 150% Windows scaling; derived from
the px-fixed nav order box in their screenshots). Test there first, not only at 1440x900.
Measured before: inner hero titles 205px (award ladder h1 7.9vw = 101px), section heads
82-84px (ladder 4.4vw = 56px), Roastery band names 147px, body 17-19px, photos 538-551px
tall on a 667px screen. Script of record: `qa/2026-09-11_scale/scale_down.py` (checked,
exact-count patterns). Changes, sizes only (no motion/timing/structure):
- Hero titles 15vw -> 9vw (framed 11.2 -> 7.4vw), hero cut-out 64vh -> 46vh, framed photo
  min(32vw,54vh) -> min(24vw,42vh), hero sub 21px max -> 18px. Hero animation untouched.
- Section heads -> ~4.4vw (menu categories, On the counter, macro, house head, h2.sec);
  runs line 10.4vw -> 7vw; act figures 7.2vw -> 5vw; Step-inside words 11vw -> 7.6vw;
  Roastery act words 12.5vw -> 8.4vw, band names 11.5vw -> 8vw; marquee 3.6vw -> 2.6vw.
- Body/lede: 17-18px -> 16px; lede max 26px -> 21px.
- Images: act photos and Roastery photos capped min(24vw,~50vh); pour cut-out 62vh -> 46vh;
  homepage bakery cut-outs max 44vh; counter items 34vh -> 27vh; menu feats max 290px.
- Left as is: homepage film overlays (.st) and the fitted footer wordmark.
- Before/after shots: `qa/2026-09-11_scale/before_*.png`, `after_*.png`.
- **Pass 2** (client: "icons, images, animations all still so large"), `scale_down_2.py`:
  act + Roastery photos -> min(20vw, 38-40vh); pour cup 46 -> 38vh; homepage bakery
  cut-outs 44 -> 34vh; hero cut-out 46 -> 40vh, framed min(21vw,38vh); hero titles 9 ->
  7.6vw (framed 6.4vw); Roastery act words 8.4 -> 7vw, band names 8 -> 7vw; Step-inside
  words 7.6 -> 6.8vw, interior photo min(20vw,36vh); runs line 7 -> 6.2vw; menu feats
  max 250px; counter items 25vh. Shots: `after2_*.png`.
- Film checked, not changed: 1920x1080 frames cover-fit at 1280x667 crop only ~7% top and
  bottom (scale 0.667), so the film itself is not "zoomed". Full-screen moments kept on
  purpose: the film, Step inside (client asked for full-bleed), the bakery crumb reveal.

### UPDATE 2026-09-11: impeccable polish pass (whole site)
Skill: the full upstream impeccable (pbakaus/impeccable, Apache-2.0) now lives in
`creative-library/cloud skills/web-design/pbakaus_impeccable/.claude/skills/impeccable/`
(the installed plugin copy ships SKILL.md only, no reference/ files). polish.md followed.
Audited in Playwright: 5 pages x 1440/1024/768 + a touch-emulated 390 phone. Fixed:
- **12px text floor** (was 9-11px): .attrib, .btn, .flist labels, footer labels + address,
  .order strip, .dir, roastery progress + mobile band labels, loader %, textlinks.
- **Contrast**: inactive list states were 30-32% bone (2.47-2.63:1, fail) -> 55%: homepage
  pour list, menu rail, roastery progress. 0 failures site-wide after.
- **Touch targets 44px** without layout change: nav links + wordmark (padding/neg. margin),
  order links, `.dir` and mobile `.mrail a` (invisible ::after), footer link rows on phones.
- **Headings**: footer h4 -> h2 (all pages), Locations outlet h3 -> h2. 0 skips.
- **Layout shift**: width/height on every non-hero img (menu feats read via PIL in
  build_pages `_wh()`).
- **Favicon** (was 404 everywhere): the client's own cup sign (IG C0oRnxCxsBD) lifted to a
  bone mark on the green: `code/favicon.ico`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`.
- Homepage: meta description, theme-color, Fontshare preconnects (the Google ones were unused).
- One shared `:focus-visible` accent ring (inner pages used the UA ring).
- Menu hover image is created on first hover (an empty-src img read as broken).
- Result: 0 console errors/warnings, 0 failed requests, 0 overflow at every size.
- Not changed (flagged, design not polish): Locations is still an identical card grid
  (impeccable absolute ban) -> the planned Locations redesign fixes it; the homepage has
  many uppercase eyebrows (taste doc 4.7 caps them at 1 per 3 sections).
- No og:image: needs the production domain for an absolute URL.
- Script of record: `qa/2026-09-10_polish/polish_2026_09_10.py`; shots in the same folder.

### UPDATE 2026-09-10 (evening): cut-outs v2, Step inside full-bleed, food motion
Client feedback: the cut-out SHAPES looked wrong (the glove and the hand were the shape,
the cake's top was sliced flat by the crop); Step inside opened on a blurry stack of
copies with green round the frame; wanted more bakery items and "crazy" food motion
(rotation). **The header/hero scroll is FINAL: do not change the homepage film or the
inner-page heroes.** The Bakery hero therefore still shows `cut-cake.webp` (gloved);
ask the client before swapping it.
- `code/make_cutouts_v2.py` -> `qa/2026-09-10_cutouts_v2/` (preview.jpg), then copied to
  `assets/img`: croissant-sandwich, bagel-sesame, bagel-stuffed, cookie-croissant,
  falafel (overwrote the unused v1 file), affogato, iced-layered, cappuccino (unused).
  New gates: largest connected component only, and an EDGE check (alpha touching the
  crop border = a flat-cut edge). Croissant sandwich touches the SOURCE's left edge:
  small flat corner bottom-left, unfixable without a better photo.
- Rejected: avocado toastie on the plate (ragged), tiramisu (the pour joins the jug),
  cut croissant C1y80GnRGeb (glove + logo). **`cut-cappuccino.webp` is the Winter Spice
  Latte cup (DCYs8yqxeW3), NOT a cappuccino.** Unused on purpose.
- Homepage `#house`: croissant sandwich / turnover / cookie croissant, each in a `.spin`
  wrapper. GSAP scroll turn on `.spin`, cursor tilt + hover lift on the img. CSS float removed.
- Bakery counter: 7 items (`.ci1`-`.ci7`). Bagels are `.ci-roll` (roll in, keep rolling
  with scroll) and `.ci-sm` (231px sources kept small). One layer per job, and no CSS
  transforms on any of them (GSAP owns them): `.ci` opacity + y, `.ci-in` scroll turn,
  `.ci-spin` entrance, img tilt + hover. `.counter{overflow-x:clip}` stops the roll-in
  from widening the page on phones.
- Menu featured: + Affogato 230, Iced Latte 240 (6 items, 3-col grid; mobile is an
  auto-flow scroller). `PHOTOS` hover map + Affogato, Latte.
- Step inside: frame is full-bleed (`position:absolute;inset:0`); layers 1-5 start at
  opacity 0 and fade in once the scroll starts; the zoom timeline is otherwise unchanged.
  `room-storefront.webp` re-exported from DGKmjTxxCJT at 1170x825 (the full source width;
  was 1050x740) with light unsharp. Still ~1.6x enlarged on a 1920 screen: source limit.
- Verified in Playwright (fresh context), screenshots in `qa/2026-09-10_step_food/`:
  pin start = layers [1,0,0,0,0,0], frame fills the viewport; counter 7/7 visible;
  hover dim 0.3 + tilt; bakery macro window starts centred; 390px no horizontal overflow.
  This closes "Unfinished" items 1a/1b below.
- Copy inferred, confirm with the client: "Stuffed bagel / Savoury filling, baked in",
  "Sesame bagel / New York style, baked here" (from their NY-style bagel posts).
- Animation skills: 6 MIT repos in `creative-library/cloud skills/web-animation/`
  (`SOURCES.md`), registered in the router. Official GSAP skills win on conflicts.

### UPDATE 2026-09-10 (later session): §3 plan BUILT
`#gallery` is deleted. In its place (`code/index.html`):
- `#runs`: "Amritsar runs on Doubleshot." It has `margin-top:-45vh` and a transparent→ink
  gradient top, so it rises INTO the last film frame while the pin releases (no hard
  cut). `updateOverlays` now also hides the fixed chapter copy once `#runs` passes 55vh.
- `#acts`: zig-zag rows Sourcing / Roasting / Brewing, one figure each, photo drift at
  0.12 depth, single rise on entry. Images in `code/assets/img/*.webp`, cropped from the
  client's own IG posts (sourcing `DAk-mWjyS4j`, roasting `C7Rs5gdBMAP`, brewing
  `Cyq5RpChjmL`), cropped below the IG cup watermark.
- Figures: only "24 hours" (cold brew) is a real number. Sourcing = "By hand",
  Roasting = "On premise". **Do NOT use "230°C"**: that caption is from a sourdough
  BREAD post (`DK3-IC6Rbdh`), not coffee roasting. Ask the client for a real
  sourcing/roast figure (origin, altitude, roast batch size).
- No "01 / 02 / 03" eyebrows: the taste doc bans section-number eyebrows (§9.F).
- Sourcing photo is soft (a 520px-tall crop from under baked-in text). Needs a better
  bean or cherry shot from the client.
- Verify visuals with the **Playwright plugin**, not the Browser pane: the pane never
  fires rAF, so every screenshot comes back flat green and IntersectionObservers never fire.

### UPDATE 2026-09-10: grade + "film must dominate" pass (client feedback)
Client: the exposure lift read as glare ("sun in the eyes"), looked cheap, and the text
was seen before the video. They want the **latte-art logo pour** and the **final splash**
to carry the page.
- Grade: `uExposure` 1.62 → **1.0**, `uSat` 1.10 → 1.04 (ACES kept). Rendered luma on the
  logo shot is now 75.6 against 81.6 for the raw source. **Do not lift exposure again**;
  the earlier "dim splash" note was about the raw footage, not a reason to push the grade.
- Dwell remapped from a frame sheet: logo finished at frames ~104-116 (0.75), white flash
  at 124-128 (avoid), cup on green ~132 (0.95), splash 136-140 (0.992).
- Type set like credits: h1/h2/body roughly 40% smaller. Chapters on the key shots use
  `.st.low` (bottom-left, no scrim, excluded from the -50% parallax). The Brewing price
  list became one line + menu link; the Visit buttons became text links.

### UPDATE 2026-09-10: second client pass (gloss, hover, photos, motion)
- Grade darker + matte: `uExposure` 0.82, `uSat` 0.95, grain 0.068, plus a matte
  shoulder in the shader (highlights partly desaturated, white point ×0.94). Logo shot
  luma is now 65.5 (was 75.6). Client wants darker, less "shiny/glossy", Rolex-like.
- Hover problem = the magnetic pull on nav links and buttons (`initMagnetic` in
  index.html, `bindMagnetic` in site.js). Both are now disabled. Keep them off.
- New `#house` section after `#acts`: the client's own IG photos (bakery trio + storefront
  + interior), 12-col asymmetric overlap, clip-path wipe on the IMG (not the figure:
  Chrome's IO honours the target's own clip-path, so a clipped figure never reveals),
  0.08 parallax, hover = brighten + caption (no movement). Scroll fallback reveals
  anything skipped by a fast fling.
- Skills applied: impeccable, frontend-design, ui-ux-pro-max, webdesign-guidelines,
  build-3d-website. motion-design is a Higgsfield video-generation flow (credits), so it
  was not run. The impeccable reference files (polish.md etc.) are not shipped in this
  install; its polish checklist was applied manually (44px link hit areas, focus-visible).
- Own preview server config: `doubleshot-8091` in creative-library/.claude/launch.json.

### UPDATE 2026-09-10: research-driven rebuild (client: "make it 10/10")
Full research is in `RESEARCH-2026-09-10.md`: 12 live sites inspected, award galleries,
and one tutorial watched. Client approved all six items, cut-outs, and keeping the
current film.
- GSAP 3.13 + ScrollTrigger added (jsdelivr), synced to Lenis via `lenis.on('scroll', ScrollTrigger.update)`.
- `#anim` 800vh → 640vh.
- `.marquee` after `#runs`: the tagline + cities, Web Animations API, playbackRate follows Lenis velocity.
- `#pour`: pinned list (Tiramisu ₹350 / Iced Matcha ₹300 / Hot Chocolate ₹290) with a
  cut-out per drink. Real menu prices only. Matcha Thandai dropped (glove runs off frame).
- `#house`: now bakery cut-outs only (cake / turnover / cookie), floating, with reserved sizes.
- `#step`: pinned Codrops-style layered zoom through the storefront (6 nested layers) into the interior.
- Footer: giant fitted "Doubleshot" wordmark.
- Cut-outs are made by `code/make_cutouts.py` (rembg `isnet-general-use`, model in
  `~/.rembg`). Rerunnable; per-image crop + erase rects for IG text overlays.
- Gotcha: lazy images below a pin shift its start/end. Each lazy `img` load triggers a
  debounced `ScrollTrigger.refresh()`, and the cut-outs carry width/height attributes.

### UPDATE 2026-09-10: inner pages, one at a time (client approved the concept)
Research is in `RESEARCH-2026-09-10.md`, section "Inner pages". The client wants the pages
done **one by one**. Status: shared shell + **Menu done**. Roastery, Bakery, Locations next.
- **swup removed.** Page changes are now cross-document View Transitions declared in
  `site.css` (`@view-transition{navigation:auto}`): the old page lifts to -12vh at 0.6
  opacity while the new one wipes up (clip-path inset 100%→0), 1s ease-in-out. The nav
  has its own `view-transition-name`. This works to and from the homepage too, because
  the homepage loads site.css. No support = normal navigation.
- New hero shell `.hx` for all inner pages: giant Cabinet Grotesk title + a floating
  cut-out (`cut`) or framed photo (`frame`, which also adds `.framed` for a smaller
  title). The title chars rise at +420ms.
- Shared marquee + fitted giant wordmark before/in every inner footer.
- Menu: 4 featured cut-outs (Tiramisu 350, Iced Matcha 300, Hot Chocolate 290, V60 260),
  a sticky category rail tracked by ScrollTrigger, and a row cascade via
  `ScrollTrigger.batch`. The hover image now shows only real cut-outs; the film frames
  were wrong for every item. Count corrected to 39 drinks (it said "forty two").
- Chandigarh = "Opening soon" everywhere (client decision; matches their IG).
- `site.js` was rewritten (magnetic + swup gone).
- **Roastery done:** pinned horizontal scroll through Sourcing / Roasting / Brewing
  (desktop only; phones get a vertical stack), a per-panel photo drift via
  `containerAnimation`, and five stacking sticky brew bands. Each band strip starts with
  the method name, because the strips are all you see once stacked. The Brewing photo is
  the La Marzocco from the Jalandhar post (`roastery-machine.webp`).
- **Bakery built:** "On the counter" = 5 cut-outs (cake, turnover, avocado toastie,
  grilled veggie, cookie) with per-item scroll speeds and a hover that dims the rest;
  the croissant-crumb macro opens from a clip-path window to full screen (pinned);
  "Goes with" is paired with the croissant-sandwich photo. The bagel and falafel
  cut-outs were made but dropped (a watermark fused to the bagel; a halo on the falafel).
- **Gotcha: cross-document View Transitions + browser cache.** Plain links (no `?v=`)
  served stale cached pages that still had swup and no `@view-transition`, so the
  transition looked broken. Always test in a fresh browser context. The homepage's
  site.css stamp was bumped for returning visitors. Head CDN scripts on inner pages are
  now `defer` (site.js too, to keep the order).
- **Unfinished at session end (do these first):**
  1. Two edits are NOT yet built or verified: (a) the bakery hover-dim now dims `.ci-in` and
     `figcaption` (GSAP owns `.ci` opacity), with a mobile reset; (b) `site.js` macro uses
     `fromTo` from `inset(18% 26% 18% 26%)`, because the 2-value shorthand made it slide left.
     Run `venv\Scripts\python.exe build_pages.py` from `code\`, then verify bakery.html in a
     FRESH Playwright context (hover dim, a centred macro window, mobile). Move the `bk_*.jpg`
     screenshots from the creative-library root to `qa\2026-09-10_inner_bakery\`.
  2. **Storefront city is probably mislabelled.** `room-storefront.webp` (IG DGKmjTxxCJT,
     arched windows, caption without a city) is labelled "Ranjit Avenue" on the homepage `#step`
     and in the Locations hero alt. The real Ranjit Avenue post (C0oRnxCxsBD) shows a different
     building: grey, a big white cup sign, grid windows. View DCLhu-KxgEZ (Jalandhar) to
     confirm, then relabel it, or make it city-neutral.
- Next: **Locations** (SVG map with lines drawn from the Amritsar roaster, expanding big
  city rows with hover photos, Dishoom-style per-outlet stories, Chandigarh "Opening soon").
  This replaces the identical card grid. Material: Jalandhar DCLhu-KxgEZ, C_VPtASS6Qi,
  C50jg4fILAv; Ranjit Ave C0oRnxCxsBD, DMH7bnVRByq, DL7EyMeRnpZ;
  `brand-photos\10_LOGO_chandigarh_card.jpg`.
- Optional cleanup: the unused `Swup.umd.js` in the index head, and dead `.ph/.bake/.room`
  CSS in index.html.

### The one thing the client hated (now fixed, see above)
`#gallery` in `code/index.html` (~line 394) — a 7-tile grid of stills taken from
the film. Client: *"the images over there are not very good. They are looking very bad."*
**Delete it and replace per §3.**

---

## 2. Research findings (3 agents, already run — do not re-run)

### What goes below a scroll-scrub hero
Surveyed 9 sites that pin a film to scroll.

- **In 8 of 9, the next section is a short declarative sentence carrying new
  information the film could not state. Nobody re-shows the hero's imagery.**
- Asked directly whether a gallery is ever right in that slot: **no.** A grid earns
  the slot only when each tile carries *unique* data. A grid of film stills fails
  that test by definition — same footage, no new fact.
- The next section must **visibly intrude into the last hero frame while the pin is
  still releasing.** Every site that hard-cuts after the pin ends reads as two
  websites stapled together. **The current build hard-cuts.** This is a real bug.

### Inner pages
- **Alternating split layouts** — image left / type right, then flipped, then a
  full-bleed break. Not stacked centred blocks. *"That alternation is what you're
  missing."* All four inner pages currently violate this.
- Inner-page motion is deliberately quieter than the hero: char-mask reveals on
  headings only, `translateY` on image blocks at ~0.12 depth, nothing else. The hero
  earns loudness precisely because the inner pages don't compete.

### 3D / shaders
- ✅ **Already applied**: ACES filmic tonemap (Narkowicz) replaced the plain gamma
  lift; velocity-reactive grain scale. This is what fixed the "dim splash" complaint.
  Verified rendering.
- Worth vendoring, all licence-checked:
  | Skill | Stars | Licence |
  |---|---|---|
  | `Leonxlnx/taste-skill` | 85.8k | MIT |
  | `v2space-labs/shader-for-interfaces` | 108 | MIT |
  | `feitangyuan/motion-web` | 65 | MIT (vanilla Three.js — fits no-build) |
- ❌ `AThevon/genjutsu` — NOASSERTION licence. **Do not vendor into client work.**

---

## 3. The agreed plan for below the hero

Replace `#gallery` with two beats:

**Beat 1 — the sentence.** `Amritsar runs on Doubleshot.`
This is the client's own line, painted on their own café wall (see
`brand-photos/00_mural_amritsar_runs_on.jpg`). It is real copy they own, not filler.
It passes the research test exactly: the film shows coffee being made; it cannot say
*a city drinks this.*
Type only, oversized, on the green ground. **Must begin translating up into the last
hero frame while the pin is still releasing** — no hard cut.

**Beat 2 — numbered process.** `Sourcing 01 / Roasting 02 / Brewing 03` (their own
tagline). Each step carries **one hard number** and one photo in the house style
(§4). Quiet, not loud.

---

## 4. Brand photography — MAJOR FIND

Pulled from `@doubleshotroasters` (14.7K followers) on 2026-09-10 into
`brand-photos/`. **The CDN URLs in `brand-photos/urls.txt` are signed and have
already expired — the JPGs on disk are the only copy. Do not delete them.**

### The client has a real photographic house style, and earlier builds ignored it
`03_orange_cake_glove`, `04_matcha_thandai`, `11_cookie_in_hand` are all the *same
shot*: product held in a **black-gloved hand, against near-black, hard side light.**
That is precisely the film's grade. It sits on the green ground with no adjustment.
**Use this as the system for Beat 2.** It is not something to invent or generate.

### UPDATE 2026-09-10 (later session) — full-res pull done: `brand-photos/fullres/`
- **74 photos**, all from `@doubleshotroasters` only, each byte-verified against the
  CDN source. `manifest.csv` maps post code → file → caption. Filenames:
  `ds_<p|reel>_<postcode>_<WxH>.jpg`.
- Sizes: photo posts 1080×1350 up to 2730×1820; reel covers 640×1136 to 1080×1920.
  Much better than the 361×640 thumbnails below (those are kept, not deleted).
- Excluded on purpose: `marathonmedia.in`, `deol_amrit` (not the client) and
  `doubleshottricity` (separate account — ask the client whether it is theirs).
- Only the newest ~84 of ~325 posts were reached. Instagram stops loading the grid
  while the Chrome tab is hidden. To get the rest: keep the Instagram tab visible and
  re-run the harvest.
- **How it works** (downloads are blocked after the first; Instagram's CSP allows only
  `ws://localhost`): run the stdlib WebSocket receiver
  (`receiver.py`, listens on :8765, writes into `fullres/`) and send from the tab.
  Two traps already hit: Chrome **fragments** large WS messages (reassemble to FIN),
  and **hidden tabs throttle timers**, so wait on the ack event, never poll with setTimeout.
- New shots worth using: storefront exterior (`DGKmjTxxCJT`, `DCLhu-KxgEZ`), Jalandhar
  espresso bar (`DFg-Js1yGkt`), more black-glove house-style shots (`Dc1IHzQpps4`
  orange cake, `DQT2-nuCRL-` pastry, `DUQD8HBCYHQ` cookie), and interiors
  (`DHm1rYnoAc3` 1170×2080, `DQwoKdnCX9j`).

### `10_LOGO_chandigarh_card.jpg` is the logo
The "Brewing Soon — Chandigarh, Sector 8" card carries the full DOUBLESHOT wordmark
plus the cup-and-steam mark, clean on white. **The logo has been missing from the
entire site all along.** Trace this to SVG.

### Inventory
| File | Content | Use |
|---|---|---|
| `00_mural_amritsar_runs_on` | Line-art runner mural + the tagline | Beat 1 reference / possible art |
| `01_interior_seated` | Real café interior, people, cane chairs | Only genuine environment shot — locations page |
| `02_milk_pour_3years` | Milk pour into branded cup, dark | Brewing 03 |
| `03_orange_cake_glove` | Orange upside-down cake, gloved hand | Bakery / house style |
| `04_matcha_thandai` | Matcha Thandai, gloved hand, dark stone | Menu / house style |
| `05_cup_on_table_light` | Cup on table, light, minimal | Quiet break |
| `06_summer_sips_coconut` | Promo graphic, bright blue sky | **Off-palette — probably skip** |
| `07_outlet_collage` | Street/outlet collage | Busy — locations only |
| `08_sourdough_platter` | Sourdough platter, heavy text overlay | Bakery, needs the overlay cropped out |
| `11_cookie_in_hand` | Cookie in hand on black | Bakery / house style |

**Excluded deliberately:** one grid post is credited to *Marathon Media®️*, not the
client. Not theirs to publish — do not use it.

### Resolution caveat — READ THIS
These are **640px grid thumbnails** (most are ~361×640 because the posts are Reels
and the tile is a video cover frame). Fine for contained tiles at ~30vw. **They will
not survive a full-bleed crop.** Two ways to fix:
1. Client grants the Claude-in-Chrome extension access to `instagram.com` (extension
   icon → site access → allow), then originals can be pulled logged-in at full res
   and the whole feed can be scrolled back, not just the newest 12.
   *Attempted this session; blocked by that domain permission.*
2. Client sends original photography.

---

## 5. Open items / blockers

- [ ] **Real Zomato and Swiggy URLs** — currently `data-needs-url` placeholders.
- [ ] **Logo SVG** — trace from `brand-photos/10_LOGO_chandigarh_card.jpg`.
- [ ] **Full-res photography** — see §4 caveat.
- [ ] **CONTRADICTION:** Instagram says Chandigarh Sector 8 is *"Brewing Soon."*
      `BRAND-BOARD.md` and `locations.html` list Chandigarh as a **live outlet.**
      One is wrong and it is on the live locations page. Ask the client.
- [ ] **Unresolved conflict flagged to client:** their printed menu is black monospace
      on cream (utilitarian) vs the elegant Roadster aspiration they approved.
- [ ] Inner pages still need the alternating-split rebuild (§2).
- [ ] Optional: depth-map parallax on one or two hero holds.

### The hard ceiling, unchanged
The source footage is a **7-cut montage with a white flash**, not one continuous take.
That is the real limit on how premium the scroll can feel. The genuine fix is
regenerating as a single continuous ~15s take, which **costs Higgsfield credits and
has not been authorised.** Do not spend credits without asking.

---

## 6. Hard-won gotchas — do not rediscover these

- **Verify canvas output with `getImageData`, not screenshots.** A whole session was
  lost chasing a phantom "black gap" that was caused by my own diagnostic
  `ctx.setTransform(1,0,0,1,0,0)` leaving the transform at identity, so `draw()`
  repainted only the top-left quarter of a dpr-scaled backing store.
- **`#copyscrim` must stay a sibling layer, never a pseudo-element.** As `.st::before`
  it got clipped by the parent's own `clip-path` reveal and `overflow:hidden`, hard-
  edging the gradient *and* inflating `scrollHeight` by exactly its 10vh bottom inset
  (63px), faking a "content overflows" on every chapter.
- **Never patch `build_pages.py` through a bash heredoc.** It was corrupted twice that
  way (block landed at top of file; `\n` interpreted literally). Rewrite wholesale
  with the Write tool.
- **A CSS unicode escape mangled through heredoc→Python** turned `'\20B9'` into a
  literal control char + "B9", rendering as "B9". grep hid the control char. Write the
  literal ₹ glyph.
- **Stamp `?v=<epoch>` on both shared assets every build.** Browser-cached
  `assets/site.css` made correct changes appear to do nothing.
- **Don't build 140 individual THREE textures** — 1080p × 140 ≈ 1.1GB VRAM. Composite
  one offscreen 2D canvas into a single `CanvasTexture`.
- **Chapter crossfades must be staggered** (out 0.22s, in 0.5s with 0.22s delay).
  Equal rates stack two headings in the same position.
- Mobile nav: `#nav nav > a` (direct children only). `#nav nav a:not(.cta)` stranded
  the "Order /" label by hiding the nested links.

### Content facts that were invented and corrected — do not regress
- There is **no "Chai Latte ₹119."** It is **Masala Chai Latté ₹190.**
- Cold brew is **24 hours**, not eighteen.

### Palette note (a correction I made to myself)
The anti-AI-slop ban is on *cream background + brass accent*. The Roadster reference
is *green ground + cream type*, and the approved rotation explicitly lists
"Forest: deep green + bone + amber". The forest green is **correct** — it was removed
once by mistake and restored. Ground `#0A2111` is the footage's own green (hue 138°);
Roadster forest `#1E3A28` is hue 141°. Three degrees apart, measured not guessed.
