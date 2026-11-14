"""Проверка озвучки: распознаёт речь (Whisper) и сравнивает со сценарием слово в слово.

Запуск:  python check_voice.py <аудио> <ожидаемый текст или путь к .txt> [язык=de]
Печатает процент совпадения и слова, которые прозвучали не так, как написано.
"""
import difflib, re, sys
from pathlib import Path
from faster_whisper import WhisperModel

audio, expected = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else "de"
if Path(expected).is_file():
    expected = Path(expected).read_text(encoding="utf-8")

from num2words import num2words
def norm(s):
    # цифры -> слова («18» = «achtzehn»), иначе это ложная ошибка
    s = s.replace("ё", "е")
    s = re.sub(r"(?<=\d)\.(?=\d{3})", "", s)  # 280.000 -> 280000
    s = re.sub(r"\d+", lambda m: " " + (num2words(int(m.group()), lang=lang, to="year") if 1100 <= int(m.group()) < 2000 else num2words(int(m.group()), lang=lang)) + " ", s.lower())
    return re.sub(r"[^\wäöüß]+", " ", s).split()

model = WhisperModel("medium", device="cpu", compute_type="int8")
# декодируем через ffmpeg в 16 кГц моно (встроенный декодер faster-whisper падает на части файлов)
import subprocess, numpy as np
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                     check=True, capture_output=True).stdout
samples = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
segs, _ = model.transcribe(samples, language=lang, beam_size=5)
heard = " ".join(s.text.strip() for s in segs)

a, b = norm(expected), norm(heard)
sm = difflib.SequenceMatcher(a=a, b=b)
ratio = sum(m.size for m in sm.get_matching_blocks()) / max(len(a), 1)
print(f"Совпадение: {ratio * 100:.1f}%")
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op != "equal":
        print(f"  написано: «{' '.join(a[i1:i2])}»  →  услышано: «{' '.join(b[j1:j2])}»")
print("Распознано:", heard)
