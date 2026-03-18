'use client';

import { useState, useEffect, useRef } from "react";
import {
  TANK_SIZES,
  LIGHTS,
  FISH_DB,
} from '../data/index.js';
import { getWarnings } from '../hooks/getWarnings.js';
import { DEFAULT_STATE, loadSavedState, loadFromURL, useAutoSave } from '../hooks/usePersistence.js';
import { smartPosition, layoutPreset } from '../hooks/usePlacement.js';
import { useUndoRedo } from '../hooks/useUndoRedo.js';
import AquariumCanvas from './AquariumCanvas.jsx';
import { clearEvents } from '../rendering/simulateFish.js';
import { StepPanels, SelectedItemPanel, MiniPreview, Toast, SaveShareBar, FullscreenView, CostSummary } from './panels/index.js';

// ============================================================================
// MAIN APP
// Orchestrates state, layout shell, tank preview, warnings, and step panels.
// ============================================================================
export default function AquariumBuilder() {
  const [step, setStep] = useState(0);
  const [openGroups, setOpenGroups] = useState({});
  const [lastAdded, setLastAdded] = useState(null);
  const [selectedDecId, setSelectedDecId] = useState(null);
  const [tankVisible, setTankVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const tankPreviewRef = useRef(null);
  const aquariumRef = useRef(null);
  const [state, setState, { undo, redo, canUndo, canRedo }] = useUndoRedo(() => {
    // Priority: URL share > localStorage > defaults
    return loadFromURL() || loadSavedState() || { ...DEFAULT_STATE };
  });

  // Auto-save to localStorage on every change (debounced)
  useAutoSave(state);

  // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Shift+Z / Ctrl+Y = redo
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || e.key === 'y')) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  // ---- Derived values ----
  const tank = state.tankSize === "custom"
    ? { id: "custom", name: "Custom", width: state.customTank.width, height: state.customTank.height, depth: state.customTank.depth, liters: Math.round(state.customTank.width * state.customTank.height * state.customTank.depth / 1000), price: 0 }
    : TANK_SIZES.find(t => t.id === state.tankSize);
  const warnings = getWarnings(state);
  const totalBio = state.fish.reduce((s, f) => { const fd = FISH_DB.find(d => d.id === f.id); return s + (fd ? fd.bio * f.count : 0); }, 0);
  const stockPct = Math.min(Math.round((totalBio / (tank.liters / 5)) * 100), 150);
  const light = state.light === "custom"
    ? { id: "custom", name: "Custom", intensity: state.customLight.intensity, spectrum: "custom", planted: state.customLight.intensity >= 2, price: 0, r: state.customLight.r, g: state.customLight.g, b: state.customLight.b, strength: state.customLight.strength }
    : LIGHTS.find(l => l.id === state.light);
  const maxVW = typeof window !== "undefined" && window.innerWidth >= 768 ? 720 : 560;
  const maxVH = typeof window !== "undefined" && window.innerWidth >= 768 ? 440 : 320;
  const sc = tank ? Math.min(maxVW / tank.width, maxVH / tank.height) : 1;
  const vw = tank ? Math.round(tank.width * sc) : 300;
  const vh = tank ? Math.round(tank.height * sc) : 200;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  const availFish = FISH_DB.filter(f => f.water === state.waterType);
  const ambientGlow = nightMode
    ? "radial-gradient(ellipse at 50% 40%, rgba(30,50,120,0.2) 0%, transparent 65%)"
    : light && light.intensity > 0
      ? `radial-gradient(ellipse at 50% 40%, rgba(${light.r},${light.g},${light.b},${light.strength * 0.7}) 0%, transparent 65%)`
      : "radial-gradient(ellipse at 50% 60%, rgba(10,40,80,0.15) 0%, transparent 70%)";

  // ---- Actions ----
  const addFish = (id) => setState(p => { const e = p.fish.find(f => f.id === id); return e ? { ...p, fish: p.fish.map(f => f.id === id ? { ...f, count: f.count + 1 } : f) } : { ...p, fish: [...p.fish, { id, count: 1 }] }; });
  const removeFish = (id) => setState(p => ({ ...p, fish: p.fish.map(f => f.id === id ? { ...f, count: f.count - 1 } : f).filter(f => f.count > 0) }));

  const toggleDec = (id) => setState(p => {
    if (p.decorations.some(d => d.id === id)) return { ...p, decorations: p.decorations.filter(d => d.id !== id) };
    const pos = smartPosition(id, p.decorations);
    return { ...p, decorations: [...p.decorations, { id, count: 1, positions: [pos] }] };
  });

  const addPlant = (id) => setState(p => {
    const e = p.decorations.find(d => d.id === id);
    if (e) {
      const newPos = smartPosition(id, p.decorations);
      return { ...p, decorations: p.decorations.map(d => d.id === id ? { ...d, count: d.count + 1, positions: [...(d.positions || []), newPos] } : d) };
    }
    const pos = smartPosition(id, p.decorations);
    return { ...p, decorations: [...p.decorations, { id, count: 1, positions: [pos] }] };
  });

  const removePlant = (id) => setState(p => ({
    ...p, decorations: p.decorations.map(d => d.id === id ? { ...d, count: d.count - 1, positions: (d.positions || []).slice(0, -1) } : d).filter(d => d.count > 0)
  }));

  const updateDecPosition = (decId, posIdx, nx, ny) => {
    setState(p => ({
      ...p, decorations: p.decorations.map(d => {
        if (d.id !== decId) return d;
        const newPositions = [...(d.positions || [])];
        if (posIdx < newPositions.length) newPositions[posIdx] = { x: nx, y: ny };
        return { ...d, positions: newPositions };
      })
    }));
  };

  const resizeDecor = (decId, delta) => {
    setState(p => ({
      ...p, decorations: p.decorations.map(d => {
        if (d.id !== decId) return d;
        const cur = d.userScale || 1;
        const next = Math.max(0.3, Math.min(3.0, cur + delta));
        return { ...d, userScale: Math.round(next * 100) / 100 };
      })
    }));
  };

  const applyPreset = (preset) => {
    clearEvents();
    // Use the smart layout engine for collision-aware placement
    const decorations = layoutPreset(preset);

    const fish = (preset.fish || []).map(id => {
      const fd = FISH_DB.find(f => f.id === id);
      return { id, count: fd?.schooling ? fd.minSchool : (fd?.minSchool || 1) };
    });
    setState(s => ({
      ...s,
      tankSize: preset.tank || s.tankSize,
      waterType: preset.water || s.waterType,
      substrate: preset.substrate || s.substrate,
      light: preset.light || s.light,
      filter: preset.filter || s.filter,
      heater: preset.heater || s.heater,
      decorations, fish,
      substrateDepth: preset.substrate === "bare" ? 1 : 12,
    }));
    setStep(1);
  };

  // ---- Effects ----
  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(() => setLastAdded(null), 2200);
    return () => clearTimeout(t);
  }, [lastAdded]);

  useEffect(() => {
    const el = tankPreviewRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { setTankVisible(entry.isIntersecting); }, { threshold: 0, rootMargin: "-60px 0px 0px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---- Step navigation ----
  const steps = [
    { label: "Style", icon: "🎨" },
    { label: "Tank", icon: "🔲" },
    { label: "Water", icon: "💧" },
    { label: "Substrate", icon: "⬇" },
    { label: "Equip", icon: "⚡" },
    { label: "Decor", icon: "🪨" },
    { label: "Plants", icon: "🌿" },
    { label: "Fish", icon: "🐟" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080E1A", color: "#D0D8E4", fontFamily: "'SF Mono','Fira Code','JetBrains Mono',monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}[style*="scrollbarWidth"]::-webkit-scrollbar{display:none}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.08);border-radius:4px;height:4px;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#7CB8FF;cursor:pointer;border:2px solid #080E1A;box-shadow:0 0 6px rgba(60,140,255,0.4)}input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#7CB8FF;cursor:pointer;border:2px solid #080E1A}input[type=text],input[type=search]{-webkit-appearance:none}`}</style>

      {/* ---- HEADER ---- */}
      <div style={{ padding: isDesktop ? "8px 20px 6px" : "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "linear-gradient(180deg,#0D1525,#080E1A)" }}>
        <div style={{ display: "flex", alignItems: isDesktop ? "center" : "flex-start", gap: isDesktop ? 16 : 10, flexWrap: isDesktop ? "nowrap" : "wrap", marginBottom: isDesktop ? 0 : 14 }}>
          {/* Logo + title — compact on desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: isDesktop ? 28 : 36, height: isDesktop ? 28 : 36, borderRadius: isDesktop ? 7 : 10, background: "linear-gradient(135deg,#0A4080,#1A6BC0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDesktop ? 14 : 18 }}>🐠</div>
            <div>
              <h1 style={{ fontSize: isDesktop ? 13 : 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: "#F0F4FF", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Aquarium Builder</h1>
              {!isDesktop && <p style={{ fontSize: 10, opacity: 0.3, letterSpacing: 1.5 }}>SANDBOX · {tank.name.toUpperCase()} · {tank.liters}L</p>}
            </div>
            {isDesktop && <span style={{ fontSize: 9, opacity: 0.25, letterSpacing: 1.2, marginLeft: 4 }}>{tank.name.toUpperCase()} · {tank.liters}L</span>}
          </div>

          {/* Step tabs — inline on desktop */}
          <div style={{
            display: "flex", gap: 2, overflowX: "auto", WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none", padding: "2px 0", msOverflowStyle: "none",
            flex: isDesktop ? "1 1 auto" : "0 0 100%",
            order: isDesktop ? 0 : 1,
            justifyContent: isDesktop ? "center" : "flex-start",
          }}>
            {steps.map((s, i) => {
              const active = step === i;
              return (
                <button key={s.label} onClick={() => setStep(i)} style={{
                  flex: "0 0 auto", padding: isDesktop ? "5px 10px" : "8px 12px", minWidth: isDesktop ? 44 : 52,
                  display: "flex", flexDirection: isDesktop ? "row" : "column", alignItems: "center", gap: isDesktop ? 4 : 2,
                  fontSize: 9, fontWeight: active ? 700 : 400, letterSpacing: 0.3,
                  background: active ? "rgba(60,140,255,0.15)" : "transparent",
                  border: active ? "1px solid rgba(60,140,255,0.3)" : "1px solid transparent",
                  borderRadius: isDesktop ? 6 : 8, color: active ? "#7CB8FF" : "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}>
                  <span style={{ fontSize: isDesktop ? 12 : 16, lineHeight: 1 }}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ---- SAVE / SHARE / LOAD ---- */}
      <SaveShareBar state={state} setState={setState} setStep={setStep} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} aquariumRef={aquariumRef} />

      {/* ---- TANK PREVIEW ---- */}
      <div ref={tankPreviewRef} style={{ padding: isDesktop ? "12px 0" : "20px 0", display: "flex", justifyContent: "center", background: ambientGlow, transition: "background 0.8s ease" }}>
        <div style={{ position: "relative" }}>
          {/* Glass frame — beveled edge with inner bright / outer dark */}
          <div style={{
            padding: 4, borderRadius: "6px 6px 3px 3px",
            background: `linear-gradient(180deg, rgba(160,200,240,0.18) 0%, rgba(100,140,180,0.1) 30%, rgba(60,90,130,0.08) 70%, rgba(40,60,90,0.12) 100%)`,
            boxShadow: [
              // Outer glow from light
              nightMode
                ? "0 4px 50px rgba(30,50,150,0.3)"
                : light && light.intensity > 0
                  ? `0 4px 50px rgba(${light.r},${light.g},${light.b},${light.strength * 0.6})`
                  : "0 4px 30px rgba(0,50,120,0.15)",
              // Inner top bright edge (glass catching overhead light)
              "inset 0 1px 0 rgba(255,255,255,0.12)",
              // Inner bottom dark edge
              "inset 0 -1px 0 rgba(0,0,0,0.15)",
              // Inner left bright edge
              "inset 1px 0 0 rgba(255,255,255,0.06)",
              // Inner right dark edge
              "inset -1px 0 0 rgba(0,0,0,0.08)",
            ].join(", "),
          }}>
            {/* Inner bevel — bright rim inside the frame */}
            <div style={{
              padding: 1, borderRadius: "4px 4px 2px 2px",
              background: "linear-gradient(180deg, rgba(200,230,255,0.06), rgba(100,150,200,0.02))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              <div style={{ borderRadius: 3, overflow: "hidden", position: "relative" }}>
                <AquariumCanvas ref={aquariumRef} state={state} tankWidth={vw} tankHeight={vh} tankLiters={tank.liters} onUpdatePosition={updateDecPosition} onSelectItem={setSelectedDecId} nightMode={nightMode} />

                {/* ---- GLASS OVERLAYS (inside the canvas area, pointer-events: none) ---- */}

                {/* Top rim reflection — bright horizontal line at very top */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: "linear-gradient(180deg, rgba(200,235,255,0.12), rgba(180,220,255,0.04), transparent)",
                  pointerEvents: "none",
                }} />

                {/* Left glass edge reflection */}
                <div style={{
                  position: "absolute", top: 0, left: 0, width: 3, height: "100%",
                  background: "linear-gradient(90deg, rgba(180,220,255,0.08), rgba(160,200,240,0.03), transparent)",
                  pointerEvents: "none",
                }} />

                {/* Right glass edge (darker — shadow side) */}
                <div style={{
                  position: "absolute", top: 0, right: 0, width: 3, height: "100%",
                  background: "linear-gradient(270deg, rgba(0,10,30,0.1), rgba(0,10,30,0.04), transparent)",
                  pointerEvents: "none",
                }} />

                {/* Corner reflections — bright arcs where silicone bead catches light */}
                {/* Top-left corner */}
                <div style={{
                  position: "absolute", top: 0, left: 0, width: 18, height: 18,
                  background: "radial-gradient(ellipse at 0% 0%, rgba(200,235,255,0.12) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                {/* Top-right corner */}
                <div style={{
                  position: "absolute", top: 0, right: 0, width: 18, height: 18,
                  background: "radial-gradient(ellipse at 100% 0%, rgba(180,220,250,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                {/* Bottom-left corner */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, width: 14, height: 14,
                  background: "radial-gradient(ellipse at 0% 100%, rgba(160,200,240,0.06) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                {/* Bottom-right corner */}
                <div style={{
                  position: "absolute", bottom: 0, right: 0, width: 14, height: 14,
                  background: "radial-gradient(ellipse at 100% 100%, rgba(140,180,220,0.05) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />

                {/* Chromatic aberration — very subtle red/blue fringe at extreme edges */}
                {/* Left edge: slight red shift */}
                <div style={{
                  position: "absolute", top: "10%", left: 0, width: 2, height: "80%",
                  background: "linear-gradient(180deg, transparent 0%, rgba(255,120,100,0.04) 30%, rgba(255,100,80,0.05) 50%, rgba(255,120,100,0.04) 70%, transparent 100%)",
                  pointerEvents: "none",
                }} />
                {/* Right edge: slight blue shift */}
                <div style={{
                  position: "absolute", top: "10%", right: 0, width: 2, height: "80%",
                  background: "linear-gradient(180deg, transparent 0%, rgba(80,120,255,0.04) 30%, rgba(60,100,255,0.05) 50%, rgba(80,120,255,0.04) 70%, transparent 100%)",
                  pointerEvents: "none",
                }} />

                {/* Glass surface reflection — moving diagonal highlight */}
                <div style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  background: `linear-gradient(115deg, transparent 0%, transparent 35%, rgba(200,230,255,0.025) 45%, rgba(220,240,255,0.04) 50%, rgba(200,230,255,0.025) 55%, transparent 65%, transparent 100%)`,
                  pointerEvents: "none",
                }} />
              </div>
            </div>
          </div>

          {/* Fullscreen button */}
          <button onClick={() => setFullscreen(true)} style={{
            position: "absolute", top: 8, right: 8,
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#AAC8FF", fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit", transition: "all 0.15s",
            zIndex: 5,
          }} title="Fullscreen">⛶</button>

          {/* Night mode toggle */}
          <button onClick={() => setNightMode(n => !n)} style={{
            position: "absolute", top: 8, right: 46,
            width: 32, height: 32, borderRadius: 8,
            background: nightMode ? "rgba(50,70,160,0.6)" : "rgba(0,0,0,0.4)",
            backdropFilter: "blur(6px)",
            border: nightMode ? "1px solid rgba(100,140,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
            color: nightMode ? "#AAC8FF" : "#667788",
            fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit", transition: "all 0.3s",
            zIndex: 5,
          }} title={nightMode ? "Day mode" : "Night mode"}>🌙</button>

          {/* Cabinet */}
          {state.cabinet.style !== "none" && (() => {
            const cab = state.cabinet;
            const cabH = Math.round(vh * 0.45);
            const cabW = vw + 6;
            const isWood = cab.material === "wood";
            const isGloss = cab.material === "gloss";
            const isMetal = cab.material === "metal";
            const isMatte = cab.material === "matte";

            // Parse cabinet base color for derived shades
            const hexToRgbCab = (hex) => ({
              r: parseInt(hex.slice(1, 3), 16) || 40,
              g: parseInt(hex.slice(3, 5), 16) || 30,
              b: parseInt(hex.slice(5, 7), 16) || 20,
            });
            const cc = hexToRgbCab(cab.color);
            const lighter = `rgb(${Math.min(255,cc.r+25)},${Math.min(255,cc.g+25)},${Math.min(255,cc.b+25)})`;
            const darker = `rgb(${Math.max(0,cc.r-20)},${Math.max(0,cc.g-20)},${Math.max(0,cc.b-20)})`;
            const darkest = `rgb(${Math.max(0,cc.r-40)},${Math.max(0,cc.g-40)},${Math.max(0,cc.b-40)})`;

            return (<>
              {/* Floor shadow beneath cabinet */}
              {cab.style !== "floating" && (
                <div style={{
                  width: cabW * 0.85, height: 10, margin: "0 auto", marginTop: -2,
                  background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)",
                  borderRadius: "50%", filter: "blur(3px)", position: "relative", zIndex: 0,
                  pointerEvents: "none",
                }} />
              )}
              <div style={{
                width: cabW, height: cabH, margin: "0 auto",
                marginTop: cab.style === "floating" ? -1 : -10,
                position: "relative", borderRadius: "0 0 5px 5px", overflow: "hidden",
                background: `linear-gradient(180deg, ${lighter} 0%, ${cab.color} 15%, ${cab.color} 70%, ${darker} 100%)`,
                boxShadow: [
                  "0 8px 30px rgba(0,0,0,0.35)",
                  `inset 0 1px 0 rgba(255,255,255,${isGloss ? 0.15 : isMetal ? 0.12 : 0.05})`,
                  `inset 0 -1px 0 rgba(0,0,0,${isGloss ? 0.15 : 0.1})`,
                  `inset 1px 0 0 rgba(255,255,255,${isGloss ? 0.06 : 0.02})`,
                  `inset -1px 0 0 rgba(0,0,0,0.06)`,
                ].join(", "),
              }}>
                {/* === WOOD GRAIN (procedural) === */}
                {isWood && (<div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                  {/* Grain lines — varying opacity and spacing using sin-based curvature */}
                  {Array.from({ length: 14 }).map((_, i) => {
                    const baseY = 6 + i * 7.3;
                    const opacity = 0.025 + (i % 3) * 0.015 + (i % 5 === 0 ? 0.02 : 0);
                    // Each grain line curves slightly using a css clip-path trick
                    // We simulate it with a thin div that has a subtle background gradient
                    return (<div key={i} style={{
                      position: "absolute", left: 0, right: 0,
                      top: `${baseY}%`, height: i % 4 === 0 ? 2 : 1,
                      background: `linear-gradient(90deg,
                        rgba(0,0,0,${opacity * 0.5}) 0%,
                        rgba(0,0,0,${opacity}) 15%,
                        rgba(0,0,0,${opacity * 1.2}) 30%,
                        rgba(0,0,0,${opacity * 0.8}) 50%,
                        rgba(0,0,0,${opacity * 1.1}) 70%,
                        rgba(0,0,0,${opacity * 0.6}) 85%,
                        rgba(0,0,0,${opacity * 0.3}) 100%
                      )`,
                      transform: `scaleY(${0.8 + (i % 3) * 0.2}) translateY(${Math.sin(i * 1.3) * 1.5}px)`,
                    }} />);
                  })}
                  {/* Knot — small elliptical darker spot */}
                  <div style={{
                    position: "absolute", left: "22%", top: "35%",
                    width: 8, height: 12, borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${darkest} 0%, ${darker} 40%, transparent 70%)`,
                    opacity: 0.3,
                  }} />
                  <div style={{
                    position: "absolute", right: "28%", top: "62%",
                    width: 6, height: 9, borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${darkest} 0%, ${darker} 40%, transparent 70%)`,
                    opacity: 0.2,
                  }} />
                </div>)}

                {/* === GLOSS reflection (animated feel via gradient positioning) === */}
                {isGloss && (<>
                  {/* Main diagonal reflection band */}
                  <div style={{
                    position: "absolute", top: 0, left: "5%", width: "35%", height: "100%",
                    background: "linear-gradient(95deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 70%, transparent 100%)",
                    pointerEvents: "none",
                  }} />
                  {/* Secondary softer reflection on opposite side */}
                  <div style={{
                    position: "absolute", top: 0, right: "10%", width: "20%", height: "100%",
                    background: "linear-gradient(85deg, transparent, rgba(255,255,255,0.03), transparent)",
                    pointerEvents: "none",
                  }} />
                  {/* Bottom edge dark reflection line */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.08))",
                    pointerEvents: "none",
                  }} />
                </>)}

                {/* === METAL brushed texture === */}
                {isMetal && (<>
                  {/* Fine vertical brushed lines */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `repeating-linear-gradient(90deg,
                      transparent, transparent 1.5px,
                      rgba(255,255,255,0.015) 1.5px, rgba(255,255,255,0.015) 2px,
                      transparent 2px, transparent 3.5px,
                      rgba(0,0,0,0.01) 3.5px, rgba(0,0,0,0.01) 4px
                    )`,
                    pointerEvents: "none",
                  }} />
                  {/* Horizontal sheen band */}
                  <div style={{
                    position: "absolute", top: "30%", left: 0, right: 0, height: "25%",
                    background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.04), rgba(255,255,255,0.06), rgba(255,255,255,0.04), transparent)",
                    pointerEvents: "none",
                  }} />
                </>)}

                {/* === MATTE subtle noise texture === */}
                {isMatte && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(180deg,
                      rgba(255,255,255,0.02) 0%,
                      transparent 5%,
                      transparent 95%,
                      rgba(0,0,0,0.03) 100%
                    )`,
                    pointerEvents: "none",
                  }} />
                )}

                {/* === DOOR SEAM (center line for non-open styles) === */}
                {cab.style !== "open" && (<>
                  <div style={{ position: "absolute", top: "6%", left: "50%", width: 1, height: "88%", background: "rgba(0,0,0,0.12)" }} />
                  {/* Shadow side of seam */}
                  <div style={{ position: "absolute", top: "6%", left: "calc(50% + 1px)", width: 1, height: "88%", background: "rgba(255,255,255,0.03)" }} />
                </>)}

                {/* === HANDLES (improved with 3D bevel) === */}
                {cab.style !== "open" && cab.style !== "handleless" && (<>
                  {[{ left: "44%" }, { left: "52%" }].map((pos, hi) => (
                    <div key={hi} style={{
                      position: "absolute", top: "44%", ...pos,
                      width: Math.max(12, cabW * 0.035), height: 4, borderRadius: 2,
                      background: isMetal
                        ? "linear-gradient(180deg, rgba(220,220,230,0.6), rgba(160,160,175,0.5))"
                        : `linear-gradient(180deg, rgba(${Math.min(255,cc.r+60)},${Math.min(255,cc.g+50)},${Math.min(255,cc.b+40)},0.5), rgba(${cc.r},${cc.g},${cc.b},0.4))`,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }} />
                  ))}
                </>)}

                {/* === OPEN SHELF === */}
                {cab.style === "open" && (<>
                  <div style={{
                    position: "absolute", top: "44%", left: "4%", right: "4%", height: 3,
                    background: `linear-gradient(180deg, ${lighter}, ${cab.color})`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    borderRadius: 1,
                  }} />
                  <div style={{
                    position: "absolute", top: "46%", left: "6%", right: "6%", bottom: "8%",
                    background: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.1))`,
                    borderRadius: 2,
                  }} />
                </>)}

                {/* === FEET / LEGS (non-floating) === */}
                {cab.style !== "floating" && (<>
                  {["4%", undefined].map((leftVal, fi) => (
                    <div key={fi} style={{
                      position: "absolute", bottom: 0,
                      ...(leftVal ? { left: leftVal } : { right: "4%" }),
                      width: Math.max(6, cabW * 0.03), height: cabH * 0.065,
                      background: `linear-gradient(180deg, ${darker}, ${darkest})`,
                      borderRadius: "0 0 2px 2px",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                    }} />
                  ))}
                </>)}

                {/* Top edge — bright line where tank sits on cabinet */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: `rgba(255,255,255,${isGloss ? 0.08 : 0.03})`,
                  pointerEvents: "none",
                }} />
              </div>
            </>);
          })()}
        </div>
      </div>

      {/* ---- BIOLOAD BAR ---- */}
      {state.fish.length > 0 && (
        <div style={{ padding: "0 20px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.35, marginBottom: 3, letterSpacing: 1.5 }}>
            <span>BIOLOAD</span>
            <span style={{ color: stockPct > 100 ? "#FF6B6B" : stockPct > 75 ? "#FFB86C" : "#50FA7B" }}>{stockPct}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(stockPct, 100)}%`, borderRadius: 2, transition: "width 0.4s", background: stockPct > 100 ? "#FF5555" : stockPct > 75 ? "linear-gradient(90deg,#50FA7B,#FFB86C)" : "#3C88FF" }} />
          </div>
        </div>
      )}

      {/* ---- COST SUMMARY ---- */}
      <CostSummary state={state} />

      {/* ---- WARNINGS ---- */}
      {warnings.length > 0 && (
        <div style={{ padding: "4px 20px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {warnings.map((w, i) => (
            <div key={i} onClick={() => { if (w.goTo !== undefined) setStep(w.goTo); }}
              style={{
                padding: "6px 10px", borderRadius: 8, fontSize: 11, lineHeight: 1.4,
                background: w.type === "error" ? "rgba(255,60,60,0.07)" : "rgba(255,180,80,0.06)",
                border: `1px solid ${w.type === "error" ? "rgba(255,80,80,0.18)" : "rgba(255,180,80,0.12)"}`,
                animation: "fadeIn 0.3s ease", cursor: w.goTo !== undefined ? "pointer" : "default", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (w.goTo !== undefined) e.currentTarget.style.background = w.type === "error" ? "rgba(255,60,60,0.14)" : "rgba(255,180,80,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = w.type === "error" ? "rgba(255,60,60,0.07)" : "rgba(255,180,80,0.06)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: w.type === "error" ? "#FF8080" : "#FFBB77" }}>{w.type === "error" ? "✕" : "△"} {w.msg}</span>
                  <span style={{ opacity: 0.4, marginLeft: 8 }}>→ {w.fix}</span>
                </div>
                {w.goTo !== undefined && (
                  <span style={{ fontSize: 9, opacity: 0.3, flexShrink: 0, marginLeft: 8, padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                    {steps[w.goTo]?.label} →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- STEP PANELS ---- */}
      <StepPanels
        step={step} state={state} setState={setState}
        openGroups={openGroups} setOpenGroups={setOpenGroups}
        addFish={addFish} removeFish={removeFish}
        addPlant={addPlant} removePlant={removePlant}
        toggleDec={toggleDec} resizeDecor={resizeDecor}
        applyPreset={applyPreset} setStep={setStep}
        setLastAdded={setLastAdded} light={light} availFish={availFish}
      />

      {/* ---- OVERLAYS ---- */}
      {fullscreen && <FullscreenView state={state} tankLiters={tank.liters} onClose={() => setFullscreen(false)} nightMode={nightMode} />}
      <MiniPreview state={state} vw={vw} vh={vh} tankLiters={tank.liters} tankPreviewRef={tankPreviewRef} visible={!tankVisible && !fullscreen} />
      <SelectedItemPanel
        selectedDecId={selectedDecId} setSelectedDecId={setSelectedDecId}
        state={state} resizeDecor={resizeDecor}
        addPlant={addPlant} removePlant={removePlant}
        toggleDec={toggleDec} setLastAdded={setLastAdded}
      />
      <Toast lastAdded={lastAdded} />
    </div>
  );
}
