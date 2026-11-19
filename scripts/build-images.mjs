// Generates every optimised image the site uses from /assets/source.
// The originals in /assets/source are only read, never modified.
// Run with: npm run images   (output is committed, so this is only needed when a source changes)

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets/source';
const OUT = 'public/images';
await mkdir(OUT, { recursive: true });

// Palette (sampled from palette.png and grain.jpg)
const ONYX = { r: 5, g: 5, b: 5 };
const MIDNIGHT = { r: 25, g: 33, b: 44 };
const IVORY = { r: 214, g: 204, b: 168 };
const UMBER = { r: 44, g: 31, b: 22 };

const src = (f) => path.join(SRC, f);
const out = (f) => path.join(OUT, f);

/* ------------------------------------------------------------------ */
/* Elephant: sepia-toned, softened, emerging from a dark canvas        */
/* ------------------------------------------------------------------ */

// Tone the elephant into the palette: greyscale, warm umber tint,
// lowered contrast and brightness so it reads at roughly half strength.
async function tonedElephant({ top = 0, height, width }) {
  const meta = await sharp(src('elephant.jpg')).metadata();
  const h = height ?? meta.height - top;
  return sharp(src('elephant.jpg'))
    .extract({ left: 0, top, width: meta.width, height: h })
    .resize({ width })
    .greyscale()
    .linear(1.06, -44) // push the photo's grey backdrop down to black
    .tint({ r: 180, g: 150, b: 112 }) // warm sepia
    .modulate({ brightness: 0.86 })
    .toBuffer({ resolveWithObject: true });
}

