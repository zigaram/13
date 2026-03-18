import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { DECORATIONS, FISH_DB, SUBSTRATES, LIGHTS, BACKGROUNDS } from '../data/index.js';
import {
  hexToRgb,
  drawFishBody,
  drawDecoration,
  drawSubstrate,
  drawSubstrateMound,
  drawBackground,
  drawCaustics,
  drawLightRays,
} from '../rendering/index.js';
import { simulateFish, triggerEvent, getFoodParticles } from '../rendering/simulateFish.js';

// ============================================================================
// AQUARIUM CANVAS
// The live animated aquarium preview with fish simulation, drag-to-move, etc.
// ============================================================================
const AquariumCanvas = forwardRef(function AquariumCanvas({ state, tankWidth, tankHeight, tankLiters, onUpdatePosition, onSelectItem, nightMode, paused }, ref) {
  const canvasRef = useRef(null);

  // Expose canvas element to parent via ref
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }), []);
  const fishRef = useRef([]);
  const bubblesRef = useRef([]);
  const sinkingRef = useRef([]);
  const dustRef = useRef([]);
  const floatingRef = useRef([]); // permanent floating detritus/particles
  const startleRef = useRef({ timer: 0, maxTimer: 45, x: 0, y: 0, radius: 120 });
  const prevKey = useRef("");
  const dragRef = useRef(null);
  const pausedRef = useRef(!!paused);
  pausedRef.current = !!paused;
  // Pre-allocated arrays reused every frame to avoid GC churn
  const bgFishRef = useRef([]);
  const fgFishRef = useRef([]);
  const carpetsRef = useRef([]);
  const floatersRef = useRef([]);
  const groundRef = useRef([]);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Content scale: items appear relatively smaller in bigger tanks
  // Normalized so ~112L (medium) = 1.0, nano (20L) ~1.5, XXL (500L) ~0.65
  // Also factor in canvas pixel size — a bigger canvas showing the same tank
  // should render everything proportionally bigger.
  // Reference canvas: 560px wide. Current canvas may be larger on desktop.
  const pixelScale = Math.sqrt(tankWidth * tankHeight) / Math.sqrt(560 * 320);
  const contentScale = (Math.sqrt(112) / Math.sqrt(Math.max(tankLiters || 112, 10))) * pixelScale;

  const sub = SUBSTRATES.find(s => s.id === state.substrate);
  const light = state.light === "custom"
    ? { id: "custom", intensity: state.customLight.intensity, r: state.customLight.r, g: state.customLight.g, b: state.customLight.b, strength: state.customLight.strength }
    : LIGHTS.find(l => l.id === state.light);
  const subH = state.substrate === "bare" ? tankHeight * 0.01 : tankHeight * (state.substrateDepth / 100);

  // Night mode: deep blue moonlight, very dim
  const MOONLIGHT = { id: "moon", intensity: 1, r: 50, g: 80, b: 190, strength: 0.07 };

  // ---- Config refs: animation loop reads these without restarting ----
  const configRef = useRef({});
  configRef.current = {
    waterType: state.waterType,
    background: state.background,
    light: nightMode ? MOONLIGHT : light,
    sub,
    subH,
    nightMode: !!nightMode,
  };

  // Keep a ref to state.decorations for animation loop reads without restarting
  const decStateRef = useRef(state.decorations);

  // --- Build expanded decoration list with pixel positions ---
  const expandedDecsRef = useRef([]);
  const buildExpanded = useCallback(() => {
    const list = [];
    const decs = decStateRef.current;
    decs.forEach(d => {
      const dec = DECORATIONS.find(dd => dd.id === d.id);
      if (!dec) return;
      const positions = d.positions || [];
      const cnt = dec.isPlant ? (d.count || 1) : 1;
      const us = d.userScale || 1;
      for (let c = 0; c < cnt; c++) {
        const pos = positions[c] || { x: (c + 1) / (cnt + 1), y: 0.85 };
        list.push({ ...dec, scale: (dec.scale || 1) * us * contentScale, decId: d.id, posIdx: c, px: pos.x * tankWidth, py: pos.y * tankHeight });
      }
    });
    expandedDecsRef.current = list;
  }, [tankWidth, tankHeight, contentScale]);

  // Rebuild expanded list whenever decorations change (adds, removes, drags, resizes)
  useEffect(() => {
    decStateRef.current = state.decorations;
    buildExpanded();
  }, [state.decorations, buildExpanded]);

  // --- Drag handlers ---
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / rect.width * tankWidth, y: (clientY - rect.top) / rect.height * tankHeight };
  }, [tankWidth, tankHeight]);

  // --- Double-click detection for feeding ---
  const lastClickRef = useRef({ time: 0, x: 0, y: 0 });

  const handlePointerDown = useCallback((e) => {
    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    let best = null, bestDist = 45;
    expandedDecsRef.current.forEach(d => {
      const FLOATING_T = ["frogbit", "salvinia", "duck"];
      let hitY = d.py;
      if (!FLOATING_T.includes(d.drawType) && d.drawType !== "carpet") {
        hitY = d.py - tankHeight * 0.08;
      }
      const dx = d.px - pos.x;
      const dy = hitY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) { bestDist = dist; best = d; }
    });
    if (best) {
      dragRef.current = { decId: best.decId, posIdx: best.posIdx, offsetX: best.px - pos.x, offsetY: best.py - pos.y, startX: pos.x, startY: pos.y, moved: false };
      e.preventDefault();
    } else {
      // Clicked on empty water — check for double-click (feed) vs single (startle)
      const now = performance.now();
      const lc = lastClickRef.current;
      const timeDiff = now - lc.time;
      const posDiff = Math.sqrt((pos.x - lc.x) ** 2 + (pos.y - lc.y) ** 2);

      if (timeDiff < 400 && posDiff < 30) {
        // Double-click — feed! Drop food from the click point
        triggerEvent("feed", pos.x, pos.y, tankHeight);
        lastClickRef.current = { time: 0, x: 0, y: 0 }; // reset to prevent triple
      } else {
        // Single click — glass tap startle
        triggerEvent("startle", pos.x, pos.y, tankHeight);
        startleRef.current = { timer: 45, maxTimer: 45, x: pos.x, y: pos.y, radius: 120 };
        lastClickRef.current = { time: now, x: pos.x, y: pos.y };
      }

      if (onSelectItem) onSelectItem(null);
    }
  }, [getCanvasPos, tankHeight, onSelectItem]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const pos = getCanvasPos(e);
    // Track if moved enough to be a drag
    const dx = pos.x - dragRef.current.startX;
    const dy = pos.y - dragRef.current.startY;
    if (Math.sqrt(dx * dx + dy * dy) > 5) dragRef.current.moved = true;
    const nx = Math.max(0.02, Math.min(0.98, (pos.x + dragRef.current.offsetX) / tankWidth));
    const ny = Math.max(0.02, Math.min(0.98, (pos.y + dragRef.current.offsetY) / tankHeight));
    onUpdatePosition(dragRef.current.decId, dragRef.current.posIdx, nx, ny);
    e.preventDefault();
  }, [getCanvasPos, onUpdatePosition, tankWidth, tankHeight]);

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    const wasTap = !drag.moved;
    dragRef.current = null;

    // TAP = select item for editing
    if (wasTap && onSelectItem) {
      onSelectItem(drag.decId);
      return;
    }

    // DRAG = check for sinking animation
    const dec = DECORATIONS.find(d => d.id === drag.decId);
    const FLOATING_T = ["frogbit", "salvinia", "duck", "carpet"];
    if (!dec || FLOATING_T.includes(dec.drawType)) return;
    const decState = decStateRef.current.find(d => d.id === drag.decId);
    if (!decState || !decState.positions || !decState.positions[drag.posIdx]) return;
    const pos = decState.positions[drag.posIdx];
    const dropPixelY = pos.y * tankHeight;
    const subLine = tankHeight - subH;
    if (dropPixelY < subLine - 15) {
      const us = decState.userScale || 1;
      sinkingRef.current.push({
        decId: drag.decId, posIdx: drag.posIdx,
        x: pos.x * tankWidth,
        currentY: dropPixelY,
        targetY: subLine,
        vy: 0,
        wobblePhase: Math.random() * Math.PI * 2,
        dec: { ...dec, scale: (dec.scale || 1) * us * contentScale },
        landed: false,
      });
    }
  }, [tankHeight, contentScale, onSelectItem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("mouseleave", handlePointerUp);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: false });
    canvas.addEventListener("touchmove", handlePointerMove, { passive: false });
    canvas.addEventListener("touchend", handlePointerUp);
    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("mouseleave", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    const key = state.fish.map(f => `${f.id}:${f.count}`).join(",") + `:cs${contentScale.toFixed(3)}`;
    if (key === prevKey.current) return;
    prevKey.current = key;
    const existing = new Map();
    fishRef.current.forEach(f => { if (!existing.has(f.data.id)) existing.set(f.data.id, []); existing.get(f.data.id).push(f); });
    const nf = [];
    state.fish.forEach(f => {
      const fd = FISH_DB.find(d => d.id === f.id); if (!fd) return;
      const pool = existing.get(fd.id) || [];
      for (let i = 0; i < f.count; i++) {
        if (i < pool.length) {
          // Update pixelSize for existing fish when tank changes
          pool[i].pixelSize = (fd.size === "tiny" ? 8 : fd.size === "small" ? 14 : fd.size === "medium" ? 23 : fd.size === "huge" ? 52 : 35) * contentScale;
          nf.push(pool[i]);
        } else {
          const yZ = fd.level === "top" ? 0.08 : fd.level === "bottom" ? 0.7 : 0.2;
          const yR = fd.level === "bottom" ? 0.18 : 0.45;
          // Scale initial velocity to species size — prevents snails/plecos darting in unnaturally
          const initSpeed = fd.bodyShape === "snail" ? 0.02 : fd.bodyShape === "shrimp" ? 0.05
            : fd.size === "tiny" ? 0.12 : fd.size === "small" ? 0.08 : fd.size === "medium" ? 0.06 : 0.04;
          nf.push({ data: fd, x: Math.random() * tankWidth, y: yZ * tankHeight + Math.random() * yR * tankHeight,
            vx: (Math.random() - 0.5) * initSpeed * 2, vy: (Math.random() - 0.5) * initSpeed * 0.4,
            pixelSize: (fd.size === "tiny" ? 8 : fd.size === "small" ? 14 : fd.size === "medium" ? 23 : fd.size === "huge" ? 52 : 35) * contentScale,
            wobble: Math.random() * Math.PI * 2, tailPhase: Math.random() * Math.PI * 2 });
        }
      }
    });
    fishRef.current = nf;
  }, [state.fish, tankWidth, tankHeight, contentScale]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = tankWidth * dpr; canvas.height = tankHeight * dpr;
    const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
    let animId; const t0 = performance.now();

    const animate = () => {
      // Skip rendering when paused (e.g. MiniPreview hidden) but keep loop alive
      if (pausedRef.current) { animId = requestAnimationFrame(animate); return; }
      const time = (performance.now() - t0) / 4000;
      ctx.clearRect(0, 0, tankWidth, tankHeight);

      // Read current config from refs (no stale closures)
      const { waterType, background, light: curLight, sub: curSub, subH: curSubH, nightMode: isNight } = configRef.current;

      const wG = ctx.createLinearGradient(0, 0, 0, tankHeight);
      if (isNight) {
        // Night mode: very dark deep blue
        wG.addColorStop(0, "#040A18"); wG.addColorStop(0.5, "#030814"); wG.addColorStop(1, "#020610");
      } else if (waterType === "salt") { wG.addColorStop(0, "#0A3055"); wG.addColorStop(0.5, "#082848"); wG.addColorStop(1, "#061E38"); }
      else { wG.addColorStop(0, "#0E3B5E"); wG.addColorStop(0.5, "#0A2E4A"); wG.addColorStop(1, "#071F34"); }
      ctx.fillStyle = wG; ctx.fillRect(0, 0, tankWidth, tankHeight);

      // ---- LIGHT ABSORPTION — deeper water shifts bluer/greener ----
      // Real water absorbs red wavelengths first, so the bottom of the tank
      // should have a subtle cyan/teal tint compared to the top
      if (!isNight) {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        const absG = ctx.createLinearGradient(0, 0, 0, tankHeight);
        absG.addColorStop(0, "rgba(255,255,255,1)");       // no tint at surface
        absG.addColorStop(0.3, "rgba(245,250,255,1)");     // barely noticeable
        absG.addColorStop(0.7, "rgba(220,240,250,1)");     // subtle cyan shift
        absG.addColorStop(1, "rgba(200,230,245,1)");       // deepest = most blue-green
        ctx.fillStyle = absG;
        ctx.fillRect(0, 0, tankWidth, tankHeight);
        ctx.restore();
      }

      // Background overlay
      const bgData = BACKGROUNDS.find(b => b.id === background.id);
      if (bgData && bgData.colors) {
        drawBackground(ctx, bgData, tankWidth, tankHeight, isNight ? background.brightness * 0.15 : background.brightness);
      }

      drawLightRays(ctx, tankWidth, tankHeight, time, curLight);
      drawCaustics(ctx, tankWidth, tankHeight, time, curLight);

      // Color wash — tints entire tank with light color at high intensity
      if (curLight && curLight.intensity > 0 && curLight.strength > 0.1) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const washG = ctx.createLinearGradient(0, 0, 0, tankHeight);
        const washAlpha = curLight.strength * curLight.strength * 0.5;
        washG.addColorStop(0, `rgba(${curLight.r},${curLight.g},${curLight.b},${washAlpha * 0.8})`);
        washG.addColorStop(0.4, `rgba(${curLight.r},${curLight.g},${curLight.b},${washAlpha * 0.3})`);
        washG.addColorStop(1, `rgba(${curLight.r},${curLight.g},${curLight.b},${washAlpha * 0.05})`);
        ctx.fillStyle = washG;
        ctx.fillRect(0, 0, tankWidth, tankHeight);
        ctx.restore();
      }

      drawSubstrate(ctx, curSub, tankWidth, tankHeight, curSubH);

      // ---- POSITION-BASED DECORATION RENDERING ----
      const expanded = expandedDecsRef.current;

      // Sort by layer: carpet first, then hardscape/ground by y, floating last
      const carpets = carpetsRef.current; carpets.length = 0;
      const floaters = floatersRef.current; floaters.length = 0;
      const ground = groundRef.current; ground.length = 0;
      for (let i = 0; i < expanded.length; i++) {
        const d = expanded[i];
        const dt = d.drawType;
        if (dt === "carpet") carpets.push(d);
        else if (dt === "frogbit" || dt === "salvinia" || dt === "duck") floaters.push(d);
        else ground.push(d);
      }
      // Sort ground items by y — lower y = further back in the tank
      ground.sort((a, b) => a.py - b.py);

      // ---- 5-LANE DEPTH SYSTEM ----
      // Decorations are placed into 5 depth lanes based on their Y position.
      // User controls depth by dragging items up/down — higher = further back.
      // Each lane gets a different substrate burial depth for 3D parallax.
      const subLine = tankHeight - curSubH;
      const depthLanes = [[], [], [], [], []]; // 5 lanes: 0=furthest back, 4=closest front
      const laneSubY = [
        subLine + curSubH * 0.15,  // lane 0: back — shallowest burial
        subLine + curSubH * 0.3,   // lane 1
        subLine + curSubH * 0.45,  // lane 2: middle
        subLine + curSubH * 0.58,  // lane 3
        subLine + curSubH * 0.7,   // lane 4: front — deepest burial
      ];

      ground.forEach(d => {
        // Assign lane based on Y position within the tank's lower half
        // Items dragged higher go to back lanes, items lower go to front lanes
        const yNorm = Math.max(0, Math.min(1, (d.py - tankHeight * 0.4) / (tankHeight * 0.55)));
        const lane = Math.min(4, Math.floor(yNorm * 5));
        d._depthLane = lane;
        depthLanes[lane].push(d);
      });

      // Render layers with z-depth fish interleaving
      // 1. Carpets (very back)
      carpets.forEach(d => drawDecoration(ctx, d, d.px, tankHeight - curSubH, tankHeight, time));

      // Fish are split into 3 depth groups
      const bgFish = bgFishRef.current; bgFish.length = 0;    // zDepth < 0.33 — behind all decor
      const midFish = [];                                       // zDepth 0.33-0.66 — between decor layers
      const fgFish = fgFishRef.current; fgFish.length = 0;    // zDepth > 0.66 — in front of all decor

      // Drag indicator — show around the item being dragged
      if (dragRef.current) {
        const dragged = expanded.find(d => d.decId === dragRef.current.decId && d.posIdx === dragRef.current.posIdx);
        if (dragged) {
          ctx.save();
          const isFloating = ["frogbit", "salvinia", "duck"].includes(dragged.drawType);
          const isGround = !isFloating && dragged.drawType !== "carpet";
          const indicatorX = dragged.px;
          const indicatorY = isGround ? dragged.py : (isFloating ? dragged.py : tankHeight - curSubH - tankHeight * 0.06);
          // Dashed circle
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = "rgba(120,200,255,0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          // Glow
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 20, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(120,200,255,0.06)";
          ctx.fill();
          // Drop hint for ground items above substrate
          if (isGround && dragged.py < tankHeight - curSubH - 20) {
            // Dotted line showing where it will land
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = "rgba(120,200,255,0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(indicatorX, indicatorY + 22);
            ctx.lineTo(indicatorX, tankHeight - curSubH);
            ctx.stroke();
            ctx.setLineDash([]);
            // Small target on substrate
            ctx.beginPath();
            ctx.arc(indicatorX, tankHeight - curSubH, 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(120,200,255,0.3)";
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // --- SINKING ANIMATIONS ---
      const subColor = curSub ? curSub.color : "#8B7355";
      const subRgb = curSub ? hexToRgb(curSub.color) : { r: 139, g: 115, b: 85 };
      const cs = contentScale; // shorthand for sinking/dust scaling
      sinkingRef.current = sinkingRef.current.filter(s => {
        if (s.landed) return false;
        s.vy += 0.025;
        s.vy *= 0.94;
        s.vy = Math.min(s.vy, 1.15);
        s.currentY += s.vy;
        s.wobblePhase += 0.02;
        const wobbleAmp = (3 + Math.max(0, 2 - s.vy) * 1.5) * cs;
        const wobbleX = Math.sin(s.wobblePhase) * wobbleAmp;
        const wobbleX2 = Math.sin(s.wobblePhase * 0.7 + 1.5) * wobbleAmp * 0.2;

        const landY = tankHeight - curSubH;
        if (s.currentY >= landY) {
          s.currentY = landY;
          s.landed = true;
          const numDust = Math.round((12 + Math.random() * 8) * cs);
          for (let i = 0; i < numDust; i++) {
            const angle = -Math.PI * (0.15 + Math.random() * 0.7);
            const speed = (1.2 + Math.random() * 2.5) * cs;
            const side = i < numDust / 2 ? -1 : 1;
            dustRef.current.push({
              x: s.x + side * (Math.random() * 12 * cs),
              y: landY - 2,
              vx: Math.cos(angle) * speed * side * (0.5 + Math.random()),
              vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4),
              life: 0, maxLife: 25 + Math.random() * 20,
              size: (1.5 + Math.random() * 2.5) * cs,
              r: subRgb.r + Math.floor(Math.random() * 30 - 15),
              g: subRgb.g + Math.floor(Math.random() * 30 - 15),
              b: subRgb.b + Math.floor(Math.random() * 30 - 15),
            });
          }
          // Snap the item position to substrate level
          onUpdatePosition(s.decId, s.posIdx, s.x / tankWidth, landY / tankHeight);
          return false;
        }

        // Draw the sinking item at animated position
        drawDecoration(ctx, s.dec, s.x + wobbleX + wobbleX2, s.currentY, tankHeight, time);

        // Draw motion trail - scaled
        ctx.save();
        for (let t2 = 1; t2 <= 4; t2++) {
          const trailAlpha = 0.08 * (1 - t2 / 5);
          ctx.beginPath();
          ctx.arc(s.x + wobbleX * (1 - t2 * 0.15), s.currentY - t2 * 10 * cs, (3 + t2 * 2.5) * cs, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(150,200,255,${trailAlpha})`;
          ctx.fill();
        }
        const rippleAlpha = Math.abs(Math.cos(s.wobblePhase)) * 0.08;
        ctx.beginPath();
        ctx.ellipse(s.x + wobbleX + wobbleX2, s.currentY, (15 + wobbleAmp) * cs, 3 * cs, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,220,255,${rippleAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();

        return true; // keep animating
      });

      // --- DUST / SAND PARTICLES ---
      dustRef.current = dustRef.current.filter(p => {
        p.life++;
        if (p.life > p.maxLife) return false;
        p.vy += 0.06; // gravity pulls dust back down
        p.vx *= 0.95; // air/water resistance
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;
        const alpha = 1 - (p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha * 0.6})`;
        ctx.fill();
        return true;
      });

      // Bubbles
      const hasBubbler = decStateRef.current.some(d => d.id === "bubbler");
      if (hasBubbler && Math.random() < 0.3) {
        const bubblerDec = expanded.find(d => d.id === "bubbler");
        const bx = bubblerDec ? bubblerDec.px : tankWidth / 2;
        bubblesRef.current.push({ x: bx + (Math.random() - 0.5) * 6, y: tankHeight - curSubH, r: 1 + Math.random() * 2.5, speed: 0.06 + Math.random() * 0.12, wp: Math.random() * Math.PI * 2 });
      }
      if (Math.random() < 0.01) bubblesRef.current.push({ x: Math.random() * tankWidth, y: tankHeight - curSubH - Math.random() * 20, r: 0.5 + Math.random() * 1.5, speed: 0.06 + Math.random() * 0.12, wp: Math.random() * Math.PI * 2 });
      bubblesRef.current = bubblesRef.current.filter(b => b.y > -5);
      bubblesRef.current.forEach(b => {
        b.y -= b.speed; b.x += Math.sin(b.y * 0.08 + b.wp) * 0.08;
        const bG = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
        bG.addColorStop(0, "rgba(200,230,255,0.25)"); bG.addColorStop(0.7, "rgba(150,200,255,0.1)"); bG.addColorStop(1, "rgba(100,180,255,0.05)");
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = bG; ctx.fill();
        ctx.strokeStyle = "rgba(180,220,255,0.18)"; ctx.lineWidth = 0.5; ctx.stroke();
      });

      // ---- FLOATING DETRITUS PARTICLES ----
      // Tiny permanent particles drifting in the water column.
      // They catch the light and make the water feel like a real medium.
      // Initialize once, then simulate every frame.
      const TARGET_PARTICLES = Math.round(20 + tankWidth * 0.04);
      while (floatingRef.current.length < TARGET_PARTICLES) {
        floatingRef.current.push({
          x: Math.random() * tankWidth,
          y: Math.random() * (tankHeight - curSubH - 10) + 5,
          vx: (Math.random() - 0.5) * 0.03,
          vy: (Math.random() - 0.5) * 0.015,
          size: 0.4 + Math.random() * 1.2,
          phase: Math.random() * Math.PI * 2,
          drift: 0.005 + Math.random() * 0.01, // how much it sways
          brightness: 0.3 + Math.random() * 0.7,  // some catch light more
          kind: Math.random(), // 0-0.5 = white speck, 0.5-0.8 = green speck, 0.8-1 = warm speck
        });
      }
      // Trim if tank shrunk
      while (floatingRef.current.length > TARGET_PARTICLES + 10) floatingRef.current.pop();

      floatingRef.current.forEach(p => {
        p.phase += 0.003;
        // Gentle Brownian drift
        p.vx += (Math.random() - 0.5) * 0.002;
        p.vy += (Math.random() - 0.5) * 0.001;
        // Very slow settling (detritus sinks slightly)
        p.vy += 0.0002;
        // Damping
        p.vx *= 0.998;
        p.vy *= 0.997;
        // Clamp speed
        p.vx = Math.max(-0.08, Math.min(0.08, p.vx));
        p.vy = Math.max(-0.04, Math.min(0.04, p.vy));
        // Sinusoidal sway
        p.x += p.vx + Math.sin(p.phase) * p.drift;
        p.y += p.vy + Math.cos(p.phase * 0.7 + 1) * p.drift * 0.5;
        // Wrap around edges
        if (p.x < -3) p.x = tankWidth + 2;
        if (p.x > tankWidth + 3) p.x = -2;
        // Bounce off top and substrate
        if (p.y < 3) { p.y = 3; p.vy = Math.abs(p.vy); }
        if (p.y > tankHeight - curSubH - 3) { p.y = tankHeight - curSubH - 3; p.vy = -Math.abs(p.vy) * 0.5; }

        // Draw — brightness affected by depth (closer to light = brighter)
        const depthFade = 1 - (p.y / tankHeight) * 0.4;
        const alpha = p.brightness * depthFade * (isNight ? 0.08 : 0.18);
        // Color based on kind
        let pr, pg, pb;
        if (p.kind < 0.5) { pr = 200; pg = 220; pb = 240; }          // white-ish (dust)
        else if (p.kind < 0.8) { pr = 140; pg = 180; pb = 120; }     // green-ish (plant matter)
        else { pr = 180; pg = 160; pb = 130; }                         // warm (food/debris)

        // Shimmer — some particles briefly catch light
        const shimmer = Math.sin(time * 8 + p.phase * 3) > 0.92 ? 0.25 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha + shimmer})`;
        ctx.fill();
      });

      // Fish behavior simulation
      simulateFish(fishRef.current, tankWidth, tankHeight, curSubH, expanded, bgFish, fgFish, midFish);

      // ===== LAYER 1: Background fish (behind ALL decorations) =====
      bgFish.forEach(f => {
        ctx.save();
        ctx.globalAlpha = 0.7;
        drawFishBody(ctx, f, time);
        ctx.restore();
      });

      // ---- DEPTH FOG ----
      if (!isNight) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const fogG = ctx.createLinearGradient(0, 0, 0, tankHeight);
        fogG.addColorStop(0, "rgba(80,120,170,0.015)");
        fogG.addColorStop(0.2, "rgba(70,110,160,0.025)");
        fogG.addColorStop(0.5, "rgba(60,100,150,0.02)");
        fogG.addColorStop(0.8, "rgba(50,90,140,0.01)");
        fogG.addColorStop(1, "rgba(40,80,130,0)");
        ctx.fillStyle = fogG;
        ctx.fillRect(0, 0, tankWidth, tankHeight);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const nfogG = ctx.createLinearGradient(0, 0, 0, tankHeight);
        nfogG.addColorStop(0, "rgba(30,50,100,0.02)");
        nfogG.addColorStop(0.4, "rgba(25,40,90,0.015)");
        nfogG.addColorStop(1, "rgba(15,25,60,0)");
        ctx.fillStyle = nfogG;
        ctx.fillRect(0, 0, tankWidth, tankHeight);
        ctx.restore();
      }

      // ===== DEPTH LANES 0-1: Back decorations =====
      const drawLane = (lane, alpha) => {
        depthLanes[lane].forEach(d => {
          if (sinkingRef.current.some(s => s.decId === d.decId && s.posIdx === d.posIdx)) return;
          const isDragged = dragRef.current && dragRef.current.decId === d.decId && dragRef.current.posIdx === d.posIdx;
          if (isDragged) {
            drawDecoration(ctx, d, d.px, d.py, tankHeight, time);
          } else {
            if (alpha < 1) { ctx.save(); ctx.globalAlpha = alpha; }
            drawDecoration(ctx, d, d.px, laneSubY[lane], tankHeight, time);
            if (alpha < 1) ctx.restore();
          }
        });
      };

      drawLane(0, 0.8);  // furthest back — faded
      drawLane(1, 0.88);

      // ===== Mid-depth fish (swim between back and front decor) =====
      midFish.forEach(f => {
        ctx.save();
        ctx.globalAlpha = 0.88;
        drawFishBody(ctx, f, time);
        ctx.restore();
      });

      // ===== DEPTH LANES 2-3: Middle decorations =====
      drawLane(2, 0.95);
      drawLane(3, 1.0);

      // ===== DEPTH LANE 4: Front decorations =====
      drawLane(4, 1.0);

      // ===== Foreground fish (in front of ALL decorations) =====
      fgFish.forEach(f => {
        drawFishBody(ctx, f, time);
      });

      // 4.5. Food particles (from feeding events)
      const foodParts = getFoodParticles();
      if (foodParts.length > 0) {
        ctx.save();
        foodParts.forEach(p => {
          // Warm brown/orange food flakes
          const age = Math.min(1, p.life / 300); // fade over ~5 sec
          const alpha = 0.9 - age * 0.5;
          if (alpha <= 0) return;
          ctx.globalAlpha = alpha;
          // Flake shape — slightly irregular
          ctx.beginPath();
          const wobble = Math.sin(p.life * 0.08 + p.x) * 0.4;
          ctx.ellipse(p.x, p.y, p.size * (1.1 + wobble * 0.3), p.size * (0.7 - wobble * 0.15), wobble, 0, Math.PI * 2);
          // Color varies per flake
          const hueShift = Math.sin(p.x * 0.5) * 30;
          ctx.fillStyle = `rgb(${180 + hueShift},${110 + hueShift * 0.5},${50})`;
          ctx.fill();
          // Tiny highlight
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,230,180,${alpha * 0.4})`;
          ctx.fill();
        });
        ctx.restore();
      }

      // 5. Floaters (top layer)
      floaters.forEach(d => {
        drawDecoration(ctx, d, d.px, tankHeight - curSubH, tankHeight, time);
      });

      // ---- STARTLE RIPPLE — visual feedback for glass tap ----
      if (startleRef.current.timer > 0) {
        startleRef.current.timer--;
        const st = startleRef.current;
        const progress = 1 - st.timer / st.maxTimer;
        const radius = st.radius * progress;
        const alpha = (1 - progress) * 0.15;
        ctx.save();
        ctx.strokeStyle = `rgba(180,220,255,${alpha})`;
        ctx.lineWidth = 1.5 * (1 - progress);
        // Expanding ripple rings
        for (let r = 0; r < 3; r++) {
          const ringProgress = Math.max(0, progress - r * 0.15);
          if (ringProgress <= 0) continue;
          const ringR = st.radius * ringProgress;
          const ringAlpha = (1 - ringProgress) * 0.12;
          ctx.globalAlpha = ringAlpha;
          ctx.beginPath();
          ctx.arc(st.x, st.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ===== WATER SURFACE =====
      // Multi-layer surface effect: refraction distortion, meniscus, foam, shimmer

      // Layer 1: Refraction distortion band — wavy horizontal lines that simulate
      // the light-bending you see when looking through a water surface
      ctx.save();
      ctx.globalAlpha = 0.06;
      for (let row = 0; row < 6; row++) {
        const baseY = 8 + row * 5;
        ctx.beginPath();
        for (let x = 0; x <= tankWidth; x += 3) {
          const wave = Math.sin(x * 0.06 + time * 1.8 + row * 0.7) * 3
                     + Math.sin(x * 0.12 + time * 2.5 - row * 0.5) * 1.5
                     + Math.cos(x * 0.03 + time * 1.1 + row * 1.2) * 2;
          if (x === 0) ctx.moveTo(x, baseY + wave);
          else ctx.lineTo(x, baseY + wave);
        }
        ctx.strokeStyle = `rgba(180,220,255,${0.5 - row * 0.07})`;
        ctx.lineWidth = 1.5 - row * 0.15;
        ctx.stroke();
      }
      ctx.restore();

      // Layer 2: Surface meniscus — the bright edge where water meets glass
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= tankWidth; x += 2) {
        const wave = Math.sin(x * 0.08 + time * 2) * 1.8
                   + Math.sin(x * 0.03 + time * 1.3) * 1.2
                   + Math.sin(x * 0.15 + time * 3.2) * 0.6;
        if (x === 0) ctx.moveTo(x, wave + 2);
        else ctx.lineTo(x, wave + 2);
      }
      ctx.lineTo(tankWidth, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      // Gradient from bright at waterline to transparent above
      const surfGrad = ctx.createLinearGradient(0, 0, 0, 8);
      surfGrad.addColorStop(0, "rgba(140,200,255,0.0)");
      surfGrad.addColorStop(0.6, "rgba(160,210,255,0.08)");
      surfGrad.addColorStop(1, "rgba(200,230,255,0.15)");
      ctx.fillStyle = surfGrad;
      ctx.fill();
      ctx.restore();

      // Layer 3: Bright highlight line — the main visible surface edge
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= tankWidth; x += 2) {
        const wave = Math.sin(x * 0.08 + time * 2) * 1.8
                   + Math.sin(x * 0.03 + time * 1.3) * 1.2
                   + Math.sin(x * 0.15 + time * 3.2) * 0.6;
        if (x === 0) ctx.moveTo(x, wave + 2.5);
        else ctx.lineTo(x, wave + 2.5);
      }
      ctx.strokeStyle = "rgba(200,235,255,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Secondary thinner bright line
      ctx.beginPath();
      for (let x = 0; x <= tankWidth; x += 2) {
        const wave = Math.sin(x * 0.08 + time * 2) * 1.8
                   + Math.sin(x * 0.03 + time * 1.3) * 1.2
                   + Math.sin(x * 0.15 + time * 3.2) * 0.6;
        if (x === 0) ctx.moveTo(x, wave + 1.5);
        else ctx.lineTo(x, wave + 1.5);
      }
      ctx.strokeStyle = "rgba(220,240,255,0.12)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      // Layer 4: Foam / micro-bubbles along the surface
      ctx.save();
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 12; i++) {
        const bx = ((i * 47.3 + time * 8) % (tankWidth + 20)) - 10;
        const wave = Math.sin(bx * 0.08 + time * 2) * 1.8 + Math.sin(bx * 0.03 + time * 1.3) * 1.2;
        const by = wave + 4 + Math.sin(time * 3 + i * 2.1) * 1;
        const br = 1 + Math.sin(i * 1.7) * 0.5;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,230,255,0.6)";
        ctx.fill();
      }
      ctx.restore();

      // Layer 5: Shimmer spots — moving bright patches on the surface
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const sx = ((i * 137 + time * 15) % (tankWidth + 40)) - 20;
        const wave = Math.sin(sx * 0.08 + time * 2) * 1.8;
        const shimmerW = 25 + Math.sin(time * 1.5 + i * 3) * 10;
        const shimmerAlpha = 0.03 + Math.sin(time * 2.5 + i * 1.7) * 0.02;
        const shimG = ctx.createRadialGradient(sx, wave + 3, 0, sx, wave + 3, shimmerW);
        shimG.addColorStop(0, `rgba(200,235,255,${shimmerAlpha})`);
        shimG.addColorStop(1, "rgba(200,235,255,0)");
        ctx.fillStyle = shimG;
        ctx.fillRect(sx - shimmerW, wave + 3 - shimmerW * 0.3, shimmerW * 2, shimmerW * 0.6);
      }
      ctx.restore();

      // ================================================================
      // NIGHT MODE — dramatic moonlit aquarium
      // ================================================================
      if (isNight) {
        ctx.save();

        // --- 1. DECORATION SILHOUETTES ---
        // Darken decorations more than water for visible silhouette contrast.
        // We overlay a dark layer only in the lower half where decor lives.
        ctx.globalCompositeOperation = "multiply";
        const silG = ctx.createLinearGradient(0, tankHeight * 0.3, 0, tankHeight);
        silG.addColorStop(0, "rgba(255,255,255,1)");       // no darkening in upper water
        silG.addColorStop(0.3, "rgba(220,225,240,1)");     // slight darken mid
        silG.addColorStop(0.7, "rgba(180,190,215,1)");     // heavier in decor zone
        silG.addColorStop(1, "rgba(160,170,200,1)");       // darkest at substrate
        ctx.fillStyle = silG;
        ctx.fillRect(0, 0, tankWidth, tankHeight);

        // --- 2. DARK BLUE WASH ---
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(5,10,30,0.42)";
        ctx.fillRect(0, 0, tankWidth, tankHeight);

        // Blue tint via multiply
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgba(20,35,80,0.35)";
        ctx.fillRect(0, 0, tankWidth, tankHeight);

        // --- 3. MOONBEAM (wider, softer) ---
        ctx.globalCompositeOperation = "screen";
        // Primary moonbeam — cone from top
        const moonX = tankWidth * (0.45 + Math.sin(time * 0.15) * 0.05);
        const moonG = ctx.createRadialGradient(moonX, -15, 0, moonX, tankHeight * 0.35, tankWidth * 0.5);
        moonG.addColorStop(0, "rgba(90,130,230,0.08)");
        moonG.addColorStop(0.3, "rgba(60,100,200,0.04)");
        moonG.addColorStop(0.7, "rgba(40,70,160,0.015)");
        moonG.addColorStop(1, "rgba(30,50,120,0)");
        ctx.fillStyle = moonG;
        ctx.fillRect(0, 0, tankWidth, tankHeight);

        // Secondary moonbeam shaft — narrow bright column
        const shaftW = tankWidth * 0.15;
        const shaftG = ctx.createLinearGradient(moonX, 0, moonX, tankHeight * 0.7);
        shaftG.addColorStop(0, "rgba(100,150,255,0.04)");
        shaftG.addColorStop(0.4, "rgba(80,120,220,0.02)");
        shaftG.addColorStop(1, "rgba(60,90,180,0)");
        ctx.fillStyle = shaftG;
        ctx.beginPath();
        ctx.moveTo(moonX - shaftW * 0.3, 0);
        ctx.lineTo(moonX - shaftW * 0.8, tankHeight * 0.7);
        ctx.lineTo(moonX + shaftW * 0.8, tankHeight * 0.7);
        ctx.lineTo(moonX + shaftW * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        // --- 4. MOON CAUSTICS ---
        // Very subtle, slow-moving blue caustic patches from the moonbeam
        ctx.globalAlpha = 0.025;
        for (let i = 0; i < 8; i++) {
          const hash = Math.sin(i * 127.1 + 77) * 43758.5453;
          const cx = moonX + ((hash % 1 + 1) % 1 - 0.5) * tankWidth * 0.6;
          const cy = tankHeight * (0.15 + ((Math.sin(i * 269.5 + 31) * 43758.5453 % 1 + 1) % 1) * 0.5);
          const cr = 15 + (i * 13 % 20);
          // Slow drift
          const dx = Math.sin(time * 0.3 + i * 1.7) * 8;
          const dy = Math.cos(time * 0.25 + i * 2.3) * 5;
          // Flickering brightness
          const bright = (Math.sin(time * 0.5 + i * 3.1) + 1) * 0.5;
          if (bright < 0.3) continue;

          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.4) {
            const wobble = Math.sin(a * 3 + time * 0.4 + i) * cr * 0.25;
            const rx = cx + dx + Math.cos(a) * (cr + wobble);
            const ry = cy + dy + Math.sin(a) * (cr * 0.6 + wobble * 0.5);
            if (a === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(80,120,220,${bright})`;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // --- 5. FISH EYE GLOW ---
        // In moonlight, fish eyes catch and reflect light — tiny blue-white point lights.
        const allFish = [...bgFish, ...midFish, ...fgFish];
        ctx.globalCompositeOperation = "screen";
        allFish.forEach(fi => {
          const s = fi.pixelSize;
          const dir = fi.vx >= 0 ? 1 : -1;
          // Approximate eye position in world space
          let eyeOffX, eyeOffY;
          if (fi.data.bodyShape === "tall") { eyeOffX = s * 0.15; eyeOffY = -s * 0.15; }
          else if (fi.data.bodyShape === "disc") { eyeOffX = s * 0.25; eyeOffY = -s * 0.08; }
          else if (fi.data.bodyShape === "snail") { eyeOffX = s * 0.55; eyeOffY = -s * 0.32; }
          else if (fi.data.bodyShape === "shrimp") { eyeOffX = s * 0.4; eyeOffY = -s * 0.15; }
          else { eyeOffX = s * 0.35; eyeOffY = -s * 0.08; }

          const ex = fi.x + eyeOffX * dir;
          const ey = fi.y + eyeOffY;
          const glowR = Math.max(2, s * 0.12);

          // Outer glow
          const gG = ctx.createRadialGradient(ex, ey, 0, ex, ey, glowR * 3);
          gG.addColorStop(0, "rgba(120,170,255,0.12)");
          gG.addColorStop(0.4, "rgba(80,130,220,0.04)");
          gG.addColorStop(1, "rgba(60,100,200,0)");
          ctx.fillStyle = gG;
          ctx.beginPath(); ctx.arc(ex, ey, glowR * 3, 0, Math.PI * 2); ctx.fill();

          // Bright core
          ctx.beginPath(); ctx.arc(ex, ey, glowR * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(180,210,255,0.2)";
          ctx.fill();
        });

        // --- 6. STARFIELD SURFACE REFLECTION ---
        // Faint, tiny white dots on the water surface that flicker.
        // Mimics light from the room reflecting off the water surface at night.
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < 15; i++) {
          const hash = Math.sin(i * 73.1 + 13) * 43758.5453;
          const sx = ((hash % 1 + 1) % 1) * tankWidth;
          const surfWave = Math.sin(sx * 0.08 + time * 2) * 1.8 + Math.sin(sx * 0.03 + time * 1.3) * 1.2;
          const sy = surfWave + 3 + Math.sin(time * 3 + i * 2.7) * 0.8;

          // Twinkle — each star has its own phase
          const twinkle = (Math.sin(time * 4 + i * 5.3) + 1) * 0.5;
          if (twinkle < 0.3) continue;

          const starR = 0.5 + twinkle * 0.8;
          ctx.globalAlpha = twinkle * 0.15;
          ctx.beginPath(); ctx.arc(sx, sy, starR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(200,220,255,1)";
          ctx.fill();

          // Tiny cross flare on brightest stars
          if (twinkle > 0.7) {
            ctx.globalAlpha = (twinkle - 0.7) * 0.3;
            ctx.beginPath();
            ctx.moveTo(sx - starR * 2.5, sy); ctx.lineTo(sx + starR * 2.5, sy);
            ctx.moveTo(sx, sy - starR * 2.5); ctx.lineTo(sx, sy + starR * 2.5);
            ctx.strokeStyle = "rgba(180,210,255,1)";
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      // Vignette — stronger at night
      const vigStrength = isNight ? 0.5 : 0.25;
      const vig = ctx.createRadialGradient(tankWidth / 2, tankHeight / 2, tankWidth * 0.3, tankWidth / 2, tankHeight / 2, tankWidth * 0.7);
      vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, `rgba(0,0,0,${vigStrength})`);
      ctx.fillStyle = vig; ctx.fillRect(0, 0, tankWidth, tankHeight);

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [tankWidth, tankHeight, dpr]); // Only remount when canvas size changes — all config reads come from refs

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: tankWidth, height: tankHeight, borderRadius: 4, cursor: dragRef.current ? "grabbing" : "default", touchAction: "none" }} />
      <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: 9, opacity: 0.25, pointerEvents: "none", color: "#AAC8FF", letterSpacing: 0.5 }}>
        {state.decorations.length > 0 ? "drag items · " : ""}click to tap glass · double-click to feed
      </div>
    </div>
  );
});

export default AquariumCanvas;