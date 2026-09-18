"""Generates the DOUBLESHOT inner pages from one shared shell.
Run:  ./venv/Scripts/python.exe build_pages.py
Rerunnable - it overwrites the four page files and nothing else.

2026-09-10 rebuild (see RESEARCH-2026-09-10.md, "Inner pages"):
- swup removed; page changes are cross-document View Transitions (site.css)
- giant-type hero with a floating cut-out or framed photo, no dead gap
- shared marquee + fitted giant wordmark before/in the footer
- Menu page: sticky category rail, featured cut-outs, cascading rows
Pages are being improved one at a time; Roastery, Bakery and Locations keep
their bodies for now and only get the new shell.
"""
import io, os, time

ASSET_V = str(int(time.time()))   # cache-bust the shared assets on every build

VEG = ('<svg class="veg" viewBox="0 0 20 20" aria-label="Eggless" role="img">'
       '<rect x="1" y="1" width="18" height="18"/><circle cx="10" cy="10" r="4.5"/></svg>')

# 2026-09-13: the phone page list (assets/mnav.js). A sibling of #nav, never inside it:
# #nav.deep has backdrop-filter, which would make it the containing block of a fixed
# child. Same block in index.html (keep in sync).
MNAV = """<div class="mnav" id="mnav" hidden>
  <nav aria-label="Pages">
    <ol class="mnav-list">
      <li style="--i:0"><a href="index.html"><span>Home</span></a></li>
      <li style="--i:1"><a href="menu.html"><span>Menu</span><em>Every drink</em></a></li>
      <li style="--i:2"><a href="bakery.html"><span>Bakery</span><em>100% eggless</em></a></li>
      <li style="--i:3"><a href="roastery.html"><span>Roastery</span><em>On premise</em></a></li>
      <li style="--i:4"><a href="locations.html"><span>Locations</span><em>Five caf&eacute;s</em></a></li>
    </ol>
    <div class="mnav-foot">
      <p>Every day, 9:00 to 21:00</p>
      <a href="tel:+917743007183">+91 77430 07183</a>
      <a class="ig" href="https://www.instagram.com/doubleshotroasters/" target="_blank" rel="noopener">Instagram</a>
    </div>
  </nav>
</div>"""

NAV = """
<header id="nav">
  <a class="wordmark" href="index.html"><span class="nav-mark" data-ds-mark="load" aria-hidden="true"></span>Doubleshot</a>
  <nav>
    <a href="menu.html">Menu</a>
    <a href="bakery.html">Bakery</a>
    <a href="roastery.html">Roastery</a>
    <a href="locations.html">Locations</a>
    <!-- 2026-09-12: real order links, each verified to load (qa/2026-09-12_order).
         Zomato = delivery, 5 outlets. Swiggy lists these cafes only on Dineout (table
         booking); its delivery pages returned an error, so they are labelled as such. -->
    <details class="order">
      <summary>Order <b>Zomato</b><i>/</i><b>Swiggy</b></summary>
      <div class="order-pop">
        <p class="op-k">Order from</p>
        <div class="op-choose">
          <button type="button" data-op="zomato"><b>Zomato</b><span>Delivery from five cafés</span></button>
          <button type="button" data-op="swiggy"><b>Swiggy</b><span>Book a table (Dineout)</span></button>
        </div>
        <div class="op-sec" data-op-sec="zomato">
          <button type="button" class="op-back">&larr; Back</button>
          <h3>Zomato</h3>
          <ul class="op-list">
            <li><a href="https://www.zomato.com/amritsar/doubleshot-coffee-roasters-1-ranjit-avenue/order" target="_blank" rel="noopener">Ranjit Avenue <span>Amritsar</span></a></li>
            <li><a href="https://www.zomato.com/amritsar/doubleshot-coffee-roasters-kabir-park/order" target="_blank" rel="noopener">Kabir Park <span>Amritsar</span></a></li>
            <li><a href="https://www.zomato.com/amritsar/doubleshot-coffee-roasters-gt-road/order" target="_blank" rel="noopener">GT Road <span>Amritsar</span></a></li>
            <li><a href="https://www.zomato.com/chandigarh/doubleshot-coffee-roasters-sector-78-mohali/order" target="_blank" rel="noopener">Sector 78 <span>Mohali</span></a></li>
            <li><a href="https://www.zomato.com/jalandhar/doubleshot-coffee-roasters-3-model-town/order" target="_blank" rel="noopener">Model Town <span>Jalandhar</span></a></li>
          </ul>
        </div>
        <div class="op-sec" data-op-sec="swiggy">
          <button type="button" class="op-back">&larr; Back</button>
          <h3>Swiggy</h3>
          <ul class="op-list">
            <li><a href="https://www.swiggy.com/restaurants/amritsar/g-t-road/double-shot-coffee-roasters-680189/dineout" target="_blank" rel="noopener">GT Road <span>Amritsar</span></a></li>
            <li><a href="https://www.swiggy.com/restaurants/chandigarh/sector-78-mohali/doubleshot-coffee-roasters-693808/dineout" target="_blank" rel="noopener">Sector 78 <span>Mohali</span></a></li>
          </ul>
          <p class="op-note">On Swiggy these cafés take table bookings (Dineout). For delivery, use Zomato.</p>
        </div>
      </div>
    </details>
    <!-- 2026-09-13: phones (<=820px) get every page from this button (assets/mnav.js) -->
    <button class="mnav-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Open pages"><i></i><i></i></button>
  </nav>
</header>
""" + MNAV

MQ_RUN = ('<span>Sourcing</span><b>|</b><span>Roasting</span><b>|</b><span>Brewing</span><b>|</b>'
          '<span class="dim">100% eggless</span><b>|</b><span class="dim">Amritsar</span><b>|</b>'
          '<span class="dim">Mohali</span><b>|</b><span class="dim">Jalandhar</span><b>|</b>')

FOOTER = """<div class="marquee" aria-hidden="true">
  <div class="mq-track">""" + MQ_RUN + MQ_RUN + """</div>
</div>
<footer>
  <div class="giant" aria-hidden="true">Doubleshot</div>
  <div class="foot-grid">
    <div>
      <span class="foot-mark" data-ds-mark="view" aria-hidden="true"></span>
      <p>Sourcing, roasting and brewing in Punjab.<br>100% eggless artisanal bakery &amp; savoury.</p>
    </div>
    <div>
      <h2>Visit</h2>
      <a href="locations.html">Amritsar</a>
      <a href="locations.html">Mohali</a>
      <a href="locations.html">Jalandhar</a>
      <a href="locations.html">Chandigarh (opening soon)</a>
    </div>
    <div>
      <h2>Contact</h2>
      <a href="tel:+917743007183">+91 77430 07183</a>
      <p>Every day, 9:00 to 21:00</p>
      <a href="https://www.instagram.com/doubleshotroasters/" target="_blank" rel="noopener">Instagram</a>
    </div>
  </div>
  <div class="fl">SCO 49, B Block, District Shopping Centre, Ranjit Avenue, Amritsar 143001</div>
</footer>"""

