"""Second cut-out pass (2026-09-10): product only, whole, no hands or gloves.

Client feedback on v1: the shapes looked wrong — the glove and the hand were cut out
with the food, and the cake's top edge was sliced flat by the source crop. This pass
picks shots where the item stands alone and adds two gates the v1 script lacked:

  * largest connected component only (drops bits of neighbouring items), and
  * an EDGE check: if the alpha touches the crop border, the item was cut off by
    the frame and will show a flat edge. Those are flagged, not silently shipped.

Writes to qa/ (NOT assets/img) plus a preview sheet on the site's green, so nothing
on the live site changes until the cut-outs are approved.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from rembg import new_session, remove
from scipy import ndimage

SRC = Path(r"E:\my projects\doubleshot_website\brand-photos\fullres")
OUT = Path(r"E:\my projects\doubleshot_website\qa\2026-09-10_cutouts_v2")
GREEN = (10, 33, 17)

# name: (source file, crop box left, top, right, bottom) in source pixels
JOBS = {
    # Pass 2 crops: first pass cut the right edge / top / saucer too tight (EDGE gate).
    # The avocado toastie on the plate was dropped: ragged outline.
    "cut-croissant-sandwich": ("ds_reel_DKbc_2sRm8M_640x1136.jpg", (0, 380, 640, 1060)),
    "cut-bagel-sesame":       ("ds_reel_DLm2BwohffK_640x1136.jpg", (120, 390, 380, 650)),
    "cut-bagel-stuffed":      ("ds_reel_DLm2BwohffK_640x1136.jpg", (240, 580, 500, 870)),
    "cut-cookie-croissant":   ("ds_reel_C97ZiCFy3nc_720x1280.jpg", (0, 700, 640, 1260)),
    "cut-falafel":            ("ds_reel_C-PNDPUResh_720x1280.jpg", (20, 380, 720, 840)),
    "cut-affogato":           ("ds_reel_C8Yv_UNRBVs_720x1280.jpg", (40, 270, 620, 1200)),
    "cut-iced-layered":       ("ds_reel_C783muxRM_k_720x1280.jpg", (60, 220, 700, 1250)),
    "cut-cappuccino":         ("ds_reel_DCYs8yqxeW3_720x1280.jpg", (280, 520, 710, 920)),
    "cut-spice-latte":        ("ds_reel_DCYs8yqxeW3_720x1280.jpg", (100, 270, 350, 670)),
}

session = new_session("isnet-general-use")
done = []
for name, (fname, box) in JOBS.items():
    img = Image.open(SRC / fname).convert("RGB").crop(box)
    cut = remove(img, session=session, post_process_mask=True)
    a = np.array(cut.getchannel("A"))

    # Largest connected component only.
    lab, n = ndimage.label(a > 40)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
        keep = ndimage.binary_dilation(lab == (int(np.argmax(sizes)) + 1), iterations=3)
        a = np.where(keep, a, 0).astype(np.uint8)
        cut.putalpha(Image.fromarray(a))

    # Edge gate: share of each border that carries solid alpha.
    solid = a > 128
    edges = {"top": solid[0].mean(), "bottom": solid[-1].mean(),
             "left": solid[:, 0].mean(), "right": solid[:, -1].mean()}
    touching = [k for k, v in edges.items() if v > 0.02]
    coverage = (a > 128).mean()

    bbox = Image.fromarray(a).point(lambda v: 255 if v > 12 else 0).getbbox()
    if bbox:
        pad = 12
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                min(cut.width, bbox[2] + pad), min(cut.height, bbox[3] + pad))
        cut = cut.crop(bbox)
    OUT.mkdir(parents=True, exist_ok=True)
    cut.save(OUT / f"{name}.webp", "WEBP", quality=88, method=6)
    flag = f"  EDGE: {', '.join(touching)}" if touching else ""
    print(f"{name}: {cut.width}x{cut.height} coverage {coverage:.0%}{flag}")
    done.append((name, cut, touching))

# Preview sheet on the site green, labelled, edge flags in red.
th = 380
cols = 5
rows = (len(done) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (th + 20), rows * (th + 50)), GREEN)
d = ImageDraw.Draw(sheet)
for i, (name, cut, touching) in enumerate(done):
    c = cut.copy()
    c.thumbnail((th, th))
    x, y = (i % cols) * (th + 20), (i // cols) * (th + 50)
    sheet.paste(c, (x + 10 + (th - c.width) // 2, y + 10 + (th - c.height) // 2), c)
    d.text((x + 12, y + th + 20), name + ("  EDGE:" + ",".join(touching) if touching else ""),
           fill=(255, 90, 90) if touching else (241, 237, 228))
sheet.save(OUT / "preview.jpg", quality=88)
print("preview:", OUT / "preview.jpg")
