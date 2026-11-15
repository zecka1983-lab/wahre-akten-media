"""Озвучка сценария: script.json -> voice.wav + timeline.json (тайминги сцен и слов).

Запуск:  python make_voice.py <папка_проекта> [de|ru] [voice_id ElevenLabs]
  de — немецкий (финал), ru — русский (превью для проверки смысла).
  Если задан voice_id и ключ (файл из переменной EL_KEY_FILE) — озвучка через ElevenLabs,
  иначе бесплатный офлайн-голос Piper. Ответы ElevenLabs кэшируются, повторно кредиты не тратятся.
"""
import base64, hashlib, json, os, subprocess, sys, urllib.request, wave
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import shots as shotplan

proj = Path(sys.argv[1])
lang = sys.argv[2] if len(sys.argv) > 2 else "de"
VOICES = {"de": "de-thorsten-low.onnx", "ru": "ru-irinia-medium.onnx"}
voice = str(Path(__file__).parent / "voices" / VOICES[lang])
el_voice = sys.argv[3] if len(sys.argv) > 3 else None
el_key = Path(os.environ["EL_KEY_FILE"]).read_text().strip() if el_voice and os.environ.get("EL_KEY_FILE") else None
cache = Path(__file__).parent / "el_cache"; cache.mkdir(exist_ok=True)
# как на сайте ElevenLabs по умолчанию + чуть быстрее (владелец сравнил на слух)
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True, "speed": float(os.environ.get("EL_SPEED", "1.04"))}


def elevenlabs(text: str, wav: Path, voice_id: str):
    """Озвучка одной сцены через ElevenLabs. Возвращает [(слово, старт_сек)] по реальному звуку."""
    h = hashlib.sha1(f"{voice_id}|{text}|{json.dumps(VOICE_SETTINGS, sort_keys=True)}".encode()).hexdigest()[:16]
    cj = cache / f"{h}.json"
    if not cj.exists():
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                             "voice_settings": VOICE_SETTINGS}).encode(),
            headers={"xi-api-key": el_key, "Content-Type": "application/json"})
        cj.write_text(urllib.request.urlopen(req, timeout=120).read().decode())
    d = json.loads(cj.read_text())
    mp3 = wav.with_suffix(".mp3"); mp3.write_bytes(base64.b64decode(d["audio_base64"]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", "44100", "-ac", "1", str(wav)], check=True)
    al = d["alignment"]; chars, starts = al["characters"], al["character_start_times_seconds"]
    out, cur, st = [], "", None
    for c, t0 in zip(chars + [" "], starts + [None]):
        if c.isspace():
            if cur: out.append((cur, st)); cur = ""
        else:
            if not cur: st = t0
            cur += c
    return out


def tighten(path: Path, max_gap: float = float(os.environ.get("MAX_GAP", "0.22")), thr_db: float = -40.0):
    """Сжимает паузы длиннее max_gap до max_gap (темп для соцсетей).
    Возвращает функцию: время в исходном звуке -> время в сжатом (для субтитров)."""
    import numpy as np
    with wave.open(str(path)) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), np.int16).reshape(-1, ch)[:, 0].astype(np.float32) / 32768
    win = int(sr * 0.01)
    frames = len(x) // win
    rms = np.sqrt(np.mean(x[:frames * win].reshape(frames, win) ** 2, axis=1) + 1e-12)
    silent = 20 * np.log10(rms) < thr_db
    keep, cuts, i = np.ones(len(x), bool), [], 0
    while i < frames:
        if silent[i]:
            j = i
            while j < frames and silent[j]:
                j += 1
            run = (j - i) * 0.01
            if run > max_gap:
                a = int((i * 0.01 + max_gap / 2) * sr)
                b = int((j * 0.01 - max_gap / 2) * sr)
                keep[a:b] = False
                cuts.append((a / sr, b / sr))
            i = j
        else:
            i += 1
    y = x[keep]
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())

    def remap(tt: float) -> float:
        shift = 0.0
        for a, b in cuts:
            if tt >= b:
                shift += b - a
            elif tt > a:
                shift += tt - a
        return tt - shift
    return remap

FPS, PAUSE = 30, float(os.environ.get("PAUSE", "0.2"))  # пауза между сценами, сек
# надписи в плашке, которые надо перевести для русского превью
BIG_RU = {" h": " ч", "DU?": "А ТЫ?", "FOLGEN": "ПОДПИШИСЬ", "Tage": "дней", "NACHT": "НОЧЬ", "MEER": "МОРЕ",
          "KORALLEN": "КОРАЛЛЫ", "TURTLES": "ЧЕРЕПАХИ", "ACHSE": "ОСЬ", "KLIMA": "КЛИМАТ", "MOND": "ЛУНА"}