SHELL_CSS = """
/* ---------- inner-page hero: giant type + a floating subject --------------
   Replaces the blurred film still. Sons & Daughters-style oversized title;
   the cut-out sits in front of the letters for depth. No dead gap below. */
.hx{position:relative;min-height:88vh;padding:17vh var(--pad) 7vh;display:grid;
  grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:end;gap:2vw;overflow:hidden}
.hx::before{content:'';position:absolute;right:6vw;top:18vh;width:36vh;height:36vh;border-radius:50%;
  background:radial-gradient(circle,rgba(198,164,114,.14) 0%,rgba(198,164,114,0) 68%);pointer-events:none}
.hx-copy{position:relative;z-index:2;grid-column:1;grid-row:1}
.hx-title{font-family:var(--heading);font-weight:800;font-size:clamp(3rem,7.6vw,8.2rem);line-height:.8;
  letter-spacing:-.065em;margin:0 0 3.4vh -.05em;white-space:nowrap;color:var(--warm-white)}
.hx.in .hx-title .char{transform:translateY(0)}
/* A framed photo has hard edges, so the title must not run into it (a cut-out
   can overlap the letters; a rectangle just looks like a collision). */
.hx.framed .hx-title{font-size:clamp(2.8rem,6.4vw,7rem)}
.hx-sub{font-size:clamp(15px,1.15vw,18px);line-height:1.5;color:var(--warm-white-dim);max-width:40ch;margin:0}
.hx-copy .overline,.hx-copy .vegline,.hx-sub{opacity:0;transform:translateY(16px);
  transition:opacity .9s ease .75s,transform 1s cubic-bezier(.16,1,.3,1) .75s}
.hx-copy .overline,.hx-copy .vegline{margin-bottom:2.4vh}
.hx.in .hx-copy .overline,.hx.in .hx-copy .vegline,.hx.in .hx-sub{opacity:1;transform:none}
.hx-art{grid-column:2;grid-row:1;justify-self:center;align-self:center;margin:0;position:relative;z-index:1}
.hx-art-in{opacity:0;transform:translateY(60px) scale(.95);
  transition:opacity 1.2s ease .3s,transform 1.5s cubic-bezier(.16,1,.3,1) .3s}
.hx.in .hx-art-in{opacity:1;transform:none}
.hx-art.cut img{max-height:52vh;width:auto;max-width:100%;
  filter:brightness(.9) drop-shadow(0 50px 60px rgba(0,0,0,.55));animation:hxfloat 8s ease-in-out infinite alternate}
.hx-art.frame .hx-art-in{width:min(27vw,54vh);aspect-ratio:4/5;overflow:hidden}
.hx-art.frame img{width:100%;height:100%;object-fit:cover;filter:brightness(.8) saturate(.9)}
@keyframes hxfloat{from{transform:translateY(0) rotate(-1.2deg)}to{transform:translateY(-16px) rotate(1.2deg)}}
.wrap{padding:var(--section) var(--pad)}
.lede{max-width:52ch;font-size:clamp(17px,1.55vw,21px);line-height:1.45;font-weight:300;
  letter-spacing:-.015em;margin:0 0 4vw}
h2.sec{font-family:var(--heading);font-weight:500;letter-spacing:-.04em;
  font-size:clamp(1.6rem,2.7vw,2.5rem);line-height:.98;margin:0 0 20px}
.big{font-family:var(--display);font-weight:700;letter-spacing:-.04em;
  font-size:clamp(1.7rem,3.1vw,2.7rem);line-height:1;margin:0 0 14px}
.cols{display:grid;grid-template-columns:repeat(2,1fr);gap:4vw}

/* ---------- marquee + giant wordmark (shared with the homepage) ---------- */
.marquee{position:relative;overflow:hidden;padding:2.2vw 0;background:var(--ink);
  border-top:1px solid rgba(241,237,228,.12);border-bottom:1px solid rgba(241,237,228,.12)}
.mq-track{display:flex;width:max-content;will-change:transform}
.mq-track span{font-family:var(--heading);font-weight:500;font-size:clamp(1.3rem,2.6vw,2.5rem);
  letter-spacing:-.035em;line-height:1;color:var(--warm-white);padding:0 .45em;white-space:nowrap}
.mq-track span.dim{color:rgba(241,237,228,.55)}   /* .34 measured 2.81:1 */
.mq-track b{font-family:var(--heading);font-weight:300;font-size:clamp(1.3rem,2.6vw,2.5rem);line-height:1;color:var(--accent);opacity:.8}
.giant{font-family:var(--display);font-weight:700;font-size:17vw;line-height:.82;letter-spacing:-.05em;
  color:var(--warm-white);white-space:nowrap;overflow:hidden;padding-bottom:.08em;margin:0 0 4vw}
.giant.in .char{transform:translateY(0)}

@media (max-width:820px){
  /* top padding clears the ~70px phone header (24vw left the hero art touching it) */
  .hx{grid-template-columns:1fr;min-height:0;padding:calc(18vw + 48px) var(--pad) 10vw;gap:6vw;align-items:start}
  .hx-art{grid-column:1;grid-row:1;justify-self:center}
  .hx-copy{grid-row:2}
  .hx-title{font-size:16vw}
  .hx-art.cut img{max-height:34vh}
  .hx-art.frame .hx-art-in{width:70vw}
  .hx-sub{font-size:16px}
  .cols{grid-template-columns:1fr;gap:10vw}
  /* grid children may shrink below their content on phones (a long unbreakable row
     otherwise widens the whole page; found on Menu at 360px) */
  .hx > *,.cols > *,.pair > *,.lmap > *,.city-body > *,.loc-all > *,.a3 > *,.mgrid > *{min-width:0}
}
@media (prefers-reduced-motion:reduce){
  .hx-art.cut img{animation:none}
  .hx-art-in,.hx-copy .overline,.hx-copy .vegline,.hx-sub{opacity:1;transform:none;transition:none}
}
"""

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>__TITLE__</title>
<meta name="description" content="__DESC__" />
<meta name="theme-color" content="#0A2111" />
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=zodiak@400,700&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css?v=__V__">
<!-- defer: render-blocking CDN scripts delayed first paint enough that the
     cross-document View Transition was never created on inner pages. -->
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>
<script defer src="assets/logo-paths.js?v=__V__"></script>
<script defer src="assets/logo.js?v=__V__"></script>
<style>__SHELL____EXTRA__
</style>
</head>
<body>
__NAV__
"""


def page(fn, title, desc, art, art_kind, art_alt, kicker, h1, sub, body, extra="", kicker_veg=False):
    """art_kind: 'cut' = transparent cut-out floating; 'frame' = framed photo."""
    html = (HEAD.replace("__TITLE__", title).replace("__DESC__", desc)
                .replace("__SHELL__", SHELL_CSS).replace("__EXTRA__", extra)
                .replace("__NAV__", NAV).replace("__V__", ASSET_V))
    kick = ('<div class="vegline">' + VEG + " " + kicker + "</div>") if kicker_veg \
        else ('<div class="overline">' + kicker + "</div>")
    html += (
        "\n<main>\n"
        '<section class="hx' + (' framed' if art_kind == 'frame' else '') + '">\n'
        '  <div class="hx-copy">\n'
        "    " + kick + "\n"
        '    <h1 class="hx-title">' + h1 + "</h1>\n"
        '    <p class="hx-sub">' + sub + "</p>\n"
        "  </div>\n"
        '  <figure class="hx-art ' + art_kind + '" data-parallax="-0.14" data-scale="1">'
        '<div class="hx-art-in"><img src="assets/img/' + art + '" alt="' + art_alt + '"></div></figure>\n'
        "</section>\n" + body + "\n</main>\n"
    )
    # defer keeps it after the deferred libraries in the head (document order)
    html += (FOOTER + '\n<script defer src="assets/liquid.js?v=' + ASSET_V + '"></script>'
             + '\n<script defer src="assets/velocity.js?v=' + ASSET_V + '"></script>'
             + '\n<script defer src="assets/order.js?v=' + ASSET_V + '"></script>'
             + '\n<script defer src="assets/mnav.js?v=' + ASSET_V + '"></script>'
             # 2026-09-13: the doughnut track replaced the runner (client request)
             + '\n<script defer src="assets/donut.js?v=' + ASSET_V + '"></script>'
             + '\n<script defer src="assets/site.js?v=' + ASSET_V
             + '"></script>\n</body>\n</html>\n')
    io.open(fn, "w", encoding="utf-8", newline="").write(html)
    return fn


# ------------------------------------------------------------------- MENU ---
CATS = [
    ("Espresso", [
        ("Espresso shot", "", "150"), ("Americano", "Hot / iced", "180 / 205"),
        ("Cortado", "Hot / iced", "190 / 195"), ("Cappuccino", "Hot / iced", "190 / 235"),
        ("Flat white", "", "190"), ("Latt&eacute;", "Hot / iced", "220 / 240"),
        ("Mocha", "Hot / iced", "265 / 280"), ("White mocha", "Hot / iced", "285 / 300"),
        ("Toasted spice latte", "Hot / iced", "280"), ("Affogato", "", "230")]),
    ("Signatures", [
        ("Jaggery latt&eacute;", "Gur, not sugar.", "260"),
        ("Masala chai latt&eacute;", "The one you actually grew up on.", "190"),
        ("DS tiramisu latt&eacute;", "Ours. The initials are the clue.", "350"),
        ("Mont Blanc", "", "299"), ("Espresso Blanc", "", "339"), ("Matcha Cloud", "", "339"),
        ("Roasted hazelnut latt&eacute;", "", "280"), ("Roasted almond latt&eacute;", "", "280"),
        ("Hot chocolate", "", "290"), ("Mug of love", "", "305"), ("Double malt-a", "", "350")]),
    ("Speciality", [
        ("V60 pour-over", "Hot / iced", "260"), ("Kalita pour-over", "Hot / iced", "260"),
        ("Aeropress", "", "260"), ("French press", "", "260"),
        ("Cold brew", "Coarse ground, steeped twenty four hours.", "245")]),
    ("Cold", [
        ("Vietnamese iced coffee", "", "315"), ("Espresso &amp; tonic", "", "275"),
        ("Frapp&eacute;", "", "280"), ("Iced matcha green latt&eacute;", "", "300"),
        ("Ice tea", "Peach / lemon", "230"), ("Mojito", "Lemon / orange", "225 / 280"),
        ("Watermelon mojito", "", "280"), ("Iced matcha frapp&eacute;", "", "300"),
        ("Orange matcha", "", "300"), ("Nutella frapp&eacute;", "", "310")]),
    ("Tea", [
        ("Black / green / cinnamon", "", "165"),
        ("Hot matcha green latt&eacute;", "", "245"), ("Honey ginger lemon tea", "", "215")]),
]

# Only drinks we have a real photo of get a hover image. The client's own
# Instagram shots, cut out of their backgrounds by make_cutouts.py.
PHOTOS = {
    "DS tiramisu latt&eacute;": "assets/img/cut-tiramisu.webp",
    "Iced matcha green latt&eacute;": "assets/img/cut-matcha.webp",
    "Hot chocolate": "assets/img/cut-hotchoc.webp",
    "V60 pour-over": "assets/img/cut-v60.webp",
    "Affogato": "assets/img/cut-affogato.webp",
    "Latt&eacute;": "assets/img/cut-iced-layered.webp",
}

# 2026-09-10: + Affogato and Iced latte (client's own posts C8Yv_UNRBVs, C783muxRM_k;
# real menu prices). The cup in DCYs8yqxeW3 is the Winter Spice Latte (not on the
# printed menu), so it is NOT labelled cappuccino and stays off the page.
FEATURED = [
    ("DS Tiramisu Latt&eacute;", "350", "cut-tiramisu.webp", "DS tiramisu latte with cocoa-dusted cream and a biscuit"),
    ("Iced Matcha Latt&eacute;", "300", "cut-matcha.webp", "Iced matcha latte poured in layers"),
    ("Hot Chocolate", "290", "cut-hotchoc.webp", "Hot chocolate with whipped cream and cocoa"),
    ("V60 Pour-over", "260", "cut-v60.webp", "V60 dripper over a glass server"),
    ("Affogato", "230", "cut-affogato.webp", "Two scoops of vanilla ice cream in a glass, espresso poured over"),
    ("Iced Latt&eacute;", "240", "cut-iced-layered.webp", "Iced latte in a tall glass, topped with whipped cream and cinnamon"),
]


def anchor(n):
    return n.lower().replace(" ", "-")


total = sum(len(items) for _, items in CATS)
rail = "\n".join(
    '      <li><a href="#%s"><span class="rn">%s</span><span class="rc">%02d</span></a></li>'
    % (anchor(c), c, len(items)) for c, items in CATS)

secs = []
for name, items in CATS:
    rows = "\n".join(
        '        <li%s><b>%s</b>%s<em>%s</em></li>'
        % ((' data-img="%s"' % PHOTOS[n]) if n in PHOTOS else "", n,
           ("<span>%s</span>" % d) if d else "", pr)
        for n, d, pr in items)
    secs.append(
        '    <section class="mcat" id="%s">\n'
        '      <h2 class="mcat-h">%s</h2>\n'
        '      <ul class="menu">\n%s\n      </ul>\n    </section>' % (anchor(name), name, rows))

def _wh(name):
    """Intrinsic size, so the browser reserves the box before the image loads."""
    from PIL import Image
    return Image.open(os.path.join("assets", "img", name)).size


feats = "\n".join(
    '    <figure class="feat"><img src="assets/img/%s" width="%d" height="%d" alt="%s" loading="lazy">'
    '<figcaption><b>%s</b><em>%s</em></figcaption></figure>' % ((img,) + _wh(img) + (alt, nm, pr))
    for nm, pr, img, alt in FEATURED)

# 2026-09-11: the signature moment (desktop). Descriptions come from the menu
# itself or from what the client's own photo/caption shows; nothing invented.
SIG_DESC = {
    "cut-tiramisu.webp": "Ours. The initials are the clue.",
    "cut-matcha.webp": "Matcha poured in layers over milk and ice.",
    "cut-hotchoc.webp": "Whipped cream and cocoa on top.",
    "cut-v60.webp": "Poured by hand, hot or iced.",
    "cut-affogato.webp": "Vanilla ice cream, espresso poured over.",
    "cut-iced-layered.webp": "Tall and iced, whipped cream and cinnamon on top.",
}
sig_names = "\n".join(
    '      <h2 class="sig-name%s"><span>%s</span></h2>' % (" on" if i == 0 else "", nm)
    for i, (nm, pr, img, alt) in enumerate(FEATURED))
sig_cups = "\n".join(
    '      <figure class="sig-cup%s"><img loading="lazy" src="assets/img/%s" width="%d" height="%d" alt="%s"></figure>'
    % ((" on" if i == 0 else "", img) + _wh(img) + (alt,))
    for i, (nm, pr, img, alt) in enumerate(FEATURED))
sig_meta = "\n".join(
    '      <div class="sig-meta-i%s"><em>%s</em><p>%s</p></div>' % (" on" if i == 0 else "", pr, SIG_DESC[img])
    for i, (nm, pr, img, alt) in enumerate(FEATURED))
sig_rail = "\n".join(
    '      <li%s>%s</li>' % (' class="on"' if i == 0 else "", nm)
    for i, (nm, pr, img, alt) in enumerate(FEATURED))

SIG_HTML = """<section class="sig" aria-label="House signatures">
  <div class="sig-pin">
    <p class="overline sig-kick">House signatures</p>
    <div class="sig-names">
