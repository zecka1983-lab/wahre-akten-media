#!/usr/bin/env bash
# Порядок работы:
#   1) ./make_video.sh preview projekte/<имя> [ru|de]  -> "Предварительный просмотр/<имя>_preview.mp4" (быстро, 540x960)
#   2) владелец смотрит и даёт согласие
#   3) ./make_video.sh final projekte/<имя>     -> "Готовые ролики/<имя>.mp4" (1080x1920)
# Финал без одобренного превью не делается (нужен файл projekte/<имя>/APPROVED).
# Образцы и чужие ролики для анализа лежат в "Референс".
set -euo pipefail
cd "$(dirname "$0")"
MODE="$1"; P="$2"; LANG_V="${3:-de}"; NAME="$(basename "$P")"
PREVIEW="Предварительный просмотр"; FINAL="Готовые ролики"
mkdir -p "$PREVIEW" "$FINAL" "Референс"

# если владелец прислал свою озвучку (projekte/<имя>/audio_<язык>.mp3) — берём её
if [ -f "$P/audio_${LANG_V}.mp3" ]; then
  python3 tools/import_voice.py "$P" "$P/audio_${LANG_V}.mp3" "$LANG_V"
else
  if [ "$MODE" = preview ]; then
    SHOW_RU=1 python3 tools/make_voice.py "$P" "$LANG_V"   # бесплатный голос, только для таймингов; русская строка-подсказка
  else
    python3 tools/make_voice.py "$P" "$LANG_V" ${EL_VOICE:-}
  fi
fi
cp "$P/timeline.json" video/src/timeline.json
cp "$P/voice.wav" video/public/voice.wav
BR=${BROWSER:+--browser-executable="$BROWSER"}

cd video
if [ "$MODE" = preview ]; then
  # лёгкое превью для экономии трафика: 360x640, без звука, только субтитры (~1 МБ)
  npx remotion render src/index.ts Main "../$PREVIEW/${NAME}_${LANG_V}_preview.mp4" --codec=h264 --crf=34 --scale=0.3333 --muted $BR
  echo "Превью готово: $PREVIEW/${NAME}_${LANG_V}_preview.mp4. Ждём согласия."
elif [ "$MODE" = final ]; then
  [ -f "../$P/APPROVED" ] || { echo "Превью ещё не одобрено. Финал не делаю."; exit 1; }
  npx remotion render src/index.ts Main "../$FINAL/${NAME}.mp4" --codec=h264 --crf=18 $BR
  # своя фоновая музыка, если задана в script.json ("music"): тихо, под голосом
  if python3 -c "import json,sys; sys.exit(0 if json.load(open('../$P/script.json')).get('music') else 1)"; then
    (cd .. && python3 tools/make_music.py "$P")
    ffmpeg -v error -y -i "../$FINAL/${NAME}.mp4" -i "../$P/music.wav" -filter_complex \
      "[1:a][0:a]sidechaincompress=threshold=0.04:ratio=3:attack=30:release=500[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k \
      "../$FINAL/${NAME}_m.mp4" && mv "../$FINAL/${NAME}_m.mp4" "../$FINAL/${NAME}.mp4"
  fi
  # сжатие под TikTok (~20 МБ на минуту+): владелец экономит трафик, TikTok всё равно пережимает
  ffmpeg -v error -y -i "../$FINAL/${NAME}.mp4" -c:v libx264 -preset slow -crf 23 -maxrate 2500k -bufsize 5000k \
    -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "../$FINAL/${NAME}_tmp.mp4" && mv "../$FINAL/${NAME}_tmp.mp4" "../$FINAL/${NAME}.mp4"
  echo "Готово: $FINAL/${NAME}.mp4"
else
  echo "Режим: preview или final"; exit 1
fi
