import { hexToRgb } from './utils.js';

// ============================================================================
// ENVIRONMENT RENDERING
// Substrate, background, caustics, and light ray effects
// ============================================================================

export function drawSubstrate(ctx, sub, w, h, subH) {
  if (!sub) return;
  const y = h - subH;

  // Bare bottom — just a flat dark floor line
  if (sub.id === "bare") {
    ctx.fillStyle = sub.darkColor;
    ctx.fillRect(0, y, w, subH);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    return;
  }

  const pRgb = hexToRgb(sub.color);
  const aRgb = hexToRgb(sub.accent);
  const dRgb = hexToRgb(sub.darkColor);

  // Shared wave function for consistent top edge across layers
  const wave = (x2) => Math.sin(x2 * 0.12) * 2.5 + Math.sin(x2 * 0.05 + 1) * 1.5 + Math.sin(x2 * 0.22) * 0.8;

  // --- Layer 1: Deep base fill ---
  const baseG = ctx.createLinearGradient(0, y, 0, h);
  baseG.addColorStop(0, sub.accent);
  baseG.addColorStop(0.25, sub.color);
  baseG.addColorStop(0.7, sub.darkColor);
  baseG.addColorStop(1, `rgba(${Math.max(0,dRgb.r-20)},${Math.max(0,dRgb.g-20)},${Math.max(0,dRgb.b-20)},1)`);
  ctx.fillStyle = baseG;
  // Undulating top edge
  ctx.beginPath(); ctx.moveTo(0, h);
  ctx.lineTo(0, y + 2);
  for (let x2 = 0; x2 <= w; x2 += 4) ctx.lineTo(x2, y + wave(x2));
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

  // --- Layer 2: Mid-tone texture layer ---
  ctx.save(); ctx.globalAlpha = 0.3;
  ctx.beginPath(); ctx.moveTo(0, h);
  ctx.lineTo(0, y + subH * 0.3);
  for (let x2 = 0; x2 <= w; x2 += 6) {
    const w2 = Math.sin(x2 * 0.09 + 2) * 2 + Math.sin(x2 * 0.18) * 1;
    ctx.lineTo(x2, y + subH * 0.3 + w2);
  }
  ctx.lineTo(w, h); ctx.closePath();
  ctx.fillStyle = sub.darkColor; ctx.fill();
  ctx.restore();

  // --- Layer 3: Surface highlight strip ---
  ctx.save(); ctx.globalAlpha = 0.15;
  ctx.beginPath();
  for (let x2 = 0; x2 <= w; x2 += 4) {
    if (x2 === 0) ctx.moveTo(x2, y + wave(x2));
    else ctx.lineTo(x2, y + wave(x2));
  }
  for (let x2 = w; x2 >= 0; x2 -= 4) ctx.lineTo(x2, y + wave(x2) + 3);
  ctx.closePath(); ctx.fillStyle = "#FFF"; ctx.fill();
  ctx.restore();

  // --- LIGHT-FACING HIGHLIGHTS ---
  // Particles near the top-center of the substrate (where light hits strongest)
  // get a radial brightness boost. Simulates overhead light pooling on the bed.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const lightG = ctx.createRadialGradient(w * 0.5, y, 0, w * 0.5, y, w * 0.45);
  lightG.addColorStop(0, `rgba(${Math.min(255,aRgb.r+60)},${Math.min(255,aRgb.g+50)},${Math.min(255,aRgb.b+40)},0.07)`);
  lightG.addColorStop(0.5, `rgba(${Math.min(255,aRgb.r+30)},${Math.min(255,aRgb.g+25)},${Math.min(255,aRgb.b+20)},0.03)`);
  lightG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lightG;
  ctx.fillRect(0, y, w, subH * 0.5);
  ctx.restore();

  // --- Particles / grains (with light-distance brightness) ---
  const lightCenterX = w * 0.5;
  const numParticles = Math.round(w * 0.4);
  for (let i = 0; i < numParticles; i++) {
    const px = (i * 7.3 + 13) % w;
    const depth = ((i * 11.7) % (subH - 3));
    const py = y + 3 + depth;
    const depthFactor = depth / subH; // 0=top, 1=bottom
    // Light distance: particles closer to center-top are brighter
    const lightDist = Math.abs(px - lightCenterX) / (w * 0.5);
    const lightBoost = (1 - lightDist * 0.3) * (1 - depthFactor * 0.5);
    const shade = (0.55 + (1 - depthFactor) * 0.35 + ((i * 37 % 100) / 100) * 0.15) * (0.8 + lightBoost * 0.3);
    const pSize = sub.particleSize * (0.3 + (i * 13 % 10) / 10 * 0.7) * (1 - depthFactor * 0.3);
    ctx.beginPath(); ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.round(Math.min(255, pRgb.r * shade))},${Math.round(Math.min(255, pRgb.g * shade))},${Math.round(Math.min(255, pRgb.b * shade))},${0.35 + (1 - depthFactor) * 0.25})`;
    ctx.fill();
  }

  // --- Scattered larger pebbles on surface ---
  for (let i = 0; i < w * 0.04; i++) {
    const px = (i * 37.7 + 7) % w;
    const py = y + wave(px) + 1;
    const pSize = sub.particleSize * (1.2 + (i * 19 % 10) / 10);
    const shade = 0.75 + ((i * 23 % 100) / 100) * 0.25;
    ctx.beginPath(); ctx.ellipse(px, py, pSize, pSize * 0.65, (i * 0.7) % Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.round(aRgb.r * shade)},${Math.round(aRgb.g * shade)},${Math.round(aRgb.b * shade)},0.5)`;
    ctx.fill();
    // Tiny highlight on top of each pebble
    ctx.beginPath(); ctx.ellipse(px - pSize * 0.2, py - pSize * 0.2, pSize * 0.4, pSize * 0.2, (i * 0.7) % Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,0.06)`;
    ctx.fill();
  }

  // --- FOREGROUND PARTICLES (depth illusion) ---
  // A few oversized, higher-opacity particles along the very front (bottom edge)
  // of the substrate. These are "closer to camera" so they appear larger.
  const fgCount = Math.round(w * 0.02) + 3;
  for (let i = 0; i < fgCount; i++) {
    const px = (i * 53.3 + 19) % w;
    const py = h - 2 - (i * 7.1 % 4);
    const pSize = sub.particleSize * (1.8 + (i * 11 % 8) / 8 * 1.2);
    const shade = 0.7 + ((i * 29 % 100) / 100) * 0.3;
    ctx.beginPath(); ctx.ellipse(px, py, pSize, pSize * 0.55, (i * 1.1) % Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.round(pRgb.r * shade)},${Math.round(pRgb.g * shade)},${Math.round(pRgb.b * shade)},0.6)`;
    ctx.fill();
    // Shadow under foreground particle
    ctx.beginPath(); ctx.ellipse(px + 0.5, py + pSize * 0.3, pSize * 0.7, pSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fill();
  }

  // --- SCATTERED DEBRIS (lived-in look) ---
  // Tiny leaf fragments, wood chips, and organic bits scattered on the surface.
  // These make the substrate look like a real aquarium bed, not a clean render.
  const debrisCount = Math.round(w * 0.025);
  for (let i = 0; i < debrisCount; i++) {
    const dx = (i * 67.3 + 41) % w;
    const dy = y + wave(dx) + 0.5 + (i * 3.7 % 3);
    const hash = (i * 131.7 % 1000) / 1000; // 0-1

    if (hash < 0.4) {
      // Tiny leaf fragment (green-brown speck)
      ctx.beginPath(); ctx.ellipse(dx, dy, 1.5 + hash * 1.5, 0.6 + hash * 0.5, (i * 2.3) % Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${80 + Math.round(hash * 40)},${90 + Math.round(hash * 30)},${50 + Math.round(hash * 20)},${0.2 + hash * 0.15})`;
      ctx.fill();
    } else if (hash < 0.7) {
      // Wood chip (brown)
      ctx.save(); ctx.translate(dx, dy); ctx.rotate((i * 1.7) % Math.PI);
      ctx.beginPath(); ctx.rect(-1.5, -0.5, 3, 1);
      ctx.fillStyle = `rgba(${100 + Math.round(hash * 50)},${70 + Math.round(hash * 30)},${40 + Math.round(hash * 20)},${0.15 + hash * 0.12})`;
      ctx.fill(); ctx.restore();
    } else {
      // Shell fragment / mineral (pale speck)
      ctx.beginPath(); ctx.arc(dx, dy, 0.5 + hash * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${200 + Math.round(hash * 40)},${190 + Math.round(hash * 30)},${170 + Math.round(hash * 20)},${0.12 + hash * 0.1})`;
      ctx.fill();
    }
  }

  // --- Subtle depth shadow at top edge ---
  ctx.save();
  const shadowG = ctx.createLinearGradient(0, y - 2, 0, y + 6);
  shadowG.addColorStop(0, "rgba(0,0,0,0)");
  shadowG.addColorStop(0.5, "rgba(0,0,0,0.08)");
  shadowG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowG;
  ctx.fillRect(0, y - 2, w, 8);
  ctx.restore();

  // --- Wet sheen along waterline ---
  // A narrow bright strip right at the substrate surface where water meets gravel.
  ctx.save(); ctx.globalAlpha = 0.06;
  ctx.beginPath();
  for (let x2 = 0; x2 <= w; x2 += 3) {
    const wy = y + wave(x2);
    if (x2 === 0) ctx.moveTo(x2, wy - 1);
    else ctx.lineTo(x2, wy - 1);
  }
  ctx.strokeStyle = "rgba(180,220,255,1)";
  ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