// Feathered alpha mask, so the image has no hard edges
function featherMask(w, h, { left = 0.35, right = 0.08, top = 0.1, bottom = 0.18 }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="x" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="${left}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="${1 - right}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="y" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="${top}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="${1 - bottom}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <mask id="m"><rect width="100%" height="100%" fill="url(#y)"/></mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#x)" mask="url(#m)"/>
  </svg>`);
}

async function featheredLayer(buf, w, h, feather) {
  return sharp(buf)
    .ensureAlpha()
    .composite([{ input: featherMask(w, h, feather), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

// Onyx base with a fine film grain, which also prevents banding in the dark areas
async function canvas(w, h) {
  const noise = await sharp({
    create: { width: w, height: h, channels: 3, noise: { type: 'gaussian', mean: 7, sigma: 3 } },
  }).png().toBuffer();
  return sharp(noise);
}

// Desktop hero: 1920x1080, elephant to the right, calm dark space on the left
async function heroDesktop() {
  const W = 1920, H = 1080;
  const { data, info } = await tonedElephant({ top: 120, height: 900, width: 720 });
  const layer = await featheredLayer(data, info.width, info.height, { left: 0.62, right: 0.12, top: 0.14, bottom: 0.24 });
  const base = await (await canvas(W, H))
    .composite([
      { input: layer, left: W - info.width - 40, top: Math.round((H - info.height) / 2) + 20 },
    ])
    .png()
    .toBuffer();
  return base;
}

// Mobile hero: portrait, elephant sits behind and below the text
async function heroMobile() {
  const W = 900, H = 1400;
  const { data, info } = await tonedElephant({ top: 110, height: 690, width: 900 });
  const layer = await featheredLayer(data, info.width, info.height, { left: 0.05, right: 0.02, top: 0.2, bottom: 0.1 });
  return (await canvas(W, H))
    .composite([
      { input: layer, left: 0, top: 380 },
    ])
    .png()
    .toBuffer();
}

async function writeVariants(buffer, name, widths, { avif = 50, webp = 68, jpeg = 70 } = {}) {
  const results = [];
  for (const w of widths) {
    const img = sharp(buffer).resize({ width: w });
    await img.clone().avif({ quality: avif, effort: 6 }).toFile(out(`${name}-${w}.avif`));
    await img.clone().webp({ quality: webp }).toFile(out(`${name}-${w}.webp`));
    const info = await img.clone().jpeg({ quality: jpeg, mozjpeg: true, progressive: true }).toFile(out(`${name}-${w}.jpg`));
    results.push(`${name}-${w}: ${Math.round(info.size / 1024)} KB jpg`);
  }
  return results;
}

const desktop = await heroDesktop();
const mobile = await heroMobile();
console.log(...await writeVariants(desktop, 'hero', [960, 1440, 1920]));
console.log(...await writeVariants(mobile, 'hero-mobile', [480, 720, 900]));

/* About header: a heavily faded detail of the ear texture only */
{
  const ear = await sharp(src('elephant.jpg'))
    .extract({ left: 300, top: 230, width: 306, height: 420 })
    .resize({ width: 700 })
    .greyscale()
    .linear(1.25, -30)
    .blur(0.8)
    .webp({ quality: 40 })
    .toFile(out('ear-texture.webp'));
  console.log('ear-texture', Math.round(ear.size / 1024), 'KB');
}

/* ------------------------------------------------------------------ */
/* Grain: the growth-ring lines, cleaned and turned into a texture     */
/* ------------------------------------------------------------------ */
// Lines become an alpha channel (cream paper removed), filled with Umber.
// Upscaling before thresholding keeps the strokes crisp.
async function grainTexture(colour, file, rotate = 0) {
  const meta = await sharp(src('grain.jpg')).metadata();
  const scale = 1;
  let g = sharp(src('grain.jpg'))
    .resize({ width: Math.round(meta.width * scale), kernel: 'lanczos3' })
    .greyscale()
    .blur(0.5)
    .negate() // lines bright, paper dark
    .linear(3.2, -150); // drop the paper to zero, saturate the lines
  if (rotate) g = g.rotate(rotate);
  const alpha = await g.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = alpha.info;
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = colour.r;
    rgba[i * 4 + 1] = colour.g;
    rgba[i * 4 + 2] = colour.b;
    rgba[i * 4 + 3] = alpha.data[i];
  }
  const info = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ quality: 50, alphaQuality: 40 })
    .toFile(out(file));
  console.log(file, width, 'x', height, Math.round(info.size / 1024), 'KB');
}
await grainTexture(UMBER, 'grain-lines.webp');


/* ------------------------------------------------------------------ */
/* Logo, favicon and Open Graph image                                  */
/* ------------------------------------------------------------------ */
// Turn the navy-on-white wordmark into a transparent mark in any colour.
async function recolourLogo(colour, { extract } = {}) {
  let s = sharp(src('logo.png'));
  if (extract) s = s.extract(extract);
  const { data, info } = await s.greyscale().negate().linear(1.4, -40).raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    rgba[i * 4] = colour.r;
    rgba[i * 4 + 1] = colour.g;
    rgba[i * 4 + 2] = colour.b;
    rgba[i * 4 + 3] = data[i];
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const logoIvory = await recolourLogo(IVORY);
await sharp(logoIvory).resize({ width: 520 }).webp({ quality: 90 }).toFile(out('logo-ivory-520.webp'));
await sharp(logoIvory).resize({ width: 520 }).png({ compressionLevel: 9 }).toFile(out('logo-ivory-520.png'));

// Monogram: the boxed "S" only
const logoMeta = await sharp(src('logo.png')).metadata();
const mono = { left: 0, top: 0, width: Math.round(logoMeta.height * 0.93), height: logoMeta.height };
const monoNavy = await sharp(src('logo.png')).extract(mono).toBuffer();
const favBase = await sharp(monoNavy).resize(512, 512, { fit: 'contain', background: '#E8E2D4' }).flatten({ background: '#E8E2D4' }).png().toBuffer();
await sharp(favBase).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(favBase).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(favBase).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(favBase).resize(512, 512).png().toFile('public/icon-512.png');

// Open Graph: 1200x630, fogged elephant crop with the wordmark
{
  const W = 1200, H = 630;
  const crop = await sharp(desktop).extract({ left: 720, top: 90, width: 1200, height: 630 }).toBuffer();
  const fog = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="f" x1="0" x2="1">
      <stop offset="0" stop-color="#050505" stop-opacity="1"/>
      <stop offset="0.38" stop-color="#19212C" stop-opacity="0.92"/>
      <stop offset="0.75" stop-color="#19212C" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#19212C" stop-opacity="0.1"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#f)"/>
    <rect x="80" y="388" width="72" height="1" fill="#AE906B"/>
  </svg>`);
  const mark = await sharp(logoIvory).resize({ width: 560 }).toBuffer();
  await sharp(crop)
    .composite([{ input: fog }, { input: mark, left: 80, top: 260 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out('og-image.jpg'));
}
console.log('done');
