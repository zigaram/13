import { DECORATIONS } from '../../data/index.js';
import { getSizeLabel, SIZE_OPTIONS } from '../styles.js';

// ============================================================================
// SELECTED ITEM PANEL
// Bottom sheet that appears when tapping a decoration/plant in the tank.
// Allows resize and remove actions.
// ============================================================================
export default function SelectedItemPanel({
  selectedDecId, setSelectedDecId, state, resizeDecor, addPlant, removePlant, toggleDec, setLastAdded,
}) {
  if (!selectedDecId) return null;

  const decInState = state.decorations.find(d => d.id === selectedDecId);
  const decData = DECORATIONS.find(d => d.id === selectedDecId);
  if (!decInState || !decData) return null;

  const us = decInState.userScale || 1;
  const sizeLabel = getSizeLabel(us);
  const isPlant = decData.isPlant;
  const accentColor = isPlant ? "#50FA7B" : "#FFB86C";
  const accentRgba = isPlant ? "80,250,123" : "255,180,80";

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
      padding: "12px 16px 16px", paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      background: "rgba(12,18,32,0.95)", backdropFilter: "blur(12px)",
      borderTop: `1px solid rgba(${accentRgba},0.2)`,
      boxShadow: "0 -4px 30px rgba(0,0,0,0.4)",
      animation: "fadeIn 0.2s ease",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{decData.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: accentColor }}>{decData.name}</div>
            <div style={{ fontSize: 10, opacity: 0.35 }}>{isPlant ? `×${decInState.count} · plant` : "decoration"} · tap tank to deselect</div>
          </div>
        </div>
        <button onClick={() => setSelectedDecId(null)} style={{
          width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)", color: "#8899AA", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
        }}>✕</button>
      </div>

      {/* Size selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        <span style={{ fontSize: 10, opacity: 0.3, lineHeight: "32px", marginRight: 4 }}>SIZE</span>
        {SIZE_OPTIONS.map(sz => (
          <button key={sz.label} onClick={() => resizeDecor(selectedDecId, sz.val - (decInState.userScale || 1))} style={{
            flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
            background: sizeLabel === sz.label ? `rgba(${accentRgba},0.15)` : "rgba(255,255,255,0.03)",
            border: sizeLabel === sz.label ? `2px solid rgba(${accentRgba},0.5)` : "2px solid rgba(255,255,255,0.06)",
            color: sizeLabel === sz.label ? accentColor : "rgba(255,255,255,0.3)",
            transition: "all 0.15s",
          }}>{sz.label}</button>
        ))}
      </div>

      {/* Actions row */}
      <div style={{ display: "flex", gap: 6 }}>
        {isPlant && (
          <button onClick={() => { addPlant(selectedDecId); setLastAdded({ name: decData.name, color: accentColor, time: Date.now() }); }} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
            background: `rgba(${accentRgba},0.1)`, border: `1px solid rgba(${accentRgba},0.25)`, color: accentColor,
          }}>+ Add One</button>
        )}
        <button onClick={() => {
          if (isPlant) removePlant(selectedDecId); else toggleDec(selectedDecId);
          setSelectedDecId(null);
        }} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
          background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#FF8888",
        }}>{isPlant ? "− Remove One" : "Remove"}</button>
      </div>
    </div>
  );
}
