#!/usr/bin/env node
/*
  Quick frame analyzer for eTax Mobile video frames.
  - Input: directory of frames (frame_000001.jpg ...)
  - Output: CSV and JSON lines describing detected UI elements per frame
  Heuristics:
    * Detect header (red band) bbox
    * Detect main white cards (user card + sections) as coarse bboxes
    * Detect large red button (e.g., "Tra cứu") bbox
    * OCR optional for header title and prominent button label
*/

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

let TesseractLib = null;
try { TesseractLib = require('tesseract.js'); } catch {}

function usage() {
  console.error('Usage: node tools/analyze_frames.js <frames_dir> <fps> <out_csv> <out_jsonl> [--ocr] [--langs eng+vie] [--limit N]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 4) usage();

const FRAMES_DIR = args[0];
const FPS = parseFloat(args[1]);
const OUT_CSV = args[2];
const OUT_JSONL = args[3];
const OCR_ENABLED = args.includes('--ocr');
const LIMIT_ARG_INDEX = args.indexOf('--limit');
const LIMIT = LIMIT_ARG_INDEX >= 0 ? parseInt(args[LIMIT_ARG_INDEX + 1]) : undefined;
const LANGS_ARG_INDEX = args.indexOf('--langs');
const OCR_LANGS = LANGS_ARG_INDEX >= 0 ? args[LANGS_ARG_INDEX + 1] : (process.env.TESS_LANGS || 'eng');

async function ensureDir(p) {
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
}

function listFrames(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.match(/\.jpe?g$/i))
    .sort();
}

function hex(r,g,b){
  const h=(n)=>n.toString(16).padStart(2,'0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function isRedish(r,g,b){ return r>110 && r-g>40 && r-b>40; }
function isNearWhite(r,g,b){ const m=(r+g+b)/3; return m>230; }

async function detectHeader(image){
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  let headerBottom = 0;
  const sampleXs = [Math.floor(w*0.1), Math.floor(w*0.3), Math.floor(w*0.5), Math.floor(w*0.7), Math.floor(w*0.9)];
  for (let y=0; y<Math.min(200,h); y++){
    let redCount=0; let total=0;
    for (const x of sampleXs){
      const idx = (w*y + x) * 4; const d=image.bitmap.data;
      const r=d[idx], g=d[idx+1], b=d[idx+2];
      total++;
      if (isRedish(r,g,b)) redCount++;
    }
    if (redCount >= 3) headerBottom = y; // majority red at this row
    if (y>20 && redCount <= 1 && headerBottom>0) break; // passed header
  }
  if (headerBottom>0) return {x:0,y:0,w:w,h:headerBottom};
  return null;
}

async function detectLargeRedButton(image){
  const w=image.bitmap.width, h=image.bitmap.height;
  const yStart = Math.floor(h*0.25);
  const yEnd = Math.floor(h*0.8);
  // scan bands to find a horizontally wide red area (Tra cứu)
  for (let y=yStart; y<yEnd; y+=2){
    let redCount=0, total=0;
    for (let x=10; x<w-10; x+=4){
      const idx=(w*y+x)*4; const d=image.bitmap.data;
      const r=d[idx], g=d[idx+1], b=d[idx+2];
      total++;
      if (isRedish(r,g,b)) redCount++;
    }
    const ratio = redCount/(total||1);
    if (ratio>0.5){
      // expand vertically to get button
      let top=y; while(top>yStart){
        let cnt=0, tot=0; for(let x=10; x<w-10; x+=4){ const i=(w*top+x)*4; const d=image.bitmap.data; const r=d[i],g=d[i+1],b=d[i+2]; tot++; if(isRedish(r,g,b))cnt++; }
        if (cnt/(tot||1) < 0.4) break; top--; }
      let bottom=y; while(bottom<yEnd){
        let cnt=0, tot=0; for(let x=10;x<w-10;x+=4){ const i=(w*bottom+x)*4; const d=image.bitmap.data; const r=d[i],g=d[i+1],b=d[i+2]; tot++; if(isRedish(r,g,b))cnt++; }
        if (cnt/(tot||1) < 0.4) break; bottom++; }
      return {x:10, y:top, w:w-20, h:Math.max(1,bottom-top)};
    }
  }
  return null;
}

async function detectWhiteCards(image){
  const w=image.bitmap.width, h=image.bitmap.height;
  const cards=[];
  const step=4;
  // scan rows to find white-dominant bands, then merge contiguous ranges.
  let current=null;
  for(let y=0;y<h;y+=step){
    let white=0, tot=0;
    for(let x=10;x<w-10;x+=8){ const i=(w*y+x)*4; const d=image.bitmap.data; const r=d[i],g=d[i+1],b=d[i+2]; tot++; if(isNearWhite(r,g,b))white++; }
    const ratio=white/(tot||1);
    if(ratio>0.5){ if(!current) current={start:y}; }
    else{ if(current){ current.end=y; cards.push({x:10,y:current.start,w:w-20,h:Math.max(step,current.end-current.start)}); current=null; } }
  }
  if(current){ current.end=h-1; cards.push({x:10,y:current.start,w:w-20,h:Math.max(step,current.end-current.start)}); }
  // filter very short bands
  return cards.filter(c=>c.h>20);
}

async function ocrText(image, region){
  if (!OCR_ENABLED || !TesseractLib || !TesseractLib.recognize) return null;
  const {x,y,w,h} = region;
  const crop = image.clone().crop(x,y,w,h);
  const tmpPath = path.join(process.cwd(), `.tmp_ocr_${Date.now()}_${Math.random().toString(36).slice(2)}.png`);
  await crop.writeAsync(tmpPath);
  const { data:{ text } } = await TesseractLib.recognize(tmpPath, OCR_LANGS);
  try{ fs.unlinkSync(tmpPath);}catch{}
  return (text||'').trim().replace(/\s+/g,' ');
}

function toCsvRow(obj){
  const esc = v => typeof v==='string' ? '"'+v.replace(/"/g,'""')+'"' : v;
  return [obj.time, obj.element, `(${obj.x},${obj.y},${obj.w},${obj.h})`, obj.color||'', obj.text||'', obj.click? 'Yes':'No', obj.navigation||''].map(esc).join(',');
}

async function main(){
  const frames = listFrames(FRAMES_DIR);
  const useFrames = typeof LIMIT==='number' ? frames.slice(0, LIMIT) : frames;
  await ensureDir(OUT_CSV); await ensureDir(OUT_JSONL);
  fs.writeFileSync(OUT_CSV, 'time,element,bbox_px,color_hex,text,click,navigation\n');
  const outJson = fs.createWriteStream(OUT_JSONL, { flags:'w' });

  let lastHeaderText=null;

  for (let i=0;i<useFrames.length;i++){
    const f = useFrames[i];
    const framePath = path.join(FRAMES_DIR, f);
    const image = await Jimp.read(framePath);
    const w=image.bitmap.width, h=image.bitmap.height;
    const timeSec = (i / FPS).toFixed(2) + 's';

    // Header
    const header = await detectHeader(image);
    if(header){
      // approximate header color by sampling center
      const cx = Math.floor(w*0.5), cy = Math.floor(header.h*0.5);
      const idx=(w*cy+cx)*4; const d=image.bitmap.data; const color=hex(d[idx],d[idx+1],d[idx+2]);
      const rec={time:timeSec, element:'Header', x:header.x,y:header.y,w:header.w,h:header.h, color, text:'', click:false, navigation:''};
      fs.appendFileSync(OUT_CSV, toCsvRow(rec)+'\n');
      outJson.write(JSON.stringify(rec)+'\n');
      // Try OCR title in a small band
      if (OCR_ENABLED){
        const titleBand={x:Math.floor(w*0.25), y:5, w:Math.floor(w*0.5), h:Math.max(20, Math.floor(header.h*0.4))};
        const t = await ocrText(image, titleBand);
        if(t){
          const rec2={time:timeSec, element:'HeaderTitle', x:titleBand.x,y:titleBand.y,w:titleBand.w,h:titleBand.h, color, text:t, click:false, navigation:(t!==lastHeaderText && lastHeaderText)?`Header changed: ${lastHeaderText} -> ${t}`:''};
          fs.appendFileSync(OUT_CSV, toCsvRow(rec2)+'\n'); outJson.write(JSON.stringify(rec2)+'\n');
          lastHeaderText=t;
        }
      }
    }

    // White cards
    const cards = await detectWhiteCards(image);
    for(const c of cards){
      const cx=c.x+Math.floor(c.w/2), cy=c.y+Math.floor(c.h/2);
      const idx=(w*cy+cx)*4; const d=image.bitmap.data; const color=hex(d[idx],d[idx+1],d[idx+2]);
      const rec={time:timeSec, element:'WhiteCard', x:c.x,y:c.y,w:c.w,h:c.h, color, text:'', click:false, navigation:''};
      fs.appendFileSync(OUT_CSV, toCsvRow(rec)+'\n'); outJson.write(JSON.stringify(rec)+'\n');
    }

    // Red button (Tra cứu)
    const btn = await detectLargeRedButton(image);
    if(btn){
      const cx=btn.x+Math.floor(btn.w/2), cy=btn.y+Math.floor(btn.h/2);
      const idx=(w*cy+cx)*4; const d=image.bitmap.data; const color=hex(d[idx],d[idx+1],d[idx+2]);
      let text='';
      if(OCR_ENABLED){
        try{ text = await ocrText(image, {x:btn.x+Math.floor(btn.w*0.2), y:btn.y, w:Math.floor(btn.w*0.6), h:btn.h}); }catch{}
      }
      const rec={time:timeSec, element:'PrimaryButton', x:btn.x,y:btn.y,w:btn.w,h:btn.h, color, text, click:false, navigation:''};
      fs.appendFileSync(OUT_CSV, toCsvRow(rec)+'\n'); outJson.write(JSON.stringify(rec)+'\n');
    }
  }
  outJson.end();
  console.log(`Wrote ${OUT_CSV} and ${OUT_JSONL} for ${useFrames.length} frame(s).`);
}

main().catch(err=>{ console.error(err); process.exit(1); });
