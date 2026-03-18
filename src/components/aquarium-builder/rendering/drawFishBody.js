import { hexToRgb } from './utils.js';

// ============================================================================
// FISH BODY RENDERING — v2
//
// Upgrades over v1:
// - Scale pattern overlay on all fish bodies (crescent grid, "overlay" blend)
// - Iridescent shimmer band that moves with light angle (neons, cardinals, rainbows)
// - Translucent fins with visible fin rays radiating from base
// - Per-species body patterns: zebra danio stripes, corydoras spots, boesemani split
// - Drop shadow beneath each fish for depth
// - Rim light along the dorsal edge for 3D pop
// - Belly highlight gradient for roundness
// ============================================================================

export function drawFishBody(ctx, f, time) {
  const s = f.pixelSize;
  // Use smooth visual direction if available (from waypoint navigation),
  // otherwise fall back to velocity-based direction
  const dir = f._visualDir !== undefined ? f._visualDir : (f.vx >= 0 ? 1 : -1);
  const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
  // Tail amplitude responds to thrust (burst-glide): stronger during bursts
  const thrustBoost = f._thrust !== undefined ? f._thrust : 0.5;
  const tailAmp = 0.18 + speed * 0.8 + thrustBoost * 0.35;
  const tailSwing = Math.sin(f.tailPhase) * tailAmp;
  // Secondary wave — body S-curve flex, delayed from tail
  const bodyFlex = Math.sin(f.tailPhase - 0.8) * tailAmp * 0.3;
  const breathe = Math.sin(time * 2 + f.wobble) * 0.025;
  const rgb = hexToRgb(f.data.color);
  const accentRgb = hexToRgb(f.data.accentColor);

  // ---- DROP SHADOW (drawn before transform so it stays below) ----
  if (f.data.bodyShape !== "snail" && f.data.bodyShape !== "shrimp" && f.data.bodyShape !== "lobster") {
    ctx.save();
    ctx.globalAlpha = 0.12;
    const shadowSize = s * (f.data.bodyShape === "tall" || f.data.bodyShape === "disc" ? 0.5 : 0.6);
    ctx.beginPath();
    ctx.ellipse(f.x, f.y + s * 0.35, shadowSize, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,10,30,1)";
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(f.x, f.y);

  // Pitch rotation — fish only tilt during strong vertical movement like
  // darting to surface, diving, or fleeing. Normal swimming is always horizontal.
  // ~90% of the time fish should be at 0° rotation.
  if (f.data.bodyShape !== "snail" && f.data.bodyShape !== "shrimp" && f.data.bodyShape !== "lobster") {
    if (f._pitch === undefined) f._pitch = 0;

    const absVy = Math.abs(f.vy);
    const absVx = Math.abs(f.vx) + 0.001;
    const verticalRatio = absVy / (absVx + absVy + 0.001);

    // Very high bar — only significant vertical bursts trigger tilt
    // Normal schooling drift, wobble, and level-preference pulls won't reach this
    const vyThreshold = 0.025; // was 0.008 — 3x higher
    const ratioThreshold = 0.45; // was 0.25 — vy must dominate movement

    if (absVy > vyThreshold && verticalRatio > ratioThreshold) {
      // Strong vertical movement — allow modest pitch
      const rawPitch = Math.atan2(f.vy * dir, absVx);
      const maxPitch = 0.4; // ~23 degrees max — subtle tilt
      const targetPitch = Math.max(-maxPitch, Math.min(maxPitch, rawPitch));
      f._pitch += (targetPitch - f._pitch) * 0.06; // slow entry into tilt
    } else {
      // Return to horizontal quickly
      f._pitch *= 0.88; // fast decay back to flat
      if (Math.abs(f._pitch) < 0.008) f._pitch = 0;
    }

    if (Math.abs(f._pitch) > 0.008) {
      ctx.rotate(f._pitch);
    }
  }

  ctx.scale(dir, 1);

  // ==================================================================
  // SHRIMP
  // ==================================================================
  if (f.data.bodyShape === "shrimp") {
    ctx.beginPath();
    ctx.moveTo(s * 0.5, 0);
    ctx.quadraticCurveTo(s * 0.3, -s * 0.4, -s * 0.2, -s * 0.3);
    ctx.quadraticCurveTo(-s * 0.6, -s * 0.1, -s * 0.5, s * 0.2);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.4, s * 0.3, s * 0.15);
    ctx.closePath();
    const shrG = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.2);
    shrG.addColorStop(0, `rgba(${Math.min(255,rgb.r+30)},${Math.min(255,rgb.g+30)},${Math.min(255,rgb.b+30)},1)`);
    shrG.addColorStop(0.5, f.data.color);
    shrG.addColorStop(1, `rgba(${Math.max(0,rgb.r-20)},${Math.max(0,rgb.g-20)},${Math.max(0,rgb.b-20)},1)`);
    ctx.fillStyle = shrG; ctx.fill();
    // Segment lines
    ctx.strokeStyle = `rgba(0,0,0,0.1)`; ctx.lineWidth = 0.4;
    for (let i = 0; i < 5; i++) {
      const sx = -s * 0.35 + i * s * 0.15;
      ctx.beginPath(); ctx.moveTo(sx, -s * 0.2); ctx.quadraticCurveTo(sx + s * 0.02, 0, sx, s * 0.15); ctx.stroke();
    }
    // Legs
    for (let i = 0; i < 4; i++) {
      const lx = -s * 0.2 + i * s * 0.15;
      ctx.beginPath(); ctx.moveTo(lx, s * 0.1); ctx.lineTo(lx + Math.sin(time * 12 + i) * 2, s * 0.35);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`; ctx.lineWidth = 0.8; ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.1);
    ctx.quadraticCurveTo(s * 0.8, -s * 0.5 + Math.sin(time * 5) * 3, s * 1, -s * 0.4);
    ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(s * 0.4, -s * 0.15, s * 0.06, 0, Math.PI * 2); ctx.fillStyle = "#111"; ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.41, -s * 0.16, s * 0.02, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fill();
    ctx.restore(); return;
  }

  // ==================================================================
  // SNAIL
  // ==================================================================
  if (f.data.bodyShape === "snail") {
    const shellG = ctx.createRadialGradient(s * 0.05, -s * 0.15, 0, 0, -s * 0.1, s * 0.4);
    shellG.addColorStop(0, `rgba(${Math.min(255,rgb.r+40)},${Math.min(255,rgb.g+40)},${Math.min(255,rgb.b+40)},1)`);
    shellG.addColorStop(0.6, f.data.color);
    shellG.addColorStop(1, `rgba(${Math.max(0,rgb.r-30)},${Math.max(0,rgb.g-30)},${Math.max(0,rgb.b-30)},1)`);
    ctx.beginPath(); ctx.arc(0, -s * 0.1, s * 0.4, 0, Math.PI * 2); ctx.fillStyle = shellG; ctx.fill();
    ctx.beginPath(); ctx.arc(-s * 0.05, -s * 0.15, s * 0.25, 0, Math.PI * 2); ctx.fillStyle = f.data.accentColor; ctx.fill();
    ctx.beginPath(); ctx.arc(-s * 0.08, -s * 0.18, s * 0.13, 0, Math.PI * 2); ctx.fillStyle = f.data.color; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.ellipse(s * 0.1, -s * 0.25, s * 0.15, s * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF"; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.ellipse(s * 0.1, s * 0.25, s * 0.5, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.7)`; ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.4, s * 0.1);
    ctx.quadraticCurveTo(s * 0.6, -s * 0.2 + Math.sin(time * 3) * 2, s * 0.55, -s * 0.3);
    ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.32, 1.5, 0, Math.PI * 2); ctx.fillStyle = "#222"; ctx.fill();
    ctx.restore(); return;
  }

  // ==================================================================
  // LOBSTER / CRAYFISH — detailed anatomical rendering
  // ==================================================================
  if (f.data.bodyShape === "lobster") {
    const clawOpen = 0.18 + Math.sin(f.tailPhase * 0.5) * 0.12;
    const legPhase = f.tailPhase * 0.8;
    const tailCurl = Math.sin(f.tailPhase * 0.3) * 0.15;
    const breathe2 = Math.sin(time * 3 + f.wobble) * 0.02;
    const isThreating = f.threatTimer > 0;
    const threatPulse = isThreating ? 0.3 + Math.sin(f.tailPhase * 2) * 0.15 : 0;
    const dr = rgb.r, dg = rgb.g, db = rgb.b;
    const ar = accentRgb.r, ag = accentRgb.g, ab = accentRgb.b;

    // ---- TAIL SEGMENTS (drawn first, behind body) ----
    ctx.save();
    let tx = -s * 0.25, ty = s * 0.02;
    for (let seg = 0; seg < 6; seg++) {
      const segW = s * (0.22 - seg * 0.022);
      const segH = s * (0.14 - seg * 0.012);
      const curl = tailCurl * (seg + 1) * 0.25;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(curl);
      // Segment body
      ctx.beginPath();
      ctx.ellipse(0, 0, segW, segH, 0, 0, Math.PI * 2);
      const segShade = 0.82 + seg * 0.03;
      const segG = ctx.createLinearGradient(0, -segH, 0, segH);
      segG.addColorStop(0, `rgba(${Math.min(255, Math.round(dr * segShade + 20))},${Math.min(255, Math.round(dg * segShade + 15))},${Math.min(255, Math.round(db * segShade + 10))},1)`);
      segG.addColorStop(0.5, `rgba(${Math.round(dr * segShade)},${Math.round(dg * segShade)},${Math.round(db * segShade)},1)`);
      segG.addColorStop(1, `rgba(${Math.max(0, Math.round(dr * segShade - 25))},${Math.max(0, Math.round(dg * segShade - 25))},${Math.max(0, Math.round(db * segShade - 25))},1)`);
      ctx.fillStyle = segG;
      ctx.fill();
      // Segment edge line
      ctx.strokeStyle = `rgba(0,0,0,0.15)`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      // Dorsal ridge highlight
      ctx.beginPath();
      ctx.ellipse(0, -segH * 0.5, segW * 0.6, segH * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,0.06)`;
      ctx.fill();
      // Swimmerets (small appendages under each tail segment)
      if (seg < 5) {
        const swimAngle = Math.sin(legPhase + seg * 0.8) * 0.3;
        ctx.beginPath();
        ctx.moveTo(-segW * 0.3, segH * 0.7);
        ctx.quadraticCurveTo(-segW * 0.2, segH * 1.3 + swimAngle * s * 0.05, -segW * 0.5, segH * 1.1 + swimAngle * s * 0.08);
        ctx.strokeStyle = `rgba(${dr},${dg},${db},0.35)`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      tx -= segW * 1.35;
      ty += Math.sin(curl) * segH * 0.4;
      ctx.restore();
    }
    // Tail fan (telson + uropods)
    const fanX = tx + s * 0.08, fanY = ty;
    const fanCurl = tailCurl * 2;
    ctx.save();
    ctx.translate(fanX, fanY);
    ctx.rotate(fanCurl);
    // Central telson
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s * 0.08, -s * 0.04, -s * 0.18, -s * 0.02, -s * 0.22, 0);
    ctx.bezierCurveTo(-s * 0.18, s * 0.02, -s * 0.08, s * 0.04, 0, 0);
    ctx.fillStyle = f.data.color;
    ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,0.12)`;
    ctx.lineWidth = 0.3;
    ctx.stroke();
    // Uropods (side fans)
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(s * 0.02, side * s * 0.01);
      ctx.bezierCurveTo(-s * 0.1, side * s * 0.1, -s * 0.22, side * s * 0.12, -s * 0.26, side * s * 0.06);
      ctx.bezierCurveTo(-s * 0.2, side * s * 0.02, -s * 0.08, side * s * 0.01, s * 0.02, side * s * 0.01);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.6)`;
      ctx.fill();
      // Fan ridges
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        const rx = -s * 0.06 - r * s * 0.06;
        ctx.moveTo(rx, side * s * 0.01);
        ctx.lineTo(rx - s * 0.03, side * s * (0.05 + r * 0.02));
        ctx.strokeStyle = `rgba(0,0,0,0.08)`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.restore();

    // ---- CARAPACE (main body) ----
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.04);
    // Top edge — slightly bumpy carapace
    ctx.bezierCurveTo(s * 0.32, -s * 0.22, s * 0.15, -s * 0.28, -s * 0.05, -s * 0.26);
    ctx.bezierCurveTo(-s * 0.2, -s * 0.24, -s * 0.32, -s * 0.18, -s * 0.35, -s * 0.05);
    // Bottom edge
    ctx.bezierCurveTo(-s * 0.33, s * 0.12, -s * 0.2, s * 0.22, 0, s * 0.22);
    ctx.bezierCurveTo(s * 0.15, s * 0.2, s * 0.32, s * 0.12, s * 0.4, -s * 0.04);
    ctx.closePath();
    const bodyG = ctx.createRadialGradient(s * 0.05, -s * 0.05, 0, s * 0.05, 0, s * 0.4);
    bodyG.addColorStop(0, `rgba(${Math.min(255, dr + 30)},${Math.min(255, dg + 25)},${Math.min(255, db + 20)},1)`);
    bodyG.addColorStop(0.4, f.data.color);
    bodyG.addColorStop(1, `rgba(${Math.max(0, dr - 40)},${Math.max(0, dg - 40)},${Math.max(0, db - 40)},1)`);
    ctx.fillStyle = bodyG;
    ctx.fill();
    // Carapace texture — fine stippling
    ctx.save();
    ctx.clip();
    for (let i = 0; i < 20; i++) {
      const px = s * (-0.3 + (Math.sin(i * 73.1) * 0.5 + 0.5) * 0.65);
      const py = s * (-0.2 + (Math.sin(i * 137.3) * 0.5 + 0.5) * 0.35);
      ctx.beginPath();
      ctx.arc(px, py, s * 0.008 + (i % 3) * s * 0.003, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.04 + (i % 4) * 0.01})`;
      ctx.fill();
    }
    // Marbled pattern for marbled crayfish
    if (f.data.id === "marbled_cray") {
      for (let i = 0; i < 8; i++) {
        const mx = s * (-0.25 + i * 0.07);
        const my = s * (-0.15 + Math.sin(i * 2.3) * 0.08);
        ctx.beginPath();
        ctx.bezierCurveTo(mx, my, mx + s * 0.08, my + s * 0.06, mx + s * 0.12, my + s * 0.02);
        ctx.strokeStyle = `rgba(${Math.max(0, dr - 30)},${Math.max(0, dg - 25)},${Math.max(0, db - 20)},0.15)`;
        ctx.lineWidth = s * 0.02;
        ctx.stroke();
      }
    }
    ctx.restore();
    // Dorsal ridge line
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.05);
    ctx.bezierCurveTo(s * 0.15, -s * 0.12, -s * 0.1, -s * 0.14, -s * 0.3, -s * 0.08);
    ctx.strokeStyle = `rgba(255,255,255,0.1)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Belly highlight
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.12, s * 0.2, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,0.04)`;
    ctx.fill();

    // ---- WALKING LEGS (4 pairs) ----
    for (let i = 0; i < 4; i++) {
      const lx = s * 0.15 - i * s * 0.12;
      const ly = s * 0.16;
      const swing = Math.sin(legPhase + i * 1.2) * s * 0.06;
      const swing2 = Math.sin(legPhase + i * 1.2 + 0.5) * s * 0.03;
      // Upper leg segment
      const kneeX = lx + s * 0.04 + swing2;
      const kneeY = ly + s * 0.14 + swing * 0.3;
      // Lower leg segment
      const footX = lx + s * 0.01 + swing;
      const footY = ly + s * 0.26;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(kneeX + s * 0.03, kneeY, footX, footY);
      ctx.strokeStyle = `rgba(${dr},${dg},${db},0.65)`;
      ctx.lineWidth = Math.max(1, s * 0.028);
      ctx.lineCap = "round";
      ctx.stroke();
      // Joint dot
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, s * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.max(0, dr - 20)},${Math.max(0, dg - 20)},${Math.max(0, db - 20)},0.4)`;
      ctx.fill();
    }

    // ---- CLAWS (chelipeds) — detailed pincers ----
    // Right claw (top)
    ctx.save();
    ctx.translate(s * 0.38, -s * 0.1);
    {
      // Arm segment
      const armLen = s * 0.25;
      const armAngle = -0.15 + (isThreating ? -0.25 : 0);
      ctx.rotate(armAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armLen, 0);
      ctx.strokeStyle = f.data.color;
      ctx.lineWidth = s * 0.09;
      ctx.lineCap = "round";
      ctx.stroke();
      // Arm texture
      ctx.beginPath();
      ctx.moveTo(s * 0.03, 0);
      ctx.lineTo(armLen - s * 0.02, 0);
      ctx.strokeStyle = `rgba(255,255,255,0.08)`;
      ctx.lineWidth = s * 0.03;
      ctx.stroke();
      // Pincer at end
      ctx.translate(armLen, 0);
      ctx.rotate(-0.1);
      const clawSize = s * (isThreating ? 0.22 : 0.18);
      const clawW = clawSize * 0.55;
      const openAngle = isThreating ? clawOpen * 1.8 + threatPulse : clawOpen;
      // Top pincer
      ctx.save();
      ctx.rotate(-openAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(clawSize * 0.3, -clawW * 0.4, clawSize * 0.7, -clawW * 0.45, clawSize, -clawW * 0.1);
      ctx.bezierCurveTo(clawSize * 0.85, clawW * 0.05, clawSize * 0.4, clawW * 0.08, 0, 0);
      const clawG1 = ctx.createLinearGradient(0, -clawW * 0.3, clawSize, 0);
      clawG1.addColorStop(0, f.data.accentColor);
      clawG1.addColorStop(0.6, f.data.color);
      clawG1.addColorStop(1, `rgba(${Math.max(0, dr - 30)},${Math.max(0, dg - 30)},${Math.max(0, db - 30)},1)`);
      ctx.fillStyle = clawG1;
      ctx.fill();
      ctx.strokeStyle = `rgba(0,0,0,0.12)`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      // Serrations on inner edge
      for (let t = 0; t < 3; t++) {
        const tx2 = clawSize * (0.3 + t * 0.2);
        ctx.beginPath();
        ctx.arc(tx2, clawW * 0.02, s * 0.008, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,0.12)`;
        ctx.fill();
      }
      ctx.restore();
      // Bottom pincer
      ctx.save();
      ctx.rotate(openAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(clawSize * 0.3, clawW * 0.35, clawSize * 0.7, clawW * 0.4, clawSize, clawW * 0.08);
      ctx.bezierCurveTo(clawSize * 0.85, -clawW * 0.03, clawSize * 0.4, -clawW * 0.06, 0, 0);
      ctx.fillStyle = f.data.color;
      ctx.fill();
      ctx.strokeStyle = `rgba(0,0,0,0.12)`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Left claw (bottom) — slightly smaller
    ctx.save();
    ctx.translate(s * 0.34, s * 0.1);
    {
      const armLen = s * 0.2;
      const armAngle = 0.12 + (isThreating ? 0.2 : 0);
      ctx.rotate(armAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armLen, 0);
      ctx.strokeStyle = f.data.color;
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.translate(armLen, 0);
      ctx.rotate(0.05);
      const clawSize = s * (isThreating ? 0.18 : 0.14);
      const clawW = clawSize * 0.5;
      const openAngle = isThreating ? clawOpen * 1.5 + threatPulse * 0.8 : clawOpen * 0.8;
      ctx.save();
      ctx.rotate(-openAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(clawSize * 0.3, -clawW * 0.35, clawSize * 0.65, -clawW * 0.4, clawSize * 0.9, -clawW * 0.08);
      ctx.bezierCurveTo(clawSize * 0.75, clawW * 0.03, clawSize * 0.35, clawW * 0.06, 0, 0);
      ctx.fillStyle = f.data.accentColor;
      ctx.fill();
      ctx.strokeStyle = `rgba(0,0,0,0.1)`;
      ctx.lineWidth = 0.3;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.rotate(openAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(clawSize * 0.3, clawW * 0.3, clawSize * 0.65, clawW * 0.35, clawSize * 0.9, clawW * 0.06);
      ctx.bezierCurveTo(clawSize * 0.75, -clawW * 0.02, clawSize * 0.35, -clawW * 0.04, 0, 0);
      ctx.fillStyle = f.data.color;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // ---- ANTENNAE (2 long + 2 short antennules) ----
    const antSway = Math.sin(f.tailPhase * 0.4) * s * 0.1;
    const antSway2 = Math.sin(f.tailPhase * 0.6 + 1) * s * 0.08;
    ctx.strokeStyle = `rgba(${dr},${dg},${db},0.45)`;
    ctx.lineCap = "round";
    // Long antenna 1
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.18);
    ctx.bezierCurveTo(s * 0.55, -s * 0.35 + antSway, s * 0.75, -s * 0.42 + antSway, s * 0.95 + antSway, -s * 0.35 + antSway2);
    ctx.stroke();
    // Long antenna 2
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.11);
    ctx.bezierCurveTo(s * 0.58, -s * 0.32 - antSway2, s * 0.8, -s * 0.3 - antSway2, s * 1.0 - antSway2, -s * 0.2 + antSway);
    ctx.stroke();
    // Short antennules
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = `rgba(${dr},${dg},${db},0.35)`;
    ctx.beginPath();
    ctx.moveTo(s * 0.42, -s * 0.15);
    ctx.lineTo(s * 0.56 + antSway * 0.4, -s * 0.24 + antSway2 * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.42, -s * 0.1);
    ctx.lineTo(s * 0.54 - antSway2 * 0.3, -s * 0.04 + antSway * 0.2);
    ctx.stroke();

    // ---- EYES (on stalks) ----
    const eyeStalkWave = Math.sin(time * 2 + f.wobble) * s * 0.008;
    // Eye stalks
    ctx.strokeStyle = `rgba(${dr},${dg},${db},0.6)`;
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(s * 0.38, -s * 0.19);
    ctx.lineTo(s * 0.44, -s * 0.24 + eyeStalkWave);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.38, -s * 0.07);
    ctx.lineTo(s * 0.44, -s * 0.03 - eyeStalkWave);
    ctx.stroke();
    // Eye globes
    ctx.beginPath();
    ctx.arc(s * 0.44, -s * 0.24 + eyeStalkWave, s * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.445, -s * 0.245 + eyeStalkWave, s * 0.018, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.44, -s * 0.03 - eyeStalkWave, s * 0.035, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.445, -s * 0.035 - eyeStalkWave, s * 0.015, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();

    // ---- DROP SHADOW already handled globally ----

    // Threat display glow (red-ish aura when agitated)
    if (isThreating) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.beginPath();
      ctx.ellipse(s * 0.05, 0, s * 0.5, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,60,30,${threatPulse * 0.06})`;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    return;
  }

  // ==================================================================
  // SEA BREAM — large deep-bodied fish with silvery scales
  // ==================================================================
  if (f.data.bodyShape === "bream") {
    const glidePhase = f._glidePhase || time;
    const breathe3 = Math.sin(time * 2.5 + f.wobble) * 0.015;

    // ---- BODY — deep oval with pronounced forehead ----
    ctx.beginPath();
    // Top profile — high forehead curving down to tail
    ctx.moveTo(s * 0.55, 0);
    ctx.bezierCurveTo(s * 0.5, -s * 0.32, s * 0.3, -s * 0.48, s * 0.05, -s * 0.5);
    ctx.bezierCurveTo(-s * 0.2, -s * 0.48, -s * 0.4, -s * 0.35, -s * 0.52, -s * 0.15);
    // Tail peduncle
    ctx.bezierCurveTo(-s * 0.58, -s * 0.05, -s * 0.58, s * 0.05, -s * 0.52, s * 0.15);
    // Bottom profile
    ctx.bezierCurveTo(-s * 0.4, s * 0.3, -s * 0.2, s * 0.4, s * 0.05, s * 0.42);
    ctx.bezierCurveTo(s * 0.25, s * 0.4, s * 0.45, s * 0.25, s * 0.55, 0);
    ctx.closePath();
    const breamG = ctx.createRadialGradient(s * 0.1, -s * 0.05, 0, 0, 0, s * 0.55);
    breamG.addColorStop(0, `rgba(${Math.min(255, rgb.r + 50)},${Math.min(255, rgb.g + 45)},${Math.min(255, rgb.b + 40)},1)`);
    breamG.addColorStop(0.4, f.data.color);
    breamG.addColorStop(0.8, `rgba(${Math.max(0, rgb.r - 30)},${Math.max(0, rgb.g - 25)},${Math.max(0, rgb.b - 20)},1)`);
    breamG.addColorStop(1, `rgba(${Math.max(0, rgb.r - 50)},${Math.max(0, rgb.g - 45)},${Math.max(0, rgb.b - 40)},1)`);
    ctx.fillStyle = breamG;
    ctx.fill();

    // ---- SCALE PATTERN — crescent rows ----
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.08;
    const scaleR = Math.max(2, s * 0.06);
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 14; col++) {
        const sx = -s * 0.5 + col * scaleR * 1.8 + (row % 2) * scaleR * 0.9;
        const sy = -s * 0.45 + row * scaleR * 1.4;
        ctx.beginPath();
        ctx.arc(sx, sy, scaleR, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.strokeStyle = `rgba(255,255,255,0.6)`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
    // Iridescent shimmer band — moves with time
    const shimX = Math.sin(glidePhase * 0.5) * s * 0.3;
    ctx.globalAlpha = 0.06;
    const shimG = ctx.createLinearGradient(shimX - s * 0.15, 0, shimX + s * 0.15, 0);
    shimG.addColorStop(0, "transparent");
    shimG.addColorStop(0.5, "rgba(255,255,255,1)");
    shimG.addColorStop(1, "transparent");
    ctx.fillStyle = shimG;
    ctx.fillRect(-s * 0.6, -s * 0.5, s * 1.2, s * 1);
    ctx.restore();

    // ---- LATERAL LINE ----
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.02);
    ctx.bezierCurveTo(s * 0.2, -s * 0.06, -s * 0.1, -s * 0.04, -s * 0.45, s * 0.02);
    ctx.strokeStyle = `rgba(0,0,0,0.07)`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // ---- DORSAL FIN — tall spiny with rays ----
    const dorsalWave = Math.sin(glidePhase * 0.7) * s * 0.02;
    ctx.beginPath();
    ctx.moveTo(s * 0.25, -s * 0.45);
    ctx.bezierCurveTo(s * 0.15, -s * 0.72 + dorsalWave, -s * 0.1, -s * 0.7 + dorsalWave, -s * 0.3, -s * 0.55 + dorsalWave);
    ctx.bezierCurveTo(-s * 0.4, -s * 0.4, -s * 0.45, -s * 0.25, -s * 0.48, -s * 0.15);
    ctx.lineTo(-s * 0.35, -s * 0.3);
    ctx.bezierCurveTo(-s * 0.15, -s * 0.4, s * 0.1, -s * 0.45, s * 0.25, -s * 0.45);
    ctx.closePath();
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.35)`;
    ctx.fill();
    // Fin rays
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const rx = s * (0.2 - t * 0.6);
      const ry = -s * 0.45 - (1 - Math.abs(t - 0.35) * 2) * s * 0.2 + dorsalWave;
      ctx.beginPath();
      ctx.moveTo(rx, -s * 0.42 + t * s * 0.1);
      ctx.lineTo(rx - s * 0.02, ry);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ---- TAIL (caudal fin) — forked ----
    const tailSwing2 = Math.sin(f.tailPhase) * s * 0.08;
    ctx.beginPath();
    ctx.moveTo(-s * 0.52, -s * 0.08);
    ctx.bezierCurveTo(-s * 0.6, -s * 0.12, -s * 0.72, -s * 0.25 + tailSwing2, -s * 0.8, -s * 0.3 + tailSwing2);
    ctx.bezierCurveTo(-s * 0.72, -s * 0.15 + tailSwing2, -s * 0.62, -s * 0.02, -s * 0.55, 0);
    ctx.bezierCurveTo(-s * 0.62, s * 0.02, -s * 0.72, s * 0.15 + tailSwing2, -s * 0.8, s * 0.3 + tailSwing2);
    ctx.bezierCurveTo(-s * 0.72, s * 0.25 + tailSwing2, -s * 0.6, s * 0.12, -s * 0.52, s * 0.08);
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.45)`;
    ctx.fill();

    // ---- PECTORAL FIN ----
    const pectWave = Math.sin(glidePhase * 1.2) * s * 0.03;
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.1);
    ctx.bezierCurveTo(s * 0.15, s * 0.25 + pectWave, s * 0.0, s * 0.3 + pectWave, -s * 0.1, s * 0.2 + pectWave);
    ctx.bezierCurveTo(-s * 0.05, s * 0.15, s * 0.1, s * 0.12, s * 0.2, s * 0.1);
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.25)`;
    ctx.fill();

    // ---- ANAL FIN ----
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.35);
    ctx.bezierCurveTo(-s * 0.25, s * 0.45, -s * 0.4, s * 0.4, -s * 0.45, s * 0.2);
    ctx.lineTo(-s * 0.35, s * 0.25);
    ctx.bezierCurveTo(-s * 0.25, s * 0.35, -s * 0.15, s * 0.35, -s * 0.15, s * 0.35);
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.3)`;
    ctx.fill();

    // ---- EYE ----
    ctx.beginPath();
    ctx.arc(s * 0.38, -s * 0.1, s * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = "#EEDD44";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.38, -s * 0.1, s * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.39, -s * 0.11, s * 0.018, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();

    // ---- MOUTH ----
    ctx.beginPath();
    ctx.moveTo(s * 0.54, s * 0.02);
    ctx.quadraticCurveTo(s * 0.5, s * 0.06 + breathe3 * s, s * 0.44, s * 0.04);
    ctx.strokeStyle = `rgba(0,0,0,0.15)`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // ---- RIM LIGHT (dorsal edge) ----
    ctx.beginPath();
    ctx.moveTo(s * 0.45, -s * 0.15);
    ctx.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.0, -s * 0.48, -s * 0.3, -s * 0.35);
    ctx.strokeStyle = `rgba(255,255,255,0.08)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    return;
  }

  // ==================================================================
  // SCAT — round disc body with spotted pattern
  // ==================================================================
  if (f.data.bodyShape === "scat") {
    const glidePhase = f._glidePhase || time;
    const breathe3 = Math.sin(time * 2.5 + f.wobble) * 0.015;

    // ---- BODY — almost circular disc shape ----
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.48 + breathe3 * s, 0, 0, Math.PI * 2);
    const scatG = ctx.createRadialGradient(s * 0.08, -s * 0.08, 0, 0, 0, s * 0.52);
    scatG.addColorStop(0, `rgba(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 35)},${Math.min(255, rgb.b + 25)},1)`);
    scatG.addColorStop(0.5, f.data.color);
    scatG.addColorStop(1, `rgba(${Math.max(0, rgb.r - 35)},${Math.max(0, rgb.g - 30)},${Math.max(0, rgb.b - 25)},1)`);
    ctx.fillStyle = scatG;
    ctx.fill();

    // ---- SPOTTED PATTERN — characteristic dark spots ----
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.48, 0, 0, Math.PI * 2);
    ctx.clip();
    const spots = [
      { x: 0.15, y: -0.15, r: 0.06 }, { x: -0.1, y: -0.2, r: 0.05 },
      { x: 0.25, y: 0.0, r: 0.055 }, { x: 0.0, y: 0.05, r: 0.065 },
      { x: -0.2, y: 0.1, r: 0.05 }, { x: 0.1, y: 0.2, r: 0.045 },
      { x: -0.05, y: -0.08, r: 0.04 }, { x: 0.3, y: -0.1, r: 0.035 },
      { x: -0.25, y: -0.05, r: 0.04 }, { x: 0.15, y: 0.12, r: 0.05 },
      { x: -0.15, y: 0.22, r: 0.038 }, { x: 0.05, y: -0.3, r: 0.035 },
      { x: -0.3, y: 0.0, r: 0.03 }, { x: 0.2, y: -0.25, r: 0.032 },
    ];
    spots.forEach(sp => {
      ctx.beginPath();
      ctx.arc(sp.x * s, sp.y * s, sp.r * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.6)`;
      ctx.fill();
    });
    // Subtle scale shimmer
    const shimX = Math.sin(glidePhase * 0.4) * s * 0.25;
    ctx.globalAlpha = 0.05;
    const shimG = ctx.createLinearGradient(shimX - s * 0.12, 0, shimX + s * 0.12, 0);
    shimG.addColorStop(0, "transparent");
    shimG.addColorStop(0.5, "rgba(255,255,255,1)");
    shimG.addColorStop(1, "transparent");
    ctx.fillStyle = shimG;
    ctx.fillRect(-s * 0.5, -s * 0.5, s, s);
    ctx.restore();

    // ---- LATERAL LINE ----
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.02);
    ctx.bezierCurveTo(s * 0.1, -s * 0.02, -s * 0.15, s * 0.0, -s * 0.4, s * 0.05);
    ctx.strokeStyle = `rgba(0,0,0,0.06)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // ---- DORSAL FIN — tall, spiny ----
    const dorsalWave = Math.sin(glidePhase * 0.6) * s * 0.02;
    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.42);
    ctx.bezierCurveTo(s * 0.1, -s * 0.65 + dorsalWave, -s * 0.15, -s * 0.62 + dorsalWave, -s * 0.3, -s * 0.45 + dorsalWave);
    ctx.lineTo(-s * 0.25, -s * 0.38);
    ctx.bezierCurveTo(-s * 0.05, -s * 0.42, s * 0.1, -s * 0.42, s * 0.2, -s * 0.42);
    ctx.closePath();
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`;
    ctx.fill();
    // Spiny rays
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const rx = s * (0.18 - t * 0.45);
      ctx.beginPath();
      ctx.moveTo(rx, -s * 0.42);
      ctx.lineTo(rx - s * 0.01, -s * 0.58 + t * s * 0.1 + dorsalWave);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // ---- ANAL FIN — also spiny ----
    ctx.beginPath();
    ctx.moveTo(s * 0.05, s * 0.42);
    ctx.bezierCurveTo(-s * 0.1, s * 0.58, -s * 0.3, s * 0.52, -s * 0.35, s * 0.35);
    ctx.lineTo(-s * 0.3, s * 0.38);
    ctx.bezierCurveTo(-s * 0.15, s * 0.42, s * 0.0, s * 0.42, s * 0.05, s * 0.42);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`;
    ctx.fill();

    // ---- TAIL (caudal fin) — slightly forked ----
    const tailSwing2 = Math.sin(f.tailPhase) * s * 0.07;
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.05);
    ctx.bezierCurveTo(-s * 0.55, -s * 0.1, -s * 0.65, -s * 0.22 + tailSwing2, -s * 0.72, -s * 0.25 + tailSwing2);
    ctx.bezierCurveTo(-s * 0.65, -s * 0.12, -s * 0.55, 0, -s * 0.48, 0);
    ctx.bezierCurveTo(-s * 0.55, 0, -s * 0.65, s * 0.12, -s * 0.72, s * 0.25 + tailSwing2);
    ctx.bezierCurveTo(-s * 0.65, s * 0.22 + tailSwing2, -s * 0.55, s * 0.1, -s * 0.45, s * 0.05);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`;
    ctx.fill();

    // ---- PECTORAL FIN ----
    const pectWave = Math.sin(glidePhase * 1.1) * s * 0.025;
    ctx.beginPath();
    ctx.moveTo(s * 0.15, s * 0.12);
    ctx.bezierCurveTo(s * 0.1, s * 0.28 + pectWave, -s * 0.05, s * 0.3 + pectWave, -s * 0.12, s * 0.22);
    ctx.bezierCurveTo(-s * 0.05, s * 0.18, s * 0.08, s * 0.14, s * 0.15, s * 0.12);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)`;
    ctx.fill();

    // ---- EYE ----
    ctx.beginPath();
    ctx.arc(s * 0.32, -s * 0.1, s * 0.065, 0, Math.PI * 2);
    ctx.fillStyle = "#DDCC33";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.32, -s * 0.1, s * 0.038, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.33, -s * 0.11, s * 0.016, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();

    // ---- MOUTH ----
    ctx.beginPath();
    ctx.moveTo(s * 0.48, s * 0.03);
    ctx.quadraticCurveTo(s * 0.44, s * 0.08 + breathe3 * s, s * 0.38, s * 0.05);
    ctx.strokeStyle = `rgba(0,0,0,0.12)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // ---- BELLY HIGHLIGHT ----
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.2, s * 0.25, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,0.04)`;
    ctx.fill();

    // ---- RIM LIGHT ----
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.48, 0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = `rgba(255,255,255,0.07)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    return;
  }

  // ==================================================================
  // AXOLOTL
  // ==================================================================
  if (f.data.bodyShape === "axolotl") {
    const gillWave = Math.sin(f.tailPhase*0.6)*0.15, tailWag = Math.sin(f.tailPhase*0.4)*s*0.12;
    ctx.beginPath(); ctx.ellipse(0,0,s*0.55,s*0.3,0,0,Math.PI*2);
    const axG = ctx.createRadialGradient(s*0.1,-s*0.05,0,0,0,s*0.55);
    axG.addColorStop(0,f.data.accentColor); axG.addColorStop(1,f.data.color);
    ctx.fillStyle = axG; ctx.fill();
    ctx.beginPath(); ctx.ellipse(s*0.45,0,s*0.3,s*0.28,0,0,Math.PI*2); ctx.fillStyle = f.data.color; ctx.fill();
    for (let side=-1;side<=1;side+=2) { for (let g=0;g<3;g++) {
      const ga=(side*(0.4+g*0.35))+gillWave*side, gl=s*(0.25+g*0.05);
      ctx.save(); ctx.translate(s*0.55,side*s*0.15); ctx.rotate(ga);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(gl*0.3,-gl*0.1,gl*0.7,-gl*0.05,gl,0);
      ctx.strokeStyle = f.data.accentColor; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
      for (let f2=0;f2<3;f2++) { const fx=gl*(0.3+f2*0.25);
        ctx.beginPath(); ctx.moveTo(fx,0); ctx.lineTo(fx+gl*0.08,-gl*0.12);
        ctx.strokeStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.5)`; ctx.lineWidth = 0.8; ctx.stroke();
      } ctx.restore();
    }}
    ctx.beginPath(); ctx.moveTo(-s*0.5,0);
    ctx.bezierCurveTo(-s*0.7,-s*0.05+tailWag*0.3,-s*0.9,tailWag*0.5,-s*1,tailWag);
    ctx.bezierCurveTo(-s*0.9,tailWag+s*0.05,-s*0.7,s*0.03+tailWag*0.3,-s*0.5,s*0.05);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`; ctx.fill();
    for (let i=0;i<4;i++) { const lx=s*(0.2-i*0.25), legKick=Math.sin(f.tailPhase*0.3+i*1.5)*s*0.03;
      ctx.beginPath(); ctx.moveTo(lx,s*0.2); ctx.quadraticCurveTo(lx+s*0.05,s*0.35+legKick,lx+legKick,s*0.4);
      ctx.strokeStyle = f.data.color; ctx.lineWidth = s*0.05; ctx.lineCap = "round"; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(s*0.52,s*0.05,s*0.1,0.1,Math.PI-0.1);
    ctx.strokeStyle = `rgba(0,0,0,0.15)`; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(s*0.55,-s*0.08,s*0.04,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.55,s*0.08,s*0.04,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.arc(s*0.56,-s*0.09,s*0.015,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.56,s*0.07,s*0.015,0,Math.PI*2); ctx.fill();
    ctx.restore(); return;
  }

  // ==================================================================
  // PUFFER
  // ==================================================================
  if (f.data.bodyShape === "puffer") {
    const puff=1+Math.sin(f.tailPhase*0.2)*0.05;
    ctx.beginPath(); ctx.arc(0,0,s*0.45*puff,0,Math.PI*2);
    const pG = ctx.createRadialGradient(s*0.1,-s*0.1,0,0,0,s*0.45);
    pG.addColorStop(0,f.data.accentColor); pG.addColorStop(0.6,f.data.color);
    pG.addColorStop(1,`rgba(${Math.max(0,rgb.r-30)},${Math.max(0,rgb.g-30)},${Math.max(0,rgb.b-30)},1)`);
    ctx.fillStyle = pG; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0,s*0.15,s*0.3,s*0.18,0,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,240,0.2)`; ctx.fill();
    for (let i=0;i<5;i++) { const sx=-s*0.2+(i*s*0.12), sy=-s*0.1+Math.sin(i*2)*s*0.1;
      ctx.beginPath(); ctx.arc(sx,sy,s*0.04,0,Math.PI*2);
      ctx.fillStyle = `rgba(${Math.max(0,rgb.r-50)},${Math.max(0,rgb.g-50)},${Math.max(0,rgb.b-20)},0.4)`; ctx.fill();
    }
    const tWag=Math.sin(f.tailPhase)*s*0.06;
    ctx.beginPath(); ctx.moveTo(-s*0.4,0); ctx.lineTo(-s*0.55,-s*0.1+tWag); ctx.lineTo(-s*0.55,s*0.1+tWag); ctx.closePath();
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.5)`; ctx.fill();
    ctx.fillStyle = "#FFF"; ctx.beginPath(); ctx.arc(s*0.25,-s*0.12,s*0.1,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(s*0.28,-s*0.12,s*0.06,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(s*0.3,-s*0.14,s*0.02,0,Math.PI*2); ctx.fill();
    const finFlut=Math.sin(f.tailPhase*2)*0.3;
    ctx.save(); ctx.translate(s*0.05,-s*0.3); ctx.rotate(-0.5+finFlut);
    ctx.beginPath(); ctx.ellipse(0,0,s*0.08,s*0.04,0,0,Math.PI*2);
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.4)`; ctx.fill(); ctx.restore();
    ctx.restore(); return;
  }

  // ==================================================================
  // FROG
  // ==================================================================
  if (f.data.bodyShape === "frog") {
    const legKick=Math.sin(f.tailPhase*0.5)*s*0.1;
    ctx.beginPath(); ctx.ellipse(0,0,s*0.4,s*0.3,0,0,Math.PI*2); ctx.fillStyle = f.data.color; ctx.fill();
    ctx.beginPath(); ctx.ellipse(s*0.3,-s*0.05,s*0.22,s*0.2,0,0,Math.PI*2); ctx.fillStyle = f.data.color; ctx.fill();
    ctx.strokeStyle = f.data.color; ctx.lineWidth = s*0.06; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-s*0.3,s*0.15); ctx.quadraticCurveTo(-s*0.5,s*0.3+legKick,-s*0.65,s*0.15+legKick); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s*0.3,-s*0.15); ctx.quadraticCurveTo(-s*0.5,-s*0.3-legKick,-s*0.65,-s*0.15-legKick); ctx.stroke();
    ctx.lineWidth = s*0.03;
    ctx.beginPath(); ctx.moveTo(-s*0.65,s*0.15+legKick); ctx.lineTo(-s*0.72,s*0.1+legKick);
    ctx.moveTo(-s*0.65,s*0.15+legKick); ctx.lineTo(-s*0.73,s*0.18+legKick);
    ctx.moveTo(-s*0.65,s*0.15+legKick); ctx.lineTo(-s*0.7,s*0.22+legKick); ctx.stroke();
    ctx.lineWidth = s*0.04;
    ctx.beginPath(); ctx.moveTo(s*0.15,s*0.2); ctx.quadraticCurveTo(s*0.25,s*0.35,s*0.35,s*0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.15,-s*0.2); ctx.quadraticCurveTo(s*0.25,-s*0.35,s*0.35,-s*0.3); ctx.stroke();
    ctx.fillStyle = "#DDD";
    ctx.beginPath(); ctx.arc(s*0.38,-s*0.18,s*0.08,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.38,s*0.08,s*0.08,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(s*0.4,-s*0.18,s*0.04,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.4,s*0.08,s*0.04,0,Math.PI*2); ctx.fill();
    ctx.restore(); return;
  }

  // ====================================================================
  // ========================== FISH BODY ===============================
  // ====================================================================

  // Helper: draw the body path (reused for fill, clip, and outline)
  const bodyPath = () => {
    ctx.beginPath();
    if (f.data.bodyShape === "slim") {
      // S-curve body flex — rear half shifts with bodyFlex for swimming undulation
      const bf = bodyFlex * s * 0.06;
      ctx.moveTo(s*0.65, 0);
      ctx.bezierCurveTo(s*0.6, -s*0.25, s*0.2, -s*0.35, -s*0.1, -s*0.3 + bf*0.3);
      ctx.bezierCurveTo(-s*0.5, -s*0.2 + bf*0.7, -s*0.65, -s*0.05 + bf, -s*0.65, bf);
      ctx.bezierCurveTo(-s*0.65, s*0.05 + bf, -s*0.5, s*0.2 + bf*0.7, -s*0.1, s*0.3 + bf*0.3);
      ctx.bezierCurveTo(s*0.2, s*0.35, s*0.6, s*0.25, s*0.65, 0);
    } else if (f.data.bodyShape === "tall") {
      ctx.ellipse(0, 0, s*0.35, s*0.7*(1+breathe), 0, 0, Math.PI*2);
    } else if (f.data.bodyShape === "disc") {
      ctx.arc(0, 0, s*0.55*(1+breathe), 0, Math.PI*2);
    } else if (f.data.bodyShape === "flat") {
      ctx.ellipse(0, s*0.05, s*0.7, s*0.25, 0, 0, Math.PI*2);
    } else if (f.data.bodyShape === "round") {
      ctx.ellipse(0, 0, s*0.6, s*0.45*(1+breathe), 0, 0, Math.PI*2);
    } else {
      // Oval default — also gets subtle flex
      const bf = bodyFlex * s * 0.04;
      ctx.ellipse(0, bf * 0.3, s*0.6, s*0.38, 0, 0, Math.PI*2);
    }
  };

  // ---- TAIL ----
  const tailX = (f.data.bodyShape === "tall" || f.data.bodyShape === "disc") ? -s*0.5 : -s*0.65;
  const tailW = (f.data.bodyShape === "tall" || f.data.bodyShape === "disc") ? s*0.35 : s*0.45;
  const tailWave2 = Math.sin(f.tailPhase*0.8+1)*tailAmp*0.35;
  // S-curve offset at tail base — makes the tail connect organically to the body
  const sCurveOff = bodyFlex * s * 0.08;

  ctx.beginPath(); ctx.moveTo(tailX, sCurveOff);
  // Upper lobe — wider fork with organic curve
  ctx.bezierCurveTo(
    tailX - tailW * 0.25, -s * 0.08 + tailSwing * s * 0.15 + sCurveOff,
    tailX - tailW * 0.6, -s * 0.22 + tailSwing * s * 0.3 + sCurveOff * 0.5,
    tailX - tailW, -s * 0.32 + tailSwing * s * 0.4 + tailWave2 * s * 0.12
  );
  // Fork indent
  ctx.bezierCurveTo(
    tailX - tailW * 0.7, -s * 0.05 + tailSwing * s * 0.12,
    tailX - tailW * 0.7, s * 0.05 + tailSwing * s * 0.12,
    tailX - tailW, s * 0.32 + tailSwing * s * 0.4 + tailWave2 * s * 0.12
  );
  // Lower lobe
  ctx.bezierCurveTo(
    tailX - tailW * 0.6, s * 0.22 + tailSwing * s * 0.3 + sCurveOff * 0.5,
    tailX - tailW * 0.25, s * 0.08 + tailSwing * s * 0.15 + sCurveOff,
    tailX, sCurveOff
  );
  const tailGrad = ctx.createLinearGradient(tailX, 0, tailX - tailW, 0);
  tailGrad.addColorStop(0, f.data.accentColor);
  tailGrad.addColorStop(0.5, `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.55)`);
  tailGrad.addColorStop(1, `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.25)`);
  ctx.fillStyle = tailGrad; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;

  // Tail fin rays — more rays, follow the swing
  ctx.save(); ctx.globalAlpha = 0.14;
  for (let i = 0; i < 8; i++) {
    const rayT = i / 7; // 0 to 1
    const rayAngle = -0.55 + rayT * 1.1;
    const tipY = rayAngle * s * 0.65 + tailSwing * s * 0.25;
    const tipX = tailX - tailW * (0.85 + Math.abs(rayAngle) * 0.15);
    ctx.beginPath();
    ctx.moveTo(tailX, sCurveOff);
    ctx.quadraticCurveTo(tailX - tailW * 0.4, tipY * 0.4 + sCurveOff * 0.5, tipX, tipY);
    ctx.strokeStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},1)`;
    ctx.lineWidth = 0.4; ctx.stroke();
  }
  ctx.restore();

  // ---- BODY with clip for all overlays ----
  ctx.save();
  bodyPath(); ctx.clip();

  // Base gradient
  const grad = ctx.createLinearGradient(0,-s*0.5,0,s*0.5);
  grad.addColorStop(0,`rgba(${Math.min(255,rgb.r+50)},${Math.min(255,rgb.g+50)},${Math.min(255,rgb.b+50)},1)`);
  grad.addColorStop(0.45,f.data.color);
  grad.addColorStop(1,`rgba(${Math.max(0,rgb.r-40)},${Math.max(0,rgb.g-40)},${Math.max(0,rgb.b-40)},1)`);
  ctx.fillStyle = grad; ctx.fillRect(-s,-s,s*2,s*2);

  // Belly highlight
  ctx.save(); ctx.globalCompositeOperation = "screen";
  const bellyG = ctx.createRadialGradient(s*0.05,s*0.15,0,s*0.05,s*0.15,s*0.4);
  bellyG.addColorStop(0,`rgba(${Math.min(255,rgb.r+80)},${Math.min(255,rgb.g+70)},${Math.min(255,rgb.b+50)},0.15)`);
  bellyG.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle = bellyG; ctx.fillRect(-s,-s,s*2,s*2); ctx.restore();

  // ---- SCALE PATTERN ----
  if (s > 8) {
    ctx.save(); ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = s > 14 ? 0.18 : 0.1;
    const scaleR = Math.max(1.5, s*0.06);
    const cols = Math.ceil(s*1.4/(scaleR*2))+1;
    const rows = Math.ceil(s*1.0/(scaleR*1.6))+1;
    const ox = -s*0.7, oy = -s*0.5;
    for (let row=0;row<rows;row++) {
      const rowOff = (row%2)*scaleR;
      for (let col=0;col<cols;col++) {
        const cx = ox+col*scaleR*2+rowOff, cy = oy+row*scaleR*1.6;
        ctx.beginPath(); ctx.arc(cx,cy,scaleR,Math.PI*0.85,Math.PI*0.15,true);
        ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 0.4; ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- SPECIES PATTERNS (inside clip) ----
  // Neon / Cardinal
  if (f.data.id === "neon" || f.data.id === "cardinal") {
    const shimX = Math.sin(time*1.5+f.wobble)*s*0.15;
    const shimG = ctx.createLinearGradient(-s*0.5+shimX,-s*0.08,s*0.5+shimX,s*0.02);
    shimG.addColorStop(0,"rgba(0,255,200,0)"); shimG.addColorStop(0.2,"rgba(0,230,255,0.8)");
    shimG.addColorStop(0.5,"rgba(0,255,220,0.9)"); shimG.addColorStop(0.8,"rgba(0,200,255,0.7)");
    shimG.addColorStop(1,"rgba(0,255,200,0)");
    ctx.save(); ctx.globalCompositeOperation = "screen";
    ctx.beginPath(); ctx.moveTo(s*0.5,-s*0.05);
    ctx.bezierCurveTo(s*0.3,-s*0.1,-s*0.2,-s*0.08,-s*0.5,-s*0.02);
    ctx.lineTo(-s*0.5,s*0.06); ctx.bezierCurveTo(-s*0.2,s*0.02,s*0.3,s*0.04,s*0.5,s*0.05);
    ctx.closePath(); ctx.fillStyle = shimG; ctx.fill(); ctx.restore();
    const redStart = f.data.id === "cardinal" ? -s*0.45 : s*0.05;
    ctx.beginPath(); ctx.moveTo(redStart,s*0.05);
    ctx.bezierCurveTo(redStart-s*0.05,s*0.25,-s*0.35,s*0.22,-s*0.5,s*0.1);
    ctx.lineTo(-s*0.5,s*0.02); ctx.bezierCurveTo(-s*0.2,s*0.08,redStart-s*0.05,s*0.08,redStart,s*0.05);
    ctx.fillStyle = "#FF3333"; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
  }
  if (f.data.id === "rummy") {
    const rG = ctx.createRadialGradient(s*0.5,0,0,s*0.4,0,s*0.35);
    rG.addColorStop(0,"rgba(255,20,0,0.8)"); rG.addColorStop(1,"rgba(255,20,0,0)");
    ctx.fillStyle = rG; ctx.fillRect(-s,-s,s*2,s*2);
  }
  if (f.data.id === "clownfish") {
    ctx.fillStyle = "#FFFFFF"; ctx.globalAlpha = 0.85;
    [-s*0.15,s*0.2].forEach(bx => {
      ctx.beginPath(); ctx.moveTo(bx,-s*0.4);
      ctx.bezierCurveTo(bx-s*0.05,-s*0.3,bx-s*0.05,s*0.3,bx,s*0.4);
      ctx.bezierCurveTo(bx+s*0.05,s*0.3,bx+s*0.05,-s*0.3,bx,-s*0.4); ctx.fill();
    }); ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 0.8;
    [-s*0.15,s*0.2].forEach(bx => {
      ctx.beginPath(); ctx.moveTo(bx,-s*0.38); ctx.bezierCurveTo(bx-s*0.05,-s*0.28,bx-s*0.05,s*0.28,bx,s*0.38); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx,-s*0.38); ctx.bezierCurveTo(bx+s*0.05,-s*0.28,bx+s*0.05,s*0.28,bx,s*0.38); ctx.stroke();
    });
  }
  if (f.data.id === "discus") {
    ctx.globalAlpha = 0.2;
    for (let i=0;i<9;i++) { const a=(i/9)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*s*0.55,Math.sin(a)*s*0.55);
      ctx.strokeStyle = f.data.accentColor; ctx.lineWidth = 1.2; ctx.stroke();
    }
    for (let ring=1;ring<=3;ring++) { const rr=s*0.15*ring;
      ctx.beginPath();
      for (let a=0;a<=Math.PI*2;a+=0.1) { const w2=Math.sin(a*5+ring)*s*0.02;
        const px=Math.cos(a)*(rr+w2), py=Math.sin(a)*(rr+w2);
        if (a===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      } ctx.closePath();
      ctx.strokeStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.15)`; ctx.lineWidth = 0.8; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (f.data.id === "angelfish") {
    ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.3)`;
    for (let i=0;i<4;i++) { const sx=-s*0.25+i*s*0.17, bw=s*0.04+Math.sin(i*1.5)*s*0.01;
      ctx.beginPath(); ctx.moveTo(sx,-s*0.7);
      ctx.bezierCurveTo(sx+bw,-s*0.3,sx+bw,s*0.3,sx,s*0.7);
      ctx.bezierCurveTo(sx-bw,s*0.3,sx-bw,-s*0.3,sx,-s*0.7); ctx.fill();
    }
  }
  if (f.data.id === "zebra_danio") {
    ctx.globalAlpha = 0.35;
    for (let i=0;i<4;i++) { const sy=-s*0.18+i*s*0.12;
      ctx.beginPath(); ctx.moveTo(-s*0.6,sy);
      for (let x2=-s*0.6;x2<=s*0.6;x2+=s*0.1) ctx.lineTo(x2,sy+Math.sin(x2*0.3+i)*s*0.015);
      ctx.lineTo(s*0.6,sy+s*0.04);
      for (let x2=s*0.6;x2>=-s*0.6;x2-=s*0.1) ctx.lineTo(x2,sy+s*0.04+Math.sin(x2*0.3+i)*s*0.015);
      ctx.closePath(); ctx.fillStyle = f.data.accentColor; ctx.fill();
    } ctx.globalAlpha = 1;
  }
  if (f.data.id === "corydoras") {
    ctx.globalAlpha = 0.3;
    for (let i=0;i<12;i++) {
      const sx=-s*0.4+(i*37%11)/11*s*0.8, sy=-s*0.2+(i*23%7)/7*s*0.4, sr=s*0.025+(i%3)*s*0.01;
      ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fillStyle = f.data.accentColor; ctx.fill();
    } ctx.globalAlpha = 1;
  }
  if (f.data.id === "rainbowfish") {
    ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.35;
    const splitG = ctx.createLinearGradient(-s*0.3,0,s*0.4,0);
    splitG.addColorStop(0,"#FFaa00"); splitG.addColorStop(0.45,"#FFaa00");
    splitG.addColorStop(0.55,"#3366FF"); splitG.addColorStop(1,"#3366FF");
    ctx.fillStyle = splitG; ctx.fillRect(-s,-s,s*2,s*2); ctx.restore();
  }
  if (f.data.id === "ember") {
    ctx.save(); ctx.globalCompositeOperation = "screen";
    const embG = ctx.createRadialGradient(0,0,0,0,0,s*0.4);
    embG.addColorStop(0,"rgba(255,120,0,0.2)"); embG.addColorStop(1,"rgba(255,80,0,0)");
    ctx.fillStyle = embG; ctx.fillRect(-s,-s,s*2,s*2); ctx.restore();
  }
  if (f.data.id === "serpae") {
    ctx.save(); ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.ellipse(s*0.15,-s*0.02,s*0.1,s*0.15,0,0,Math.PI*2);
    ctx.fillStyle = "#111"; ctx.fill(); ctx.restore();
  }
  if (f.data.id === "kuhli") {
    ctx.globalAlpha = 0.45;
    for (let i=0;i<8;i++) { const bx=-s*0.5+i*s*0.15;
      ctx.beginPath(); ctx.ellipse(bx,0,s*0.03,s*0.25,0,0,Math.PI*2);
      ctx.fillStyle = f.data.accentColor; ctx.fill();
    } ctx.globalAlpha = 1;
  }

  // ---- IRIDESCENT SHIMMER ----
  const iridescentSpecies = ["neon","cardinal","rummy","ember","rainbowfish","neon_dwarf_rainbow","cpd","chili_rasbora","congo","guppy","endler","betta"];
  if (iridescentSpecies.includes(f.data.id)) {
    ctx.save(); ctx.globalCompositeOperation = "screen";
    const shimOffset = Math.sin(time*2.5+f.wobble*2)*s*0.3;
    const shimG = ctx.createRadialGradient(shimOffset,-s*0.05,0,shimOffset,-s*0.05,s*0.3);
    shimG.addColorStop(0,`rgba(${Math.min(255,rgb.r+100)},${Math.min(255,rgb.g+100)},${Math.min(255,rgb.b+100)},0.25)`);
    shimG.addColorStop(0.4,`rgba(200,240,255,0.08)`);
    shimG.addColorStop(1,"rgba(200,240,255,0)");
    ctx.fillStyle = shimG; ctx.fillRect(-s,-s,s*2,s*2); ctx.restore();
  }

  // Rim light
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.15;
  const rimG = ctx.createLinearGradient(0,-s*0.5,0,-s*0.15);
  rimG.addColorStop(0,"rgba(200,230,255,0.8)"); rimG.addColorStop(1,"rgba(200,230,255,0)");
  ctx.fillStyle = rimG; ctx.fillRect(-s,-s*0.5,s*2,s*0.4); ctx.restore();

  // Shine
  ctx.save(); ctx.globalAlpha = 0.15; ctx.beginPath();
  ctx.ellipse(s*0.08,-s*0.14,s*0.25,s*0.055,-0.2,0,Math.PI*2);
  ctx.fillStyle = "#FFF"; ctx.fill(); ctx.restore();

  ctx.restore(); // end clip

  // Body outline
  bodyPath();
  ctx.strokeStyle = `rgba(${Math.max(0,rgb.r-60)},${Math.max(0,rgb.g-60)},${Math.max(0,rgb.b-60)},0.15)`;
  ctx.lineWidth = 0.6; ctx.stroke();

  // ---- FINS ----
  if (f.data.finStyle === "flowing") {
    const dw = Math.sin(time*4+f.wobble)*s*0.1;
    ctx.beginPath(); ctx.moveTo(-s*0.3,-s*0.25);
    ctx.bezierCurveTo(-s*0.1,-s*0.9+dw,s*0.3,-s*0.8+dw,s*0.4,-s*0.2);
    ctx.lineTo(s*0.2,-s*0.2);
    ctx.bezierCurveTo(s*0.1,-s*0.5+dw*0.5,-s*0.1,-s*0.6+dw*0.5,-s*0.2,-s*0.25);
    const dfG = ctx.createLinearGradient(0,-s*0.25,0,-s*0.85);
    dfG.addColorStop(0,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.6)`);
    dfG.addColorStop(1,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.12)`);
    ctx.fillStyle = dfG; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.12;
    for (let i=0;i<6;i++) { const t=i/5; const bx=-s*0.25+t*s*0.6;
      const ey=-s*0.75+dw*(0.3+t*0.4)+Math.abs(t-0.5)*s*0.2;
      ctx.beginPath(); ctx.moveTo(bx,-s*0.25); ctx.lineTo(bx+s*0.02,ey);
      ctx.strokeStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},1)`;
      ctx.lineWidth = 0.5; ctx.stroke();
    } ctx.restore();
    ctx.beginPath(); ctx.moveTo(-s*0.1,s*0.2);
    ctx.bezierCurveTo(-s*0.3,s*0.8-dw,s*0.1,s*0.9-dw,s*0.2,s*0.2);
    const afG = ctx.createLinearGradient(0,s*0.2,0,s*0.85);
    afG.addColorStop(0,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.45)`);
    afG.addColorStop(1,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.08)`);
    ctx.fillStyle = afG; ctx.fill();
  } else if (f.data.finStyle === "angel") {
    const wave = Math.sin(time*3+f.wobble)*s*0.05;
    ctx.beginPath(); ctx.moveTo(-s*0.1,-s*0.65);
    ctx.quadraticCurveTo(s*0.05,-s*1.3+wave,s*0.15,-s*0.65);
    const adfG = ctx.createLinearGradient(0,-s*0.65,0,-s*1.3);
    adfG.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},0.45)`);
    adfG.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`);
    ctx.fillStyle = adfG; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-s*0.05,s*0.65);
    ctx.quadraticCurveTo(s*0.05,s*1.4-wave,s*0.12,s*0.65);
    const avfG = ctx.createLinearGradient(0,s*0.65,0,s*1.4);
    avfG.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`);
    avfG.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0.05)`);
    ctx.fillStyle = avfG; ctx.fill();
  } else if (f.data.finStyle === "fantail") {
    const fan = Math.sin(time*6+f.tailPhase)*0.3;
    ctx.beginPath(); ctx.moveTo(-s*0.5,0);
    ctx.bezierCurveTo(-s*0.6,-s*0.5,-s*1,-s*0.5+fan*s,-s*0.9,0);
    ctx.bezierCurveTo(-s*1,s*0.5+fan*s,-s*0.6,s*0.5,-s*0.5,0);
    const tGrad = ctx.createRadialGradient(-s*0.6,0,0,-s*0.6,0,s*0.6);
    tGrad.addColorStop(0,f.data.accentColor);
    tGrad.addColorStop(1,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.15)`);
    ctx.fillStyle = tGrad; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.1;
    for (let i=0;i<7;i++) { const a=-0.7+i*0.2+fan*0.3;
      ctx.beginPath(); ctx.moveTo(-s*0.5,0); ctx.lineTo(-s*0.5+Math.cos(a)*-s*0.5,Math.sin(a)*s*0.5);
      ctx.strokeStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},1)`; ctx.lineWidth = 0.4; ctx.stroke();
    } ctx.restore();
  } else if (f.data.finStyle !== "none") {
    ctx.beginPath(); ctx.moveTo(-s*0.15,-s*0.28);
    ctx.quadraticCurveTo(s*0.05,-s*0.55,s*0.25,-s*0.28);
    const sdfG = ctx.createLinearGradient(0,-s*0.28,0,-s*0.55);
    sdfG.addColorStop(0,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.4)`);
    sdfG.addColorStop(1,`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.1)`);
    ctx.fillStyle = sdfG; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.1;
    for (let i=0;i<4;i++) { const t=(i+0.5)/4; const bx=-s*0.15+t*s*0.4;
      ctx.beginPath(); ctx.moveTo(bx,-s*0.28); ctx.lineTo(bx+s*0.02,-s*0.48+Math.abs(t-0.5)*s*0.15);
      ctx.strokeStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},1)`; ctx.lineWidth = 0.4; ctx.stroke();
    } ctx.restore();
  }

  // Pectoral fin — flaps faster when swimming, larger stroke
  if (f.data.bodyShape !== "flat") {
    const pFinSpeed = 6 + speed * 15; // faster flap when moving
    const pFinAmp = 0.2 + speed * 0.3 + thrustBoost * 0.15; // bigger sweep during thrust
    const pFinWave = Math.sin(time * pFinSpeed + f.wobble) * pFinAmp * s;
    ctx.beginPath(); ctx.moveTo(s * 0.15, s * 0.05);
    ctx.bezierCurveTo(s * 0.2, s * 0.15 + pFinWave * 0.4, s * 0.12, s * 0.28 + pFinWave, -s * 0.02, s * 0.22 + pFinWave * 0.6);
    ctx.bezierCurveTo(s * 0.02, s * 0.12, s * 0.1, s * 0.08, s * 0.15, s * 0.05);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.22)`; ctx.fill();
    ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`; ctx.lineWidth = 0.4; ctx.stroke();
    // Fin rays
    ctx.save(); ctx.globalAlpha = 0.08;
    for (let i = 0; i < 3; i++) {
      const t = (i + 0.5) / 3;
      const rx = s * 0.15 - t * s * 0.15;
      const ry = s * 0.05 + t * (s * 0.18 + pFinWave * 0.7);
      ctx.beginPath(); ctx.moveTo(s * 0.15, s * 0.05); ctx.lineTo(rx, ry);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`; ctx.lineWidth = 0.3; ctx.stroke();
    }
    ctx.restore();
  }

  // ---- EYE ----
  const eyeX = f.data.bodyShape === "tall" ? s*0.15 : f.data.bodyShape === "disc" ? s*0.25 : s*0.35;
  const eyeY = f.data.bodyShape === "tall" ? -s*0.15 : -s*0.08;
  const eyeR = s*0.09;
  ctx.beginPath(); ctx.arc(eyeX,eyeY,eyeR+1.5,0,Math.PI*2); ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fill();
  ctx.beginPath(); ctx.arc(eyeX,eyeY,eyeR,0,Math.PI*2);
  const eyeG = ctx.createRadialGradient(eyeX-eyeR*0.2,eyeY-eyeR*0.2,0,eyeX,eyeY,eyeR);
  eyeG.addColorStop(0,"#FFFFFF"); eyeG.addColorStop(1,"#E8E0D8");
  ctx.fillStyle = eyeG; ctx.fill();
  ctx.beginPath(); ctx.arc(eyeX+eyeR*0.15,eyeY,eyeR*0.55,0,Math.PI*2); ctx.fillStyle = "#111"; ctx.fill();
  ctx.beginPath(); ctx.arc(eyeX+eyeR*0.3,eyeY-eyeR*0.2,eyeR*0.22,0,Math.PI*2); ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fill();
  ctx.beginPath(); ctx.arc(eyeX-eyeR*0.1,eyeY+eyeR*0.15,eyeR*0.08,0,Math.PI*2); ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fill();

  ctx.restore();
}
