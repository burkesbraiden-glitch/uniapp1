const fs = require('fs');
const zlib = require('zlib');

const icons = {
  'tab-home': createSimpleIcon('#999999'),
  'tab-home-active': createSimpleIcon('#667eea'),
  'tab-publish': createSimpleIcon('#999999'),
  'tab-publish-active': createSimpleIcon('#667eea'),
  'tab-my': createSimpleIcon('#999999'),
  'tab-my-active': createSimpleIcon('#667eea'),
};

function createSimpleIcon(color) {
  const [r, g, b] = hexToRgb(color);
  const size = 48;
  const rawData = [];
  
  for (let y = 0; y < size; y++) {
    rawData.push(0);
    for (let x = 0; x < size; x++) {
      if (y > 20 && y < 35 && x > 12 && x < 36) {
        rawData.push(r, g, b, 255);
      } else if ((x > 15 && x < 20 && y > 10 && y < 38) || (x > 28 && x < 33 && y > 10 && y < 38)) {
        rawData.push(r, g, b, 255);
      } else {
        rawData.push(255, 255, 255, 0);
      }
    }
  }
  
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  return buildPng(size, size, compressed);
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function buildPng(width, height, compressedData) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = createChunk('IHDR', Buffer.from([
    (width >> 24) & 0xff, (width >> 16) & 0xff, (width >> 8) & 0xff, width & 0xff,
    (height >> 24) & 0xff, (height >> 16) & 0xff, (height >> 8) & 0xff, height & 0xff,
    8, 6, 0, 0, 0
  ]));
  
  const idat = createChunk('IDAT', compressedData);
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

for (const [name, buffer] of Object.entries(icons)) {
  fs.writeFileSync(`src/static/${name}.png`, buffer);
  console.log(`Created ${name}.png`);
}

console.log('All icons generated!');