""" + sig_names + """
    </div>
    <div class="sig-stage">
""" + sig_cups + """
    </div>
    <div class="sig-meta">
""" + sig_meta + """
    </div>
    <ol class="sig-rail">
""" + sig_rail + """
    </ol>
  </div>
</section>
"""

MENU_BODY = (SIG_HTML + """<section class="featured">
  <p class="overline">House signatures</p>
  <div class="feat-row">
""" + feats + """
  </div>
</section>
<section class="fromcounter">
  <div class="fc-head"><h2 class="sec">From the counter</h2><a class="act-link" href="bakery.html">The bakery</a></div>
  <div class="fc-row">
    <figure class="fc"><img loading="lazy" src="assets/img/cut-croissant-sandwich.webp" width="547" height="605" alt="Croissant sandwich"><figcaption>Croissant sandwich</figcaption></figure>
    <figure class="fc"><img loading="lazy" src="assets/img/cut-cookie-croissant.webp" width="549" height="430" alt="Cookie croissant"><figcaption>Cookie croissant</figcaption></figure>
    <figure class="fc"><img loading="lazy" src="assets/img/cut-bagel-sesame.webp" width="231" height="237" alt="Sesame bagel"><figcaption>Sesame bagel</figcaption></figure>
    <figure class="fc"><img loading="lazy" src="assets/img/cut-turnover.webp" width="682" height="659" alt="Apple turnover"><figcaption>Apple turnover</figcaption></figure>
  </div>
</section>
<div class="mgrid">
  <aside class="mrail">
    <ol>
""" + rail + """
    </ol>
    <div class="vegline">""" + VEG + """ Every bake and savoury is eggless</div>
  </aside>
  <div class="mcats">
""" + "\n".join(secs) + """
    <section class="mcat mcat-add" id="add-ons" data-reveal>
      <h2 class="mcat-h">Add to any of it</h2>
      <div class="cols">
        <ul class="dotlist">
          <li><b>Whipped cream</b><em></em><b>80</b></li>
          <li><b>Cold foam</b><em></em><b>40</b></li>
          <li><b>Flavours</b><em></em><b>40</b></li>
        </ul>
        <ul class="dotlist">
          <li><b>Soy milk</b><em></em><b>45</b></li>
          <li><b>Oat milk</b><em></em><b>150</b></li>
          <li><b>Almond milk</b><em></em><b>150</b></li>
          <li><b>Lactose free</b><em></em><b>35</b></li>
        </ul>
      </div>
      <p class="spec">Flavours: jaggery, hazelnut, vanilla, caramel, irish. All prices in rupees.</p>
    </section>
  </div>
</div>""")

MENU_EXTRA = """
/* ---------- menu: the signature moment (desktop, pinned) -----------------
   Scrolling pours each signature into view: the cut-out fills upward behind a
   wave line (a mask 3x the box, its position animated), the name rises out of
   a mask above it, the rail names the step. site.js adds body.has-sig; without
   it (phones, reduced motion, no JS) the plain featured row shows instead. */
.sig{display:none;position:relative}
body.has-sig .sig{display:block}
body.has-sig .featured{display:none}
.sig-pin{position:relative;height:100vh;overflow:hidden}
.sig-kick{position:absolute;top:15vh;left:var(--pad);margin:0}
.sig-names{position:absolute;left:0;right:0;top:19vh}
.sig-name{position:absolute;left:0;right:0;margin:0;overflow:hidden;text-align:center;font-family:var(--heading);
  font-weight:800;font-size:clamp(2.6rem,6.6vw,7.4rem);letter-spacing:-.06em;line-height:.95;padding-bottom:.06em;
  color:var(--warm-white);white-space:nowrap}
.sig-name span{display:inline-block;transform:translateY(110%);transition:transform .5s cubic-bezier(.65,0,.35,1)}
.sig-name.on span{transform:none;transition:transform .9s cubic-bezier(.16,1,.3,1) .15s}
.sig-name.past span{transform:translateY(-110%)}
.sig-stage{position:absolute;left:0;right:0;top:34vh;bottom:7vh}
.sig-stage::before{content:'';position:absolute;left:50%;top:58%;width:52vh;height:52vh;border-radius:50%;
  transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(198,164,114,.16) 0%,rgba(198,164,114,0) 68%)}
.sig-cup{position:absolute;inset:0;margin:0;display:flex;align-items:flex-end;justify-content:center;
  -webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 300' preserveAspectRatio='none'%3E%3Cpath d='M0 150 Q12.5 141 25 150 T50 150 T75 150 T100 150 V300 H0Z'/%3E%3C/svg%3E");
  mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 300' preserveAspectRatio='none'%3E%3Cpath d='M0 150 Q12.5 141 25 150 T50 150 T75 150 T100 150 V300 H0Z'/%3E%3C/svg%3E");
  -webkit-mask-size:100% 300%;mask-size:100% 300%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  -webkit-mask-position:0 0%;mask-position:0 0%;
  transition:-webkit-mask-position 1.3s cubic-bezier(.65,0,.35,1),mask-position 1.3s cubic-bezier(.65,0,.35,1),
    opacity .6s ease,transform .8s cubic-bezier(.16,1,.3,1)}
.sig-cup.on,.sig-cup.past{-webkit-mask-position:0 100%;mask-position:0 100%}
.sig-cup.past{opacity:0;transform:translateY(-6vh)}
.sig-cup img{max-height:100%;max-width:44vw;width:auto;height:auto;display:block;
  filter:brightness(.9) drop-shadow(0 40px 46px rgba(0,0,0,.55));animation:hxfloat 8s ease-in-out infinite alternate}
.sig-meta{position:absolute;left:var(--pad);bottom:9vh;width:30vw}
.sig-meta-i{position:absolute;left:0;bottom:0;opacity:0;transform:translateY(14px);
  transition:opacity .4s ease,transform .6s cubic-bezier(.16,1,.3,1)}
