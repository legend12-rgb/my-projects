# DOUBLESHOT Coffee Roasters — brand board & build plan

Status: **draft, needs your answers.** Last updated 2026-09-10.

## Why this file exists

The process documented in the brain (`brain/chapters/web-design.md`, from
*"Build $10,000 Websites using Claude Code"*) is:

> **install skills → build a BRAND BOARD → write a PLAN → only then build.**
> *"Most people skip the brand board and the plan, and it's why Claude then rushes
> itself and creates something that doesn't actually look good."*

I skipped both and went straight to building. Three rebuilds later, that is
visibly the reason. This file is the missing step. Nothing further gets built
until the open questions at the bottom are answered.

---

## 1. The real brand (from `brain/cards/2026-09-08_doubleshot-brand-research`)

These came from the live Instagram profile and public coverage. **The site
currently contradicts several of them.**

| Fact | Source tag | Site status |
|---|---|---|
| Tagline is **"Sourcing \| Roasting \| Brewing"** | observed | **Not used at all** |
| **"100% Eggless Artisan Bakery and Savoury"** | observed | **Completely absent** |
| Locations: **Amritsar** (SCO 49, B Block, District Shopping Complex, Ranjit Avenue), **Chandigarh, Mohali, Jalandhar** | observed | Absent; copy is Western-coded |
| Roasting is done **on premise**; coffee cherries **individually handpicked** | observed | Absent |
| Latte art is a **recognised strength** in public reviews | observed | Present in footage only |
| Logo: black circle, white line-drawn cup, two curling steam ribbons; replaces the O in the wordmark | observed | **Not on the site** |
| In-store world reads **dark, warm, wooden, with gold accents** | observed | Partially |
| 6,984 followers; Highlights include AESTHETICS, DESIGN, W.I.P. | observed | n/a |

**The two biggest misses:**

1. **"Sourcing | Roasting | Brewing" is a three-act structure the brand already
   owns.** The site invents six arbitrary chapters instead of using it. And act
   one is *already printed on the cup* — the engraved botanicals are coffee
   cherries, and the cherries are handpicked. The sourcing story does not need
   inventing.
