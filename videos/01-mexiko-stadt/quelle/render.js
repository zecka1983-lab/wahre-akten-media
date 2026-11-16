const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const [,, dir, mode, ...rest] = process.argv;
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await page.goto('file://' + path.join(dir, 'index.html'));
  await page.evaluate(() => window.ready);
  if (mode === 'stills') {
    for (const t of rest) {
      const d = await page.evaluate(t => { frame(+t); return document.getElementById('c').toDataURL('image/jpeg', 0.85) }, t);
      fs.writeFileSync(path.join(dir, 'stills', `s_${String(t).padStart(5, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    }
  } else {
    const [out, dur, fpsS] = rest; const fps = +fpsS, n = Math.round(+dur * fps);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      const d = await page.evaluate(t => { frame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93) }, i / fps);
      if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log('frame', i, '/', n);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  if (errs.length) console.log('ERRORS:', errs.slice(0, 5).join('\n'));
  await browser.close();
})();
