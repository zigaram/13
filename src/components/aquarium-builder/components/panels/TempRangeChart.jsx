import { FISH_DB } from '../../data/index.js';

// ============================================================================
// TEMPERATURE RANGE CHART
// Shows each species' temp range as a horizontal bar, with the safe
// overlap zone highlighted. Immediately reveals incompatible species.
// ============================================================================

// Color ramp: cold → cool → warm → hot
function tempColor(t) {
  if (t <= 18) return "#64B5F6";  // cold blue
  if (t <= 22) return "#4DD0E1";  // cool teal
  if (t <= 26) return "#81C784";  // green
  if (t <= 29) return "#FFB74D";  // warm orange
  return "#EF5350";               // hot red
}

export default function TempRangeChart({ fishList }) {
  // Get unique species in tank
  const species = fishList
    .filter(f => f.count > 0)
    .map(f => {
      const fd = FISH_DB.find(d => d.id === f.id);
      return fd ? { ...fd, count: f.count } : null;
    })
    .filter(Boolean);

  if (species.length === 0) return null;

  // Global range for the scale
  const allMin = Math.min(...species.map(s => s.tempMin));
  const allMax = Math.max(...species.map(s => s.tempMax));
  const scaleMin = Math.floor(Math.min(allMin, 16) / 2) * 2;
  const scaleMax = Math.ceil(Math.max(allMax, 30) / 2) * 2;
  const scaleRange = scaleMax - scaleMin;

  // Calculate overlap zone (where ALL species can live)
  const overlapMin = Math.max(...species.map(s => s.tempMin));
  const overlapMax = Math.min(...species.map(s => s.tempMax));
  const hasOverlap = overlapMax >= overlapMin;
  const overlapWidth = hasOverlap ? overlapMax - overlapMin : 0;

  const toPercent = (temp) => ((temp - scaleMin) / scaleRange) * 100;

  // Generate scale ticks
  const ticks = [];
  for (let t = scaleMin; t <= scaleMax; t += 2) {
    ticks.push(t);
  }

  return (
    <div style={{
      marginBottom: 12, padding: "10px 12px",
      background: "rgba(60,140,255,0.03)",
      border: "1px solid rgba(60,140,255,0.08)",
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5 }}>TEMPERATURE RANGES</span>
        {hasOverlap ? (
          <span style={{
            fontSize: 9, padding: "2px 8px", borderRadius: 10,
            background: overlapWidth >= 4 ? "rgba(80,250,123,0.1)" : "rgba(255,180,80,0.1)",
            border: overlapWidth >= 4 ? "1px solid rgba(80,250,123,0.2)" : "1px solid rgba(255,180,80,0.2)",
            color: overlapWidth >= 4 ? "#50FA7B" : "#FFB86C",
            fontWeight: 600,
          }}>
            {overlapWidth >= 4 ? "✓" : "△"} Safe zone: {overlapMin}–{overlapMax}°C
          </span>
        ) : (
          <span style={{
            fontSize: 9, padding: "2px 8px", borderRadius: 10,
            background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,80,80,0.2)",
            color: "#FF8888", fontWeight: 600,
          }}>
            ✕ No overlap!
          </span>
        )}
      </div>

      {/* Scale ruler */}
      <div style={{ position: "relative", height: 14, marginBottom: 4 }}>
        {ticks.map(t => (
          <div key={t} style={{
            position: "absolute", left: `${toPercent(t)}%`, transform: "translateX(-50%)",
            fontSize: 8, opacity: 0.25, color: "#AAC8FF", whiteSpace: "nowrap",
          }}>
            {t}°
          </div>
        ))}
      </div>

      {/* Overlap zone highlight (behind the bars) */}
      <div style={{ position: "relative" }}>
        {hasOverlap && (
          <div style={{
            position: "absolute",
            left: `${toPercent(overlapMin)}%`,
            width: `${toPercent(overlapMax) - toPercent(overlapMin)}%`,
            top: 0, bottom: 0,
            background: overlapWidth >= 4
              ? "rgba(80,250,123,0.06)"
              : "rgba(255,180,80,0.06)",
            borderLeft: `1px dashed ${overlapWidth >= 4 ? "rgba(80,250,123,0.25)" : "rgba(255,180,80,0.25)"}`,
            borderRight: `1px dashed ${overlapWidth >= 4 ? "rgba(80,250,123,0.25)" : "rgba(255,180,80,0.25)"}`,
            borderRadius: 4,
            zIndex: 0,
            pointerEvents: "none",
          }} />
        )}

        {/* Species bars */}
        {species.map((s, i) => {
          const left = toPercent(s.tempMin);
          const width = toPercent(s.tempMax) - left;
          const isOutside = !hasOverlap || s.tempMin > overlapMax || s.tempMax < overlapMin;
          const barColor = isOutside ? "#FF6B6B" : s.color;

          return (
            <div key={s.id} style={{
              position: "relative", zIndex: 1,
              display: "flex", alignItems: "center", gap: 0,
              height: 22, marginBottom: 3,
            }}>
              {/* Species label */}
              <div style={{
                width: 80, flexShrink: 0,
                display: "flex", alignItems: "center", gap: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: s.color, flexShrink: 0,
                  border: `1px solid ${s.accentColor}44`,
                }} />
                <span style={{
                  fontSize: 9, fontWeight: 500,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  color: isOutside ? "#FF8888" : "#AAC8FF",
                }}>
                  {s.name}
                </span>
              </div>

              {/* Bar track */}
              <div style={{ flex: 1, position: "relative", height: 14 }}>
                {/* Track background */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 7,
                }} />

                {/* Range bar */}
                <div style={{
                  position: "absolute",
                  left: `${left}%`,
                  width: `${Math.max(width, 1)}%`,
                  top: 1, bottom: 1,
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${tempColor(s.tempMin)}, ${tempColor((s.tempMin + s.tempMax) / 2)}, ${tempColor(s.tempMax)})`,
                  opacity: isOutside ? 0.5 : 0.8,
                  boxShadow: isOutside ? "none" : `0 0 6px ${barColor}33`,
                  transition: "all 0.3s ease",
                }} />

                {/* Min/Max labels on bar */}
                <div style={{
                  position: "absolute",
                  left: `${left}%`,
                  width: `${Math.max(width, 1)}%`,
                  top: 0, bottom: 0,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0 3px",
                  fontSize: 7, color: "rgba(0,0,0,0.6)", fontWeight: 700,
                  pointerEvents: "none",
                }}>
                  {width > 8 && <span>{s.tempMin}</span>}
                  {width > 8 && <span>{s.tempMax}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heater recommendation */}
      {hasOverlap && species.length > 1 && (
        <div style={{
          marginTop: 6, fontSize: 9, opacity: 0.4, textAlign: "center",
        }}>
          🌡️ Set heater to {Math.round((overlapMin + overlapMax) / 2)}°C for all species
        </div>
      )}
    </div>
  );
}
