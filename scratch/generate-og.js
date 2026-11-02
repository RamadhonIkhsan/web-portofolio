const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#070707" />
        <stop offset="50%" stop-color="#0a0a0a" />
        <stop offset="100%" stop-color="#0e0e0e" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" />
      </pattern>
      <linearGradient id="limeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a6ff2e" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Corner Accents -->
    <path d="M 40 80 L 40 40 L 80 40" fill="none" stroke="#a6ff2e" stroke-width="2" />
    <path d="M 1120 40 L 1160 40 L 1160 80" fill="none" stroke="#a6ff2e" stroke-width="2" />
    <path d="M 40 550 L 40 590 L 80 590" fill="none" stroke="#a6ff2e" stroke-width="2" />
    <path d="M 1120 590 L 1160 590 L 1160 550" fill="none" stroke="#a6ff2e" stroke-width="2" />

    <!-- Top Telemetry Header -->
    <text x="80" y="90" font-family="monospace" font-size="14" fill="#a6ff2e" letter-spacing="4">
      [ SYS.RUN // RIP.PORTFOLIO.V2.4 ]
    </text>
    <text x="960" y="90" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.6)" letter-spacing="3">
      LAT -06.2088 / +106.8456
    </text>
    <line x1="80" y1="110" x2="1120" y2="110" stroke="rgba(255,255,255,0.12)" stroke-width="1" />

    <!-- Role Pill -->
    <rect x="80" y="150" width="310" height="36" rx="18" fill="rgba(166, 255, 46, 0.12)" stroke="rgba(166, 255, 46, 0.4)" stroke-width="1" />
    <circle cx="102" cy="168" r="4" fill="#a6ff2e" />
    <text x="118" y="173" font-family="monospace" font-size="13" font-weight="bold" fill="#a6ff2e" letter-spacing="2">
      FRONT-END WEB DEVELOPER
    </text>

    <!-- Main Title -->
    <text x="80" y="270" font-family="sans-serif" font-weight="900" font-size="88" fill="#ffffff" letter-spacing="-2">
      RAMADHON
    </text>
    <text x="80" y="360" font-family="sans-serif" font-weight="900" font-size="88" fill="#a6ff2e" letter-spacing="-2">
      IKHSAN
    </text>

    <!-- Tagline -->
    <text x="80" y="420" font-family="monospace" font-size="18" fill="rgba(255,255,255,0.75)" letter-spacing="1">
      Creative Technologist &amp; Front-End Architect
    </text>
    <text x="80" y="450" font-family="monospace" font-size="15" fill="rgba(255,255,255,0.5)" letter-spacing="1">
      Kinetic Web Architectures · Scroll-Driven Systems · High-Performance Runtimes
    </text>

    <!-- Bottom Telemetry Bar -->
    <line x1="80" y1="520" x2="1120" y2="520" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
    <text x="80" y="555" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.6)" letter-spacing="2">
      STACK: NEXT.JS / REACT / TYPESCRIPT / GSAP / LENIS / TAILWIND
    </text>
    <text x="960" y="555" font-family="monospace" font-size="13" fill="#a6ff2e" letter-spacing="2">
      STATUS: DEPLOYED ↗
    </text>
  </svg>
  `;

  const outputPath = path.join(__dirname, '..', 'public', 'og-image.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(outputPath);

  console.log(`Successfully generated OG image at: ${outputPath}`);
}

generateOgImage().catch(console.error);
