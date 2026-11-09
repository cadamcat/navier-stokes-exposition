// Render the film's particle-core model into self-contained article assets.
// Usage: node figures/render3d.js <studio node_modules directory> [film root]
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const nm = path.resolve(process.argv[2]);
const film = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(__dirname, '../../film');
if (!fs.existsSync(path.join(film, 'scenes/ns/trails.js'))) throw new Error('film root not found; pass it as the third argument');
const { chromium } = require(path.join(nm, 'playwright'));
const FIGS = { 'fig2-core': [620, 650], 'fig3-annulus': [620, 680] };
(async () => {
  const temporaryHTML = path.join(__dirname, '3d', 'fig3d-render.html');
  const html = fs.readFileSync(path.join(__dirname, 'fig3d.html'), 'utf8')
    .replaceAll('__FILM_URL__', pathToFileURL(film + path.sep).href)
    .replaceAll('__MODULES_URL__', pathToFileURL(nm + path.sep).href);
  fs.mkdirSync(path.dirname(temporaryHTML), { recursive: true });
  fs.writeFileSync(temporaryHTML, html);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
  try {
  for (const [name, [w, h]] of Object.entries(FIGS)) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const errors = [], remote = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('request', r => { if (/^https?:/.test(r.url())) remote.push(r.url()); });
    await page.goto(pathToFileURL(temporaryHTML).href + '?fig=' + name + '&w=' + w + '&h=' + h);
    await page.waitForFunction(() => window.figDone === true, null, { timeout: 60000 });
    if (errors.length || remote.length) throw new Error([...errors, ...remote].join('\n'));
    const anchors = await page.evaluate(() => window.figAnchors);
    const target = path.join(__dirname, '3d', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target + '-anchors.json', JSON.stringify(anchors, null, 2) + '\n');
    const first = await page.screenshot({ path: target + '.png', scale: 'device' });
    await page.evaluate(() => { window.setTime(2); window.setTime(5.2); });
    const second = await page.screenshot({ scale: 'device' });
    if (!first.equals(second)) throw new Error('non-deterministic plate ' + name);
    console.log('PASS 3d', name, 'film particle renderer; no core ellipse; seeded; seek 5.2 → 2 → 5.2 identical;', w * 2, 'x', h * 2, 'cache bytes', anchors.cacheBytes);
    console.log('PASS 3d resources', name, 'local only');
    await page.close();
  }
  } finally {
    await browser.close();
    fs.unlinkSync(temporaryHTML);
  }
})().catch(e => { console.error(e); process.exit(1); });
