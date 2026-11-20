// server/src/seed/generateImages.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import productsData from './products.data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../../../client/public/seed-images');

export function generateSeedImages() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Generate Product SVGs
  productsData.forEach((p) => {
    const filename = `${p.code}.svg`;
    const filepath = path.join(targetDir, filename);

    const priceRs = Math.round(p.pricePaise / 100);
    const qtyStr = `${p.quantityValue} ${p.quantityUnit}`;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBF8F3"/>
      <stop offset="100%" stop-color="#EFE8DE"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5DCD0" stroke-width="0.8" opacity="0.6"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect width="800" height="600" fill="url(#grid)"/>

  <!-- Inner Decorative Card -->
  <rect x="40" y="40" width="720" height="520" rx="24" fill="#FFFFFF" fill-opacity="0.85" stroke="#DCCEC0" stroke-width="2"/>

  <!-- Top Category Pill -->
  <rect x="70" y="70" width="220" height="44" rx="22" fill="#8C6D58" fill-opacity="0.15"/>
  <text x="180" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#6A4E3D" text-anchor="middle">
    ${p.category.toUpperCase().replace('-', ' ')}
  </text>

  <!-- Product Code Pill -->
  <rect x="630" y="70" width="100" height="44" rx="22" fill="#EAE2D7"/>
  <text x="680" y="98" font-family="monospace" font-size="18" font-weight="700" fill="#523E32" text-anchor="middle">
    ${p.code}
  </text>

  <!-- Center Decorative Emblem -->
  <circle cx="400" cy="270" r="110" fill="#F4EFE8" stroke="#D3C3B1" stroke-width="2"/>
  <circle cx="400" cy="270" r="88" fill="#E8DEC9" fill-opacity="0.5"/>
  <path d="M400,210 C420,240 450,260 450,290 C450,320 425,340 400,340 C375,340 350,320 350,290 C350,260 380,240 400,210 Z" fill="#2E7D32" fill-opacity="0.85"/>
  <circle cx="400" cy="290" r="14" fill="#FAF6EE"/>

  <!-- English Title -->
  <text x="400" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="700" fill="#2B2118" text-anchor="middle">
    ${p.name.en}
  </text>

  <!-- Marathi Title -->
  <text x="400" y="475" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="28" font-weight="600" fill="#6A4E3D" text-anchor="middle">
    ${p.name.mr}
  </text>

  <!-- Bottom Details Bar -->
  <line x1="80" y1="505" x2="720" y2="505" stroke="#E6DCD1" stroke-width="1.5"/>

  <!-- Quantity -->
  <text x="120" y="538" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#756152">
    Net: <tspan font-weight="700" fill="#2B2118">${qtyStr}</tspan>
  </text>

  <!-- Price Badge -->
  <text x="680" y="538" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#2E7D32" text-anchor="end">
    ₹${priceRs}
  </text>
</svg>`;

    fs.writeFileSync(filepath, svg, 'utf8');
  });

  // 2. Generate Seller Avatars (S1..S8)
  for (let i = 1; i <= 8; i++) {
    const avatarPath = path.join(targetDir, `seller-${i}-avatar.svg`);
    const coverPath = path.join(targetDir, `seller-${i}-cover.svg`);

    const avatarSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="96" fill="#8C6D58" stroke="#FDFBF7" stroke-width="8"/>
  <circle cx="100" cy="100" r="76" fill="#735442"/>
  <text x="100" y="118" font-family="system-ui, sans-serif" font-size="52" font-weight="700" fill="#FDFBF7" text-anchor="middle">
    S${i}
  </text>
</svg>`;

    const coverSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="400" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFE8DE"/>
      <stop offset="50%" stop-color="#FBF8F3"/>
      <stop offset="100%" stop-color="#E6DFD5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#coverGrad)"/>
  <circle cx="200" cy="200" r="160" fill="#8C6D58" fill-opacity="0.06"/>
  <circle cx="1000" cy="150" r="220" fill="#2E7D32" fill-opacity="0.04"/>
  <circle cx="600" cy="350" r="180" fill="#735442" fill-opacity="0.05"/>
</svg>`;

    fs.writeFileSync(avatarPath, avatarSvg, 'utf8');
    fs.writeFileSync(coverPath, coverSvg, 'utf8');
  }

  console.log(`Generated ${productsData.length} product SVGs and 8 seller avatar/covers in ${targetDir}`);
}

export default generateSeedImages;