.sig-meta-i.on{opacity:1;transform:none;transition-delay:.3s}
.sig-meta-i em{display:block;font-style:normal;font-family:var(--heading);font-weight:500;
  font-size:clamp(1.4rem,2.2vw,2.2rem);letter-spacing:-.03em;color:var(--accent);margin-bottom:1vh;font-variant-numeric:tabular-nums}
.sig-meta-i em::before{content:'₹';opacity:.6;margin-right:2px}
.sig-meta-i p{margin:0;max-width:30ch;font-size:16px;line-height:1.5;color:var(--warm-white-dim)}
.sig-rail{position:absolute;right:var(--pad);bottom:9vh;list-style:none;margin:0;padding:0 0 0 18px;
  border-left:1px solid var(--line)}
.sig-rail li{font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;line-height:1.3;padding:5px 0;
  color:rgba(241,237,228,.55);transition:color .4s,transform .6s cubic-bezier(.16,1,.3,1)}
.sig-rail li.on{color:var(--warm-white);transform:translateX(8px)}

/* ---------- menu: from the counter (real cut-outs, links to Bakery) ------- */
.fromcounter{padding:0 var(--pad) 8vw}
.fc-head{display:flex;justify-content:space-between;align-items:baseline;gap:4vw;margin-bottom:3vw}
.fc-head .act-link{margin-top:0}
.fc-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3vw;align-items:end}
.fc{margin:0;text-align:center}
.fc:nth-child(even){margin-bottom:3vw}
.fc img{height:clamp(150px,19vw,260px);width:auto;max-width:100%;margin:0 auto;object-fit:contain;display:block;
  filter:brightness(.92) drop-shadow(0 26px 30px rgba(0,0,0,.5))}
.fc figcaption{margin-top:1.4vw;font-size:14px;color:var(--warm-white-dim)}
@media (max-width:820px){.fc-row{grid-template-columns:1fr 1fr;row-gap:8vw}.fc:nth-child(even){margin-bottom:0}}

/* ---------- menu: featured cut-outs --------------------------------------- */
.featured{padding:3vw var(--pad) 9vw;position:relative}
.featured .overline{margin-bottom:5vw}
.feat-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:5vw;row-gap:6vw;align-items:end}
.feat{margin:0;text-align:center;will-change:transform}
.feat:nth-child(3n+2){margin-bottom:7vw}
.feat:nth-child(3n){margin-bottom:3.5vw}
.feat img{height:clamp(240px,26vw,380px);width:auto;max-width:100%;margin:0 auto;object-fit:contain;
  filter:brightness(.9) drop-shadow(0 36px 40px rgba(0,0,0,.5));transition:transform .9s cubic-bezier(.16,1,.3,1)}
.feat:hover img{transform:translateY(-14px) rotate(-2deg)}
.feat figcaption{margin-top:2.2vw;display:flex;justify-content:center;align-items:baseline;gap:14px}
.feat b{font-family:var(--heading);font-weight:500;font-size:clamp(1rem,1.2vw,1.2rem);letter-spacing:-.03em}
.feat em{font-style:normal;font-size:13px;color:var(--accent);font-variant-numeric:tabular-nums}
.feat em::before{content:'\\20B9';opacity:.55;margin-right:1px}

/* ---------- menu: sticky rail + categories -------------------------------- */
.mgrid{display:grid;grid-template-columns:minmax(0,.6fr) minmax(0,2fr);gap:6vw;padding:2vw var(--pad) var(--section)}
.mrail{position:sticky;top:18vh;align-self:start}
.mrail ol{list-style:none;margin:0 0 4vh;padding:0;border-top:1px solid var(--line-soft)}
.mrail li{border-bottom:1px solid var(--line-soft)}
.mrail a{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:1.5vh 0;
  color:rgba(241,237,228,.55);transition:color .5s}
.mrail a:hover{color:var(--warm-white-dim)}
.mrail .rn{font-family:var(--heading);font-weight:500;font-size:clamp(1.2rem,1.6vw,1.6rem);letter-spacing:-.04em;
  line-height:1;transition:transform .7s cubic-bezier(.16,1,.3,1)}
.mrail .rc{font-size:12px;font-variant-numeric:tabular-nums}
.mrail a.on{color:var(--warm-white)}
.mrail a.on .rn{transform:translateX(14px)}
.mrail a.on .rc{color:var(--accent)}
.mcat{margin-bottom:9vw;scroll-margin-top:110px}
.mcat-h{font-family:var(--heading);font-weight:700;font-size:clamp(2rem,4.2vw,4.4rem);letter-spacing:-.055em;
  line-height:.9;margin:0 0 2.4vw;color:var(--warm-white)}
.mcat .menu{columns:2;column-gap:4vw;margin-top:0}
.mcat .menu li{break-inside:avoid}
.mcat .menu li b{transition:transform .5s cubic-bezier(.16,1,.3,1)}
.mcat .menu li:hover b{transform:translateX(8px)}
.mcat .menu li:hover em{color:var(--warm-white)}
.mcat-add .mcat-h{font-size:clamp(1.6rem,3vw,2.8rem)}

@media (max-width:1000px){.mcat .menu{columns:1}}
@media (max-width:820px){
  .feat-row{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:58vw;overflow-x:auto;scroll-snap-type:x mandatory;
    padding-bottom:4vw;margin:0 calc(var(--pad) * -1);padding-left:var(--pad);padding-right:var(--pad)}
  .feat{scroll-snap-align:center;margin-bottom:0 !important}
  .feat img{height:52vw}
  /* minmax(0,1fr), not 1fr: the phone rail's row of links set the column's min-content,
     so on a 360px phone the menu column was 350px and the page's layout width 385px */
  .mgrid{grid-template-columns:minmax(0,1fr);gap:4vw}
  .mrail{position:sticky;top:0;z-index:20;background:var(--ink);margin:0 calc(var(--pad) * -1);padding:12px var(--pad)}
  .mrail ol{display:flex;gap:22px;overflow-x:auto;border:0;margin:0}
  .mrail li{border:0;flex:none}
  .mrail a{padding:6px 0;position:relative}
  /* invisible 44px touch target; the sticky rail keeps its height */
  .mrail a::after{content:'';position:absolute;inset:-8px -4px}
  .mrail .rn{font-size:1.1rem}
  .mrail .rc,.mrail .vegline{display:none}
  .mrail a.on .rn{transform:none}
  .mcat-h{font-size:11vw}
  /* 2026-09-13: the rail sits under the header while it shows and takes the top once
     it hides (html.nav-hidden + --navh from mnav.js); it used to slide under the bar */
  .mrail{transition:top .3s ease}
  html:not(.nav-hidden) .mrail{top:var(--navh,60px)}
  /* 2026-09-13: the signature moment on phones (was desktop only) */
  .sig-kick{top:12vh}
  .sig-names{top:17vh}
  .sig-name{font-size:10vw;padding:0 4vw}
  .sig-stage{top:27vh;bottom:25vh}
  .sig-stage::before{width:34vh;height:34vh}
  .sig-cup{align-items:center}   /* bottom-aligned left a wide gap under the name */
  .sig-cup img{max-width:72vw}
  .sig-meta{left:var(--pad);right:var(--pad);width:auto;bottom:calc(7vh + 44px)}
  .sig-meta-i{left:0;right:0;text-align:center}
  .sig-meta-i p{margin:0 auto}
  /* the step rail becomes a row of short bars beside the kicker */
  .sig-rail{top:calc(12vh + 6px);bottom:auto;display:flex;gap:6px;padding:0;border:0}
  .sig-rail li{width:14px;height:2px;padding:0;overflow:hidden;text-indent:120%;white-space:nowrap;
    background:rgba(241,237,228,.3);transition:background .4s,width .4s}
  .sig-rail li.on{width:28px;background:var(--accent);transform:none}
}
"""

page("menu.html", "Menu &middot; Doubleshot Coffee Roasters",
     "The full Doubleshot menu: espresso, signatures, speciality pour-overs, cold drinks and tea.",
     "cut-matcha.webp", "cut", "Iced matcha latte poured in layers",
     "Every day, 9:00 to 21:00", "Menu",
     "%d drinks, made properly. Prices in rupees." % total, MENU_BODY, MENU_EXTRA)

# --------------------------------------------------------------- ROASTERY ---
ROASTERY_BODY = """<div class="wrap" style="padding-bottom:4vw">
  <p class="lede" data-reveal>Two of the three words on our door happen before anyone
     orders anything. This is that part.</p>
</div>

<!-- The roastery in the client's own photos (2026-09-11 fill pass). -->
<section class="rstrip" aria-label="Inside the roastery">
  <figure class="rs-frame"><img loading="lazy" src="assets/img/strip-C7Rs5gdBMAP.webp" width="640" height="800" alt="Beans turning in the cooling tray of the roaster"><figcaption>Roasted on premise</figcaption></figure>
  <figure class="rs-frame"><img loading="lazy" src="assets/img/sourcing.webp" width="720" height="520" alt="Roasted coffee beans, still steaming"><figcaption>Straight out of the roast</figcaption></figure>
  <figure class="rs-frame"><img loading="lazy" src="assets/img/strip-Cyq5RpChjmL.webp" width="640" height="800" alt="A V60 pour-over dripping into a glass server"><figcaption>Poured by hand</figcaption></figure>
  <figure class="rs-frame"><img loading="lazy" src="assets/img/strip-C4XSH7-xMnz.webp" width="576" height="560" alt="Milk poured into a cappuccino at the bar"><figcaption>Finished at the bar</figcaption></figure>
