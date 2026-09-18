"""Cut the client's Instagram shots out of their backgrounds (Sunbeam-style treatment).

Rerunnable. Crops each source to the subject first (clear of IG text/logo overlays),
removes the background with rembg, trims to the alpha bounding box, and writes a
transparent WebP into assets/img plus a preview sheet on the site's green.
"""
from pathlib import Path
from PIL import Image
from rembg import new_session, remove

SRC = Path(r"E:\my projects\doubleshot_website\brand-photos\fullres")
OUT = Path(r"E:\my projects\doubleshot_website\code\assets\img")
PREVIEW = Path(r"E:\my projects\doubleshot_website\qa\2026-09-10_polish\cutouts_preview.jpg")
GREEN = (10, 33, 17)

# name: (source file, crop box left, top, right, bottom, [erase rects in SOURCE coords])
# Thandai was dropped: its glove runs off the source frame, so the cut edge is ragged.
JOBS = {
    "cut-tiramisu": ("ds_reel_DBoAJbzyjle_720x1280.jpg", (140, 520, 720, 1010), []),
    "cut-matcha":   ("ds_reel_C9IVMuxIlwk_1080x1920.jpg", (230, 830, 880, 1610), []),
    "cut-hotchoc":  ("ds_reel_DCBWbFmS9V9_720x1280.jpg", (0, 640, 700, 1220), []),
    # V60: dripper + server on the scale; crop starts below the kettle spout.
    "cut-v60":      ("ds_reel_Cyq5RpChjmL_720x1280.jpg", (190, 300, 650, 975), []),
    "cut-cake":     ("ds_reel_Dc1IHzQpps4_720x1280.jpg", (100, 470, 720, 1100), []),
    # Wide crop so the pastry is whole; the IG text card (top-left) is erased after masking.
    "cut-turnover": ("ds_p_DQT2-nuCRL-_1080x1350.jpg", (200, 400, 930, 1120), [(0, 0, 385, 595)]),
    "cut-cookie":   ("ds_p_DUQD8HBCYHQ_1080x1350.jpg", (0, 0, 1080, 1350), []),
    # Bakery counter (names are the client's own IG overlays). Crops start below
    # each post's title text; panini/club skipped (label arrows drawn over the food).
    "cut-avotoast": ("ds_p_DAyOpxRo_XG_1440x1440.jpg", (420, 568, 1060, 1440), []),
    "cut-bagel":    ("ds_reel_C3FxdWjx4Cy_720x1280.jpg", (145, 185, 570, 620), []),
    "cut-falafel":  ("ds_reel_C-PNDPUResh_720x1280.jpg", (25, 390, 715, 835), []),
    "cut-grilled":  ("ds_reel_DMZjBe5x-jv_640x1136.jpg", (20, 455, 470, 865), []),
}

session = new_session("isnet-general-use")
done = []
for name, (fname, box, erase) in JOBS.items():
    img = Image.open(SRC / fname).convert("RGB").crop(box)
    cut = remove(img, session=session, post_process_mask=True)
    if erase:
        alpha = cut.getchannel("A")
        for (x0, y0, x1, y1) in erase:
            r = (max(0, x0 - box[0]), max(0, y0 - box[1]), max(0, x1 - box[0]), max(0, y1 - box[1]))
            if r[2] > r[0] and r[3] > r[1]:
                alpha.paste(0, r)
        cut.putalpha(alpha)
    bbox = cut.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
    if bbox:
        pad = 12
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                min(cut.width, bbox[2] + pad), min(cut.height, bbox[3] + pad))
        cut = cut.crop(bbox)
    if cut.height > 1000:
        cut = cut.resize((round(cut.width * 1000 / cut.height), 1000), Image.LANCZOS)
    cut.save(OUT / f"{name}.webp", "WEBP", quality=86, method=6)
    done.append((name, cut))
    print(f"{name}: {cut.width}x{cut.height}  {(OUT / f'{name}.webp').stat().st_size // 1024}KB")

# Preview sheet: every cut-out on the page green, so edge quality can be judged.
th = 420
tiles = []
for name, cut in done:
    c = cut.copy()
    c.thumbnail((th, th))
    tile = Image.new("RGB", (th + 20, th + 20), GREEN)
    tile.paste(c, ((tile.width - c.width) // 2, (tile.height - c.height) // 2), c)
    tiles.append(tile)
sheet = Image.new("RGB", ((th + 20) * 4, (th + 20) * 2), GREEN)
for i, t in enumerate(tiles):
    sheet.paste(t, ((i % 4) * (th + 20), (i // 4) * (th + 20)))
PREVIEW.parent.mkdir(parents=True, exist_ok=True)
sheet.save(PREVIEW, quality=88)
print("preview:", PREVIEW)
