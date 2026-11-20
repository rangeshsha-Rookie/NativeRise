// client/scripts/extract-mockup-assets.mjs
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const MOCKUP_PATH = 'C:/Users/HP/.gemini/antigravity/brain/adba6d9c-4158-46ca-98cb-26e902cc3258/.user_uploaded/media_1795200904649_85b7e31f.jpg';
const OUT_DIRS = [
  path.resolve('public', 'mockup-assets'),
  'E:/NativeRise/client/public/mockup-assets'
];

for (const dir of OUT_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function extract() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  
  const imageBase64 = fs.readFileSync(MOCKUP_PATH).toString('base64');
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#fff;">
        <img id="mockup" src="data:image/jpeg;base64,${imageBase64}" />
        <canvas id="cvs"></canvas>
      </body>
    </html>
  `;

  await page.setContent(html);

  async function cropAndSave(name, x, y, width, height) {
    const dataUrl = await page.evaluate(({ x, y, width, height }) => {
      const img = document.getElementById('mockup');
      const cvs = document.getElementById('cvs');
      cvs.width = width;
      cvs.height = height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      return cvs.toDataURL('image/png');
    }, { x, y, width, height });

    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
    for (const dir of OUT_DIRS) {
      fs.writeFileSync(path.join(dir, `${name}.png`), buffer);
    }
    console.log(`Saved: ${name}.png (${width}x${height})`);
  }

  // 1. Hero Village Scenery (Clean crop of cottage, bullock cart, lush trees without left text)
  await cropAndSave('hero-village-scenery', 252, 48, 300, 185);

  // 2. Categories (crop strictly the icon without the label below it)
  const catNames = [
    'cat-farming',
    'cat-handicrafts',
    'cat-textiles',
    'cat-food-honey',
    'cat-home-decor',
    'cat-jewellery',
    'cat-eco-friendly',
    'cat-organic-produce'
  ];
  for (let i = 0; i < 8; i++) {
    const cx = Math.round(28 + i * 63);
    await cropAndSave(catNames[i], cx + 5, 285, 38, 36);
  }

  // 3. Featured Products Photos (clean product object isolated)
  await cropAndSave('prod-bamboo-basket', 35, 403, 94, 60);
  await cropAndSave('prod-terracotta-pot', 165, 403, 94, 60);
  await cropAndSave('prod-cotton-fabric', 293, 403, 94, 60);
  await cropAndSave('prod-village-honey', 422, 403, 94, 60);

  await cropAndSave('prod-wooden-lamp', 35, 532, 94, 60);
  await cropAndSave('prod-homemade-pickle', 165, 532, 94, 60);
  await cropAndSave('prod-eco-mat', 293, 532, 94, 60);
  await cropAndSave('prod-ayurvedic-herbs', 422, 532, 94, 60);

  // 4. Artisans Portraits (circle portraits precisely centered)
  await cropAndSave('artisan-sunita-devi', 24, 714, 34, 34);
  await cropAndSave('artisan-ramesh-kumar', 154, 714, 34, 34);
  await cropAndSave('artisan-meena-sharma', 284, 714, 34, 34);
  await cropAndSave('artisan-suresh-patel', 414, 714, 34, 34);

  // 5. Value Props Icons
  await cropAndSave('icon-authentic-products', 45, 804, 26, 26);
  await cropAndSave('icon-rural-economy', 204, 804, 26, 26);
  await cropAndSave('icon-secure-shopping', 377, 804, 26, 26);

  // 6. Footer Village Silhouette
  await cropAndSave('footer-village-silhouette', 0, 920, 552, 45);

  await browser.close();
  console.log('All mockup assets re-extracted with precision coordinates!');
}

extract().catch(console.error);