</section>

<!-- The three acts as one pinned horizontal scroll (desktop). Real photos only. -->
<section class="acts3">
  <div class="acts3-pin">
    <div class="a3-prog"><span>Sourcing</span><span>Roasting</span><span>Brewing</span></div>
    <div class="acts3-track">
      <article class="a3">
        <div class="a3-copy">
          <h2 class="a3-word">Sourcing</h2>
          <p class="a3-stat">By hand</p>
          <p>The leaves and cherries engraved on our cup are not decoration. Every cherry is
             picked by hand, one at a time, because a machine cannot tell which ones are ready.</p>
        </div>
        <figure><img loading="lazy" src="assets/img/sourcing.webp" width="720" height="520" alt="Roasted coffee beans, still steaming"></figure>
      </article>
      <article class="a3">
        <div class="a3-copy">
          <h2 class="a3-word">Roasting</h2>
          <p class="a3-stat">On premise</p>
          <p>We roast in the same building you drink in. Small batches, tasted before any of
             it reaches the counter.</p>
        </div>
        <figure><img loading="lazy" src="assets/img/roasting.webp" width="720" height="850" alt="Freshly roasted beans turning in the cooling tray of our roaster"></figure>
      </article>
      <article class="a3">
        <div class="a3-copy">
          <h2 class="a3-word">Brewing</h2>
          <p class="a3-stat">Ground to order</p>
          <p>Never ground before you ask for it, then pulled on the La Marzocco at the bar.</p>
        </div>
        <figure><img loading="lazy" src="assets/img/roastery-machine.webp" width="720" height="560" alt="The La Marzocco espresso machine on the counter, cups warming on top"></figure>
      </article>
    </div>
    <div class="a3-bar"><i></i></div>
  </div>
</section>

<div class="wrap">
  <section data-reveal style="margin-bottom:var(--section)">
    <h2 class="sec">Two you will not find on a Western menu</h2>
    <div class="cols">
      <div>
        <h3 class="big">Jaggery latt&eacute;</h3>
        <p style="color:var(--warm-white-dim);line-height:1.6;max-width:38ch">
          Gur, not sugar. It behaves differently in milk, and it tastes like something
          rather than just sweet.</p>
      </div>
      <div>
        <h3 class="big">Masala chai latt&eacute;</h3>
        <p style="color:var(--warm-white-dim);line-height:1.6;max-width:38ch">
          The one you actually grew up on, pulled on an espresso machine instead of
          boiled to death.</p>
      </div>
    </div>
  </section>

  <h2 class="sec" data-reveal>Then you can taste the roast five ways</h2>
</div>

<!-- Brew methods as full-width bands that stack as you scroll (Sons & Daughters).
     Each band keeps its label strip visible once the next one covers it. -->
<section class="bands">
  <!-- 2026-09-11: each band carries a photo (client: "the animation is good, but it is
       empty"). Client's own posts, qa/2026-09-11_images/crop_bands.py. Only the V60
       (Cyq5RpChjmL) and Aeropress (Cxzhp2-RVVa) shots show that method; the others are
       honest bar/table shots with alts that say what is in them. Ask for real
       Kalita, French press and cold brew photos. -->
  <article class="band b1" style="--i:0"><div class="band-top"><span>V60</span><span>Pour-over, hot or iced</span><em>260</em></div>
    <figure class="band-ph"><img loading="lazy" src="assets/img/band-v60.webp" width="720" height="960" alt="Water poured from a gooseneck kettle into a V60 over a glass server"></figure>
    <h3 class="bn">V60</h3><p class="bd">Poured by hand, in circles, over a paper filter.</p></article>
  <article class="band b2" style="--i:1"><div class="band-top"><span>Kalita</span><span>Pour-over, hot or iced</span><em>260</em></div>
    <figure class="band-ph"><img loading="lazy" src="assets/img/band-grinders.webp" width="390" height="520" alt="The grinders at the bar, their hoppers full of our beans"></figure>
    <h3 class="bn">Kalita</h3><p class="bd">A flat bed, so the water meets every ground evenly.</p></article>
  <article class="band b3" style="--i:2"><div class="band-top"><span>Aeropress</span><span>Pressure, short contact</span><em>260</em></div>
    <figure class="band-ph"><img loading="lazy" src="assets/img/band-aeropress.webp" width="720" height="960" alt="Hot water poured into an Aeropress standing on a scale"></figure>
    <h3 class="bn">Aeropress</h3><p class="bd">Pressed through, quick and clean.</p></article>
  <article class="band b4" style="--i:3"><div class="band-top"><span>French press</span><span>Immersion, full body</span><em>260</em></div>
    <figure class="band-ph"><img loading="lazy" src="assets/img/band-cup.webp" width="720" height="960" alt="A latte and a cookie on a saucer by a rain-streaked window"></figure>
    <h3 class="bn">French press</h3><p class="bd">Steeped whole, then plunged.</p></article>
  <article class="band b5" style="--i:4"><div class="band-top"><span>Cold brew</span><span>Steeped 24 hours</span><em>245</em></div>
    <figure class="band-ph"><img loading="lazy" src="assets/img/band-glass.webp" width="900" height="1200" alt="A cut-glass tumbler held in a black-gloved hand"></figure>
    <h3 class="bn">Cold brew</h3><p class="bd">Coarse ground and steeped for twenty four hours.</p></article>
</section>

<div class="wrap" style="padding-top:6vw">
  <div class="btns"><a class="btn" href="menu.html">See the full menu</a></div>
</div>"""

ROAST_EXTRA = """
/* ---------- roastery: the client's photo strip, drifting with scroll ---- */
/* 2026-09-11 (client: "images a bit too small"): 4-in-a-row at ~250px wide became a
   staggered 2+2 on 12 columns, each photo ~370-470px wide, capped at 64vh. */
.rstrip{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:1.6vw;row-gap:4vw;
  padding:0 var(--pad) 8vw;align-items:start}
.rs-frame{margin:0}
.rs-frame img{width:100%;max-height:64vh;object-fit:cover;display:block;filter:brightness(.86) saturate(.92)}
.rs-frame:nth-child(1){grid-column:1/6;grid-row:1}
.rs-frame:nth-child(1) img,.rs-frame:nth-child(3) img{aspect-ratio:4/5}
.rs-frame:nth-child(2){grid-column:7/12;grid-row:1;margin-top:12vw}
.rs-frame:nth-child(2) img{aspect-ratio:4/3}
.rs-frame:nth-child(3){grid-column:3/7;grid-row:2;margin-top:-6vw}
.rs-frame:nth-child(4){grid-column:9/13;grid-row:2;margin-top:2vw}
.rs-frame:nth-child(4) img{aspect-ratio:1/1}
.rs-frame figcaption{margin-top:12px;font-size:14px;color:var(--warm-white-dim)}
@media (max-width:820px){.rstrip{grid-template-columns:1fr 1fr;gap:3vw}
  .rs-frame:nth-child(n){grid-column:auto;grid-row:auto;margin-top:0}
  .rs-frame:nth-child(n) img{aspect-ratio:4/5}}

/* ---------- roastery: pinned horizontal three acts ------------------------ */
.acts3{position:relative}
.acts3-pin{position:relative;height:100vh;overflow:hidden}
.acts3-track{display:flex;height:100%;width:max-content;will-change:transform}
.a3{flex:none;width:100vw;height:100%;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);
  align-items:center;gap:5vw;padding:16vh var(--pad) 12vh}
.a3-word{font-family:var(--heading);font-weight:800;font-size:clamp(2.8rem,7vw,7.6rem);letter-spacing:-.065em;
  line-height:.82;margin:0 0 3.4vh -.04em;color:var(--warm-white);white-space:nowrap}
.a3-stat{font-family:var(--heading);font-weight:500;font-size:clamp(1.2rem,1.7vw,1.7rem);letter-spacing:-.03em;
  color:var(--accent);margin:0 0 2vh}
.a3-copy p:last-child{max-width:40ch;font-size:16px;line-height:1.6;color:var(--warm-white-dim);margin:0}
.a3 figure{margin:0;justify-self:center;width:min(30vw,56vh);aspect-ratio:4/5;overflow:hidden}
.a3 figure img{width:100%;height:100%;object-fit:cover;transform:scale(1.18);filter:brightness(.82) saturate(.9)}
.a3-prog{position:absolute;top:12vh;left:var(--pad);display:flex;gap:3vw;z-index:2}
.a3-prog span{font-size:12px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(241,237,228,.55);transition:color .4s}
.a3-prog span.on{color:var(--accent)}
.a3-bar{position:absolute;left:var(--pad);right:var(--pad);bottom:7vh;height:1px;background:rgba(241,237,228,.12)}
.a3-bar i{display:block;height:100%;background:var(--accent);transform-origin:left;transform:scaleX(0)}

/* ---------- roastery: stacking brew bands ---------------------------------- */
.bands{position:relative;padding:0 var(--pad) 10vh}
.band{position:sticky;top:calc(14vh + var(--i) * 8.5vh);height:66vh;margin-bottom:8vh;padding:2.4vh 3vw 4vh;
  display:flex;flex-direction:column;will-change:transform}
.band-top{display:flex;gap:3vw;align-items:baseline;font-size:12px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;padding-bottom:2vh;border-bottom:1px solid currentColor;opacity:.85}
.band-top em{margin-left:auto;font-style:normal;letter-spacing:.04em;font-size:14px}
.band-top em::before{content:'\\20B9';opacity:.6;margin-right:1px}
.band-top span:first-child{color:inherit;opacity:1;font-weight:600}
.bn{font-family:var(--heading);font-weight:800;font-size:clamp(2.6rem,7vw,7.8rem);letter-spacing:-.065em;
  line-height:.82;margin:auto 0 0 -.04em;white-space:nowrap}
