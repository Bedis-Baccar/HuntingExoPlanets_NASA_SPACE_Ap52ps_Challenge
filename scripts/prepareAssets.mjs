#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const publicDir = path.join(root, 'public');
const srcPluto = path.join(publicDir, 'models', 'pluto.jpg');
const outPng = path.join(publicDir, 'pluto.png');
const outIco = path.join(publicDir, 'favicon.ico');

async function ensurePlutoPng() {
  if (!fs.existsSync(srcPluto)) throw new Error('Source pluto.jpg not found at ' + srcPluto);
  const img = sharp(srcPluto).resize({ width: 512, height: 512, fit: 'inside' });
  // Create an alpha mask by thresholding brightness (simple heuristic) to simulate transparent edges
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Simple vignette-based alpha falloff from center
  const centerX = info.width / 2; const centerY = info.height / 2; const maxR = Math.min(centerX, centerY) * 0.98;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const dx = x - centerX; const dy = y - centerY; const r = Math.sqrt(dx*dx + dy*dy);
      if (r > maxR) {
        const falloff = Math.min(1, (r - maxR) / (info.width * 0.02));
        data[idx + 3] = Math.max(0, data[idx + 3] * (1 - falloff));
      }
    }
  }
  const composited = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  await composited.png({ quality: 80, compressionLevel: 9 }).toFile(outPng);
  const stat = fs.statSync(outPng);
  if (stat.size > 50 * 1024) {
    // Attempt further optimization by lowering quality slightly
    const reduced = await sharp(outPng).png({ quality: 70, compressionLevel: 9 }).toBuffer();
    if (reduced.length < stat.size) fs.writeFileSync(outPng, reduced);
  }
  console.log('pluto.png generated:', Math.round(fs.statSync(outPng).size/1024), 'kB');
}

async function ensureFavicon() {
  const base = fs.existsSync(outPng) ? outPng : srcPluto;
  await sharp(base).resize(32, 32).png({ quality: 85 }).toFile(path.join(publicDir, 'favicon-32.png'));
  // Multi-size ICO (16,32) from base
  const sizes = [16, 32];
  const images = await Promise.all(sizes.map(async s => sharp(base).resize(s, s).png().toBuffer()));
  // Simple ICO builder (combine PNGs) – sharp can output .ico indirectly by .toFile('favicon.ico') with .png input array (not natively), so fallback to 32x32 only.
  await sharp(images[1]).toFile(outIco);
  console.log('favicon.ico generated');
}

async function run() {
  await ensurePlutoPng();
  await ensureFavicon();
}

run().catch(e => { console.error(e); process.exit(1); });