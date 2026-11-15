"""Карта для роликов «карта + вопрос»: подложка NASA Blue Marble + контуры (Natural Earth, OSM).
Нужны в assets/map: bm.jpg (NASA world.200408.3x21600x10800), states.geojson (Natural Earth admin-1), wall_tg.geojson (OSM, ход Стены).
Выход: video/public/map/europe.jpg, video/src/mapdata.json (пути SVG в координатах подложки)."""
import json, math
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
from shapely.geometry import shape
from shapely.ops import unary_union
Image.MAX_IMAGE_PIXELS = None
A = Path(__file__).parent.parent / "assets/map"; V = Path(__file__).parent.parent / "video"
LON0, LON1, LATT, LATB = 0, 24, 58, 44
C = math.cos(math.radians(51.5)); K = 120
W = int((LON1 - LON0) * C * K); H = int((LATT - LATB) * K)
out_bg = V / "public/map/europe.jpg"
if not out_bg.exists():
    bm = Image.open(A / "bathy.jpg"); SW, SH = bm.size  # NASA Blue Marble topo+bathy: голубой океан с рельефом дна
    crop = bm.crop((int((LON0 + 180) / 360 * SW), int((90 - LATT) / 180 * SH), int((LON1 + 180) / 360 * SW), int((90 - LATB) / 180 * SH)))
    img = crop.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
    img = ImageEnhance.Contrast(ImageEnhance.Color(img).enhance(1.15)).enhance(1.05)
    img = ImageEnhance.Brightness(img).enhance(1.08)
    img.save(out_bg, quality=92)
d = json.load(open(A / "states.geojson"))
st = {f["properties"]["name"]: shape(f["geometry"]) for f in d["features"] if f["properties"].get("adm0_a3") == "DEU"}
east = ["Sachsen", "Brandenburg", "Mecklenburg-Vorpommern", "Thüringen", "Sachsen-Anhalt"]
wb_full = shape(json.load(open(A / "wall_tg.geojson"))["features"][0]["geometry"])
# контур OSM — поздний ход Стены (с коридором 1972 г. к Штайнштюккену); убираем узкий коридор:
_o = wb_full.buffer(-0.0008).buffer(0.0008)
_parts = sorted(_o.geoms, key=lambda g: -g.area)
wb, stein = _parts[0], _parts[1]
# для показа: сгладить мелкие зубцы контура (иначе на крупных планах «чёрные кубики»)
from shapely.geometry import Polygon as _Poly
wb_disp = _Poly(wb.buffer(0.0007, join_style=1).buffer(-0.0007, join_style=1).simplify(0.0003).exterior)  # без внутренних колец (лишние петли Стены)
# начало контура — самая северная точка (Стена «рисуется» от верха по часовой)
_c = list(wb_disp.exterior.coords)[:-1]; _k = max(range(len(_c)), key=lambda i: _c[i][1])
wb_disp = _Poly(_c[_k:] + _c[:_k])
brd = unary_union([g for n, g in st.items() if n not in east + ["Berlin"]])
ddr = unary_union([st[n] for n in east] + [st["Berlin"]])  # без дыры: Западный Берлин рисуется сверху (иначе щели с тёмной подложкой)
# Восточный Берлин: без узких полосок вдоль Западного (контуры NE и OSM не совпадают) — оставляем только основную часть
_eb = st["Berlin"].difference(wb).buffer(-0.002).buffer(0.002)  # «открытие» убирает узкие полоски, край вплотную к Западному
eb = max(_eb.geoms, key=lambda g: g.area) if _eb.geom_type != "Polygon" else _eb
def path(g, tol=0.004):
    g = g.simplify(tol)
    polys = [g] if g.geom_type == "Polygon" else [p for p in g.geoms if p.area > 1e-6]
    out = []
    for p in polys:
        for ring in [p.exterior] + list(p.interiors):
            out.append("M" + " L".join(f"{(x - LON0) * C * K:.1f} {(LATT - y) * K:.1f}" for x, y in ring.coords) + " Z")
    return " ".join(out)
P = lambda lon, lat: [round((lon - LON0) * C * K, 2), round((LATT - lat) * K, 2)]
data = {"W": W, "H": H, "brd": path(brd), "ddr": path(ddr), "wb": path(wb_disp, 0), "stein": path(stein, 0.0001), "eb": path(eb, 0.0008),
        "wbR": round((wb.bounds[2] - wb.bounds[0]) * C * K / 2 * 1.25, 2), "germany": path(unary_union(list(st.values()))),
        "cities": {"Berlin": P(13.40, 52.52), "Tempelhof": P(13.40, 52.47), "Bonn": P(7.10, 50.73), "Hamburg": P(9.99, 53.55),
                   "Hannover": P(9.73, 52.37), "Frankfurt": P(8.68, 50.11), "München": P(11.58, 48.14), "Helmstedt": P(11.0, 52.23),
                   "Grenze": P(11.58, 53.04), "WBnah": P(13.15, 52.55), "WBc": P(wb.centroid.x, wb.centroid.y), "Stein": P(stein.centroid.x, stein.centroid.y), "Kohlhasen": P(13.150, 52.400),
                   "USA": P(13.33, 52.45), "GB": P(13.20, 52.51), "F": P(13.30, 52.585), "SU": P(13.47, 52.52)}}
json.dump(data, open(V / "src/mapdata.json", "w"))
print("mapdata ok", W, H)
