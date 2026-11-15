// usage: node render.js out.mp4 [fps] [t0] [t1] [audio]   or  node render.js --stills dir t1,t2,...
const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('LOG', m.text()));
  await p.goto('file://' + __dirname + '/anim.html'); await p.waitForTimeout(300);
  if (process.argv[2] === '--stills') {
    for (const t of process.argv[4].split(',')) { await p.evaluate(t => show(+t), t); await p.screenshot({ path: `${process.argv[3]}/f_${(+t).toFixed(2)}.png` }); }
    await b.close(); return;
  }
  const out = process.argv[2], fps = +(process.argv[3] || 30), T = await p.evaluate(() => TIMES);
  const t0 = +(process.argv[4] || 0), t1 = +(process.argv[5] || T.end);
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
  if (process.argv[6]) args.push('-i', process.argv[6], '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(fps), out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'inherit'] });
  const n = Math.round((t1 - t0) * fps); const st = Date.now();
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => show(t), t0 + i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`frame ${i}/${n} ${((Date.now() - st) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out);
})();
