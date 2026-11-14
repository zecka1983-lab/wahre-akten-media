"""Готовая озвучка владельца (mp3 из ElevenLabs) -> voice.wav + timeline.json.

Запуск:  python import_voice.py <папка_проекта> <аудиофайл> [de|ru]
Whisper распознаёт слова с таймингами, затем они сопоставляются с текстом сценария:
так находятся начала сцен и момент каждого слова субтитров. Паузы не добавляются —
используется звук как есть.
"""
import difflib, json, os, re, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import shots as shotplan
import numpy as np
from faster_whisper import WhisperModel
from num2words import num2words

proj, audio = Path(sys.argv[1]), sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else "de"
FPS = 30
BIG_RU = {" h": " ч", "DU?": "А ТЫ?", "FOLGEN": "ПОДПИШИСЬ", "Tage": "дней", "NACHT": "НОЧЬ", "MEER": "МОРЕ",
          "KORALLEN": "КОРАЛЛЫ", "TURTLES": "ЧЕРЕПАХИ", "ACHSE": "ОСЬ", "KLIMA": "КЛИМАТ", "MOND": "ЛУНА"}


def toks(s):
    """Слово -> нормализованные токены (цифры словами, без знаков, ё=е)."""
    s = s.lower().replace("ё", "е")
    s = re.sub(r"\d+", lambda m: " " + num2words(int(m.group()), lang=lang) + " ", s)
    return re.sub(r"[^\wäöüß]+", " ", s).split()


script = json.loads((proj / "script.json").read_text(encoding="utf-8"))
scenes = script["scenes"]
text_of = lambda sc: sc["ru"] if lang == "ru" else sc["text"]
cap_of = lambda sc: sc.get("ru_caption", sc["ru"]) if lang == "ru" else sc.get("caption", sc["text"])

# 1) звук -> voice.wav и массив для Whisper
out = proj / "voice.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", audio, "-ar", "44100", "-ac", "1", str(out)], check=True)
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                     check=True, capture_output=True).stdout
samples = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
duration = len(samples) / 16000

# 2) распознаём слова с таймингами
model = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = model.transcribe(samples, language=lang, beam_size=5, word_timestamps=True)
heard = []  # (токен, старт)
for seg in segs:
    for w in seg.words:
        for tk in toks(w.word):
            heard.append((tk, w.start))

# 3) текст сценария в токенах, с номером сцены
ref = []  # (токен, сцена)
for i, sc in enumerate(scenes):
    for tk in toks(text_of(sc)):
        ref.append((tk, i))
sm = difflib.SequenceMatcher(a=[t for t, _ in ref], b=[t for t, _ in heard], autojunk=False)
ref_time = [None] * len(ref)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    for k in range(i1, i2):
        if j1 < len(heard):
            ref_time[k] = heard[j1 + (k - i1)][1] if op == "equal" else heard[min(j1, len(heard) - 1)][1]
for k in range(len(ref_time)):
    if ref_time[k] is None or (k and ref_time[k] < ref_time[k - 1]):
        ref_time[k] = ref_time[k - 1] if k else 0.0
match = sum(m.size for m in sm.get_matching_blocks()) / max(len(ref), 1)

# 4) начало каждой сцены = время её первого слова (чуть раньше)
starts = []
for i in range(len(scenes)):
    ks = [k for k, (_, s) in enumerate(ref) if s == i]
    starts.append(max(0.0, ref_time[ks[0]] - 0.15) if ks else (starts[-1] if starts else 0.0))
starts[0] = 0.0

timeline = []
for i, sc in enumerate(scenes):
    end = starts[i + 1] if i + 1 < len(scenes) else duration
    ks = [k for k, (_, s) in enumerate(ref) if s == i]
    spoken = [(ref[k][0], ref_time[k]) for k in ks]
    # слова субтитров (с цифрами) сопоставляем со сказанными словами сцены
    cw = cap_of(sc).split()
    ckey = [" ".join(toks(w)) or w for w in cw]
    m2 = difflib.SequenceMatcher(a=ckey, b=[t for t, _ in spoken], autojunk=False)
    times = [None] * len(cw)
    for op, a1, a2, b1, b2 in m2.get_opcodes():
        for k in range(a1, a2):
            if spoken:
                times[k] = spoken[min(b1 + (k - a1) if op == "equal" else b1, len(spoken) - 1)][1]
    for k in range(len(times)):
        if times[k] is None or (k and times[k] < times[k - 1]):
            times[k] = times[k - 1] if k else starts[i]
    big = sc["big"]
    if lang == "ru":
        for a, b in BIG_RU.items():
            big = big.replace(a, b)
    timeline.append({"big": big, "tired": sc.get("tired", 0), "moon": sc.get("moon", 0),
                     "speaker": sc.get("speaker", ""), "emo": sc.get("emo", ""), "bg": sc.get("bg", ""), "prop": sc.get("prop", ""), "cuts": shotplan.plan([{"w": w, "t": tt} for w, tt in zip(cw, times)], starts[i], end), "cut": sc.get("cut", ""), "shots": sc.get("shots", []), "punch": sc.get("punch", 0), "ru": sc.get("ru", ""),
                     "start": round(starts[i], 3), "dur": round(end - starts[i], 3),
                     "words": [{"w": w, "t": round(t, 3)} for w, t in zip(cw, times)]})

data = {"title": script["title"], "theme": script.get("theme", proj.name), "lang": lang,
        "showRu": bool(os.environ.get("SHOW_RU")), "hookText": script.get("hook_text", ""), "fps": FPS, "duration": round(duration, 3), "scenes": timeline}
(proj / "timeline.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"Готово: {out}  язык {lang}, длительность {duration:.1f} c, текст совпал на {match * 100:.0f}%")
if duration < 61:
    print("ВНИМАНИЕ: ролик короче 61 секунды — для монетизации TikTok нужно больше минуты.")
if match < 0.9:
    print("ВНИМАНИЕ: озвучка заметно отличается от сценария — проверь, тот ли текст озвучен.")
