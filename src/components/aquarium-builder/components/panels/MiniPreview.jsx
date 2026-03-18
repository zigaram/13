import AquariumCanvas from '../AquariumCanvas.jsx';

// ============================================================================
// MINI PREVIEW
// Always mounted (no mount/unmount flash). Fades in/out with CSS.
// Desktop: centered floating card. Mobile: full-width bar at top.
// ============================================================================
export default function MiniPreview({ state, vw, vh, tankLiters, tankPreviewRef, visible }) {
  // Scale: 70% on mobile, capped at 400px wide on desktop
  const previewW = Math.min(Math.round(vw * 0.7), 400);
  const previewH = Math.round(previewW * (vh / vw));

  return (
    <div
      onClick={() => tankPreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
      style={{
        position: "fixed",
        top: 8,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? '0' : '-20px'})`,
        zIndex: 80,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: visible
          ? "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(100,160,255,0.2)"
          : "none",
        background: "#0A1525",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        // On mobile: nearly full width. On desktop: auto width centered.
        width: previewW + 10,
        maxWidth: "calc(100vw - 16px)",
      }}>
      <div style={{
        padding: 3, borderRadius: 14,
        background: "linear-gradient(135deg, rgba(100,160,255,0.15), rgba(60,100,180,0.06))",
      }}>
        <AquariumCanvas
          state={state}
          tankWidth={previewW}
          tankHeight={previewH}
          tankLiters={tankLiters}
          onUpdatePosition={() => {}}
          onSelectItem={() => {}}
          paused={!visible}
        />
      </div>
      <div style={{
        position: "absolute", bottom: 5, left: 0, right: 0, textAlign: "center",
        fontSize: 9, opacity: 0.5, color: "#AAC8FF", letterSpacing: 0.5,
        pointerEvents: "none",
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
      }}>
        ▲ tap to scroll to tank
      </div>
    </div>
  );
}
