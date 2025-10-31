#!/usr/bin/env node
/* Convert PNG/JPG assets to WebP and normalize icon sizes.
   Usage: node tools/optimize_assets.js <assets_dir> [--icons 48]
*/
const fs = require('fs');
const path = require('path');
let sharp = null; try { sharp = require('sharp'); } catch {}

if (!sharp) {
  console.error('Please install sharp: npm i -D sharp');
  process.exit(1);
}

const dir = process.argv[2];
let iconSize = 48;
const idx = process.argv.indexOf('--icons');
if (idx !== -1 && process.argv[idx+1]) {
  const parsed = parseInt(process.argv[idx+1], 10);
  if (!Number.isNaN(parsed)) iconSize = parsed;
}
if (!dir) { console.error('Usage: node tools/optimize_assets.js <assets_dir> [--icons 48]'); process.exit(1); }

const ICON_PAT = /(^icon\d*|^index\d*|tienich|hotro|trangchu|nutha|icon-qr|icon-bell)/i;

async function convertFile(file){
  const ext = path.extname(file).toLowerCase();
  if (!['.png','.jpg','.jpeg'].includes(ext)) return;
  const base = file.slice(0, -ext.length);
  const webp = base + '.webp';
  try {
    const img = sharp(file);
    const meta = await img.metadata();
    let pipeline = img;
    if (ICON_PAT.test(path.basename(file))) {
      pipeline = pipeline.resize({ width: iconSize, height: iconSize, fit: 'inside', withoutEnlargement: true });
    }
    await pipeline.webp({ quality: 82 }).toFile(webp);
    console.log('Converted →', path.relative(process.cwd(), webp), `(from ${meta.width}x${meta.height})`);
  } catch (e){ console.error('Failed', file, e.message); }
}

function walk(p){
  const entries = fs.readdirSync(p, { withFileTypes: true });
  for (const e of entries){
    const full = path.join(p, e.name);
    if (e.isDirectory()) walk(full);
    else convertFile(full);
  }
}

walk(path.resolve(dir));
console.log('Done.');
