"""Подложка карты: суша — летний снимок NASA Blue Marble (без снега, 21600 px),
вода — Blue Marble topo+bathy (голубое море с рельефом дна). Выход: video/public/map/europe.jpg"""
import math, numpy as np
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
Image.MAX_IMAGE_PIXELS = None
R = Path(__file__).parent.parent
LON0, LON1, LATT, LATB = 0, 24, 58, 44
C = math.cos(math.radians(51.5)); K = 120
W = int((LON1 - LON0) * C * K); H = int((LATT - LATB) * K)
def cut(path):
    bm = Image.open(path); SW, SH = bm.size
    c = bm.crop((int((LON0 + 180) / 360 * SW), int((90 - LATT) / 180 * SH), int((LON1 + 180) / 360 * SW), int((90 - LATB) / 180 * SH)))
    return c.resize((W, H), Image.BICUBIC)
land = cut(R / "assets/map/bm.jpg")
sea = cut(R / "assets/map/bathy.jpg").filter(ImageFilter.GaussianBlur(1.2))
# море «как на карте мира»: приглушённый сине-бирюзовый, у берега светлее (шельф), рельеф дна из яркости снимка
from scipy.ndimage import distance_transform_edt, gaussian_filter
_s = np.asarray(sea).astype(np.float32).mean(2)
_s = (_s - np.percentile(_s, 2)) / (np.percentile(_s, 98) - np.percentile(_s, 2) + 1e-6)
_s = gaussian_filter(np.clip(_s, 0, 1), 1.0)
_dist = None  # заполняется ниже, когда известна маска воды
a = np.asarray(land).astype(np.float32)
water = ((a.mean(2) < 42) & (a[:, :, 2] >= a[:, :, 0])).astype(np.uint8) * 255
m = Image.fromarray(water).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
_wm = np.asarray(m) > 127
_d = distance_transform_edt(_wm) / 60.0  # ~в градусах от берега
shelf = np.exp(-_d * 1.6)                 # 1 у берега -> 0 в открытом море
k = np.clip(0.45 * _s + 0.55 * shelf, 0, 1)[..., None]
deep = np.array([18, 52, 78], np.float32); shallow = np.array([78, 140, 160], np.float32)
seac = deep + (shallow - deep) * k
seac += (gaussian_filter(np.random.default_rng(1).normal(0, 1, _s.shape), 2.5)[..., None] * 3)  # лёгкая фактура воды
sea = Image.fromarray(np.clip(seac, 0, 255).astype(np.uint8))
img = Image.composite(sea, land, m).filter(ImageFilter.UnsharpMask(2, 50, 2))
img = ImageEnhance.Brightness(ImageEnhance.Contrast(ImageEnhance.Color(img).enhance(1.1)).enhance(1.05)).enhance(1.1)
img.save(R / "video/public/map/europe.jpg", quality=93)
print("фон готов", W, H)
