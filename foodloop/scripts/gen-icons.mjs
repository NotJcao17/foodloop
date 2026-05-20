// Genera iconos PNG para el PWA usando canvas nativo de Node (no deps)
// Ejecutar: node scripts/gen-icons.mjs
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#2D7A4F";
  const r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Emoji
  ctx.font = `${size * 0.55}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🌿", size / 2, size / 2 + size * 0.05);

  return canvas.toBuffer("image/png");
}

writeFileSync("public/icons/icon-192.png", generateIcon(192));
writeFileSync("public/icons/icon-512.png", generateIcon(512));
console.log("Icons generated ✅");
