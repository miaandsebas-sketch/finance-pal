import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'

// Teal finance icon: rounded square bg + a simple $ symbol
function svg(size) {
  const r = size * 0.2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0f766e"/>
  <text
    x="50%" y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${size * 0.52}"
    font-weight="700"
    fill="white"
  >$</text>
</svg>`
}

mkdirSync('public/icons', { recursive: true })

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size))).png({ compressionLevel: 9 }).toFile(`public/icons/icon-${size}.png`)
  console.log(`icon-${size}.png`)
}
