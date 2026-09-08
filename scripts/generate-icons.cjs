const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to create PNG buffer from RGBA pixels
function createPng(width, height, pixelShader) {
  // 4 bytes per pixel + 1 filter byte per row
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

  // Helper for PNG chunks
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation for PNG
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

// Shader for CentralBo Logo
function renderLogo(isMaskable = false) {
  return (x, y, w, h) => {
    // Normalized coordinates (-1 to 1)
    const nx = (x / w) * 2 - 1;
    const ny = (y / h) * 2 - 1;
    const dist = Math.sqrt(nx * nx + ny * ny);

    // Background gradient: dark slate (#0f172a to #1e293b)
    const bgR = 15 + (y / h) * 15;
    const bgG = 23 + (y / h) * 18;
    const bgB = 42 + (y / h) * 25;

    // Scale down for maskable safe zone (80%)
    const scale = isMaskable ? 0.72 : 0.88;
    const sx = nx / scale;
    const sy = ny / scale;
    const sdist = Math.sqrt(sx * sx + sy * sy);

    // Rounded shield / hexagon / rounded box container
    const boxRadius = 0.82;
    const cornerSmooth = 0.08;
    const absX = Math.abs(sx);
    const absY = Math.abs(sy);
    const inBox = Math.max(absX, absY);

    // Central circular badge / shield
    if (sdist < 0.8) {
      // Gradient inside central emblem: Indigo to Cyan/Emerald
      const t = (sy + 0.8) / 1.6; // 0 at top, 1 at bottom
      let r = 79 * (1 - t) + 16 * t;
      let g = 70 * (1 - t) + 185 * t;
      let b = 229 * (1 - t) + 129 * t;

      // Draw stylized "C" and "B" or Hub core
      // Outer ring highlight
      if (sdist > 0.72) {
        return [r + 40, g + 40, b + 40, 255];
      }

      // Stylized central vertical nodes (representing marketplace verticals)
      // Node 1: Left (Fashion), Center (Hub), Right (Restaurant), Bottom (Services)
      const centerDist = Math.sqrt(sx * sx + sy * sy);

      // Central core node
      if (centerDist < 0.22) {
        return [255, 255, 255, 255];
      }

      // Connecting spokes
      const spokeThick = 0.06;
      const isHSpoke = Math.abs(sy) < spokeThick && Math.abs(sx) < 0.52;
      const isVSpoke = Math.abs(sx) < spokeThick && Math.abs(sy) < 0.52;

      if (isHSpoke || isVSpoke) {
        return [255, 255, 255, 230];
      }

      // Satellite vertical nodes
      const nodeR = 0.12;
      const dTop = Math.hypot(sx, sy - 0.45);
      const dBottom = Math.hypot(sx, sy + 0.45);
      const dLeft = Math.hypot(sx + 0.45, sy);
      const dRight = Math.hypot(sx - 0.45, sy);

      if (dTop < nodeR || dBottom < nodeR || dLeft < nodeR || dRight < nodeR) {
        return [255, 255, 255, 255];
      }

      return [r, g, b, 255];
    }

    // Outer subtle border
    if (sdist >= 0.8 && sdist < 0.84) {
      return [99, 102, 241, 160]; // Indigo-500 edge
    }

    return [bgR, bgG, bgB, 255];
  };
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons for CentralBo...');

const icon192 = createPng(192, 192, renderLogo(false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPng(512, 512, renderLogo(false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPng(512, 512, renderLogo(true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleTouchIcon = createPng(180, 180, renderLogo(false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);

// Simple favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon192);

console.log('PWA icons successfully created in /public');
