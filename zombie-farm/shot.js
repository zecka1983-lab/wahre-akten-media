const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2400, height: 1000 }, deviceScaleFactor: +(process.argv[3]||1) });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/sheet.html'); await p.waitForTimeout(500);
  await p.locator('#sheet').screenshot({ path: process.argv[2] }); await b.close();
})();
