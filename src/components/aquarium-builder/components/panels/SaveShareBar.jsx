import { useState } from 'react';
import {
  DEFAULT_STATE,
  generateShareURL,
  getSavedBuilds,
  saveBuild,
  deleteBuild,
} from '../../hooks/usePersistence.js';
import { generateRandomBuild } from '../../hooks/useRandomBuild.js';
import { clearEvents } from '../../rendering/simulateFish.js';

// ============================================================================
// SAVE / SHARE / LOAD BAR
// Sits below the header. Provides: auto-save indicator, named saves,
// share URL generation, and reset to defaults.
// ============================================================================
export default function SaveShareBar({ state, setState, setStep, undo, redo, canUndo, canRedo, aquariumRef }) {
  const [showSaves, setShowSaves] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copied, setCopied] = useState(false);
  const [saves, setSaves] = useState(() => getSavedBuilds());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [screenshotted, setScreenshotted] = useState(false);
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  const handleScreenshot = () => {
    const canvas = aquariumRef?.current?.getCanvas?.();
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `aquarium-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setScreenshotted(true);
      setTimeout(() => setScreenshotted(false), 2000);
    } catch (e) {
      console.error('Screenshot failed:', e);
    }
  };

  const handleShare = async () => {
    const url = generateShareURL(state);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: prompt
      window.prompt('Copy this share link:', url);
    }
  };

  const handleSave = () => {
    const name = saveName.trim() || `Build ${new Date().toLocaleDateString()}`;
    const updated = saveBuild(name, state);
    setSaves(updated);
    setSaveName('');
  };

  const handleLoad = (savedState) => {
    clearEvents();
    setState({ ...DEFAULT_STATE, ...savedState });
    setStep(1);
    setShowSaves(false);
  };

  const handleDelete = (name) => {
    const updated = deleteBuild(name);
    setSaves(updated);
  };

  const handleReset = () => {
    clearEvents();
    setState({ ...DEFAULT_STATE });
    setStep(0);
    setShowConfirmReset(false);
    try { localStorage.removeItem('aquarium_builder_state'); } catch {}
  };

  const handleRandom = () => {
    clearEvents();
    const build = generateRandomBuild();
    setState(build);
    setStep(1);
  };

  const btnBase = {
    padding: "6px 10px", borderRadius: 7, fontSize: 10, fontWeight: 600,
    fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
    display: "flex", alignItems: "center", gap: 4,
  };

  return (
    <div style={{ padding: isDesktop ? "4px 20px 4px" : "6px 20px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      {/* Action buttons row */}
      <div style={{ display: "flex", gap: isDesktop ? 4 : 6, alignItems: "center" }}>
        {/* Share */}
        <button onClick={handleShare} style={{
          ...btnBase,
          background: copied ? "rgba(80,250,123,0.12)" : "rgba(60,140,255,0.08)",
          border: copied ? "1px solid rgba(80,250,123,0.3)" : "1px solid rgba(60,140,255,0.2)",
          color: copied ? "#50FA7B" : "#7CB8FF",
        }}>
          {copied ? "✓ Copied!" : "🔗 Share"}
        </button>

        {/* Random */}
        <button onClick={handleRandom} style={{
          ...btnBase,
          background: "rgba(200,120,255,0.08)",
          border: "1px solid rgba(200,120,255,0.2)",
          color: "#C888FF",
        }} title="Random aquarium">
          🎲
        </button>

        {/* Save/Load toggle */}
        <button onClick={() => { setShowSaves(!showSaves); setSaves(getSavedBuilds()); }} style={{
          ...btnBase,
          background: showSaves ? "rgba(255,180,80,0.12)" : "rgba(255,255,255,0.03)",
          border: showSaves ? "1px solid rgba(255,180,80,0.25)" : "1px solid rgba(255,255,255,0.06)",
          color: showSaves ? "#FFB86C" : "#8899AA",
        }}>
          💾 Saves {saves.length > 0 && <span style={{ opacity: 0.5 }}>({saves.length})</span>}
        </button>

        {/* Undo / Redo */}
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={undo} disabled={!canUndo} style={{
            ...btnBase, padding: "6px 8px", fontSize: 14,
            background: canUndo ? "rgba(255,255,255,0.04)" : "transparent",
            border: canUndo ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
            color: canUndo ? "#AAB8CC" : "rgba(255,255,255,0.1)",
            cursor: canUndo ? "pointer" : "default",
          }} title="Undo (Ctrl+Z)">↩</button>
          <button onClick={redo} disabled={!canRedo} style={{
            ...btnBase, padding: "6px 8px", fontSize: 14,
            background: canRedo ? "rgba(255,255,255,0.04)" : "transparent",
            border: canRedo ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
            color: canRedo ? "#AAB8CC" : "rgba(255,255,255,0.1)",
            cursor: canRedo ? "pointer" : "default",
          }} title="Redo (Ctrl+Shift+Z)">↪</button>
        </div>

        {/* Screenshot */}
        <button onClick={handleScreenshot} style={{
          ...btnBase,
          background: screenshotted ? "rgba(80,250,123,0.12)" : "rgba(255,255,255,0.03)",
          border: screenshotted ? "1px solid rgba(80,250,123,0.3)" : "1px solid rgba(255,255,255,0.06)",
          color: screenshotted ? "#50FA7B" : "#8899AA",
        }} title="Save as image">
          {screenshotted ? "✓ Saved!" : "📷"}
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Auto-saved indicator */}
        <span style={{ fontSize: 9, opacity: 0.2, letterSpacing: 0.5 }}>auto-saved</span>

        {/* Reset */}
        {!showConfirmReset ? (
          <button onClick={() => setShowConfirmReset(true)} style={{
            ...btnBase,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#666",
          }}>
            ↺ Reset
          </button>
        ) : (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#FF8888" }}>Sure?</span>
            <button onClick={handleReset} style={{
              ...btnBase, background: "rgba(255,60,60,0.1)",
              border: "1px solid rgba(255,80,80,0.3)", color: "#FF8888",
            }}>Yes</button>
            <button onClick={() => setShowConfirmReset(false)} style={{
              ...btnBase, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#8899AA",
            }}>No</button>
          </div>
        )}
      </div>

      {/* Save/Load panel (expandable) */}
      {showSaves && (
        <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(255,180,80,0.04)", border: "1px solid rgba(255,180,80,0.1)", borderRadius: 10, animation: "fadeIn 0.2s ease" }}>
          {/* Save new */}
          <div style={{ display: "flex", gap: 6, marginBottom: saves.length > 0 ? 10 : 0 }}>
            <input
              type="text"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Name this build..."
              style={{
                flex: 1, padding: "6px 10px", borderRadius: 7, fontSize: 11,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#D0D8E4", fontFamily: "inherit", outline: "none",
              }}
            />
            <button onClick={handleSave} style={{
              ...btnBase, padding: "6px 14px",
              background: "rgba(80,250,123,0.1)", border: "1px solid rgba(80,250,123,0.25)",
              color: "#50FA7B",
            }}>Save</button>
          </div>

          {/* Saved builds list */}
          {saves.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5, marginBottom: 2 }}>SAVED BUILDS</div>
              {saves.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 8px", borderRadius: 7,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#FFB86C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <div style={{ fontSize: 9, opacity: 0.3 }}>
                      {new Date(s.date).toLocaleDateString()} · {s.state.fish?.reduce((sum, f) => sum + f.count, 0) || 0} fish
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <button onClick={() => handleLoad(s.state)} style={{
                      ...btnBase, padding: "4px 10px",
                      background: "rgba(60,140,255,0.08)", border: "1px solid rgba(60,140,255,0.2)",
                      color: "#7CB8FF",
                    }}>Load</button>
                    <button onClick={() => handleDelete(s.name)} style={{
                      ...btnBase, padding: "4px 8px",
                      background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,80,80,0.15)",
                      color: "#FF8888",
                    }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {saves.length === 0 && (
            <div style={{ fontSize: 10, opacity: 0.3, textAlign: "center", padding: "4px 0" }}>
              No saved builds yet. Name and save your first one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
