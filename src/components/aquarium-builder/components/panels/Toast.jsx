// ============================================================================
// TOAST NOTIFICATION
// Brief "+1 <name> added" popup that fades in at the bottom of the screen
// ============================================================================
export default function Toast({ lastAdded }) {
  if (!lastAdded || Date.now() - lastAdded.time >= 2000) return null;

  return (
    <div key={lastAdded.time} style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      padding: "8px 16px", borderRadius: 20,
      background: "rgba(20,30,50,0.9)", border: "1px solid rgba(60,140,255,0.25)",
      backdropFilter: "blur(8px)", zIndex: 100,
      display: "flex", alignItems: "center", gap: 8,
      animation: "fadeIn 0.2s ease",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: lastAdded.color }} />
      <span style={{ fontSize: 12, color: "#AAC8FF" }}>+1 {lastAdded.name} added</span>
      <span style={{ fontSize: 14 }}>🐟</span>
    </div>
  );
}
