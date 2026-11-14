"""Раскадровка внутри сцены: новый кадр на каждую фразу (каждые ~1–2,5 с).

Кадр — либо ракурс камеры (номер пресета сцены в Story.tsx), либо вставка-крупняк
по ключевому слову. Тайминги берутся из слов субтитров, поэтому смена кадра попадает в речь.
"""
import re

# ключевое слово (начало слова, нижний регистр) -> вставка-крупняк
INSERTS = {
    "stasi": "stamp", "штази": "stamp",
    "minen": "mines", "мины": "mines",
    "nähmaschine": "needle", "näh": "needle", "машинк": "needle",
    "gefängnis": "bars", "тюрьм": "bars",
    "gas": "gauge", "газ": "gauge",
    "polizeiauto": "siren", "полицейск": "siren",
    "stoff": "fabric", "ткан": "fabric",
}
MIN_SHOT = 1.6  # короче этого кадр не делаем


def plan(words, start, end):
    """words: [{"w": слово, "t": абс. время}]. Возвращает [{"t": время, "cam": n} | {"t":…, "insert": имя}]."""
    if not words:
        return [{"t": start, "cam": 0}]
    # фразы: режем после знаков препинания
    phrases, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.,:;!?…–]$", w["w"]) or w["w"] in ("–", "-"):
            phrases.append(cur); cur = []
    if cur:
        phrases.append(cur)
    # слишком короткие фразы склеиваем с соседней
    merged = []
    for ph in phrases:
        if merged and ph[0]["t"] - merged[-1][0]["t"] < MIN_SHOT:
            merged[-1] = merged[-1] + ph
        else:
            merged.append(ph)
    shots, cam, used = [], 0, set()
    for k, ph in enumerate(merged):
        t0 = start if k == 0 else ph[0]["t"] - 0.05
        ins = None
        for w in ph:
            key = re.sub(r"[^\wäöüß]", "", w["w"].lower())
            for kw, name in INSERTS.items():
                if key.startswith(kw) and name not in used:
                    ins = name; break
            if ins:
                break
        if ins and k > 0:
            used.add(ins)
            shots.append({"t": round(t0, 3), "insert": ins})
        else:
            shots.append({"t": round(t0, 3), "cam": cam})
            cam += 1
    return shots
