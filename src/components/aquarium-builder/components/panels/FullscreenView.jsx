import { useState, useEffect, useCallback } from 'react';
import { TANK_SIZES } from '../../data/index.js';
import AquariumCanvas from '../AquariumCanvas.jsx';

// ============================================================================
// FULLSCREEN VIEW
// Immersive fullscreen aquarium. Uses the SAME canvas pixel dimensions as the
// normal view and CSS-scales it to fill the screen. This preserves all
// proportions between fish, decorations, plants, bubbles, and the tank.
// Press Escape, tap the X, or tap anywhere to exit.
// ============================================================================
export default function FullscreenView({ state, tankLiters, onClose, nightMode }) {
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen?.();
    };
  }, []);

  useEffect(() => {
    if (!showUI) return;
    const t = setTimeout(() => setShowUI(false), 4000);
    return () => clearTimeout(t);
  }, [showUI]);

  const handleTap = useCallback(() => {
    if (showUI) onClose();
    else setShowUI(true);
  }, [showUI, onClose]);

  // Use the same base canvas size as the normal preview (not screen pixels).
  // This keeps fish, decorations, particles etc. at the exact same relative size.
  const tank = state.tankSize === "custom"
    ? { width: state.customTank.width, height: state.customTank.height }
    : TANK_SIZES.find(t => t.id === state.tankSize) || { width: 60, height: 35 };

  // Compute the same vw/vh as AquariumBuilder does for the normal preview
  const maxVW = 560;
  const sc = Math.min(maxVW / tank.width, 320 / tank.height);
  const canvasW = Math.round(tank.width * sc);
  const canvasH = Math.round(tank.height * sc);

  // Now compute a CSS scale factor to fit this canvas into the viewport
  const tankRatio = canvasW / canvasH;
  const screenRatio = dims.w / dims.h;

  let displayW, displayH;
  if (screenRatio > tankRatio) {
    // Screen wider than tank — fit to height
    displayH = dims.h;
    displayW = Math.round(dims.h * tankRatio);
  } else {
    // Screen taller — fit to width
    displayW = dims.w;
    displayH = Math.round(dims.w / tankRatio);
  }

  const cssScaleX = displayW / canvasW;
  const cssScaleY = displayH / canvasH;

  return (
    <div
      onClick={handleTap}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#000",
        cursor: "pointer",
      }}
    >
      {/* The aquarium — rendered at normal size, CSS-scaled to fill screen */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <div style={{
          width: canvasW, height: canvasH,
          transform: `scale(${cssScaleX}, ${cssScaleY})`,
          transformOrigin: "center center",
          borderRadius: 4, overflow: "hidden",
          imageRendering: "auto",
        }}>
          <AquariumCanvas
            state={state}
            tankWidth={canvasW}
            tankHeight={canvasH}
            tankLiters={tankLiters}
            onUpdatePosition={() => {}}
            onSelectItem={() => {}}
            nightMode={nightMode}
          />
        </div>
      </div>

      {/* UI overlay — fades in/out */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: showUI ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#FFF", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "auto",
            fontFamily: "inherit",
          }}
        >✕</button>

        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          padding: "8px 16px", borderRadius: 20,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", gap: 12,
          fontSize: 11, color: "rgba(255,255,255,0.6)",
          letterSpacing: 0.5,
        }}>
          <span>🐠 {state.fish.reduce((s, f) => s + f.count, 0)} fish</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>🌿 {state.decorations.reduce((s, d) => s + (d.count || 1), 0)} items</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span style={{ opacity: 0.4 }}>tap to exit</span>
        </div>

        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontSize: 13, color: "rgba(255,255,255,0.25)",
          textAlign: "center", letterSpacing: 0.5,
          pointerEvents: "none",
        }}>
          tap to exit · ESC on desktop
        </div>
      </div>
    </div>
  );
}