.bd{font-size:16px;line-height:1.5;margin:2.6vh 0 0;max-width:40ch;opacity:.85}
/* the band photo fills the right side under the label strip; the next band covers
   it as it stacks, so only the strip stays readable (as before) */
.band-ph{position:absolute;right:3vw;top:calc(4.4vh + 32px);bottom:4vh;aspect-ratio:3/4;margin:0;overflow:hidden}
.band-ph img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.9) saturate(.92)}
.bn,.bd{position:relative;z-index:1}
.b1{background:#1E3A28;color:var(--warm-white)}
.b2{background:#C6A472;color:#0A2111}
.b3{background:#F1EDE4;color:#0A2111}
.b4{background:#12291A;color:var(--warm-white);box-shadow:inset 0 0 0 1px rgba(241,237,228,.1)}
.b5{background:#2A4033;color:var(--warm-white)}

@media (max-width:820px){
  /* no horizontal pin (no GSAP, reduced motion): the three panels stack */
  .acts3:not(.h) .acts3-pin{height:auto;overflow:visible}
  .acts3:not(.h) .acts3-track{flex-direction:column;width:auto}
  .acts3:not(.h) .a3{width:auto;height:auto;padding:12vw var(--pad)}
  .acts3:not(.h) .a3-prog,.acts3:not(.h) .a3-bar{display:none}
  .a3{grid-template-columns:1fr;gap:6vw}
  .a3 figure{width:78vw;justify-self:start}
  .a3-word{font-size:15vw}
  /* 2026-09-13: the horizontal pin on phones too (site.js adds .h), one panel per
     screen: word, line, copy, photo; sized to fit a 667px iPhone SE */
  .acts3.h .a3{align-content:center;gap:3vh;padding:calc(9vh + 24px) var(--pad) calc(6vh + 40px)}
  .acts3.h .a3-word{margin-bottom:2vh}
  .acts3.h .a3-stat{margin-bottom:1.4vh}
  .acts3.h .a3 figure{width:min(62vw,28vh)}
  .acts3.h .a3-prog{top:calc(9vh - 8px);gap:5vw}
  /* the doughnut track is the progress line at the bottom of a phone; a second line
     right above it read as a glitch, the Sourcing/Roasting/Brewing labels stay */
  .acts3.h .a3-bar{display:none}
  .band{top:calc(12vh + var(--i) * 6vh);height:54vh;padding:2vh 5vw 3vh}
  .band-top{gap:3vw;font-size:12px;letter-spacing:.1em}
  .bn{font-size:10.5vw}
  .bd{font-size:15px}
  .band-ph{right:5vw;top:calc(4vh + 30px);bottom:auto;width:38vw}
}
"""

page("roastery.html", "The Roastery &middot; Doubleshot Coffee Roasters",
     "Handpicked cherries, roasted on premise in Amritsar. Sourcing and roasting at Doubleshot.",
     "roasting.webp", "frame", "Freshly roasted beans turning in the cooling tray of our roaster",
     "Sourcing and roasting", "Roastery",
     "Handpicked, roasted on premise, ground to order.", ROASTERY_BODY, ROAST_EXTRA)

# ----------------------------------------------------------------- BAKERY ---
BAKERY_BODY = """<div class="wrap" style="padding-bottom:4vw">
  <p class="lede" data-reveal>The whole bakery and the whole savoury menu, entirely
     eggless. Not a substitution, not a separate shelf, not something you have to ask
     about first. Just how we bake.</p>
</div>

<!-- The counter: cut-outs of what is actually on it, from the client's own posts
     (names are their own post titles). Hover lifts one, the rest step back. -->
<section class="counter">
  <div class="counter-head">
    <h2 class="counter-h">On the counter</h2>
    <p class="counter-note">""" + VEG + """ Every one of these is eggless</p>
  </div>
  <!-- 2026-09-10 v2 cut-outs (make_cutouts_v2.py): product only, whole, no hands or
       gloves. The cake, cookie and avocado toastie came out: their shapes were the
       glove, the hand and a thumb bite, not the food. .ci-roll = round bakes that roll. -->
  <div class="cgrid">
    <figure class="ci ci1" data-speed="0.5"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-croissant-sandwich.webp" width="547" height="605" alt="A croissant sandwich with mozzarella, tomato and greens"></div></div>
      <figcaption><b>Croissant sandwich</b><span>Mozzarella, tomato, greens</span></figcaption></figure>
    <figure class="ci ci2 ci-roll ci-sm" data-speed="1.1"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-bagel-sesame.webp" width="231" height="237" alt="A sesame bagel"></div></div>
      <figcaption><b>Sesame bagel</b><span>New York style, baked here</span></figcaption></figure>
    <figure class="ci ci3" data-speed="0.7"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-cookie-croissant.webp" width="549" height="430" alt="A cookie croissant with chocolate chunks baked into the top"></div></div>
      <figcaption><b>Cookie croissant</b><span>Half cookie, half croissant</span></figcaption></figure>
    <figure class="ci ci4" data-speed="1.2"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-turnover.webp" width="682" height="659" alt="A laminated apple turnover"></div></div>
      <figcaption><b>Apple turnover</b><span>Laminated pastry, apple inside</span></figcaption></figure>
    <figure class="ci ci5 ci-roll ci-sm" data-speed="0.6"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-bagel-stuffed.webp" width="236" height="242" alt="A bagel baked with a savoury filling"></div></div>
      <figcaption><b>Stuffed bagel</b><span>Savoury filling, baked in</span></figcaption></figure>
    <figure class="ci ci6" data-speed="0.9"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-falafel.webp" width="689" height="448" alt="A toasted falafel sandwich cut in half"></div></div>
      <figcaption><b>Falafel sandwich</b><span>Our own falafel</span></figcaption></figure>
    <figure class="ci ci7" data-speed="0.8"><div class="ci-in"><div class="ci-spin"><img loading="lazy" src="assets/img/cut-grilled.webp" width="450" height="410" alt="A grilled veggie sandwich with pesto, peppers and mushroom"></div></div>
      <figcaption><b>Grilled veggie</b><span>Pesto, peppers, mushroom</span></figcaption></figure>
  </div>
</section>

<!-- Macro moment: the croissant's crumb opens from a small window to full screen. -->
<section class="macro">
  <div class="macro-pin">
    <figure class="macro-img"><img loading="lazy" src="assets/img/bakery-crumb.webp" width="1100" height="994" alt="A croissant cut open, showing its layers"></figure>
    <!-- 2026-09-11: the crumb assembles out of squares (Codrops "SVG Mask Transitions",
         random-grid variant, rebuilt as ink tiles). site.js fills it; no JS = no tiles. -->
    <div class="macro-tiles" aria-hidden="true"></div>
    <div class="macro-copy">
      <h2 class="macro-h">Laminated, baked and filled here.</h2>
      <p>None of it with egg.</p>
    </div>
  </div>
</section>

<div class="wrap">
  <section class="cols" data-reveal>
    <div>
      <h2 class="sec">Why it is the default</h2>
      <p style="color:var(--warm-white-dim);line-height:1.6;max-width:44ch">
        Plenty of people at any table in Punjab do not eat egg. The usual answer is one
        token item at the end of the counter. We did the opposite and took egg out of
        the whole kitchen, so nobody has to negotiate their order.</p>
    </div>
    <div>
      <div class="overline">What that covers</div>
      <ul class="flist">
        <li><i>Bakes</i>The entire cabinet, every day</li>
        <li><i>Savoury</i>The full savoury menu, not a corner of it</li>
        <li><i>Cakes</i>Including anything made to order</li>
      </ul>
      <p class="spec">Ask the counter for the day's bakes. They change.</p>
    </div>
  </section>

  <section class="pair" style="margin-top:var(--section)">
    <figure class="pair-img" data-reveal><img loading="lazy" src="assets/img/bakery-croissant-sandwich.webp" width="1100" height="848"
      alt="A croissant sandwich cut open, golden layers and a green pesto filling"></figure>
    <div data-reveal="0.12">
      <h2 class="sec">Goes with</h2>
      <ul class="menu">
        <li><b>Masala chai latt&eacute;</b><span>The one you actually grew up on.</span><em>190</em></li>
        <li><b>Jaggery latt&eacute;</b><span>Gur, not sugar.</span><em>260</em></li>
        <li><b>Hot chocolate</b><em>290</em></li>
        <li><b>Honey ginger lemon tea</b><em>215</em></li>
      </ul>
    </div>
  </section>
</div>"""

BAKE_EXTRA = """
/* ---------- bakery: the counter of cut-outs ------------------------------- */
.counter{padding:3vw var(--pad) 9vw;position:relative;overflow-x:clip}
.counter-head{display:flex;justify-content:space-between;align-items:flex-end;gap:4vw;margin-bottom:5vw}
.counter-h{font-family:var(--heading);font-weight:700;font-size:clamp(2rem,4.4vw,4.6rem);letter-spacing:-.055em;
  line-height:.9;margin:0;color:var(--warm-white)}
.counter-note{display:flex;align-items:center;gap:10px;margin:0;font-size:12px;letter-spacing:.16em;
  text-transform:uppercase;color:#7FBF8E}
.cgrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:2vw;row-gap:6vw;align-items:end}
.ci{margin:0;text-align:center;perspective:1000px;will-change:transform}
/* GSAP owns every transform in the counter (site.js bindBakery): no CSS float or
   hover transform here, or the stylesheet and the inline values would fight. */
.ci-in,.ci-spin,.ci img{will-change:transform}
.ci img{width:auto;max-width:100%;max-height:40vh;height:auto;margin:0 auto;display:block;
  filter:brightness(.92) drop-shadow(0 34px 38px rgba(0,0,0,.5))}
/* the bagels are small sources (~235px wide): keep them small so they stay sharp */
.ci-sm img{max-height:min(21vh,220px)}
.ci figcaption{margin-top:1.6vw}
.ci b{display:block;font-family:var(--heading);font-weight:500;font-size:clamp(1rem,1.15vw,1.15rem);
  letter-spacing:-.03em;color:var(--warm-white)}
.ci span{display:block;margin-top:5px;font-size:13px;color:var(--concrete-dim)}
/* Dim the inner parts, not .ci itself: GSAP owns .ci's inline opacity (reveal),
   which would always beat this rule. */
.ci-in,.ci figcaption{transition:opacity .5s ease}
.cgrid:hover .ci .ci-in,.cgrid:hover .ci figcaption{opacity:.3}
.cgrid .ci:hover .ci-in,.cgrid .ci:hover figcaption{opacity:1}
/* 7 items on 12 columns in three staggered rows; the two bagels sit narrow */
/* 2026-09-11: 4 + 3 so no item sits alone in a row */
.ci1{grid-column:1/4}
.ci2{grid-column:4/6;margin-bottom:8vw}
.ci3{grid-column:6/10;margin-bottom:2vw}
.ci4{grid-column:10/13;margin-bottom:6vw}
.ci5{grid-column:2/4;margin-bottom:5vw}
.ci6{grid-column:5/9;margin-bottom:2vw}
.ci7{grid-column:9/12;margin-bottom:7vw}

/* ---------- bakery: the crumb opens from a window to full screen ----------- */
.macro{position:relative}
.macro-pin{position:relative;height:100vh;overflow:hidden;display:grid;place-items:center}
.macro-img{position:absolute;inset:0;margin:0}
.macro-img img{width:100%;height:100%;object-fit:cover;filter:brightness(.72) saturate(.92);transform:scale(1.2)}
/* ink squares over the photo; they vanish in random order as the pin scrubs */
.macro-tiles{position:absolute;inset:0;z-index:1;display:grid;pointer-events:none}
.macro-tiles i{background:var(--ink);box-shadow:0 0 0 1px var(--ink)}
.macro-copy{position:relative;z-index:2;text-align:center;padding:0 var(--pad)}
.macro-h{font-family:var(--heading);font-weight:800;font-size:clamp(2rem,4.6vw,5rem);letter-spacing:-.06em;
  line-height:.92;margin:0 0 2.4vh;color:var(--warm-white);text-shadow:0 4px 60px rgba(0,0,0,.55)}
.macro-copy p{font-size:clamp(16px,1.35vw,20px);color:var(--warm-white);margin:0;text-shadow:0 2px 30px rgba(0,0,0,.6)}

/* ---------- bakery: goes-with pairing -------------------------------------- */
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6vw;align-items:center}
.pair-img{margin:0;aspect-ratio:1100/847;overflow:hidden}
.pair-img img{width:100%;height:100%;object-fit:cover;filter:brightness(.86)}

@media (max-width:820px){
  .counter-head{flex-direction:column;align-items:flex-start;gap:3vw}
  .cgrid{grid-template-columns:1fr 1fr;row-gap:10vw}
  .ci{grid-column:auto !important;margin-bottom:0 !important}
  .ci1{grid-column:1/3 !important}
  .ci img{max-height:24vh}
  .cgrid:hover .ci .ci-in,.cgrid:hover .ci figcaption{opacity:1}
  .pair{grid-template-columns:1fr}
  .macro-h{font-size:10vw}
}
@media (prefers-reduced-motion:reduce){.ci-in{animation:none}.macro-tiles{display:none}}
"""

page("bakery.html", "Bakery &middot; 100% Eggless &middot; Doubleshot Coffee Roasters",
     "A 100% eggless artisanal bakery and savoury menu. The whole kitchen, not one token shelf.",
     # 2026-09-11 client: the gloved-cake cut-out "not premium at all" -> the client's
     # own editorial shot (DUQD8HBCYHQ: cookie in two hands on black, hard light), framed.
     "bakery-hero.webp", "frame", "A golden butter cookie held up between two hands against a black background",
     "100% eggless", "Bakery",
     "An entire kitchen without egg in it, so nobody has to ask.",
     BAKERY_BODY, BAKE_EXTRA, kicker_veg=True)

# -------------------------------------------------------------- LOCATIONS ---
# (city, name, address, service, hours, note). Chandigarh Sector 8 is "Brewing
# Soon" on the client's own Instagram, so it is shown as opening soon.
OUTLETS = [
    ("Amritsar", "Ranjit Avenue", "SCO 49, B Block, District Shopping Centre, Amritsar 143001",
     "Dine in &amp; takeaway", "Mon to Sun &middot; 9:00 to 21:00", "The roaster is on premise here."),
    ("Amritsar", "Kabir Park", "Kabir Park, Amritsar", "Dine in &amp; takeaway",
     "Mon to Sun &middot; 9:00 to 21:00", ""),
    ("Amritsar", "Amritsar Colony", "Opposite Guru Nanak Dev University", "Dine in &amp; takeaway",
     "Mon to Sun &middot; 9:00 to 21:00", ""),
    ("Mohali", "", "Mohali, Punjab", "Dine in &amp; takeaway", "Mon to Sun &middot; 9:00 to 21:00", ""),
    ("Jalandhar", "", "Jalandhar, Punjab", "Dine in &amp; takeaway", "Mon to Sun &middot; 9:00 to 21:00", ""),
    ("Chandigarh", "Sector 8", "Sector 8, Chandigarh", "Opening soon", "Brewing soon", ""),
]

# 2026-09-11 Locations redesign (replaces the identical card grid): a sketch map
# of Punjab with routes drawn out of the Amritsar roaster, and one row per city
# that opens with that city's own photo. Photos, all client posts:
#   Amritsar  = the Ranjit Avenue sign (C0oRnxCxsBD, captioned Ranjit Avenue)
#   Jalandhar = storefront (C_VPtASS6Qi, captioned Jalandhar; same arched facade
#               as DCLhu-KxgEZ, also Jalandhar, and as room-storefront.webp)
#   Chandigarh = the "Brewing Soon" card (brand-photos/10_LOGO_chandigarh_card)
#   Mohali    = no photo we can place there; the living steam mark instead.
# Map positions are projected from real lat/lon (x = lon, y = lat), labelled
# as a sketch, never as a boundary map.
CITY_INFO = [
    ("amritsar", "Amritsar", "Three caf&eacute;s &middot; the roaster", "ig-C0oRnxCxsBD.webp",
     "The Doubleshot cup-and-steam sign on the Ranjit Avenue building", (0, 1, 2)),
    ("jalandhar", "Jalandhar", "One caf&eacute;", "loc-jalandhar.webp",
     "The Doubleshot storefront in Jalandhar, arched windows under the sign", (4,)),
    ("mohali", "Mohali", "One caf&eacute;", None, "", (3,)),
    ("chandigarh", "Chandigarh", "Opening soon", "loc-chandigarh.webp",
     "The Doubleshot logo on the Brewing Soon card for Chandigarh, Sector 8", (5,)),
]
PTS = {"amritsar": (55, 60), "jalandhar": (173, 124), "mohali": (363, 253), "chandigarh": (373, 247)}
LBL = {"amritsar": (69, 58, "start", "Roaster"), "jalandhar": (187, 128, "start", ""),
       "mohali": (350, 270, "end", ""), "chandigarh": (386, 247, "start", "Soon")}
ROUTES = {"jalandhar": "M55 60 Q105 70 173 124", "mohali": "M55 60 Q215 90 363 253",
          "chandigarh": "M55 60 Q240 60 373 247"}

grat = "".join('<line class="grat" x1="%d" y1="0" x2="%d" y2="310"/>' % (x, x) for x in range(10, 470, 90)) + \
       "".join('<line class="grat" x1="0" y1="%d" x2="470" y2="%d"/>' % (y, y) for y in range(15, 310, 70))
routes = "".join('<path class="route%s" data-city="%s" pathLength="1" d="%s"/>'
                 % (" soon" if c == "chandigarh" else "", c, d) for c, d in ROUTES.items())
pts = ""
for c, (x, y) in PTS.items():
    lx, ly, anchor, sub = LBL[c]
    name = [n for cid, n, *_ in CITY_INFO if cid == c][0]
    pts += ('<g class="pt%s" data-city="%s"><circle class="halo" cx="%d" cy="%d" r="14"/>'
            '<circle class="dot" cx="%d" cy="%d" r="4.5"/></g>'
            '<text data-city="%s" x="%d" y="%d" text-anchor="%s">%s</text>'
            % (" origin" if c == "amritsar" else "", c, x, y, x, y, c, lx, ly + 4, anchor, name))
    if sub:
        pts += '<text class="sub" x="%d" y="%d" text-anchor="%s">%s</text>' % (lx, ly + 17, anchor, sub)
MAP_SVG = ('      <svg class="map" viewBox="0 0 470 310" aria-hidden="true" focusable="false">'
           + grat + routes + pts + '</svg>')


def outlet_li(o):
    city, name, addr, svc, hrs, note = o
    q = ((name or city) + " " + city).replace(" ", "+")
    soon = svc == "Opening soon"
    return ('          <li><b>%s</b><span>%s</span><span class="svc">%s</span>%s%s</li>'
            % (name or "The caf&eacute;", addr, svc if soon else svc + " &middot; " + hrs,
               ('<em>%s</em>' % note) if note else "",
               "" if soon else '<a class="dir" target="_blank" rel="noopener" '
               'href="https://www.google.com/maps/search/?api=1&amp;query=Doubleshot+Coffee+Roasters+%s">Get directions</a>' % q))


city_parts = []
for cid, nm, summ, img, alt, idx in CITY_INFO:
    if img:
        ph = '<img loading="lazy" src="assets/img/%s" width="%d" height="%d" alt="%s">' % ((img,) + _wh(img) + (alt,))
    else:
        ph = '<span class="city-mark" data-ds-mark="view" aria-hidden="true"></span>'
    city_parts.append(
        '      <article class="city" data-city="%s">\n'
        '        <div class="city-top"><h2 class="city-name">%s</h2><p class="city-sum">%s</p></div>\n'
        '        <div class="city-body">\n'
        '          <figure class="city-ph">%s</figure>\n'
        '          <ul class="outs">\n%s\n          </ul>\n'
        '        </div>\n'
        '      </article>' % (cid, nm, summ, ph, "\n".join(outlet_li(OUTLETS[k]) for k in idx)))
cities = "\n".join(city_parts)

LOC_BODY = ('<div class="wrap">\n'
    '  <p class="lede" data-reveal>Five rooms across three cities, with Chandigarh opening\n'
    '     soon. The roaster is in Ranjit Avenue, which is why that one smells the way it does.</p>\n'
    '  <section class="lmap">\n'
    '    <div class="lmap-stick">\n' + MAP_SVG + '\n'
    '      <p class="map-note">A sketch of Punjab, drawn from the roaster outward.</p>\n'
    '    </div>\n'
    '    <div class="cities">\n' + cities + '\n    </div>\n'
    '  </section>\n'
    """  <section class="loc-all" data-reveal style="margin-top:var(--section)">
    <div>
    <h2 class="sec">All of them</h2>
    <ul class="dotlist" style="max-width:620px">
      <li><b>Open</b><em></em><b>Every day, 9:00 to 21:00</b></li>
      <li><b>Phone</b><em></em><b>+91 77430 07183</b></li>
      <li><b>Also</b><em></em><b>0183 516 2920</b></li>
    </ul>
    <div class="btns">
      <a class="btn" href="tel:+917743007183">Call us</a>
      <a class="btn ghost" href="menu.html">See the menu</a>
    </div>
    </div>
    <figure class="loc-photo"><img loading="lazy" src="assets/img/room-interior.webp" width="640" height="756" alt="Guests on cane chairs inside the Ranjit Avenue cafe, the counter behind them"></figure>
  </section>
</div>""")

LOC_EXTRA = """
/* ---------- locations: the room fills the half the list left empty ------- */
.loc-all{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);gap:6vw;align-items:center}
.loc-photo{margin:0;aspect-ratio:640/756;overflow:hidden;max-height:70vh;justify-self:end;width:100%}
.loc-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.88)}
@media (max-width:820px){.loc-all{grid-template-columns:1fr}}

/* ---------- locations: sketch map + city rows ------------------------------
   The map is sticky beside the rows; each city's route draws out of the roaster
   as its row arrives (site.js bindLocations), and the row opens with its photo.
   Every hidden state sits under .lmap.js, so without JS it is all visible. */
.lmap{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:6vw;align-items:start;margin-top:2vw}
.lmap-stick{position:sticky;top:16vh}
.map{width:100%;height:auto;display:block;overflow:visible}
.map .grat{stroke:rgba(241,237,228,.07);stroke-width:1;vector-effect:non-scaling-stroke}
.map .route{fill:none;stroke:var(--accent);stroke-width:1.5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0}
.map .route.soon{stroke:rgba(198,164,114,.5)}
.lmap.js .map .route{stroke-dashoffset:1}
.map .dot{fill:rgba(241,237,228,.55);transition:fill .5s ease}
.map .halo{fill:none;stroke:var(--accent);stroke-width:1;opacity:0;transform-box:fill-box;transform-origin:center}
.map .pt.origin .dot{fill:var(--accent)}
.map .pt.origin .halo{animation:halo 2.8s ease-out infinite}
.map .pt.on .dot{fill:var(--warm-white)}
@keyframes halo{from{opacity:.75;transform:scale(.35)}to{opacity:0;transform:scale(1.6)}}
/* font sizes are SVG user units (the map scales ~1.1x on desktop, ~0.75x on phones):
   sized so every label renders at 12px or more (polish: 9-unit subs rendered ~9px) */
.map text{font-family:var(--heading);font-weight:500;font-size:15px;letter-spacing:-.01em;
  fill:rgba(241,237,228,.6);transition:fill .5s ease}
.map text.on{fill:var(--warm-white)}
.map text.sub{font-family:var(--body);font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;
  fill:var(--accent);transform:translateY(2px)}
@media (max-width:820px){.map text{font-size:19px}.map text.sub{font-size:16px;transform:translateY(8px)}}
.map-note{margin:2vh 0 0;font-size:13px;color:var(--concrete-dim)}
.cities{display:flex;flex-direction:column;gap:9vh;padding-bottom:4vh}
.city{border-top:1px solid var(--line);padding-top:3vh}
.city-top{display:flex;justify-content:space-between;align-items:baseline;gap:3vw;margin-bottom:3vh}
.city-name{font-family:var(--heading);font-weight:800;font-size:clamp(2.4rem,5vw,5.2rem);letter-spacing:-.06em;
  line-height:.9;margin:0;color:var(--warm-white);transition:color .6s ease}
/* dim only beside the sticky map (desktop); phones read every row at full strength */
@media (min-width:821px){.lmap.js .city:not(.on) .city-name{color:rgba(241,237,228,.55)}}
.city-sum{margin:0;font-size:12px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);text-align:right}
.city-body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:3vw;align-items:start}
.city-ph{margin:0;aspect-ratio:4/5;max-height:60vh;overflow:hidden;background:var(--charcoal);display:grid;place-items:center}
.city-ph img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.88)}
.city-mark{width:36%;color:var(--accent);opacity:.9}
.lmap.js .city-ph{clip-path:inset(100% 0 0 0);transition:clip-path 1.2s cubic-bezier(.77,0,.18,1)}
.lmap.js .city.seen .city-ph{clip-path:inset(0 0 0 0)}
.lmap.js .city-ph img{transform:scale(1.14);transition:transform 1.8s cubic-bezier(.16,1,.3,1)}
.lmap.js .city.seen .city-ph img{transform:none}
.outs{list-style:none;margin:0;padding:0}
.outs li{display:flex;flex-direction:column;gap:5px;padding:0 0 2.4vh;margin:0 0 2.4vh;border-bottom:1px solid var(--line-soft)}
.outs li:last-child{border-bottom:0;margin-bottom:0}
.outs b{font-family:var(--heading);font-weight:500;font-size:20px;letter-spacing:-.03em;color:var(--warm-white)}
.outs span{font-size:13px;font-weight:300;line-height:1.5;color:var(--warm-white-dim)}
.outs .svc{font-size:12px;color:var(--concrete-dim)}
.outs em{font-style:normal;font-size:12px;color:var(--accent)}
.outs .dir{align-self:flex-start;margin-top:6px;font-size:12px;letter-spacing:.16em;position:relative;
  text-transform:uppercase;color:var(--accent);border-bottom:1px solid transparent;transition:.3s}
