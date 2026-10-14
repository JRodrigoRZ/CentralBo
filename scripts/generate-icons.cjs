const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * MAXINEGO — Generador Oficial de Iconos PWA y Favicon (Fase F16)
 *
 * Identidad visual oficial aprobada:
 * - Monograma MN
 * - Degradado azul y violeta (#2563EB -> #4F46E5 -> #7C3AED)
 * - Estrella blanca central
 * - Fondo blanco / degradado opcional para contenedor de aplicación
 */

// Helper to create PNG buffer from RGBA pixels
function createPng(width, height, pixelShader) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelShader(x, y, width, height);
      const pixelStart = rowStart + 1 + x * 4;
      rawData[pixelStart] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pixelStart + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pixelStart + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[pixelStart + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Point-in-polygon helper for crisp geometric rendering
function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 512x512 Coordinate polygons
const polyM = [
  [64, 368], [64, 144], [108, 144], [154, 246], [200, 144], [244, 144],
  [244, 368], [204, 368], [204, 216], [166, 288], [142, 288], [104, 216], [104, 368]
];

const polyN = [
  [268, 368], [268, 144], [312, 144], [404, 286], [404, 144], [448, 144],
  [448, 368], [404, 368], [312, 226], [312, 368]
];

const polyStar = [
  [256, 204], [264, 244], [304, 256], [264, 268],
  [256, 308], [248, 268], [208, 256], [248, 244]
];

function distToSquircle(px, py, r = 240, n = 4) {
  const ax = Math.abs(px);
  const ay = Math.abs(py);
  return Math.pow(Math.pow(ax / r, n) + Math.pow(ay / r, n), 1 / n);
}

// Shader for MAXINEGO Logo Icon
function renderMaxiNegoShader(options = {}) {
  const { isMaskable = false, withWhiteBackground = false } = options;

  return (x, y, w, h) => {
    // 2x2 Subpixel supersampling for anti-aliasing
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    const offsets = [
      [0.25, 0.25],
      [0.75, 0.25],
      [0.25, 0.75],
      [0.75, 0.75]
    ];

    for (const [ox, oy] of offsets) {
      const sampleX = x + ox;
      const sampleY = y + oy;

      // Map to 512x512 space
      const scale = isMaskable ? 0.74 : 0.90;
      const centeredX = (sampleX / w - 0.5) / scale;
      const centeredY = (sampleY / h - 0.5) / scale;

      const p512X = (centeredX + 0.5) * 512;
      const p512Y = (centeredY + 0.5) * 512;

      // Squircle radius check (centered at 256, 256)
      const sqDist = distToSquircle(p512X - 256, p512Y - 256, 236, 4.2);

      if (sqDist > 1.05 && !isMaskable) {
        // Transparent outside squircle
        sumA += 0;
        continue;
      }

      // Linear gradient: Blue (#2563EB) to Violet (#7C3AED)
      const t = Math.max(0, Math.min(1, (sampleX + sampleY) / (w + h)));
      const gradR = 37 * (1 - t) + 124 * t;
      const gradG = 99 * (1 - t) + 58 * t;
      const gradB = 235 * (1 - t) + 237 * t;

      // Check central star first
      const inStar = pointInPolygon(p512X, p512Y, polyStar);
      if (inStar) {
        // Pure white central star
        sumR += 255;
        sumG += 255;
        sumB += 255;
        sumA += 255;
        continue;
      }

      // Check M or N
      const inM = pointInPolygon(p512X, p512Y, polyM);
      const inN = pointInPolygon(p512X, p512Y, polyN);

      if (withWhiteBackground) {
        // White background icon variant
        if (inM || inN) {
          sumR += gradR;
          sumG += gradG;
          sumB += gradB;
          sumA += 255;
        } else {
          // White squircle background
          sumR += 255;
          sumG += 255;
          sumB += 255;
          sumA += 255;
        }
      } else {
        // Gradient background icon variant (Standard PWA badge)
        if (inM || inN) {
          // White monogram letters
          sumR += 255;
          sumG += 255;
          sumB += 255;
          sumA += 255;
        } else {
          // Degradado azul y violeta
          sumR += gradR;
          sumG += gradG;
          sumB += gradB;
          sumA += 255;
        }
      }
    }

    return [sumR / 4, sumG / 4, sumB / 4, sumA / 4];
  };
}

// Generate the official SVG file
function generateSvgContent() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Degradado oficial azul y violeta de MAXINEGO -->
    <linearGradient id="maxinego-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="50%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>

    <!-- Resplandor sutil para la estrella central -->
    <filter id="star-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#FFFFFF" flood-opacity="0.9" />
    </filter>

    <!-- Sombra suave para contenedor -->
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#1E1B4B" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Contenedor / Fondo con esquinas redondeadas estilo squircle -->
  <rect width="512" height="512" rx="116" fill="url(#maxinego-gradient)" filter="url(#card-shadow)" />
  
  <!-- Borde interior sutil -->
  <rect x="12" y="12" width="488" height="488" rx="104" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="3" />

  <!-- Monograma MN oficial -->
  <g fill="#FFFFFF">
    <!-- Letra M (Izquierda) -->
    <path d="M 64 368 L 64 144 L 108 144 L 154 246 L 200 144 L 244 144 L 244 368 L 204 368 L 204 216 L 166 288 L 142 288 L 104 216 L 104 368 Z" />

    <!-- Letra N (Derecha) -->
    <path d="M 268 368 L 268 144 L 312 144 L 404 286 L 404 144 L 448 144 L 448 368 L 404 368 L 312 226 L 312 368 Z" />
  </g>

  <!-- Estrella blanca central en el corazón del monograma MN -->
  <g>
    <path d="M 256 204 L 264 244 L 304 256 L 264 268 L 256 308 L 248 268 L 208 256 L 248 244 Z" fill="#FFFFFF" filter="url(#star-glow)" />
    <circle cx="256" cy="256" r="4.5" fill="#FFFFFF" />
  </g>
</svg>
`;
}

// Generate all icons into /public
function buildAllIcons() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generando iconos oficiales de MAXINEGO...');

  // 1. icon.svg
  const svg = generateSvgContent();
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg, 'utf-8');
  console.log('✓ /public/icon.svg');

  // 2. 192x192 icons (icon-192.png y pwa-192x192.png)
  const icon192 = createPng(192, 192, renderMaxiNegoShader({ isMaskable: false }));
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
  console.log('✓ /public/icon-192.png & /public/pwa-192x192.png');

  // 3. 512x512 icons (icon-512.png y pwa-512x512.png)
  const icon512 = createPng(512, 512, renderMaxiNegoShader({ isMaskable: false }));
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
  console.log('✓ /public/icon-512.png & /public/pwa-512x512.png');

  // 4. 512x512 Maskable icons (icon-maskable-512.png y pwa-maskable-512x512.png)
  const iconMaskable = createPng(512, 512, renderMaxiNegoShader({ isMaskable: true }));
  fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), iconMaskable);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);
  console.log('✓ /public/icon-maskable-512.png & /public/pwa-maskable-512x512.png');

  // 5. Apple Touch Icon (180x180)
  const appleTouchIcon = createPng(180, 180, renderMaxiNegoShader({ isMaskable: false }));
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
  console.log('✓ /public/apple-touch-icon.png');

  // 6. Favicon (32x32)
  const favicon32 = createPng(32, 32, renderMaxiNegoShader({ isMaskable: false }));
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
  console.log('✓ /public/favicon.ico');

  console.log('Todos los iconos de MAXINEGO fueron generados exitosamente.');
}

buildAllIcons();