// Draw substrate mound around a decoration base for natural embedding
export function drawSubstrateMound(ctx, sub, x, baseY, tankH, scale) {
  if (!sub || sub.id === "bare") return;
  const aRgb = hexToRgb(sub.accent);
  const moundW = 22 * (scale || 1);
  const moundH = 5 * (scale || 1);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - moundW, baseY);
  ctx.bezierCurveTo(x - moundW * 0.5, baseY - moundH * 1.3, x + moundW * 0.5, baseY - moundH * 1.3, x + moundW, baseY);
  ctx.closePath();
  const mG = ctx.createRadialGradient(x, baseY - moundH * 0.4, 0, x, baseY, moundW);
  mG.addColorStop(0, sub.accent);
  mG.addColorStop(0.5, sub.color);
  mG.addColorStop(1, sub.darkColor);
  ctx.fillStyle = mG;
  ctx.fill();
  ctx.restore();
}

export function drawBackground(ctx, bg, w, h, brightness) {
  if (!bg || !bg.colors) return;
  const br = brightness || 0.5;

  const applyBr = (hex) => {
    const rgb = hexToRgb(hex);
    const m = 0.4 + br * 1.2;
    return `rgb(${Math.min(255, Math.round(rgb.r * m))},${Math.min(255, Math.round(rgb.g * m))},${Math.min(255, Math.round(rgb.b * m))})`;
  };

  // Center radial gradient
  if (bg.gradient === "center") {
    const grd = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
    grd.addColorStop(0, applyBr(bg.colors[0]));
    grd.addColorStop(1, applyBr(bg.colors[1]));
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Linear top-to-bottom gradient (2 or 3 colors)
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    bg.colors.forEach((c, i) => {
      grd.addColorStop(i / Math.max(1, bg.colors.length - 1), applyBr(c));
    });
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  // Accent spots/haze
  if (bg.accent) {
    const a = bg.accent;
    if (a.spots) {
      ctx.save(); ctx.globalAlpha = 0.04 * br;
      for (let i = 0; i < 14; i++) {
        const sx = ((i * 47 + 13) % w);
        const sy = ((i * 31 + 7) % (h * 0.85));
        const sr = 12 + (i * 23 % 35);
        const sG = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        sG.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.6)`);
        sG.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
        ctx.fillStyle = sG;
        ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      }
      ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha = 0.06 * br;
      const hG = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.6);
      hG.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.5)`);
      hG.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.fillStyle = hG;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}

export function drawCaustics(ctx, w, h, time, light) {
  if (!light || light.intensity === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // --- Caustic patches: organic, variable-sized, concentrated near surface ---
  // Instead of a fixed 40px grid, we use varying cell sizes and 3 shape variants.
  // Patches are brighter/sharper near the top and fade/spread as they go deeper.

  const baseAlpha = light.strength * 0.65;
  const lr = light.r, lg = light.g, lb = light.b;

  // Use two overlapping passes at different scales for richness
  const passes = [
    { cellMin: 25, cellMax: 50, count: Math.ceil(w / 35) * Math.ceil(h * 0.7 / 35), seed: 0 },
    { cellMin: 40, cellMax: 70, count: Math.ceil(w / 55) * Math.ceil(h * 0.6 / 55), seed: 137 },
  ];

  for (const pass of passes) {
    const { cellMin, cellMax, count, seed } = pass;
    for (let i = 0; i < count; i++) {
      // Pseudo-random position seeded by index
      const hash1 = Math.sin(i * 127.1 + seed) * 43758.5453;
      const hash2 = Math.sin(i * 269.5 + seed + 31) * 43758.5453;
      const hash3 = Math.sin(i * 419.2 + seed + 73) * 43758.5453;

      const px = ((hash1 % 1 + 1) % 1) * (w + 60) - 30;
      const py = ((hash2 % 1 + 1) % 1) * (h * 0.75);
      const cellSize = cellMin + ((hash3 % 1 + 1) % 1) * (cellMax - cellMin);

      // Depth fade: caustics are strong near surface, weak deep
      const depthT = py / (h * 0.75); // 0 = surface, 1 = deepest
      const depthFade = 1 - depthT * 0.7;
      // Sharpness: tighter shapes near surface, blobbier deeper
      const spread = 1 + depthT * 0.5;

      // Animated displacement
      const dx = Math.sin(px * 0.018 + time * 0.7 + i * 0.1) * 12 + Math.cos(py * 0.025 + time * 0.5) * 8;
      const dy = Math.cos(px * 0.02 + time * 0.6 - i * 0.05) * 5;

      // Brightness oscillation — caustics flicker
      const bright = (Math.sin(px * 0.035 + py * 0.028 + time * 1.1 + i * 0.3) + 1) * 0.5;
      if (bright < 0.4) continue; // skip dim patches

      const cx = px + dx;
      const cy = py + dy;
      const alpha = baseAlpha * bright * depthFade * 0.35;
      if (alpha < 0.005) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${lr},${lg},${lb})`;

      // Shape variant based on hash
      const shapeType = i % 4;
      const sz = cellSize * spread * 0.5;

      ctx.beginPath();
      if (shapeType === 0) {
        // Amoeba blob — wobbly circle
        for (let a = 0; a <= Math.PI * 2; a += 0.3) {
          const wobble = Math.sin(a * 3 + time * 0.8 + i) * sz * 0.2
                       + Math.sin(a * 5 - time * 0.5 + i * 2) * sz * 0.1;
          const rx = cx + Math.cos(a) * (sz + wobble);
          const ry = cy + Math.sin(a) * (sz * 0.7 + wobble * 0.6);
          if (a === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
        }
        ctx.closePath(); ctx.fill();
      } else if (shapeType === 1) {
        // Elongated crescent
        ctx.ellipse(cx, cy, sz * 1.2, sz * 0.4, Math.sin(time * 0.3 + i) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (shapeType === 2) {
        // Diamond/rhombus shape
        ctx.moveTo(cx, cy - sz * 0.6);
        ctx.bezierCurveTo(cx + sz * 0.8, cy - sz * 0.1, cx + sz * 0.8, cy + sz * 0.1, cx, cy + sz * 0.6);
        ctx.bezierCurveTo(cx - sz * 0.8, cy + sz * 0.1, cx - sz * 0.8, cy - sz * 0.1, cx, cy - sz * 0.6);
        ctx.fill();
      } else {
        // Classic bezier patch (improved from v1)
        ctx.moveTo(cx - sz * 0.4, cy - sz * 0.3);
        ctx.bezierCurveTo(cx + sz * 0.2, cy - sz * 0.5, cx + sz * 0.6, cy - sz * 0.1, cx + sz * 0.5, cy + sz * 0.2);
        ctx.bezierCurveTo(cx + sz * 0.3, cy + sz * 0.5, cx - sz * 0.1, cy + sz * 0.4, cx - sz * 0.3, cy + sz * 0.2);
        ctx.bezierCurveTo(cx - sz * 0.6, cy, cx - sz * 0.5, cy - sz * 0.2, cx - sz * 0.4, cy - sz * 0.3);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

export function drawLightRays(ctx, w, h, time, light) {
  if (!light || light.intensity === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Ray count varies by light intensity: basic=3, planted=5, RGB=7
  const rayCount = light.intensity <= 1 ? 3 : light.intensity === 2 ? 5 : 7;
  const baseAlpha = light.strength * 0.5;
  const lr = light.r, lg = light.g, lb = light.b;

  for (let i = 0; i < rayCount; i++) {
    // Seeded position — uneven spacing with drift
    const hash = Math.sin(i * 73.17 + 31) * 43758.5453;
    const baseX = ((hash % 1 + 1) % 1) * w;
    const sway = Math.sin(time * 0.25 + i * 1.7) * 25 + Math.cos(time * 0.15 + i * 2.3) * 15;
    const rx = baseX + sway;

    // Seeded width — some rays narrow, some wide
    const hashW = Math.sin(i * 157.3 + 47) * 43758.5453;
    const widthMult = 0.5 + ((hashW % 1 + 1) % 1) * 1.0; // 0.5 to 1.5
    const topW = (12 + Math.sin(time * 0.4 + i * 0.8) * 5) * widthMult;
    const botW = topW * (2.5 + widthMult * 0.5); // wider at bottom

    // Seeded brightness — some rays are bold, some faint
    const hashB = Math.sin(i * 211.7 + 19) * 43758.5453;
    const brightMult = 0.4 + ((hashB % 1 + 1) % 1) * 0.6;
    const rayAlpha = baseAlpha * brightMult;

    // Depth: rays extend 60-85% of tank height
    const rayDepth = h * (0.6 + ((hash % 1 + 1) % 1) * 0.25);

    // Draw multiple overlapping passes for soft edges (poor man's blur)
    for (let pass = 0; pass < 3; pass++) {
      const spread = pass * topW * 0.4; // each pass wider
      const passAlpha = rayAlpha * (1 - pass * 0.35);
      if (passAlpha < 0.005) continue;

      ctx.globalAlpha = passAlpha;
      const g = ctx.createLinearGradient(rx, 0, rx, rayDepth);
      g.addColorStop(0, `rgba(${lr},${lg},${lb},0.25)`);
      g.addColorStop(0.3, `rgba(${lr},${lg},${lb},0.12)`);
      g.addColorStop(0.7, `rgba(${lr},${lg},${lb},0.04)`);
      g.addColorStop(1, `rgba(${lr},${lg},${lb},0)`);
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.moveTo(rx - topW - spread, 0);
      ctx.lineTo(rx - botW - spread * 1.5, rayDepth);
      ctx.lineTo(rx + botW + spread * 1.5, rayDepth);
      ctx.lineTo(rx + topW + spread, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}
