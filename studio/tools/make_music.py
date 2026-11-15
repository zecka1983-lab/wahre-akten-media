"""Своя фоновая музыка (без авторских прав): тихий загадочный эмбиент под длину ролика.

Запуск:  python make_music.py <папка_проекта>
Читает timeline.json. Настроение — из script.json: "music": {"mood": "mystery", "resolve": "<cut>", "tick": ["hook", ...]}
  mood    — mystery: тёмный ре-минорный гул с медленными «вздохами»
  resolve — сцена, с которой аккорд светлеет (минор -> мажор): момент развязки
  tick    — сцены, где тикают часы (напряжение)
Пишет music.wav (громкость низкая: фон под голосом).
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

proj = Path(sys.argv[1])
tl = json.loads((proj / "timeline.json").read_text(encoding="utf-8"))
cfg = json.loads((proj / "script.json").read_text(encoding="utf-8")).get("music") or {}
SR = 44100
dur = tl["duration"] + 1.0
t = np.arange(int(dur * SR)) / SR

resolve_at = next((s["start"] for s in tl["scenes"] if cfg.get("resolve") and s.get("cut") == cfg["resolve"]), dur + 1)
res = np.clip((t - resolve_at) / 2.0, 0, 1)  # плавный переход к мажору за 2 с


def tone(f, amp, lfo, phase=0.0):
    # мягкий тон: синус + немного второй гармоники, медленное «дыхание» громкости
    w = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t + 0.3)
    return amp * w * (0.55 + 0.45 * np.sin(2 * np.pi * lfo * t + phase))


sig = (tone(73.42, 0.30, 0.05)            # D2 — гул
       + tone(110.0, 0.20, 0.07, 1.0)     # A2
       + tone(146.83, 0.12, 0.06, 2.0)    # D3
       + tone(174.61, 0.10, 0.09, 3.0) * (1 - res)   # F3 — минор (тревога)
       + tone(185.00, 0.10, 0.09, 3.0) * res         # F#3 — мажор (развязка)
       + tone(440.0, 0.025, 0.13, 4.0)    # высокое «мерцание»
       + tone(587.33, 0.02, 0.11, 5.0) * (0.3 + 0.7 * res))

# тиканье часов в напряжённых сценах
tick = np.zeros_like(t)
for s in tl["scenes"]:
    if s.get("cut") in cfg.get("tick", []):
        for k in np.arange(s["start"], s["start"] + s["dur"], 0.5):
            i = int(k * SR)
            n = int(0.03 * SR)
            if i + n < len(tick):
                env = np.exp(-np.linspace(0, 8, n))
                tick[i:i + n] += 0.18 * env * np.sin(2 * np.pi * (2400 if int(k * 2) % 2 else 1800) * t[:n])
sig = sig + tick

# пульс-сердцебиение в напряжённых сценах (тук-тук ~ 70 уд/мин)
for sc_ in tl["scenes"]:
    if sc_.get("cut") in cfg.get("pulse", []):
        for k in np.arange(sc_["start"], sc_["start"] + sc_["dur"], 0.86):
            for off, amp in ((0, 1.0), (0.18, 0.7)):
                i = int((k + off) * SR); n = int(0.16 * SR)
                if i + n < len(sig):
                    env = np.exp(-np.linspace(0, 7, n))
                    sig[i:i + n] += 0.9 * amp * env * np.sin(2 * np.pi * 52 * t[:n])
# нарастание (райзер) за 2 с до важных поворотов
for sc_ in tl["scenes"]:
    if sc_.get("cut") in cfg.get("riser", []):
        e = int(sc_["start"] * SR); n = int(2.0 * SR); b = max(0, e - n)
        if e < len(sig):
            ramp = np.linspace(0, 1, e - b) ** 2
            f = 200 + 1400 * ramp
            ph = 2 * np.pi * np.cumsum(f) / SR
            sig[b:e] += 0.35 * ramp * np.sin(ph)

# удар на 0:00 (зацепка, без тихого нарастания) и «вжух» на каждой смене сцены
rng = np.random.default_rng(7)
if cfg.get("hit"):
    n = int(1.2 * SR)
    env = np.exp(-np.linspace(0, 6, n))
    boom = 1.6 * env * np.sin(2 * np.pi * (55 + 40 * env) * t[:n]) + 0.5 * env ** 3 * rng.standard_normal(n)
    sig[:n] += boom
if cfg.get("swoosh"):
    for s in tl["scenes"][1:]:
        i, n = int(max(0, s["start"] - 0.25) * SR), int(0.35 * SR)
        if i + n < len(sig):
            env = np.sin(np.linspace(0, np.pi, n)) ** 2
            noise = np.convolve(rng.standard_normal(n), np.ones(12) / 12, mode="same")
            sig[i:i + n] += 0.45 * env * noise

# «поп» на каждой новой раскадровке (появление значка/надписи): короткий мягкий щелчок-капля
if cfg.get("pops"):
    n = int(0.07 * SR); tt = np.arange(n) / SR
    pop = np.sin(2 * np.pi * np.cumsum(np.linspace(950, 380, n)) / SR) * np.exp(-tt * 55)
    times = sorted({round(c["t"], 2) for sc_ in tl["scenes"] for c in (sc_.get("cuts") or [])} | {round(sc_["start"], 2) for sc_ in tl["scenes"]})
    for tc in times:
        i = int(tc * SR)
        if 0 < i and i + n < len(sig):
            sig[i:i + n] += 0.55 * pop

# начало и конец: с ударом — без затухания в начале
fade_in = 0.03 if cfg.get("hit") else 2.0
fade = np.minimum(1, np.minimum(t / fade_in, (dur - t) / 2.5))
sig = sig * np.clip(fade, 0, 1)
sig = sig / (np.abs(sig).max() + 1e-9) * 0.8

raw = proj / "tmp" / "music_raw.wav"
raw.parent.mkdir(exist_ok=True)
with wave.open(str(raw), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((sig * 32767).astype(np.int16).tobytes())
# лёгкий «зал» (эхо) и тихий уровень: фон должен быть на ~14 дБ тише голоса
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
                "aecho=0.8:0.7:120|260:0.35|0.25,lowpass=f=5000,loudnorm=I=-25:TP=-4:LRA=11",
                "-ar", "48000", "-ac", "2", str(proj / "music.wav")], check=True)
print(f"Музыка: {proj / 'music.wav'}  {dur:.1f} c, развязка с {resolve_at:.1f} c")
