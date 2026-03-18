// ============================================================================
// DECORATION RENDERING
// All procedural canvas drawing for hardscape, plants, and fun decorations
// ============================================================================

export function drawDecoration(ctx, dec, x, baseY, tankH, time) {
  const h = tankH * 0.25 * (dec.scale || 1);
  const s = h; // alias for readability

  // ============================================================================
  // NATURAL HARDSCAPE
  // ============================================================================

  if (dec.drawType === "driftwood") {
    ctx.save(); ctx.translate(x, baseY);
    // Main trunk — organic irregular shape with bark texture
    ctx.beginPath(); ctx.moveTo(-h * 0.55, 0);
    ctx.bezierCurveTo(-h * 0.5, -h * 0.1, -h * 0.48, -h * 0.25, -h * 0.35, -h * 0.45);
    ctx.bezierCurveTo(-h * 0.2, -h * 0.6, -h * 0.05, -h * 0.72, h * 0.1, -h * 0.78);
    ctx.bezierCurveTo(h * 0.25, -h * 0.82, h * 0.4, -h * 0.7, h * 0.35, -h * 0.5);
    ctx.bezierCurveTo(h * 0.3, -h * 0.35, h * 0.2, -h * 0.15, h * 0.25, 0);
    ctx.closePath();
    const wG = ctx.createLinearGradient(-h * 0.3, -h * 0.8, h * 0.1, 0);
    wG.addColorStop(0, "#6B5040"); wG.addColorStop(0.2, "#7B5B3A"); wG.addColorStop(0.5, "#5C4033"); wG.addColorStop(0.8, "#4A3525"); wG.addColorStop(1, "#3D2A1C");
    ctx.fillStyle = wG; ctx.fill();
    // Bark texture — fine grain lines
    ctx.strokeStyle = "rgba(0,0,0,0.07)"; ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const gy = -h * (0.08 + i * 0.07);
      ctx.beginPath();
      ctx.moveTo(-h * 0.4 + i * h * 0.04, gy);
      ctx.bezierCurveTo(-h * 0.15 + i * h * 0.02, gy - h * 0.06 + Math.sin(i * 1.3) * h * 0.02, h * 0.05 + i * h * 0.01, gy - h * 0.03, h * 0.18, gy + h * 0.01);
      ctx.stroke();
    }
    // Knot detail
    ctx.beginPath(); ctx.ellipse(-h * 0.1, -h * 0.4, h * 0.04, h * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(60,35,20,0.5)"; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5; ctx.stroke();
    // Highlight edge
    ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-h * 0.35, -h * 0.45);
    ctx.bezierCurveTo(-h * 0.15, -h * 0.65, h * 0.05, -h * 0.76, h * 0.2, -h * 0.75);
    ctx.stroke();
    // Branches
    ctx.strokeStyle = "#6B4F35"; ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, h * 0.04);
    ctx.beginPath(); ctx.moveTo(h * 0.05, -h * 0.6);
    ctx.bezierCurveTo(h * 0.2, -h * 0.85, h * 0.35, -h * 0.95, h * 0.45, -h * 0.88);
    ctx.stroke();
    ctx.lineWidth = Math.max(1.5, h * 0.025);
    ctx.beginPath(); ctx.moveTo(h * 0.25, -h * 0.9);
    ctx.quadraticCurveTo(h * 0.4, -h * 1.05, h * 0.5, -h * 0.98);
    ctx.stroke();
    // Small branch left side
    ctx.lineWidth = Math.max(1, h * 0.02);
    ctx.beginPath(); ctx.moveTo(-h * 0.3, -h * 0.35);
    ctx.quadraticCurveTo(-h * 0.5, -h * 0.5, -h * 0.55, -h * 0.42);
    ctx.stroke();
    // Roots at base
    ctx.strokeStyle = "#5C4030"; ctx.lineWidth = Math.max(1, h * 0.018);
    ctx.beginPath(); ctx.moveTo(-h * 0.5, -h * 0.05);
    ctx.quadraticCurveTo(-h * 0.65, -h * 0.08, -h * 0.72, 0);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(h * 0.2, -h * 0.03);
    ctx.quadraticCurveTo(h * 0.35, -h * 0.06, h * 0.38, 0);
    ctx.stroke();
    // Moss patches on wood (tiny green spots)
    ctx.fillStyle = "rgba(60,120,50,0.25)";
    for (let i = 0; i < 4; i++) {
      const mx = -h * 0.2 + i * h * 0.12, my = -h * (0.5 + i * 0.08);
      ctx.beginPath(); ctx.ellipse(mx, my, h * 0.03, h * 0.02, i * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    // Shadow at base
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.35, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "rock") {
    ctx.save(); ctx.translate(x, baseY);
    // Dragon Stone — layered angular rock with holes
    ctx.beginPath(); ctx.moveTo(-h * 0.4, 0);
    ctx.lineTo(-h * 0.45, -h * 0.15); ctx.lineTo(-h * 0.38, -h * 0.35);
    ctx.bezierCurveTo(-h * 0.3, -h * 0.5, -h * 0.15, -h * 0.65, h * 0.05, -h * 0.7);
    ctx.bezierCurveTo(h * 0.2, -h * 0.72, h * 0.35, -h * 0.6, h * 0.4, -h * 0.45);
    ctx.lineTo(h * 0.42, -h * 0.2); ctx.lineTo(h * 0.38, 0);
    ctx.closePath();
    const rG = ctx.createLinearGradient(0, -h * 0.7, 0, 0);
    rG.addColorStop(0, "#8B7355"); rG.addColorStop(0.3, "#7A6548"); rG.addColorStop(0.6, "#6B5A40"); rG.addColorStop(1, "#5A4A35");
    ctx.fillStyle = rG; ctx.fill();
    // Layered striations
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 0.7;
    for (let i = 0; i < 8; i++) {
      const ly = -h * (0.05 + i * 0.08);
      ctx.beginPath();
      ctx.moveTo(-h * 0.35 + i * 0.01 * h, ly);
      ctx.lineTo(h * 0.35 - i * 0.01 * h, ly + Math.sin(i * 0.8) * h * 0.02);
      ctx.stroke();
    }
    // Holes/pits (Dragon Stone characteristic)
    ctx.fillStyle = "rgba(40,30,20,0.3)";
    ctx.beginPath(); ctx.ellipse(-h * 0.1, -h * 0.35, h * 0.04, h * 0.035, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(h * 0.15, -h * 0.5, h * 0.03, h * 0.025, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(h * 0.05, -h * 0.2, h * 0.025, h * 0.02, 0, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-h * 0.35, -h * 0.38); ctx.bezierCurveTo(-h * 0.15, -h * 0.6, h * 0.1, -h * 0.68, h * 0.3, -h * 0.55); ctx.stroke();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.3, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "rock2") {
    ctx.save(); ctx.translate(x, baseY);
    // Seiryu Stone — sharp angular blue-grey with white veins
    ctx.beginPath(); ctx.moveTo(-h * 0.35, 0);
    ctx.lineTo(-h * 0.42, -h * 0.2); ctx.lineTo(-h * 0.3, -h * 0.5);
    ctx.lineTo(-h * 0.1, -h * 0.68); ctx.lineTo(h * 0.1, -h * 0.65);
    ctx.lineTo(h * 0.32, -h * 0.48); ctx.lineTo(h * 0.38, -h * 0.2); ctx.lineTo(h * 0.32, 0);
    ctx.closePath();
    const sG = ctx.createLinearGradient(0, -h * 0.7, 0, 0);
    sG.addColorStop(0, "#6B7B8A"); sG.addColorStop(0.4, "#5A6B7A"); sG.addColorStop(0.7, "#4A5B6A"); sG.addColorStop(1, "#3D4F5E");
    ctx.fillStyle = sG; ctx.fill();
    // White calcite veins (signature Seiryu)
    ctx.strokeStyle = "rgba(220,230,240,0.2)"; ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const vx = -h * 0.25 + i * h * 0.12;
      ctx.moveTo(vx, -h * 0.1 - i * h * 0.05);
      ctx.bezierCurveTo(vx + h * 0.05, -h * 0.3 - i * h * 0.04, vx - h * 0.03, -h * 0.45, vx + h * 0.02, -h * 0.55);
      ctx.stroke();
    }
    // Angular faces
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-h * 0.1, -h * 0.68); ctx.lineTo(h * 0.05, -h * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(h * 0.1, -h * 0.65); ctx.lineTo(h * 0.15, -h * 0.25); ctx.stroke();
    // Highlight
    ctx.strokeStyle = "rgba(200,220,240,0.1)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-h * 0.3, -h * 0.5); ctx.lineTo(-h * 0.1, -h * 0.68); ctx.lineTo(h * 0.1, -h * 0.65); ctx.stroke();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.28, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "cave") {
    ctx.save(); ctx.translate(x, baseY);
    // Realistic cave with depth
    ctx.beginPath(); ctx.moveTo(-h * 0.5, 0);
    ctx.bezierCurveTo(-h * 0.55, -h * 0.2, -h * 0.45, -h * 0.55, -h * 0.2, -h * 0.65);
    ctx.bezierCurveTo(0, -h * 0.72, h * 0.25, -h * 0.62, h * 0.4, -h * 0.45);
    ctx.bezierCurveTo(h * 0.5, -h * 0.3, h * 0.48, -h * 0.1, h * 0.45, 0);
    ctx.closePath();
    const cG = ctx.createLinearGradient(0, -h * 0.7, 0, 0);
    cG.addColorStop(0, "#6B6055"); cG.addColorStop(0.5, "#5A504A"); cG.addColorStop(1, "#4A4038");
    ctx.fillStyle = cG; ctx.fill();
    // Stone texture
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.arc(-h * 0.15 + i * h * 0.1, -h * (0.3 + Math.sin(i) * 0.1), h * 0.04, 0, Math.PI * 2); ctx.stroke();
    }
    // Cave opening — dark interior with depth gradient
    ctx.beginPath(); ctx.moveTo(-h * 0.25, 0);
    ctx.bezierCurveTo(-h * 0.22, -h * 0.15, -h * 0.1, -h * 0.22, h * 0.08, -h * 0.2);
    ctx.bezierCurveTo(h * 0.2, -h * 0.18, h * 0.25, -h * 0.08, h * 0.22, 0);
    ctx.closePath();
    const cavG = ctx.createRadialGradient(0, -h * 0.08, 0, 0, -h * 0.08, h * 0.2);
    cavG.addColorStop(0, "rgba(10,8,5,0.9)"); cavG.addColorStop(0.6, "rgba(25,20,15,0.7)"); cavG.addColorStop(1, "rgba(50,40,30,0.4)");
    ctx.fillStyle = cavG; ctx.fill();
    // Stalactite inside cave
    ctx.fillStyle = "rgba(80,70,60,0.5)";
    ctx.beginPath(); ctx.moveTo(-h * 0.05, -h * 0.2); ctx.lineTo(-h * 0.03, -h * 0.1); ctx.lineTo(-h * 0.07, -h * 0.1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(h * 0.1, -h * 0.18); ctx.lineTo(h * 0.12, -h * 0.1); ctx.lineTo(h * 0.08, -h * 0.1); ctx.fill();
    // Highlight on rim
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-h * 0.4, -h * 0.4); ctx.bezierCurveTo(-h * 0.15, -h * 0.62, h * 0.1, -h * 0.58, h * 0.3, -h * 0.4); ctx.stroke();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.35, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "coconut") {
    ctx.save(); ctx.translate(x, baseY);
    const r = h * 0.3;
    // Shell — half coconut with fiber texture
    ctx.beginPath(); ctx.arc(0, -r * 0.5, r, Math.PI * 0.1, Math.PI * 0.9); ctx.closePath();
    const coG = ctx.createRadialGradient(0, -r * 0.6, r * 0.1, 0, -r * 0.5, r);
    coG.addColorStop(0, "#5C4030"); coG.addColorStop(0.5, "#4A3020"); coG.addColorStop(1, "#3A2515");
    ctx.fillStyle = coG; ctx.fill();
    // Fiber texture
    ctx.strokeStyle = "rgba(80,60,40,0.3)"; ctx.lineWidth = 0.4;
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * 0.15 + i * Math.PI * 0.09;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.3, -r * 0.5 + Math.sin(a) * r * 0.3);
      ctx.lineTo(Math.cos(a) * r * 0.9, -r * 0.5 + Math.sin(a) * r * 0.9); ctx.stroke();
    }
    // Opening
    ctx.beginPath(); ctx.ellipse(0, -r * 0.15, r * 0.5, r * 0.15, 0, 0, Math.PI);
    ctx.fillStyle = "rgba(15,10,5,0.8)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "slate") {
    ctx.save(); ctx.translate(x, baseY);
    // Stacked slate pieces
    for (let i = 0; i < 4; i++) {
      const sy = -i * h * 0.15;
      const sw = h * (0.5 - i * 0.06);
      const sh = h * 0.08;
      const offset = (i % 2 === 0 ? 1 : -1) * h * 0.03;
      ctx.beginPath();
      ctx.moveTo(-sw + offset, sy); ctx.lineTo(-sw * 0.9 + offset, sy - sh);
      ctx.lineTo(sw * 0.9 + offset, sy - sh); ctx.lineTo(sw + offset, sy); ctx.closePath();
      const sG = ctx.createLinearGradient(0, sy - sh, 0, sy);
      sG.addColorStop(0, i % 2 === 0 ? "#5A5A5E" : "#4E4E55"); sG.addColorStop(1, i % 2 === 0 ? "#46464D" : "#3E3E45");
      ctx.fillStyle = sG; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-sw * 0.9 + offset, sy - sh); ctx.lineTo(sw * 0.9 + offset, sy - sh); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.32, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "branch") {
    ctx.save(); ctx.translate(x, baseY);
    // Spider wood — thin spidery branches
    ctx.strokeStyle = "#6B4F35"; ctx.lineCap = "round";
    const branches = [
      { x1: 0, y1: 0, x2: -h*0.3, y2: -h*0.5, cx: -h*0.15, cy: -h*0.3, w: h*0.04 },
      { x1: 0, y1: 0, x2: h*0.4, y2: -h*0.7, cx: h*0.2, cy: -h*0.4, w: h*0.05 },
      { x1: 0, y1: 0, x2: -h*0.5, y2: -h*0.3, cx: -h*0.25, cy: -h*0.2, w: h*0.035 },
      { x1: h*0.2, y1: -h*0.4, x2: h*0.55, y2: -h*0.85, cx: h*0.4, cy: -h*0.65, w: h*0.025 },
      { x1: -h*0.15, y1: -h*0.3, x2: -h*0.45, y2: -h*0.65, cx: -h*0.35, cy: -h*0.5, w: h*0.02 },
      { x1: h*0.3, y1: -h*0.55, x2: h*0.15, y2: -h*0.9, cx: h*0.25, cy: -h*0.75, w: h*0.018 },
    ];
    branches.forEach(b => {
      ctx.lineWidth = Math.max(1, b.w);
      ctx.beginPath(); ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo(b.cx, b.cy, b.x2, b.y2); ctx.stroke();
    });
    // Bark texture on main trunk
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.4;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-h * 0.02, -i * h * 0.08);
      ctx.lineTo(h * 0.02, -i * h * 0.08 - h * 0.03); ctx.stroke();
    }
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.25, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "bonsai") {
    ctx.save(); ctx.translate(x, baseY);
    // Trunk
    ctx.beginPath(); ctx.moveTo(-h * 0.06, 0);
    ctx.bezierCurveTo(-h * 0.08, -h * 0.2, -h * 0.04, -h * 0.4, h * 0.02, -h * 0.55);
    ctx.bezierCurveTo(h * 0.06, -h * 0.6, h * 0.1, -h * 0.55, h * 0.08, -h * 0.45);
    ctx.bezierCurveTo(h * 0.06, -h * 0.35, h * 0.1, -h * 0.2, h * 0.06, 0);
    ctx.closePath();
    ctx.fillStyle = "#5C4030"; ctx.fill();
    // Canopy — lush moss ball
    const canR = h * 0.28;
    const canY = -h * 0.65;
    const canG = ctx.createRadialGradient(0, canY - canR * 0.2, canR * 0.1, 0, canY, canR);
    canG.addColorStop(0, "#4CAF50"); canG.addColorStop(0.4, "#388E3C"); canG.addColorStop(0.8, "#2E7D32"); canG.addColorStop(1, "#1B5E20");
    ctx.beginPath(); ctx.arc(0, canY, canR, 0, Math.PI * 2); ctx.fillStyle = canG; ctx.fill();
    // Leaf texture bumps
    ctx.fillStyle = "rgba(100,180,80,0.3)";
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI * 0.2 + Math.sin(i * 1.7) * 0.3;
      const d = canR * (0.7 + Math.sin(i * 2.3) * 0.25);
      ctx.beginPath(); ctx.arc(Math.cos(a) * d, canY + Math.sin(a) * d, canR * 0.1, 0, Math.PI * 2); ctx.fill();
    }
    // Roots
    ctx.strokeStyle = "#5C4030"; ctx.lineWidth = Math.max(1, h * 0.015); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-h * 0.04, -h * 0.02); ctx.quadraticCurveTo(-h * 0.15, 0, -h * 0.2, h * 0.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(h * 0.04, -h * 0.02); ctx.quadraticCurveTo(h * 0.12, 0, h * 0.18, h * 0.02); ctx.stroke();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.2, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "arch") {
    ctx.save(); ctx.translate(x, baseY);
    const aw = h * 0.5, ah = h * 0.7;
    // Pillars
    const pilW = h * 0.1;
    const pilG = ctx.createLinearGradient(0, -ah, 0, 0);
    pilG.addColorStop(0, "#7A6B5A"); pilG.addColorStop(1, "#5A4B3A");
    ctx.fillStyle = pilG;
    ctx.fillRect(-aw - pilW / 2, -ah * 0.85, pilW, ah * 0.85);
    ctx.fillRect(aw - pilW / 2, -ah * 0.85, pilW, ah * 0.85);
    // Arch top
    ctx.beginPath(); ctx.moveTo(-aw - pilW / 2, -ah * 0.85);
    ctx.quadraticCurveTo(0, -ah * 1.15, aw + pilW / 2, -ah * 0.85);
    ctx.lineTo(aw - pilW / 2, -ah * 0.85);
    ctx.quadraticCurveTo(0, -ah * 0.95, -aw + pilW / 2, -ah * 0.85);
    ctx.closePath();
    ctx.fillStyle = pilG; ctx.fill();
    // Stone texture
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const ly = -i * ah * 0.2;
      ctx.beginPath(); ctx.moveTo(-aw, ly); ctx.lineTo(-aw + pilW, ly); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(aw - pilW, ly); ctx.lineTo(aw, ly); ctx.stroke();
    }
    // Highlight
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-aw - pilW / 2, -ah * 0.85);
    ctx.quadraticCurveTo(0, -ah * 1.15, aw + pilW / 2, -ah * 0.85); ctx.stroke();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, aw * 0.8, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "stump") {
    ctx.save(); ctx.translate(x, baseY);
    // Tree stump with rings
    ctx.beginPath(); ctx.moveTo(-h * 0.25, 0);
    ctx.bezierCurveTo(-h * 0.28, -h * 0.15, -h * 0.22, -h * 0.35, -h * 0.18, -h * 0.4);
    ctx.bezierCurveTo(-h * 0.1, -h * 0.42, h * 0.1, -h * 0.42, h * 0.18, -h * 0.4);
    ctx.bezierCurveTo(h * 0.22, -h * 0.35, h * 0.28, -h * 0.15, h * 0.25, 0);
    ctx.closePath();
    const stG = ctx.createLinearGradient(0, -h * 0.42, 0, 0);
    stG.addColorStop(0, "#6B5040"); stG.addColorStop(1, "#4A3525");
    ctx.fillStyle = stG; ctx.fill();
    // Top face with rings
    ctx.beginPath(); ctx.ellipse(0, -h * 0.4, h * 0.18, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#7B6550"; ctx.fill();
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.ellipse(0, -h * 0.4, h * 0.18 * (1 - i * 0.2), h * 0.06 * (1 - i * 0.2), 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(90,70,50,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
    // Bark texture
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.4;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-h * 0.22, -i * h * 0.08);
      ctx.lineTo(-h * 0.18, -i * h * 0.08 - h * 0.04); ctx.stroke();
    }
    ctx.restore();

  } else if (dec.drawType === "bamboo") {
    ctx.save(); ctx.translate(x, baseY);
    // 3 bamboo canes
    for (let b = 0; b < 3; b++) {
      const bx = -h * 0.12 + b * h * 0.12;
      const bh = h * (0.75 + b * 0.1);
      const bw = h * 0.035;
      // Cane
      const bG = ctx.createLinearGradient(bx - bw, 0, bx + bw, 0);
      bG.addColorStop(0, "#5D7A3A"); bG.addColorStop(0.3, "#7DA050"); bG.addColorStop(0.7, "#6B8E40"); bG.addColorStop(1, "#4A6A2A");
      ctx.fillStyle = bG;
      ctx.fillRect(bx - bw, -bh, bw * 2, bh);
      // Nodes
      for (let n = 1; n < 5; n++) {
        const ny = -n * bh * 0.2;
        ctx.fillStyle = "#4A6A2A";
        ctx.fillRect(bx - bw * 1.3, ny - 1, bw * 2.6, 2.5);
      }
      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(bx - bw * 0.3, -bh, bw * 0.5, bh);
    }
    ctx.restore();

  } else if (dec.drawType === "terracotta") {
    ctx.save(); ctx.translate(x, baseY);
    const pw = h * 0.25, ph = h * 0.35;
    // Pot body
    ctx.beginPath(); ctx.moveTo(-pw, 0); ctx.lineTo(-pw * 0.7, -ph);
    ctx.lineTo(pw * 0.7, -ph); ctx.lineTo(pw, 0); ctx.closePath();
    const tG = ctx.createLinearGradient(-pw, 0, pw, 0);
    tG.addColorStop(0, "#A0522D"); tG.addColorStop(0.3, "#CD853F"); tG.addColorStop(0.7, "#B8702F"); tG.addColorStop(1, "#8B4513");
    ctx.fillStyle = tG; ctx.fill();
    // Rim
    ctx.fillStyle = "#B8702F";
    ctx.fillRect(-pw * 0.75, -ph - h * 0.03, pw * 1.5, h * 0.05);
    // Opening shadow
    ctx.beginPath(); ctx.ellipse(0, -ph, pw * 0.55, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15,10,5,0.6)"; ctx.fill();
    // Terracotta texture lines
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.4;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-pw + pw * 0.1 * i, -i * ph * 0.3);
      ctx.lineTo(pw - pw * 0.1 * i, -i * ph * 0.3); ctx.stroke(); }
    ctx.restore();

  } else if (dec.drawType === "reef_rock") {
    ctx.save(); ctx.translate(x, baseY);
    // Porous live rock
    ctx.beginPath(); ctx.moveTo(-h * 0.4, 0);
    ctx.bezierCurveTo(-h * 0.45, -h * 0.15, -h * 0.35, -h * 0.4, -h * 0.15, -h * 0.55);
    ctx.bezierCurveTo(0, -h * 0.6, h * 0.2, -h * 0.55, h * 0.35, -h * 0.4);
    ctx.bezierCurveTo(h * 0.42, -h * 0.25, h * 0.4, -h * 0.1, h * 0.38, 0);
    ctx.closePath();
    const rrG = ctx.createLinearGradient(0, -h * 0.6, 0, 0);
    rrG.addColorStop(0, "#B8A090"); rrG.addColorStop(0.3, "#A89080"); rrG.addColorStop(0.6, "#D4B8A0"); rrG.addColorStop(1, "#8A7A6A");
    ctx.fillStyle = rrG; ctx.fill();
    // Pores and holes (live rock characteristic)
    ctx.fillStyle = "rgba(60,45,35,0.3)";
    for (let i = 0; i < 12; i++) {
      const px = -h * 0.25 + Math.sin(i * 2.7) * h * 0.25;
      const py = -h * 0.15 - Math.cos(i * 1.9) * h * 0.2;
      ctx.beginPath(); ctx.arc(px, py, h * (0.01 + Math.sin(i) * 0.01), 0, Math.PI * 2); ctx.fill();
    }
    // Coralline algae patches (pink/purple)
    ctx.fillStyle = "rgba(180,120,160,0.2)";
    ctx.beginPath(); ctx.ellipse(-h * 0.1, -h * 0.35, h * 0.06, h * 0.04, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(160,100,140,0.15)";
    ctx.beginPath(); ctx.ellipse(h * 0.15, -h * 0.25, h * 0.05, h * 0.03, -0.3, 0, Math.PI * 2); ctx.fill();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.3, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
    ctx.restore();

  // ============================================================================
  // CLASSIC / FUN DECORATIONS
  // ============================================================================

  } else if (dec.drawType === "treasure") {
    ctx.save(); ctx.translate(x, baseY);
    const tw = h * 0.35, th = h * 0.25;
    // Chest body
    ctx.beginPath(); ctx.rect(-tw, -th, tw * 2, th); ctx.closePath();
    const trG = ctx.createLinearGradient(0, -th, 0, 0);
    trG.addColorStop(0, "#8B6914"); trG.addColorStop(0.5, "#6B4F0E"); trG.addColorStop(1, "#4A3508");
    ctx.fillStyle = trG; ctx.fill();
    // Lid — slightly open
    ctx.beginPath(); ctx.moveTo(-tw, -th); ctx.bezierCurveTo(-tw * 0.5, -th * 1.6, tw * 0.5, -th * 1.6, tw, -th); ctx.closePath();
    ctx.fillStyle = "#7A5A10"; ctx.fill();
    // Metal bands
    ctx.strokeStyle = "#DAA520"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rect(-tw, -th * 0.6, tw * 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.rect(-tw, -th * 0.2, tw * 2, 0); ctx.stroke();
    // Lock
    ctx.fillStyle = "#DAA520";
    ctx.beginPath(); ctx.arc(0, -th * 0.4, h * 0.03, 0, Math.PI * 2); ctx.fill();
    // Gold glow from inside (animated)
    const glowA = 0.15 + Math.sin(time * 3) * 0.08;
    const goldG = ctx.createRadialGradient(0, -th * 0.9, 0, 0, -th * 0.9, tw * 0.5);
    goldG.addColorStop(0, `rgba(255,215,0,${glowA})`); goldG.addColorStop(1, "rgba(255,215,0,0)");
    ctx.fillStyle = goldG; ctx.fillRect(-tw, -th * 1.4, tw * 2, th * 0.5);
    // Coins spilling out
    ctx.fillStyle = "#FFD700";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.ellipse(-tw * 0.3 + i * tw * 0.2, -th * 0.05 + Math.abs(i - 1.5) * 0.02 * th, h * 0.025, h * 0.015, i * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

  } else if (dec.drawType === "ship") {
    ctx.save(); ctx.translate(x, baseY);
    const sw = h * 0.6, sh = h * 0.55;
    // Hull
    ctx.beginPath(); ctx.moveTo(-sw, 0); ctx.lineTo(-sw * 0.8, -sh * 0.4);
    ctx.lineTo(sw * 0.7, -sh * 0.35); ctx.lineTo(sw * 0.9, 0); ctx.closePath();
    const shG = ctx.createLinearGradient(0, -sh * 0.4, 0, 0);
    shG.addColorStop(0, "#5C4033"); shG.addColorStop(0.5, "#4A3525"); shG.addColorStop(1, "#3A2818");
    ctx.fillStyle = shG; ctx.fill();
    // Planks
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-sw * 0.7, -sh * 0.1 * i);
      ctx.lineTo(sw * 0.8, -sh * 0.08 * i); ctx.stroke(); }
    // Broken mast
    ctx.strokeStyle = "#6B5040"; ctx.lineWidth = Math.max(2, h * 0.03); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -sh * 0.35); ctx.lineTo(-h * 0.05, -sh * 0.95); ctx.stroke();
    // Tattered sail
    ctx.fillStyle = "rgba(200,190,170,0.3)";
    ctx.beginPath(); ctx.moveTo(-h * 0.04, -sh * 0.9);
    ctx.quadraticCurveTo(h * 0.15, -sh * 0.75 + Math.sin(time * 2) * h * 0.02, h * 0.1, -sh * 0.55);
    ctx.lineTo(-h * 0.03, -sh * 0.6); ctx.closePath(); ctx.fill();
    // Porthole
    ctx.beginPath(); ctx.arc(-sw * 0.3, -sh * 0.2, h * 0.025, 0, Math.PI * 2);
    ctx.strokeStyle = "#8B7355"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "rgba(10,20,40,0.4)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "skull") {
    ctx.save(); ctx.translate(x, baseY);
    // Skull shape
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, 0); ctx.bezierCurveTo(-s * 0.28, -s * 0.15, -s * 0.3, -s * 0.4, -s * 0.22, -s * 0.55);
    ctx.bezierCurveTo(-s * 0.15, -s * 0.65, s * 0.15, -s * 0.65, s * 0.22, -s * 0.55);
    ctx.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.28, -s * 0.15, s * 0.2, 0); ctx.closePath();
    const skG = ctx.createRadialGradient(0, -s * 0.35, 0, 0, -s * 0.35, s * 0.3);
    skG.addColorStop(0, "#E8DDD0"); skG.addColorStop(0.5, "#D4C8B8"); skG.addColorStop(1, "#B8A898");
    ctx.fillStyle = skG; ctx.fill();
    // Eye sockets
    ctx.fillStyle = "rgba(20,15,10,0.7)";
    ctx.beginPath(); ctx.ellipse(-s * 0.09, -s * 0.42, s * 0.055, s * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.09, -s * 0.42, s * 0.055, s * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.beginPath(); ctx.moveTo(0, -s * 0.32); ctx.lineTo(-s * 0.03, -s * 0.26); ctx.lineTo(s * 0.03, -s * 0.26); ctx.closePath();
    ctx.fillStyle = "rgba(20,15,10,0.5)"; ctx.fill();
    // Teeth
    ctx.fillStyle = "#D4C8B8"; ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.3;
    for (let i = 0; i < 5; i++) {
      const tx = -s * 0.08 + i * s * 0.04;
      ctx.beginPath(); ctx.rect(tx, -s * 0.22, s * 0.03, s * 0.04); ctx.fill(); ctx.stroke();
    }
    // Cracks
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-s * 0.05, -s * 0.55);
    ctx.bezierCurveTo(-s * 0.08, -s * 0.48, -s * 0.12, -s * 0.4, -s * 0.1, -s * 0.35); ctx.stroke();
    ctx.restore();

  } else if (dec.drawType === "castle") {
    ctx.save(); ctx.translate(x, baseY);
    const cw = h * 0.45, ch = h * 0.8;
    // Main tower
    const castG = ctx.createLinearGradient(0, -ch, 0, 0);
    castG.addColorStop(0, "#7A7570"); castG.addColorStop(0.5, "#6A6560"); castG.addColorStop(1, "#555050");
    ctx.fillStyle = castG;
    ctx.fillRect(-cw * 0.3, -ch, cw * 0.6, ch);
    // Side towers
    ctx.fillRect(-cw, -ch * 0.7, cw * 0.25, ch * 0.7);
    ctx.fillRect(cw * 0.75, -ch * 0.7, cw * 0.25, ch * 0.7);
    // Battlements
    ctx.fillStyle = "#6A6560";
    for (let i = 0; i < 4; i++) { ctx.fillRect(-cw * 0.25 + i * cw * 0.15, -ch - h * 0.06, cw * 0.1, h * 0.06); }
    for (let i = 0; i < 2; i++) { ctx.fillRect(-cw + i * cw * 0.12, -ch * 0.7 - h * 0.04, cw * 0.08, h * 0.04); }
    for (let i = 0; i < 2; i++) { ctx.fillRect(cw * 0.77 + i * cw * 0.12, -ch * 0.7 - h * 0.04, cw * 0.08, h * 0.04); }
    // Stone texture
    ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth = 0.4;
    for (let iy = 0; iy < 10; iy++) { for (let ix = 0; ix < 4; ix++) {
      const bx = -cw * 0.25 + ix * cw * 0.15 + (iy % 2) * cw * 0.07;
      const by = -ch + iy * ch * 0.1;
      ctx.strokeRect(bx, by, cw * 0.14, ch * 0.09);
    }}
    // Gate
    ctx.beginPath(); ctx.moveTo(-cw * 0.1, 0); ctx.lineTo(-cw * 0.1, -ch * 0.2);
    ctx.arc(0, -ch * 0.2, cw * 0.1, Math.PI, 0); ctx.lineTo(cw * 0.1, 0); ctx.closePath();
    ctx.fillStyle = "rgba(15,10,8,0.7)"; ctx.fill();
    // Window with glow
    const winGlow = 0.2 + Math.sin(time * 2.5) * 0.1;
    ctx.fillStyle = `rgba(255,200,100,${winGlow})`;
    ctx.beginPath(); ctx.arc(0, -ch * 0.55, h * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-cw * 0.88, -ch * 0.45, h * 0.02, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "column") {
    ctx.save(); ctx.translate(x, baseY);
    const cw = h * 0.1, ch = h * 0.7;
    // Base
    ctx.fillStyle = "#ADA8A0";
    ctx.fillRect(-cw * 1.5, -h * 0.05, cw * 3, h * 0.05);
    // Shaft with fluting
    const colG = ctx.createLinearGradient(-cw, 0, cw, 0);
    colG.addColorStop(0, "#B0AAA0"); colG.addColorStop(0.3, "#D0CAC0"); colG.addColorStop(0.5, "#C8C2B8"); colG.addColorStop(0.7, "#D0CAC0"); colG.addColorStop(1, "#A8A298");
    ctx.fillStyle = colG;
    ctx.fillRect(-cw, -ch, cw * 2, ch - h * 0.05);
    // Fluting (vertical grooves)
    ctx.strokeStyle = "rgba(0,0,0,0.04)"; ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const fx = -cw + i * cw * 0.5;
      ctx.beginPath(); ctx.moveTo(fx, -ch); ctx.lineTo(fx, -h * 0.05); ctx.stroke();
    }
    // Capital
    ctx.fillStyle = "#C0BAB0";
    ctx.fillRect(-cw * 1.3, -ch - h * 0.04, cw * 2.6, h * 0.04);
    ctx.fillRect(-cw * 1.6, -ch - h * 0.07, cw * 3.2, h * 0.03);
    // Cracks (ruined)
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cw * 0.3, -ch * 0.6);
    ctx.bezierCurveTo(cw * 0.5, -ch * 0.5, cw * 0.2, -ch * 0.35, cw * 0.4, -ch * 0.2); ctx.stroke();
    ctx.restore();

  } else if (dec.drawType === "bridge") {
    ctx.save(); ctx.translate(x, baseY);
    const bw = h * 0.55, bh = h * 0.4;
    // Arch
    ctx.beginPath(); ctx.moveTo(-bw, 0);
    ctx.lineTo(-bw, -bh * 0.5); ctx.quadraticCurveTo(0, -bh * 1.2, bw, -bh * 0.5);
    ctx.lineTo(bw, 0); ctx.lineTo(bw * 0.85, 0);
    ctx.lineTo(bw * 0.85, -bh * 0.4); ctx.quadraticCurveTo(0, -bh * 0.9, -bw * 0.85, -bh * 0.4);
    ctx.lineTo(-bw * 0.85, 0); ctx.closePath();
    const brG = ctx.createLinearGradient(0, -bh, 0, 0);
    brG.addColorStop(0, "#8A7A6A"); brG.addColorStop(1, "#6A5A4A");
    ctx.fillStyle = brG; ctx.fill();
    // Stone blocks
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 0.4;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.8 + i * Math.PI * 0.2;
      const r1 = bw * 0.85, r2 = bw;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, -bh * 0.4 + Math.sin(a) * bh * 0.45);
      ctx.lineTo(Math.cos(a) * r2, -bh * 0.5 + Math.sin(a) * bh * 0.55); ctx.stroke();
    }
    // Railing
    ctx.strokeStyle = "#7A6A5A"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-bw, -bh * 0.55);
    ctx.quadraticCurveTo(0, -bh * 1.25, bw, -bh * 0.55); ctx.stroke();
    ctx.restore();

  } else if (dec.drawType === "volcano") {
    ctx.save(); ctx.translate(x, baseY);
    const vw = h * 0.45, vh = h * 0.6;
    // Mountain
    ctx.beginPath(); ctx.moveTo(-vw, 0);
    ctx.lineTo(-vw * 0.2, -vh); ctx.lineTo(vw * 0.2, -vh); ctx.lineTo(vw, 0); ctx.closePath();
    const volG = ctx.createLinearGradient(0, -vh, 0, 0);
    volG.addColorStop(0, "#4A4040"); volG.addColorStop(0.3, "#5A4A3A"); volG.addColorStop(0.7, "#4A3A30"); volG.addColorStop(1, "#3A2A20");
    ctx.fillStyle = volG; ctx.fill();
    // Lava texture streaks
    ctx.strokeStyle = "rgba(200,80,20,0.15)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-vw * 0.1, -vh); ctx.bezierCurveTo(-vw * 0.3, -vh * 0.6, -vw * 0.2, -vh * 0.3, -vw * 0.5, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vw * 0.1, -vh); ctx.bezierCurveTo(vw * 0.2, -vh * 0.5, vw * 0.35, -vh * 0.3, vw * 0.4, 0); ctx.stroke();
    // Crater
    ctx.beginPath(); ctx.ellipse(0, -vh, vw * 0.2, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(30,15,10,0.7)"; ctx.fill();
    // Animated glow from crater
    const lavaGlow = 0.2 + Math.sin(time * 3) * 0.12;
    const lG = ctx.createRadialGradient(0, -vh, 0, 0, -vh, vw * 0.25);
    lG.addColorStop(0, `rgba(255,100,20,${lavaGlow})`); lG.addColorStop(0.5, `rgba(255,60,10,${lavaGlow * 0.4})`); lG.addColorStop(1, "rgba(200,40,0,0)");
    ctx.fillStyle = lG; ctx.fillRect(-vw * 0.3, -vh - h * 0.1, vw * 0.6, h * 0.15);
    ctx.restore();

  } else if (dec.drawType === "diver") {
    ctx.save(); ctx.translate(x, baseY);
    // Body
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.ellipse(0, -s * 0.4, s * 0.12, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    // Helmet
    const helG = ctx.createRadialGradient(0, -s * 0.65, 0, 0, -s * 0.65, s * 0.1);
    helG.addColorStop(0, "#DAA520"); helG.addColorStop(1, "#B8860B");
    ctx.beginPath(); ctx.arc(0, -s * 0.65, s * 0.1, 0, Math.PI * 2); ctx.fillStyle = helG; ctx.fill();
    // Visor
    ctx.beginPath(); ctx.arc(s * 0.02, -s * 0.65, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,180,255,0.4)"; ctx.fill();
    // Legs with sway
    const legSway = Math.sin(time * 2) * 0.1;
    ctx.strokeStyle = "#222"; ctx.lineWidth = Math.max(1.5, s * 0.04); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-s * 0.05, -s * 0.2); ctx.lineTo(-s * 0.08, -s * 0.02 + legSway * 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.05, -s * 0.2); ctx.lineTo(s * 0.08, -s * 0.02 - legSway * 5); ctx.stroke();
    // Arms
    ctx.beginPath(); ctx.moveTo(-s * 0.12, -s * 0.45); ctx.lineTo(-s * 0.2, -s * 0.3 + Math.sin(time * 1.5) * 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.12, -s * 0.45); ctx.lineTo(s * 0.2, -s * 0.35 - Math.sin(time * 1.5) * 3); ctx.stroke();
    // Bubbles from helmet
    for (let i = 0; i < 3; i++) {
      const by = -s * 0.75 - i * s * 0.08 - Math.abs(Math.sin(time * 2 + i)) * s * 0.1;
      const bx = s * 0.02 + Math.sin(time * 3 + i * 2) * s * 0.03;
      const br = s * 0.012 + i * s * 0.005;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,220,255,${0.3 - i * 0.08})`; ctx.fill();
    }
    ctx.restore();

  } else if (dec.drawType === "sign") {
    ctx.save(); ctx.translate(x, baseY);
    // Post
    ctx.fillStyle = "#6B5040";
    ctx.fillRect(-h * 0.02, -h * 0.5, h * 0.04, h * 0.5);
    // Sign board
    ctx.fillStyle = "#E8DDD0";
    ctx.beginPath(); ctx.roundRect(-h * 0.18, -h * 0.65, h * 0.36, h * 0.18, 3); ctx.fill();
    ctx.strokeStyle = "#C8B8A0"; ctx.lineWidth = 1; ctx.stroke();
    // No fishing icon
    ctx.strokeStyle = "#CC3333"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -h * 0.56, h * 0.06, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-h * 0.04, -h * 0.52); ctx.lineTo(h * 0.04, -h * 0.6); ctx.stroke();
    ctx.restore();

  } else if (dec.drawType === "toilet") {
    ctx.save(); ctx.translate(x, baseY);
    // Bowl
    ctx.beginPath(); ctx.ellipse(0, -s * 0.15, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#F0EDE8"; ctx.fill();
    ctx.strokeStyle = "#D0D0D0"; ctx.lineWidth = 0.5; ctx.stroke();
    // Tank
    ctx.fillStyle = "#F0EDE8";
    ctx.fillRect(-s * 0.08, -s * 0.4, s * 0.16, s * 0.2);
    ctx.strokeStyle = "#D0D0D0"; ctx.lineWidth = 0.5;
    ctx.strokeRect(-s * 0.08, -s * 0.4, s * 0.16, s * 0.2);
    // Water inside
    ctx.beginPath(); ctx.ellipse(0, -s * 0.12, s * 0.1, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,180,255,0.3)"; ctx.fill();
    // Flush handle
    ctx.strokeStyle = "#C0C0C0"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(s * 0.08, -s * 0.35); ctx.lineTo(s * 0.14, -s * 0.35); ctx.stroke();
    ctx.restore();

  } else if (dec.drawType === "duck") {
    ctx.save(); ctx.translate(x, baseY);
    // Rubber duck — floats at top, animated bob
    const bob = Math.sin(time * 2.5) * s * 0.02;
    ctx.translate(0, bob);
    // Body
    ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.18, s * 0.15, 0, 0, Math.PI * 2);
    const dG = ctx.createRadialGradient(-s * 0.04, -s * 0.25, 0, 0, -s * 0.2, s * 0.18);
    dG.addColorStop(0, "#FFE44D"); dG.addColorStop(1, "#FFCC00");
    ctx.fillStyle = dG; ctx.fill();
    // Head
    ctx.beginPath(); ctx.arc(-s * 0.12, -s * 0.35, s * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700"; ctx.fill();
    // Beak
    ctx.beginPath(); ctx.moveTo(-s * 0.21, -s * 0.35);
    ctx.lineTo(-s * 0.28, -s * 0.33); ctx.lineTo(-s * 0.21, -s * 0.31);
    ctx.fillStyle = "#FF8C00"; ctx.fill();
    // Eye
    ctx.beginPath(); ctx.arc(-s * 0.14, -s * 0.37, s * 0.015, 0, Math.PI * 2);
    ctx.fillStyle = "#111"; ctx.fill();
    // Highlight
    ctx.beginPath(); ctx.arc(-s * 0.05, -s * 0.28, s * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "pineapple") {
    ctx.save(); ctx.translate(x, baseY);
    // SpongeBob's house
    const pw = s * 0.22, ph = s * 0.55;
    // Pineapple body
    ctx.beginPath();
    ctx.moveTo(-pw, 0); ctx.bezierCurveTo(-pw * 1.1, -ph * 0.3, -pw * 1.05, -ph * 0.7, 0, -ph);
    ctx.bezierCurveTo(pw * 1.05, -ph * 0.7, pw * 1.1, -ph * 0.3, pw, 0); ctx.closePath();
    const pG = ctx.createRadialGradient(0, -ph * 0.5, 0, 0, -ph * 0.5, ph * 0.5);
    pG.addColorStop(0, "#FFA500"); pG.addColorStop(0.6, "#E89000"); pG.addColorStop(1, "#CC7700");
    ctx.fillStyle = pG; ctx.fill();
    // Diamond pattern
    ctx.strokeStyle = "rgba(180,100,0,0.25)"; ctx.lineWidth = 0.5;
    for (let iy = 0; iy < 6; iy++) { for (let ix = 0; ix < 4; ix++) {
      const dx = -pw * 0.6 + ix * pw * 0.4 + (iy % 2) * pw * 0.2;
      const dy = -ph * 0.15 - iy * ph * 0.12;
      ctx.beginPath(); ctx.moveTo(dx, dy - ph * 0.05); ctx.lineTo(dx + pw * 0.1, dy);
      ctx.lineTo(dx, dy + ph * 0.05); ctx.lineTo(dx - pw * 0.1, dy); ctx.closePath(); ctx.stroke();
    }}
    // Leaves on top
    ctx.fillStyle = "#2E8B2E";
    for (let i = 0; i < 5; i++) {
      const la = -0.4 + i * 0.2 + Math.sin(time * 1.5 + i) * 0.04;
      ctx.save(); ctx.translate(0, -ph); ctx.rotate(la);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(pw * 0.2, -ph * 0.25, 0, -ph * 0.3);
      ctx.quadraticCurveTo(-pw * 0.15, -ph * 0.25, 0, 0); ctx.fill();
      ctx.restore();
    }
    // Door
    ctx.fillStyle = "rgba(60,40,20,0.6)";
    ctx.beginPath(); ctx.moveTo(-pw * 0.2, 0); ctx.lineTo(-pw * 0.2, -ph * 0.2);
    ctx.arc(0, -ph * 0.2, pw * 0.2, Math.PI, 0); ctx.lineTo(pw * 0.2, 0); ctx.closePath(); ctx.fill();
    // Window with glow
    const wGlow = 0.25 + Math.sin(time * 2) * 0.1;
    ctx.fillStyle = `rgba(255,220,100,${wGlow})`;
    ctx.beginPath(); ctx.arc(pw * 0.15, -ph * 0.45, s * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "ufo") {
    ctx.save(); ctx.translate(x, baseY);
    const uw = s * 0.35, uh = s * 0.12;
    // Saucer
    ctx.beginPath(); ctx.ellipse(0, -uh * 2, uw, uh, 0, 0, Math.PI * 2);
    const uG = ctx.createLinearGradient(0, -uh * 3, 0, -uh);
    uG.addColorStop(0, "#8090A0"); uG.addColorStop(0.5, "#A0B0C0"); uG.addColorStop(1, "#607080");
    ctx.fillStyle = uG; ctx.fill();
    // Dome
    ctx.beginPath(); ctx.ellipse(0, -uh * 2.5, uw * 0.35, uh * 1.5, 0, Math.PI, 0);
    ctx.fillStyle = "rgba(150,200,255,0.3)"; ctx.fill();
    // Lights around rim — animated rotation
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + time * 2;
      const lx = Math.cos(a) * uw * 0.8;
      const ly = -uh * 2 + Math.sin(a) * uh * 0.6;
      const on = Math.sin(time * 4 + i * 1.2) > 0;
      ctx.beginPath(); ctx.arc(lx, ly, s * 0.015, 0, Math.PI * 2);
      ctx.fillStyle = on ? `rgba(100,255,100,0.8)` : `rgba(100,255,100,0.15)`; ctx.fill();
    }
    // Beam
    const beamA = 0.06 + Math.sin(time * 1.5) * 0.03;
    ctx.beginPath(); ctx.moveTo(-uw * 0.2, -uh * 1.2); ctx.lineTo(-uw * 0.5, 0);
    ctx.lineTo(uw * 0.5, 0); ctx.lineTo(uw * 0.2, -uh * 1.2); ctx.closePath();
    ctx.fillStyle = `rgba(100,255,150,${beamA})`; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "gnome") {
    ctx.save(); ctx.translate(x, baseY);
    // Body
    ctx.beginPath(); ctx.moveTo(-s * 0.1, 0); ctx.lineTo(-s * 0.12, -s * 0.25);
    ctx.bezierCurveTo(-s * 0.1, -s * 0.35, s * 0.1, -s * 0.35, s * 0.12, -s * 0.25);
    ctx.lineTo(s * 0.1, 0); ctx.closePath();
    ctx.fillStyle = "#3366CC"; ctx.fill();
    // Face
    ctx.beginPath(); ctx.arc(0, -s * 0.4, s * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#FFDAB9"; ctx.fill();
    // Beard
    ctx.beginPath(); ctx.moveTo(-s * 0.06, -s * 0.35); ctx.quadraticCurveTo(0, -s * 0.2, s * 0.06, -s * 0.35);
    ctx.fillStyle = "#E8E8E8"; ctx.fill();
    // Hat
    ctx.beginPath(); ctx.moveTo(-s * 0.08, -s * 0.45); ctx.lineTo(0, -s * 0.65); ctx.lineTo(s * 0.08, -s * 0.45); ctx.closePath();
    ctx.fillStyle = "#CC3333"; ctx.fill();
    // Eyes
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(-s * 0.03, -s * 0.42, s * 0.01, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.03, -s * 0.42, s * 0.01, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "pizza") {
    ctx.save(); ctx.translate(x, baseY);
    ctx.rotate(-0.2);
    // Slice
    ctx.beginPath(); ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(-s * 0.2, -s * 0.05); ctx.lineTo(s * 0.2, -s * 0.05); ctx.closePath();
    ctx.fillStyle = "#E8B84B"; ctx.fill();
    // Cheese
    ctx.beginPath(); ctx.moveTo(-s * 0.02, -s * 0.32);
    ctx.lineTo(-s * 0.17, -s * 0.08); ctx.lineTo(s * 0.17, -s * 0.08); ctx.closePath();
    ctx.fillStyle = "#FFD700"; ctx.fill();
    // Pepperoni
    ctx.fillStyle = "#CC3333";
    ctx.beginPath(); ctx.arc(-s * 0.04, -s * 0.2, s * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.05, -s * 0.15, s * 0.02, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -s * 0.28, s * 0.018, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "tv") {
    ctx.save(); ctx.translate(x, baseY);
    const tw = s * 0.2, th = s * 0.16;
    // Body
    ctx.fillStyle = "#2A2A2A";
    ctx.beginPath(); ctx.roundRect(-tw, -th * 2.2, tw * 2, th * 1.5, 3); ctx.fill();
    // Screen — animated static/color
    const screenHue = (time * 30) % 360;
    ctx.fillStyle = `hsla(${screenHue}, 60%, 50%, 0.4)`;
    ctx.fillRect(-tw * 0.85, -th * 2.05, tw * 1.7, th * 1.2);
    // Static noise
    for (let i = 0; i < 8; i++) {
      const nx = -tw * 0.8 + Math.sin(time * 20 + i * 3) * tw * 0.7;
      const ny = -th * 2 + Math.cos(time * 15 + i * 2) * th;
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(i + time * 10) * 0.08})`;
      ctx.fillRect(nx, ny, tw * 0.15, 1);
    }
    // Stand
    ctx.fillStyle = "#2A2A2A";
    ctx.fillRect(-tw * 0.3, -th * 0.7, tw * 0.6, th * 0.3);
    // Antenna
    ctx.strokeStyle = "#555"; ctx.lineWidth = 1; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-tw * 0.3, -th * 2.2); ctx.lineTo(-tw * 0.6, -th * 2.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tw * 0.3, -th * 2.2); ctx.lineTo(tw * 0.6, -th * 2.8); ctx.stroke();
    ctx.restore();

  } else if (dec.drawType === "moai") {
    ctx.save(); ctx.translate(x, baseY);
    // Easter Island head — detailed
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, 0);
    ctx.bezierCurveTo(-s * 0.22, -s * 0.1, -s * 0.2, -s * 0.3, -s * 0.18, -s * 0.5);
    ctx.bezierCurveTo(-s * 0.17, -s * 0.6, -s * 0.2, -s * 0.7, -s * 0.15, -s * 0.78);
    ctx.bezierCurveTo(-s * 0.08, -s * 0.85, s * 0.08, -s * 0.85, s * 0.15, -s * 0.78);
    ctx.bezierCurveTo(s * 0.2, -s * 0.7, s * 0.17, -s * 0.6, s * 0.18, -s * 0.5);
    ctx.bezierCurveTo(s * 0.2, -s * 0.3, s * 0.22, -s * 0.1, s * 0.18, 0);
    ctx.closePath();
    const mG = ctx.createLinearGradient(0, -s * 0.85, 0, 0);
    mG.addColorStop(0, "#8A8070"); mG.addColorStop(0.5, "#7A7060"); mG.addColorStop(1, "#6A6050");
    ctx.fillStyle = mG; ctx.fill();
    // Brow ridge
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath(); ctx.ellipse(0, -s * 0.6, s * 0.14, s * 0.03, 0, 0, Math.PI * 2); ctx.fill();
    // Eye sockets
    ctx.fillStyle = "rgba(40,35,30,0.4)";
    ctx.beginPath(); ctx.ellipse(-s * 0.06, -s * 0.58, s * 0.035, s * 0.025, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.06, -s * 0.58, s * 0.035, s * 0.025, 0, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.beginPath();
    ctx.moveTo(-s * 0.03, -s * 0.52); ctx.lineTo(0, -s * 0.38);
    ctx.lineTo(s * 0.03, -s * 0.52);
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fill();
    // Mouth/Lips
    ctx.beginPath(); ctx.moveTo(-s * 0.07, -s * 0.32);
    ctx.quadraticCurveTo(0, -s * 0.28, s * 0.07, -s * 0.32);
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1.2; ctx.stroke();
    // Weathering/moss
    ctx.fillStyle = "rgba(60,100,50,0.1)";
    ctx.beginPath(); ctx.ellipse(-s * 0.1, -s * 0.2, s * 0.05, s * 0.04, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  // ============================================================================
  // LIGHTHOUSE — blinking lamp!
  // ============================================================================

  } else if (dec.drawType === "lighthouse") {
    ctx.save(); ctx.translate(x, baseY);
    const lw = h * 0.12, lh = h * 0.8;
    // Tower body — red and white stripes
    for (let i = 0; i < 6; i++) {
      const sy = -i * lh / 6, sh = lh / 6;
      const taper = 1 - i * 0.06;
      ctx.fillStyle = i % 2 === 0 ? "#CC3333" : "#F0EDE8";
      ctx.beginPath();
      ctx.moveTo(-lw * taper, sy); ctx.lineTo(-lw * (taper - 0.06), sy - sh);
      ctx.lineTo(lw * (taper - 0.06), sy - sh); ctx.lineTo(lw * taper, sy); ctx.closePath();
      ctx.fill();
    }
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(-lw * 0.2, -lh, lw * 0.3, lh);
    // Lamp room
    const lampY = -lh - h * 0.04;
    ctx.fillStyle = "#2A2A2A";
    ctx.fillRect(-lw * 0.8, lampY, lw * 1.6, h * 0.06);
    // Glass housing
    ctx.fillStyle = "rgba(180,220,255,0.2)";
    ctx.fillRect(-lw * 0.6, lampY - h * 0.07, lw * 1.2, h * 0.07);
    // Roof
    ctx.beginPath(); ctx.moveTo(-lw * 0.9, lampY - h * 0.07);
    ctx.lineTo(0, lampY - h * 0.14); ctx.lineTo(lw * 0.9, lampY - h * 0.07); ctx.closePath();
    ctx.fillStyle = "#333"; ctx.fill();
    // BLINKING LAMP — the star feature!
    const blinkCycle = (time * 1.5) % (Math.PI * 2);
    const lampOn = Math.sin(blinkCycle) > 0.2;
    const lampIntensity = lampOn ? 0.5 + Math.sin(blinkCycle) * 0.3 : 0.05;
    // Lamp glow
    if (lampOn) {
      const beamG = ctx.createRadialGradient(0, lampY - h * 0.03, 0, 0, lampY - h * 0.03, h * 0.3);
      beamG.addColorStop(0, `rgba(255,240,150,${lampIntensity})`);
      beamG.addColorStop(0.3, `rgba(255,220,100,${lampIntensity * 0.4})`);
      beamG.addColorStop(1, "rgba(255,200,50,0)");
      ctx.fillStyle = beamG;
      ctx.fillRect(-h * 0.3, lampY - h * 0.2, h * 0.6, h * 0.35);
      // Rotating beam
      const beamAngle = time * 2;
      ctx.save(); ctx.translate(0, lampY - h * 0.03); ctx.rotate(beamAngle);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-h * 0.06, -h * 0.5);
      ctx.lineTo(h * 0.06, -h * 0.5); ctx.closePath();
      ctx.fillStyle = `rgba(255,240,150,${lampIntensity * 0.15})`;
      ctx.fill();
      ctx.restore();
    }
    // Lamp bulb
    ctx.beginPath(); ctx.arc(0, lampY - h * 0.035, lw * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = lampOn ? `rgba(255,240,120,${0.6 + lampIntensity * 0.4})` : "rgba(150,140,100,0.3)";
    ctx.fill();
    // Door at base
    ctx.fillStyle = "rgba(40,25,15,0.6)";
    ctx.beginPath(); ctx.moveTo(-lw * 0.3, 0); ctx.lineTo(-lw * 0.3, -lh * 0.12);
    ctx.arc(0, -lh * 0.12, lw * 0.3, Math.PI, 0); ctx.lineTo(lw * 0.3, 0); ctx.closePath(); ctx.fill();
    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 0, lw * 1.2, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fill();
    ctx.restore();

  } else if (dec.drawType === "thermometer") {
    ctx.save(); ctx.translate(x, baseY);
    ctx.fillStyle = "rgba(200,230,255,0.15)";
    ctx.fillRect(-h * 0.015, -h * 0.7, h * 0.03, h * 0.65);
    ctx.fillStyle = "rgba(255,60,40,0.4)";
    ctx.fillRect(-h * 0.01, -h * 0.4, h * 0.02, h * 0.35);
    ctx.beginPath(); ctx.arc(0, -h * 0.04, h * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,60,40,0.5)"; ctx.fill();
    // Scale marks
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 0.3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(h * 0.015, -h * 0.15 - i * h * 0.09);
      ctx.lineTo(h * 0.03, -h * 0.15 - i * h * 0.09); ctx.stroke(); }
    ctx.restore();

  } else if (dec.drawType === "bubbler") {
    // Bubbler is invisible — bubbles are handled in the main animation loop
    ctx.save(); ctx.translate(x, baseY);
    ctx.beginPath(); ctx.ellipse(0, -h * 0.05, h * 0.08, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(150,150,150,0.15)"; ctx.fill();
    ctx.restore();

  // ============================================================================
  // PLANTS — preserved from original
  // ============================================================================
  // ============================================================================
  // PLANTS — v2: leaf veins, per-leaf color variation, tip transparency,
  // improved detail for all 20 plant types
  // ============================================================================

  } else if (dec.drawType === "anubias") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const angle = -0.5 + i * 0.25 + Math.sin(time * 1.5 + i) * 0.08;
      const lh = h * (0.6 + i * 0.08);
      const age = i / 5; // 0=youngest, 1=oldest
      ctx.save(); ctx.rotate(angle);
      // Stem
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-lh * 0.05, -lh * 0.3, 0, -lh * 0.55);
      ctx.strokeStyle = "#1F5528"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.stroke();
      // Leaf blade with gradient (younger=lighter)
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.5);
      ctx.bezierCurveTo(lh * 0.2, -lh * 0.7, lh * 0.28, -lh * 1.0, 0, -lh * 1.1);
      ctx.bezierCurveTo(-lh * 0.28, -lh * 1.0, -lh * 0.2, -lh * 0.7, 0, -lh * 0.5);
      const leafG = ctx.createLinearGradient(0, -lh * 0.5, 0, -lh * 1.1);
      const g1 = age < 0.4 ? "#45B855" : "#2D7A3A";
      const g2 = age < 0.4 ? "#3AA048" : "#1F5528";
      leafG.addColorStop(0, g1); leafG.addColorStop(1, g2);
      ctx.fillStyle = leafG; ctx.fill();
      // Midrib vein
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.52); ctx.lineTo(0, -lh * 1.05);
      ctx.strokeStyle = "rgba(20,60,20,0.3)"; ctx.lineWidth = 0.8; ctx.stroke();
      // Lateral veins
      for (let v = 0; v < 3; v++) {
        const vy = -lh * (0.6 + v * 0.14);
        const vlen = lh * (0.12 - v * 0.02);
        ctx.beginPath(); ctx.moveTo(0, vy);
        ctx.lineTo(vlen, vy - lh * 0.04); ctx.moveTo(0, vy);
        ctx.lineTo(-vlen, vy - lh * 0.04);
        ctx.strokeStyle = "rgba(20,60,20,0.2)"; ctx.lineWidth = 0.5; ctx.stroke();
      }
      // Leaf edge highlight
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.5);
      ctx.bezierCurveTo(lh * 0.2, -lh * 0.7, lh * 0.28, -lh * 1.0, 0, -lh * 1.1);
      ctx.strokeStyle = "rgba(100,200,100,0.12)"; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

  } else if (dec.drawType === "val") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 6; i++) {
      const sx = -8 + i * 3.2;
      const sway = Math.sin(time * 1.2 + i * 0.8) * 8;
      const lh = h * (0.8 + (i * 17 % 10) / 25);
      const age = (i * 23 % 10) / 10;
      // Blade — wider stroke with gradient color
      const gr = 40 + i * 8 + (age < 0.3 ? 20 : 0);
      const gg = 140 + i * 10 + (age < 0.3 ? 30 : 0);
      const gb = 50 + i * 5;
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.5, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.8)`;
      ctx.lineWidth = 2.8 - i * 0.15; ctx.lineCap = "round"; ctx.stroke();
      // Central vein (lighter)
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.5, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = `rgba(${gr + 30},${gg + 20},${gb + 20},0.25)`;
      ctx.lineWidth = 0.6; ctx.stroke();
      // Tip fade — small transparent segment
      ctx.beginPath(); ctx.moveTo(sx + sway * 0.85, -lh * 0.85);
      ctx.quadraticCurveTo(sx + sway * 0.95, -lh * 0.95, sx + sway, -lh);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.3)`;
      ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();

  } else if (dec.drawType === "sword") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 7; i++) {
      const angle = -0.6 + i * 0.2 + Math.sin(time * 1.2 + i * 0.5) * 0.06;
      const lh = h * (0.7 + i * 0.06);
      const age = i / 7;
      ctx.save(); ctx.rotate(angle);
      // Stem
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -lh * 0.35);
      ctx.strokeStyle = "#2A6B30"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.stroke();
      // Leaf blade with age-based color
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.3);
      ctx.quadraticCurveTo(lh * 0.2, -lh * 0.65, 0, -lh);
      ctx.quadraticCurveTo(-lh * 0.2, -lh * 0.65, 0, -lh * 0.3);
      const baseGreen = age < 0.3 ? "#45B045" : age < 0.6 ? "#35993F" : "#2B8035";
      ctx.fillStyle = baseGreen; ctx.fill();
      // Midrib
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.32); ctx.lineTo(0, -lh * 0.95);
      ctx.strokeStyle = "rgba(20,50,15,0.3)"; ctx.lineWidth = 0.7; ctx.stroke();
      // Lateral veins (angled)
      for (let v = 0; v < 4; v++) {
        const vy = -lh * (0.4 + v * 0.13);
        const vl = lh * (0.1 + (4 - v) * 0.02);
        ctx.beginPath(); ctx.moveTo(0, vy);
        ctx.lineTo(vl, vy - lh * 0.05); ctx.moveTo(0, vy);
        ctx.lineTo(-vl, vy - lh * 0.05);
        ctx.strokeStyle = "rgba(20,50,15,0.15)"; ctx.lineWidth = 0.4; ctx.stroke();
      }
      // Tip transparency
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.85);
      ctx.quadraticCurveTo(lh * 0.08, -lh * 0.93, 0, -lh);
      ctx.quadraticCurveTo(-lh * 0.08, -lh * 0.93, 0, -lh * 0.85);
      ctx.fillStyle = "rgba(40,120,50,0.25)"; ctx.fill();
      ctx.restore();
    }
    ctx.restore();

  } else if (dec.drawType === "crypto") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const angle = -0.4 + i * 0.2 + Math.sin(time * 1.3 + i) * 0.05;
      const lh = h * (0.35 + i * 0.05);
      const age = i / 5;
      ctx.save(); ctx.rotate(angle);
      // Leaf with wavy edges
      ctx.beginPath(); ctx.moveTo(0, 0);
      const steps = 12;
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const ly = -lh * t;
        const wid = lh * 0.18 * Math.sin(t * Math.PI); // width envelope
        const wavyEdge = Math.sin(t * 8 + i) * lh * 0.015;
        ctx.lineTo(wid + wavyEdge, ly);
      }
      for (let j = steps; j >= 0; j--) {
        const t = j / steps;
        const ly = -lh * t;
        const wid = lh * 0.18 * Math.sin(t * Math.PI);
        const wavyEdge = Math.sin(t * 8 + i + 2) * lh * 0.015;
        ctx.lineTo(-wid + wavyEdge, ly);
      }
      ctx.closePath();
      ctx.fillStyle = age < 0.4 ? "#4A8B3A" : "#3A6B30"; ctx.fill();
      // Midrib
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.05); ctx.lineTo(0, -lh * 0.9);
      ctx.strokeStyle = "rgba(25,50,20,0.25)"; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

  } else if (dec.drawType === "frogbit") {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const fx = x - 15 + i * 8 + Math.sin(time * 0.8 + i) * 3;
      const fy = 8 + Math.sin(time * 1.2 + i * 1.5) * 2;
      const age = (i * 13 % 5) / 5;
      // Leaf pad
      ctx.beginPath(); ctx.ellipse(fx, fy, 6.5, 4.5, Math.sin(i * 0.8) * 0.15, 0, Math.PI * 2);
      const padG = ctx.createRadialGradient(fx - 1, fy - 1, 0, fx, fy, 6);
      padG.addColorStop(0, age < 0.3 ? "rgba(70,170,70,0.75)" : "rgba(45,130,55,0.7)");
      padG.addColorStop(1, "rgba(35,100,40,0.6)");
      ctx.fillStyle = padG; ctx.fill();
      // Veins on pad
      ctx.strokeStyle = "rgba(30,80,30,0.2)"; ctx.lineWidth = 0.3;
      for (let v = 0; v < 3; v++) {
        const va = -0.6 + v * 0.6;
        ctx.beginPath(); ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(va) * 5, fy + Math.sin(va) * 3); ctx.stroke();
      }
      // Roots dangling
      ctx.beginPath(); ctx.moveTo(fx, fy + 3);
      ctx.bezierCurveTo(fx + Math.sin(time + i) * 1.5, fy + 10, fx + Math.sin(time * 0.7 + i) * 2, fy + 17, fx + Math.sin(time * 0.5 + i) * 3, fy + 24);
      ctx.strokeStyle = "rgba(80,140,80,0.25)"; ctx.lineWidth = 0.8; ctx.lineCap = "round"; ctx.stroke();
    }
    ctx.restore();

  } else if (dec.drawType === "bucep") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 6; i++) {
      const angle = -0.5 + i * 0.2 + Math.sin(time * 1.4 + i) * 0.06;
      const lh = h * (0.3 + i * 0.04);
      const age = i / 6;
      ctx.save(); ctx.rotate(angle);
      // Stem
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -lh * 0.4);
      ctx.strokeStyle = "#153820"; ctx.lineWidth = 1; ctx.lineCap = "round"; ctx.stroke();
      // Leaf
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.35);
      ctx.quadraticCurveTo(lh * 0.16, -lh * 0.65, 0, -lh);
      ctx.quadraticCurveTo(-lh * 0.13, -lh * 0.65, 0, -lh * 0.35);
      const baseCol = age < 0.3 ? "#2A7038" : i % 3 === 0 ? "#1A5028" : "#206030";
      ctx.fillStyle = baseCol; ctx.fill();
      // Midrib
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.38); ctx.lineTo(0, -lh * 0.92);
      ctx.strokeStyle = "rgba(15,40,15,0.25)"; ctx.lineWidth = 0.4; ctx.stroke();
      // Sheen — bucep has metallic-looking leaves
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.08;
      ctx.beginPath(); ctx.ellipse(lh * 0.03, -lh * 0.65, lh * 0.06, lh * 0.15, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "#AAE0BB"; ctx.fill(); ctx.restore();
      ctx.restore();
    }
    ctx.restore();

  } else if (dec.drawType === "rotala") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const sx = -6 + i * 3;
      const sway = Math.sin(time * 1.1 + i * 0.7) * 5;
      const lh = h * (0.7 + (i * 13 % 8) / 20);
      // Stem
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.4, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = "#8B3030"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
      // Paired leaves along stem
      for (let j = 0; j < 5; j++) {
        const t = 0.15 + j * 0.17;
        const ly = -lh * t;
        const lx = sx + sway * t;
        const age = j / 5;
        const leafCol = age < 0.4 ? "#DD5545" : "#BB3535";
        for (let side = -1; side <= 1; side += 2) {
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(side * (0.5 + Math.sin(time * 1.5 + j) * 0.05));
          ctx.beginPath(); ctx.ellipse(3.5 * side, 0, 4, 1.8, side * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = leafCol; ctx.fill();
          // Leaf vein
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5.5 * side, 0);
          ctx.strokeStyle = "rgba(80,20,20,0.2)"; ctx.lineWidth = 0.3; ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.restore();

  } else if (dec.drawType === "carpet") {
    ctx.save();
    for (let i = -20; i < 20; i++) {
      const cx = x + i * 3;
      const ch2 = 4 + Math.sin(i * 0.5 + time) * 1.5;
      const green = 120 + Math.abs(i) * 3 + Math.sin(i * 0.7) * 15;
      ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx + Math.sin(time + i) * 1, baseY - ch2);
      ctx.strokeStyle = `rgba(30,${green},40,0.7)`;
      ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
      // Occasional lighter blade (new growth)
      if (i % 4 === 0) {
        ctx.beginPath(); ctx.moveTo(cx + 1.5, baseY); ctx.lineTo(cx + 1.5 + Math.sin(time + i + 1) * 0.8, baseY - ch2 * 0.7);
        ctx.strokeStyle = `rgba(60,${green + 30},60,0.5)`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }
    }
    ctx.restore();

  } else if (dec.drawType === "moss") {
    ctx.save(); ctx.translate(x, baseY);
    // Dense clusters of tiny fronds
    for (let i = 0; i < 18; i++) {
      const mx = -12 + (i * 17 % 24); const my = -(i * 13 % (h * 0.4 | 0));
      const mSize = 2 + (i * 7 % 3);
      const green = 100 + i * 8;
      // Blob
      ctx.beginPath(); ctx.arc(mx + Math.sin(time * 1.5 + i) * 1.5, my, mSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${30 + i * 4},${green},${30 + i * 3},0.55)`; ctx.fill();
      // Tiny frond lines radiating out
      if (mSize > 2.5) {
        ctx.strokeStyle = `rgba(${40 + i * 3},${green + 15},${40 + i * 2},0.3)`; ctx.lineWidth = 0.5;
        for (let f = 0; f < 3; f++) {
          const fa = f * 1.2 + i * 0.5;
          ctx.beginPath(); ctx.moveTo(mx, my);
          ctx.lineTo(mx + Math.cos(fa) * mSize * 1.3, my + Math.sin(fa) * mSize * 1.3); ctx.stroke();
        }
      }
    }
    ctx.restore();

  } else if (dec.drawType === "ludwigia") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const sx = -7 + i * 3.5;
      const sway = Math.sin(time * 1.0 + i * 0.9) * 4;
      const lh = h * (0.6 + (i * 11 % 7) / 18);
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.4, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = "#5A3020"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.stroke();
      for (let j = 0; j < 5; j++) {
        const t = 0.15 + j * 0.17;
        const ly = -lh * t;
        const lx = sx + sway * t;
        const leafAngle = (j % 2 === 0 ? 0.4 : -0.4) + Math.sin(time * 1.5 + j) * 0.05;
        // Color: upper leaves red, lower green (gradient along stem)
        const red = j < 2;
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(leafAngle);
        ctx.beginPath(); ctx.ellipse(4, 0, 5, 2.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = red ? "#CC5533" : "#55882A"; ctx.fill();
        // Midrib on leaf
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, 0);
        ctx.strokeStyle = red ? "rgba(80,25,15,0.2)" : "rgba(30,50,15,0.2)";
        ctx.lineWidth = 0.35; ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

  } else if (dec.drawType === "hornwort") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 4; i++) {
      const sx = -5 + i * 3.5;
      const sway = Math.sin(time * 0.9 + i * 1.1) * 6;
      const lh = h * (0.8 + (i * 7 % 5) / 15);
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.5, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = "#2A7030"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
      // Whorled needle-like leaves
      for (let j = 0; j < 8; j++) {
        const t = 0.1 + j * 0.11;
        const py = -lh * t;
        const px = sx + sway * t;
        const nSway = Math.sin(time * 2 + j + i) * 1.5;
        const needleLen = 5 + Math.sin(j * 0.7) * 1.5;
        for (let side = -1; side <= 1; side += 2) {
          ctx.beginPath(); ctx.moveTo(px, py);
          ctx.lineTo(px + side * (needleLen + nSway), py - 2.5);
          ctx.strokeStyle = `rgba(40,${130 + j * 5},50,0.55)`;
          ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }
    ctx.restore();

  } else if (dec.drawType === "javafern") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 6; i++) {
      const angle = -0.5 + i * 0.2 + Math.sin(time * 1.2 + i * 0.6) * 0.07;
      const lh = h * (0.55 + i * 0.06);
      const age = i / 6;
      ctx.save(); ctx.rotate(angle);
      // Stem
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -lh * 0.4);
      ctx.strokeStyle = "#2A5520"; ctx.lineWidth = 1.4; ctx.lineCap = "round"; ctx.stroke();
      // Leaf blade
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.25);
      ctx.quadraticCurveTo(lh * 0.14, -lh * 0.6, lh * 0.04, -lh);
      ctx.quadraticCurveTo(-lh * 0.12, -lh * 0.6, 0, -lh * 0.25);
      ctx.fillStyle = age < 0.3 ? "#358830" : "#2D6B28"; ctx.fill();
      // Prominent midrib
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.28); ctx.lineTo(lh * 0.02, -lh * 0.92);
      ctx.strokeStyle = "rgba(20,50,18,0.35)"; ctx.lineWidth = 0.7; ctx.stroke();
      // Lateral veins — java fern has visible parallel veins
      for (let v = 0; v < 4; v++) {
        const vy = -lh * (0.35 + v * 0.14);
        const vw = lh * (0.06 + (3 - v) * 0.015);
        ctx.beginPath(); ctx.moveTo(lh * 0.01, vy);
        ctx.lineTo(vw, vy - lh * 0.03); ctx.moveTo(lh * 0.01, vy);
        ctx.lineTo(-vw + lh * 0.02, vy - lh * 0.03);
        ctx.strokeStyle = "rgba(20,50,18,0.18)"; ctx.lineWidth = 0.35; ctx.stroke();
      }
      // Brown spore dots on underside (mature leaves)
      if (age > 0.5) {
        ctx.fillStyle = "rgba(100,70,30,0.2)";
        for (let d = 0; d < 3; d++) {
          ctx.beginPath(); ctx.arc(lh * 0.03 * (d - 1), -lh * (0.55 + d * 0.12), 1, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();

  } else if (dec.drawType === "dwarfsag") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 10; i++) {
      const sx = -12 + i * 2.8;
      const sway = Math.sin(time * 1.4 + i * 0.6) * 3;
      const lh = h * (0.25 + (i * 11 % 7) / 28);
      const green = 130 + i * 5 + (i % 3 === 0 ? 25 : 0); // color variation
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.5, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = `rgba(${45 + i * 3},${green},${45 + i * 2},0.75)`;
      ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.stroke();
      // Central vein highlight
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.5, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = `rgba(${65 + i * 3},${green + 25},${65 + i * 2},0.2)`;
      ctx.lineWidth = 0.5; ctx.stroke();
    }
    ctx.restore();

  } else if (dec.drawType === "wisteria") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const sx = -8 + i * 4;
      const sway = Math.sin(time * 1.1 + i * 0.8) * 5;
      const lh = h * (0.65 + (i * 13 % 6) / 18);
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.4, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = "#3A7530"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
      // Lacy compound leaves
      for (let j = 0; j < 4; j++) {
        const t = 0.2 + j * 0.2;
        const ly = -lh * t;
        const lx = sx + sway * t;
        for (let k = -1; k <= 1; k += 2) {
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(k * 0.5 + Math.sin(time + j) * 0.08);
          // Deeply lobed leaf shape (serrated edge via jagged path)
          ctx.beginPath(); ctx.moveTo(0, 0);
          const lobes = 4;
          for (let lb = 0; lb <= lobes; lb++) {
            const lt = lb / lobes;
            const ex = k * (7 * lt);
            const ey = Math.sin(lt * Math.PI) * -2;
            const notch = lb < lobes ? Math.sin(lt * Math.PI * 2) * 1 : 0;
            ctx.lineTo(ex, ey + notch);
          }
          for (let lb = lobes; lb >= 0; lb--) {
            const lt = lb / lobes;
            const ex = k * (7 * lt);
            const ey = Math.sin(lt * Math.PI) * 1;
            const notch = lb < lobes ? Math.sin(lt * Math.PI * 2) * 0.8 : 0;
            ctx.lineTo(ex, ey + notch);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(50,${140 + j * 12},55,0.6)`; ctx.fill();
          // Leaflet midrib
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(k * 6, -0.5);
          ctx.strokeStyle = "rgba(30,80,30,0.15)"; ctx.lineWidth = 0.3; ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.restore();

  } else if (dec.drawType === "lotus") {
    ctx.save(); ctx.translate(x, baseY);
    const sway = Math.sin(time * 0.8) * 4;
    // Main stem
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(sway * 0.3, -h * 0.2, sway * 0.8, -h * 0.5, sway * 1.2, -h * 0.75);
    ctx.strokeStyle = "#5A2020"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    // Large lily pad at top
    const lx = sway * 1.2, ly = -h * 0.75;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.sin(time * 0.6) * 0.1);
    // Pad with gradient
    ctx.beginPath(); ctx.ellipse(0, 0, h * 0.24, h * 0.15, 0, 0, Math.PI * 2);
    const padG = ctx.createRadialGradient(h * 0.03, -h * 0.02, 0, 0, 0, h * 0.24);
    padG.addColorStop(0, "#AA3344"); padG.addColorStop(0.7, "#882233"); padG.addColorStop(1, "#661828");
    ctx.fillStyle = padG; ctx.fill();
    // Veins radiating from center
    ctx.strokeStyle = "rgba(50,15,20,0.3)"; ctx.lineWidth = 0.5;
    for (let v = 0; v < 7; v++) {
      const va = v * 0.9 - 0.3;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(va) * h * 0.22, Math.sin(va) * h * 0.13); ctx.stroke();
    }
    // Pie-slice notch
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(h * 0.24, h * 0.02);
    ctx.lineTo(h * 0.22, -h * 0.03); ctx.closePath();
    ctx.fillStyle = "rgba(10,30,50,0.3)"; ctx.fill();
    ctx.restore();
    // Small underwater leaves
    for (let i = 0; i < 3; i++) {
      const a = -0.4 + i * 0.4 + Math.sin(time * 1.3 + i) * 0.06;
      const ll = h * (0.3 + i * 0.05);
      ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, -ll, ll * 0.2, ll * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#993344" : "#AA4455"; ctx.fill();
      // Vein
      ctx.beginPath(); ctx.moveTo(-ll * 0.15, -ll); ctx.lineTo(ll * 0.15, -ll);
      ctx.strokeStyle = "rgba(60,20,25,0.2)"; ctx.lineWidth = 0.3; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

  } else if (dec.drawType === "salvinia") {
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const fx = x - 18 + i * 6 + Math.sin(time * 0.7 + i * 1.2) * 2.5;
      const fy = 7 + Math.sin(time * 1.0 + i * 0.9) * 1.5;
      // Folded leaf pairs
      ctx.beginPath(); ctx.ellipse(fx - 1.5, fy, 3.5, 3, -0.15 + Math.sin(i) * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "rgba(50,140,50,0.7)" : "rgba(55,145,55,0.65)"; ctx.fill();
      ctx.beginPath(); ctx.ellipse(fx + 1.5, fy, 3.5, 3, 0.15 - Math.sin(i) * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "rgba(45,130,48,0.65)" : "rgba(52,138,52,0.6)"; ctx.fill();
      // Water-repellent bumps (tiny dots on surface)
      ctx.fillStyle = "rgba(80,180,80,0.2)";
      for (let d = 0; d < 3; d++) {
        ctx.beginPath(); ctx.arc(fx + (d - 1) * 2, fy - 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
      }
      // Root
      ctx.beginPath(); ctx.moveTo(fx, fy + 2);
      ctx.lineTo(fx + Math.sin(time * 2 + i) * 1, fy + 8);
      ctx.strokeStyle = "rgba(70,120,70,0.25)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
    ctx.restore();

  } else if (dec.drawType === "elodea") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const sx = -6 + i * 3;
      const sway = Math.sin(time * 1.0 + i * 0.7) * 6;
      const lh = h * (0.75 + (i * 11 % 6) / 18);
      ctx.beginPath(); ctx.moveTo(sx, 0);
      ctx.quadraticCurveTo(sx + sway * 0.5, -lh * 0.5, sx + sway, -lh);
      ctx.strokeStyle = "#308830"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
      // Whorled leaf pairs
      for (let j = 0; j < 6; j++) {
        const t = 0.12 + j * 0.15;
        const py = -lh * t;
        const px = sx + sway * t;
        for (let side = -1; side <= 1; side += 2) {
          ctx.beginPath(); ctx.ellipse(px + 2.5 * side, py, 3, 1.3, side * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(45,${135 + j * 5},50,0.6)`; ctx.fill();
          // Leaf vein
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 4 * side, py - 0.3);
          ctx.strokeStyle = "rgba(30,80,30,0.15)"; ctx.lineWidth = 0.3; ctx.stroke();
        }
      }
    }
    ctx.restore();

  } else if (dec.drawType === "staurogyne") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 7; i++) {
      const sx = -9 + i * 3;
      const sway = Math.sin(time * 1.3 + i * 0.5) * 2;
      const lh = h * (0.2 + (i * 7 % 5) / 22);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + sway, -lh);
      ctx.strokeStyle = "#2A6528"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
      // Opposite leaf pairs
      for (let j = 0; j < 3; j++) {
        const t = 0.3 + j * 0.25;
        const py = -lh * t;
        const px = sx + sway * t;
        for (let side = -1; side <= 1; side += 2) {
          ctx.beginPath(); ctx.ellipse(px + 3 * side, py, 3.5, 1.6, side * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(55,${140 + j * 8},55,0.7)`; ctx.fill();
          // Vein
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 5 * side, py);
          ctx.strokeStyle = "rgba(30,70,30,0.15)"; ctx.lineWidth = 0.3; ctx.stroke();
        }
      }
    }
    ctx.restore();

  } else if (dec.drawType === "pogostemon") {
    ctx.save(); ctx.translate(x, baseY);
    for (let i = 0; i < 5; i++) {
      const sx = -6 + i * 3;
      const sway = Math.sin(time * 1.2 + i * 0.8) * 2.5;
      const lh = h * (0.22 + (i * 9 % 5) / 25);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + sway, -lh);
      ctx.strokeStyle = "#2B6B2B"; ctx.lineWidth = 1.2; ctx.lineCap = "round"; ctx.stroke();
      // Star-shaped leaf rosette
      const px = sx + sway, py = -lh;
      const petalCount = 7;
      for (let r = 0; r < petalCount; r++) {
        const ra = (r / petalCount) * Math.PI * 2 + Math.sin(time + i) * 0.1;
        const tipLen = 5.5 + Math.sin(r * 1.2) * 1;
        // Each petal is a thin leaf
        ctx.beginPath(); ctx.moveTo(px, py);
        ctx.quadraticCurveTo(
          px + Math.cos(ra) * tipLen * 0.6, py + Math.sin(ra) * tipLen * 0.4,
          px + Math.cos(ra) * tipLen, py + Math.sin(ra) * tipLen * 0.7
        );
        ctx.strokeStyle = `rgba(50,${145 + i * 5},50,0.7)`;
        ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.stroke();
      }
      // Center dot
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(70,170,70,0.5)"; ctx.fill();
    }
    ctx.restore();
  }
}
