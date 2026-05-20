const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const dir = __dirname;

  for (let i = 1; i <= 3; i++) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });

    const htmlPath = path.join(dir, `frame${i}.html`);
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });

    // Wait for fonts to load
    await page.waitForTimeout(2000);

    const outputPath = path.join(dir, `frame${i}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`Rendered: frame${i}.png`);
    await page.close();
  }

  await browser.close();
  console.log('Done! 3 frames rendered.');
})();