2. **This is a Punjab, India multi-outlet speciality roaster**, not a generic
   Western third-wave roaster. All current copy ("warm light, hard chairs, good
   noise") is Western-coded and should be rewritten or removed.

> Evidence caveat carried from the brain: these were read live in a browser and
> **no frame was archived**, so they are tagged `observed`, not `seen`. Worth
> re-verifying against the live profile before shipping copy that depends on them.

---

## 2. Design system (current, evidence-backed)

### Palette — "Dark Roast"
Sampled from Stumptown's live site CSS, then adjusted.

| Role | Hex | Contrast on ground |
|---|---|---|
| Page ground | `#14100E` | — |
| Raised surface | `#241D19` | — |
| Primary text | `#F6F5F3` | 17.36:1 |
| Secondary text | `#CFC6BB` | 11.21:1 |
| Accent (bone) | `#E8DFD3` | high |
| Deep green (cup beat only) | `#2A4033` | — |

**Open decision — the accent.** It was antique gold `#C0A868`. I removed the gold
because `impeccable`'s category-reflex check flags "coffee brand → brown + gold"
as the first-order AI default, and the two best coffee sites found in research
(escape.cafe, assemblycoffee.co.uk) use **two colours and no third accent**.
**But** the brain says the real in-store world has **gold accents** — so gold may
be brand-accurate rather than a reflex. See Question 2.

**Scrim rule (computed, non-negotiable):** over bare crema `#F0B45A`, white text
is only **1.69:1**. Body copy needs `rgba(0,0,0,.60)` minimum behind it. Never put
an accent-coloured accent at body size over crema.

### Typography
- Display: **Cabinet Grotesk** 500/700/800 (Fontshare, free commercial)
- Body: **Switzer** 300–600 (Fontshare, free commercial)
- Sans display, not serif, deliberately: the taste doc names *"creative brief =
  serif"* as the single most-tested AI tell, and bans Fraunces + Instrument Serif.
- Ladder (measured off Awwwards-winning coffee sites): section headline is
  **4.4× body**; display is 7.9×; negative tracking **scales with size**
  (−.02em body → −.06em display); headline line-height drops **below 1**.

### Layout
- Side padding `4.63vw`; section vertical padding `10–15vw`
- Copy over a full-bleed visual caps at **~28vw** (paragraphs only; display type
  gets its own wider allowance)
- Two colours plus at most one accent. Colour comes from the footage.

---

## 3. Current structure (what is built now)

Pinned scroll-scrub stage, 140 WebP frames, ~12 viewports of scroll, with six
overlaid chapters at weighted dwell points:

| # | Chapter | Dwell @ | Footage beat |
|---|---|---|---|
| 1 | Hero — wordmark, tagline, spec line | 0.045 | bean |
| 2 | Quote | 0.205 | grinder |
| 3 | The roast — 4-item list | 0.445 | espresso extraction |
| 4 | What we pour — menu list | 0.655 | latte art |
| 5 | The room — hours | 0.925 | branded cup reveal |
| 6 | CTA | 0.988 | splash |

Then: gallery (7 stills), footer.

**Proposed restructure** (pending your answer): collapse to the brand's own
three acts — **Sourcing → Roasting → Brewing** — with the cherry/handpicking
story as act one, the on-premise roast as act two, and latte art as act three.
That is the brand's tagline rendered as a film.

---

## 4. Technical architecture

- Single-file `code/index.html` (~32KB), no build step, ES module
- **Three.js 0.180** — frames composite onto an offscreen 2D canvas, which is
  the *single* texture WebGL sees (140 individual 1080p textures would be ~1.1GB
  of VRAM). One GPU pass does grain, velocity-driven chromatic aberration and
  vignette, replacing a CSS blur filter and two DOM overlay layers.
- **Lenis 1.3.26** inertial scroll; **SplitType 0.3.4** char-mask reveals
- Scroll-dwell engine: Gaussian density → cumulative LUT → inverted. Measured
  **34px of scroll per frame at a dwell point vs 10px between** (3.4× slowdown).
- Frames: 140 desktop WebP (7.8MB) + 140 mobile (3.4MB), auto-switched
- Mobile: verified no horizontal overflow, mobile frame set, rail hidden, nav
  collapsed, copy at 88vw

### Known ceiling
The source footage is a **7-cut montage with a white flash**, which violates the
scroll-scrub footage contract (*"one continuous move, no hard cuts"*). Per-beat
scroll weighting hides it, but the real fix is regenerating as one continuous
~15s take. Costs Higgsfield credits.

---

## 5. Verified brand data (pulled live 2026-09-10)

Sourced from Google's business listing, the brand's own site listing, Instagram
and aggregator pages. **These are now live on the site.**

| Field | Value |
|---|---|
| Phone | **+91 77430 07183** (alt: 0183 516 2920) |
| Address | **SCO 49, B Block, District Shopping Centre, Ranjit Avenue, Amritsar 143001** |
| Hours | **Every day 09:00 - 21:00** (their own site; aggregators disagree, see below) |
| Outlets | Amritsar (Ranjit Avenue, Kabir Park, Amritsar Colony opp. GNDU), Mohali, Jalandhar, Chandigarh |
| Instagram | @doubleshotroasters, **14.7K followers** |
| Bio | "Sourcing \| Roasting \| Brewing / 100% Eggless Artisanal Bakery & Savoury" |
| Brand line | "Some come for the coffee." |
| Price for two | ~₹500 (Ranjit Avenue), ~₹1000 (Kabir Park) |
| Known menu | Black Coffee V60; Chai Latte ₹119; cold brew steeped **24 hours** |
| Roasting | **On premise**, beans roasted in-house |
| Rating | 4.6 (994 Justdial / 2,474 magicpin), 4.9 (Tripadvisor) |

**Conflicts to resolve with the client:**
- Hours: own site says 09:00-21:00; Zomato says 09:30-21:30; Justdial and magicpin
  say 10:30-21:00/21:30. The site currently uses the brand's own figure.
- Follower count: the brain card says 6,984, live says 14.7K. The brain card is stale.
- The brain listed 4 outlets; there are at least 3 in Amritsar alone.

**Still invented and needing replacement:** full menu with prices, the
"picked by hand" phrasing (supported by coverage but not a brand quote), and
anything on the gallery/footer beyond location names.

---

## 6. Decisions taken

1. **Structure: the brand's own three acts.** Sourcing / Roasting / Brewing,
   mapped onto the single existing film: bean -> grinder (Sourcing), extraction
   (Roasting), latte art (Brewing), then the bakery beat on the cup reveal and
   Visit on the splash. Six dwell points retained, content rebuilt.
2. **Accent: bone, two-colour.** All hue comes from the footage. Gold rejected
   as the category reflex even though the in-store world has gold accents.
3. **The eggless bakery gets its own chapter.** It was completely absent before.
4. **Real contact data is live**; the invented spec line, hours, email and quote
   are gone.

## 7. Still open

- Full menu and prices
- Real logo SVG (cup + two steam ribbons) - not on the site yet
- Real photography beyond the generated film
- Which hours figure is correct
- Whether this is one site or one per outlet
- The footage is still a 7-cut montage; a single continuous take is the real fix


---

## 8. Roadster reference + the measured palette decision (2026-09-10)

Client shared the **Roadster Coffee** identity by Markaworks as a target.
Their stated concept: *"Fuel your journey with timeless coffee"*, palette named
**"Espresso Leather"** and **"Pistachio Cream"**, and a **custom logotype** built
from "curves of chrome details and leather interiors" (so it is NOT a licensable
typeface).

**Correction to an earlier call in this project.** I had removed forest green as
a banned "premium-consumer palette" reflex. Re-reading the taste doc, that was
over-applied: the ban is on *cream BACKGROUND + brass/ochre accent*. Roadster is
*deep green ground + cream type*, and the doc's **approved** rotation explicitly
lists **"Forest: deep green + bone + amber accent (Filson / Patagonia premium)"**.
Roadster is in the approved lane.

**Then measured rather than argued.** Sampled the actual frames with ffmpeg:

| Sample | Hex | Hue |
|---|---|---|
| Footage's own settled background green (frames 133-140) | `#0A2111` | **138 deg** |
| Roadster forest green | `#1E3A28` | **141 deg** |
| Footage crema (frame 68 average) | `#A46A42` | 24 deg |
| Roadster camel | `#C6A472` | 36 deg |

**The greens are three degrees apart.** Roadster's forest is literally this
film's own background green, lifted (val 23% vs 13%, sat 48% vs 70%). The camel
sits 12 degrees off the crema, same warm family. So the palette is not a taste
call, it is already in the footage.

**Applied palette:** ground `#0A2111` (the film's green), raised surface
`#1E3A28` (Roadster forest), bone `#F1EDE4`, secondary `#C9C4B6`, tertiary
`#B2BCB0`, accent camel `#C6A472` used sparingly.

**Type:** **Zodiak** (Fontshare, free, 400/700) for the WORDMARK and
flat-background headings only. Cabinet Grotesk for chapter headings that sit over
footage, Switzer for body. This mirrors what Roadster themselves do: serif is the
logo, everything else is wide-tracked caps. High-contrast serif strokes break up
over moving video, which is why they never go over the film.

**Legibility fix this forced:** a full-width scrim cannot tame a near-white milk
frame. Each chapter now carries its own radial scrim (`.st::before`) so contrast
holds regardless of what frame is behind it. This is a legibility device, not
decorative glass.

**Not transferable from Roadster:** the vintage-Americana narrative (Porsche 911,
"the open road", LA address). DOUBLESHOT is a Punjab roaster whose real story is
handpicked cherries, on-premise roasting and a 100% eggless bakery.

---

## 9. Decisions locked (2026-09-10)

- Palette: **Roadster forest lane**, verified against the footage
- Type: **serif wordmark only** (Zodiak), grotesk over footage
- Scope: **multi-page site**, not a single scroll page
- Commerce: **none**. It is a cafe. Beans are brand storytelling, no cart.

## 10. Proposed page architecture (needs sign-off)

1. **Home** - the scroll film + the three acts, ending in Visit
2. **Menu** - coffee, plus the eggless bakery and savoury, real prices
3. **The Roastery** - sourcing and on-premise roasting, the long-form story
4. **Bakery** - the 100% eggless position given its own room
5. **Locations** - Amritsar (3), Mohali, Jalandhar, Chandigarh, with hours per outlet
6. (optional) **Journal** - the brand keeps AESTHETICS / DESIGN / W.I.P. highlights on Instagram, so they already produce this content


---

## 11. THE REAL MENU (client-supplied, 2026-09-10). Prices in INR.

Supersedes everything found via search. **The "Chai Latte 119" figure I pulled
from a search snippet does not exist on this menu** - it is Masala Chai Latte at
190. Do not trust aggregator scrapes for prices again.

**ESPRESSO**
| Item | Hot | Iced |
|---|---|---|
| Espresso shot | 150 | |
| Americano | 180 | 205 |
| Cortado | 190 | 195 |
| Cappuccino | 190 | 235 |
| Flat white | 190 | |
| Latte | 220 | 240 |
| Mocha | 265 | 280 |
| White mocha | 285 | 300 |
| Toasted spice latte | 280 | 280 |
| Affogato | 230 | |

**SPECIALS** - Mont Blanc 299 · Espresso Blanc 339 · Matcha Cloud 339 ·
DS Tiramisu Latte 350 · Jaggery Latte 260 · Roasted Hazelnut Latte 280 ·
Roasted Almond Latte 280 · Hot Chocolate 290 · Mug of Love 305 · Double Malt-A 350

**COLD DRINKS** - Vietnamese Iced Coffee 315 · Espresso & Tonic 275 · Frappe 280 ·
Iced Matcha Green Latte 300 · Ice Tea (peach/lemon) 230 · Mojito (lemon/orange) 225/280 ·
Watermelon Mojito 280 · Iced Matcha Frappe 300 · Orange Matcha 300 · Nutella Frappe 310

**SPECIALITY COFFEE** - V60 pour-over (hot/iced) 260 · Kalita pour-over (hot/iced) 260 ·
Aeropress 260 · French press 260 · Cold brew 245

**TEA** - Black/Green/Cinnamon 165 · Masala Chai Latte 190 ·
Hot Matcha Green Latte 245 · Honey Ginger Lemon Tea 215

**ADD-ONS** - Whipped cream 80 · Cold foam 40 · Flavours 40 (jaggery, hazelnut,
vanilla, caramel, irish)

**MILK** - Soy 45 · Oat 150 · Almond 150 · Lactose-free 35

### What the menu artwork itself tells us (brand evidence)
The printed menu is **black monospace/typewriter type on a cream ground, with
solid black highlight blocks behind each category heading**. That is a real
brand signal and it is NOT the Roadster serif world. Worth reconciling: the
cafe's own menu language is utilitarian-mono, the aspiration board is
elegant-serif. Flagging rather than silently picking one.

### Menu items worth featuring (they say "Punjab speciality roaster", not "Western clone")
**Jaggery Latte (260)** and **Masala Chai Latte (190)** are the two most
brand-specific drinks on the list. **DS Tiramisu Latte (350)** carries the
brand's own initials. **Mug of Love**, **Double Malt-A** and **Mont Blanc** are
their own invented signatures. These beat generic espresso items for the
homepage chapter.
