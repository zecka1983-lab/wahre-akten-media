"""Карта региона для «карта»-роликов: подложка (суша — летний Blue Marble, море — topo+bathy)
и SVG-контуры регионов одной страны из Natural Earth admin-1.
Запуск: python make_region.py <имя> <ISO3> <lon0> <lon1> <latTop> <latBottom> <K> [highlight_name ...]
Выход: video/public/map/<имя>.jpg и video/src/<имя>data.json"""
import json, math, sys
import numpy as np
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
from scipy.ndimage import distance_transform_edt, gaussian_filter
from shapely.geometry import shape
from shapely.ops import unary_union
Image.MAX_IMAGE_PIXELS = None
R = Path(__file__).parent.parent
name, iso = sys.argv[1], sys.argv[2]
LON0, LON1, LATT, LATB, K = map(float, sys.argv[3:8]); hi = sys.argv[8:]
C = math.cos(math.radians((LATT + LATB) / 2))
W = int((LON1 - LON0) * C * K); H = int((LATT - LATB) * K)
def cut(path):
    bm = Image.open(path); SW, SH = bm.size
    c = bm.crop((int((LON0 + 180) / 360 * SW), int((90 - LATT) / 180 * SH), int((LON1 + 180) / 360 * SW), int((90 - LATB) / 180 * SH)))
    return c.resize((W, H), Image.BICUBIC)
land = cut(R / "assets/map/bm.jpg"); sea0 = cut(R / "assets/map/bathy.jpg")
a = np.asarray(land).astype(np.float32)
water = ((a.mean(2) < 42) & (a[:, :, 2] >= a[:, :, 0])).astype(np.uint8) * 255
m = Image.fromarray(water).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
s = np.asarray(sea0).astype(np.float32).mean(2)
s = gaussian_filter(np.clip((s - np.percentile(s, 2)) / (np.percentile(s, 98) - np.percentile(s, 2) + 1e-6), 0, 1), 1.0)
shelf = np.exp(-distance_transform_edt(np.asarray(m) > 127) / (K / 2) * 1.6)
k = np.clip(0.45 * s + 0.55 * shelf, 0, 1)[..., None]
deep, shallow = np.array([18, 52, 78], np.float32), np.array([78, 140, 160], np.float32)
sea = Image.fromarray(np.clip(deep + (shallow - deep) * k, 0, 255).astype(np.uint8))
img = Image.composite(sea, land, m).filter(ImageFilter.UnsharpMask(2, 50, 2))
img = ImageEnhance.Brightness(ImageEnhance.Contrast(ImageEnhance.Color(img).enhance(1.15)).enhance(1.05)).enhance(1.12)
img.save(R / f"video/public/map/{name}.jpg", quality=92)
d = json.load(open(R / "assets/map/states.geojson"))
st = {f["properties"]["name"]: shape(f["geometry"]) for f in d["features"] if f["properties"].get("adm0_a3") == iso}
def path(g, tol=0.004):
    g = g.simplify(tol)
    polys = [g] if g.geom_type == "Polygon" else [p for p in g.geoms if p.area > 0.01]
    return " ".join("M" + " L".join(f"{(x - LON0) * C * K:.1f} {(LATT - y) * K:.1f}" for x, y in p.exterior.coords) + " Z" for p in polys)
out = {"W": W, "H": H, "K": K, "C": C, "LON0": LON0, "LATT": LATT, "country": path(unary_union(list(st.values()))),
       "regions": {n: path(st[n]) for n in hi}}
json.dump(out, open(R / f"video/src/{name}data.json", "w"))
print(name, W, H)