.outs .dir:hover{border-bottom-color:var(--accent)}
/* invisible 44px hit area; the underline stays on the text */
.outs .dir::after{content:'';position:absolute;inset:-14px -8px}
.lmap.js .outs li{opacity:0;transform:translateY(18px);transition:opacity .7s ease .35s,transform .9s cubic-bezier(.16,1,.3,1) .35s}
.lmap.js .city.seen .outs li{opacity:1;transform:none}
.lmap.js .city.seen .outs li:nth-child(2){transition-delay:.47s}
.lmap.js .city.seen .outs li:nth-child(3){transition-delay:.59s}
@media (max-width:820px){
  .lmap{grid-template-columns:1fr;gap:10vw}
  .lmap-stick{position:static}
  .city-body{grid-template-columns:1fr;gap:6vw}
  .city-ph{aspect-ratio:3/2}
  .city-top{flex-direction:column;gap:2vw}
  .city-sum{text-align:left}
  .city-name{font-size:13vw}
}
@media (prefers-reduced-motion:reduce){.map .pt.origin .halo{animation:none}}
"""

page("locations.html", "Locations &middot; Doubleshot Coffee Roasters",
     "Doubleshot Coffee Roasters in Amritsar, Mohali and Jalandhar, with Chandigarh opening soon. Open every day 9:00 to 21:00.",
     # 2026-09-11: room-storefront's source cuts the sign ("UBLESHO"); DCLhu-KxgEZ shows it whole
     "loc-hero.webp", "frame", "The Doubleshot storefront in Jalandhar, the full sign above arched windows",
     "Amritsar &middot; Mohali &middot; Jalandhar &middot; Chandigarh", "Find us",
     "Five rooms, one roaster. Chandigarh is next.", LOC_BODY, LOC_EXTRA)

print("built:", sorted(f for f in os.listdir(".") if f.endswith(".html")))