script = json.loads((proj / "script.json").read_text(encoding="utf-8"))
tmp = proj / "tmp"; tmp.mkdir(exist_ok=True)

timeline, t, parts = [], 0.0, []
for i, sc in enumerate(script["scenes"]):
    text = sc["ru"] if lang == "ru" else sc["text"]
    caption = sc.get("ru_caption", sc["ru"]) if lang == "ru" else sc.get("caption", sc["text"])
    big = sc.get("big", "")
    if lang == "ru":
        for k, v in BIG_RU.items():
            big = big.replace(k, v)
    wav = tmp / f"s{i:02d}.wav"
    spoken = None
    # голос героя из script.json ("voices": {"M": id, ...}), иначе общий голос из аргумента
    vid = (script.get("voices") or {}).get(sc.get("speaker", ""), "") or el_voice
    if el_key and vid:
        spoken = elevenlabs(text, wav, vid)
    else:
        subprocess.run([sys.executable, "-m", "piper", "-m", voice, "-f", str(wav), "--length-scale", "0.92"],
                       input=text.encode("utf-8"), check=True, capture_output=True)
        # единая частота 44100 Гц (полное качество), иначе склейка с паузами ломается
        raw = wav.with_name(wav.stem + "_raw.wav"); wav.rename(raw)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-ar", "44100", "-ac", "1", str(wav)], check=True)
    # выравнивание громкости реплик (все голоса на одном уровне, норма соцсетей −16 LUFS)
    # + обработка голоса героя из script.json ("audio_fx": {"G": "фильтр ffmpeg"}), напр. яркость
    fx = (script.get("audio_fx") or {}).get(sc.get("speaker", ""), "")
    chain = (fx + "," if fx else "") + "acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7"
    norm = wav.with_name(wav.stem + "_n.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", chain, "-ar", "44100", "-ac", "1", str(norm)], check=True)
    norm.replace(wav)
    remap = tighten(wav)
    if spoken:
        spoken = [(w_, remap(st)) for w_, st in spoken]
    with wave.open(str(wav)) as w:
        dur = w.getnframes() / w.getframerate()
    words = caption.split()
    if spoken:
        # точные тайминги из ElevenLabs: сопоставляем слова субтитров с реально сказанными
        import difflib, re
        key = lambda w: re.sub(r"\W", "", w.lower())
        sm = difflib.SequenceMatcher(a=[key(w) for w in words], b=[key(w) for w, _ in spoken], autojunk=False)
        times = [None] * len(words)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            for k in range(i1, i2):
                j = j1 + (k - i1) if op == "equal" else min(j1, len(spoken) - 1)
                times[k] = spoken[j][1]
        for k in range(len(times)):  # на всякий случай: время не убывает
            if times[k] is None or (k and times[k] < times[k - 1]):
                times[k] = times[k - 1] if k else 0.0
        wl = [{"w": wd, "t": round(t + tt, 3)} for wd, tt in zip(words, times)]
    else:
        # слова: время пропорционально длине слова
        weights = [len(x) + 2 for x in words]
        total, acc, wl = sum(weights), 0.0, []
        for wd, wt in zip(words, weights):
            wl.append({"w": wd, "t": round(t + dur * acc / total, 3)})
            acc += wt
    timeline.append({"big": big, "tired": sc.get("tired", 0), "moon": sc.get("moon", 0),
                     "speaker": sc.get("speaker", ""), "emo": sc.get("emo", ""), "bg": sc.get("bg", ""), "prop": sc.get("prop", ""), "cuts": shotplan.plan(wl, t, t + dur + PAUSE), "cut": sc.get("cut", ""), "shots": sc.get("shots", []), "punch": sc.get("punch", 0), "ru": sc.get("ru", ""),
                     "start": round(t, 3), "dur": round(dur + PAUSE, 3), "words": wl})
    parts.append(wav)
    t += dur + PAUSE

# склейка с паузами
silence = tmp / "pause.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                "-t", str(PAUSE), str(silence)], check=True)
lst = tmp / "concat.txt"
lst.write_text("".join(f"file '{p.resolve()}'\nfile '{silence.resolve()}'\n" for p in parts))
out = proj / "voice.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-ar", "44100", "-ac", "1", str(out)], check=True)

data = {"title": script["title"], "theme": script.get("theme", proj.name), "lang": lang,
        "showRu": bool(os.environ.get("SHOW_RU")), "hookText": script.get("hook_text", ""), "style": script.get("style", ""), "fps": FPS, "duration": round(t, 3), "scenes": timeline}
(proj / "timeline.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"Готово: {out}  язык {lang}, длительность {t:.1f} c")
