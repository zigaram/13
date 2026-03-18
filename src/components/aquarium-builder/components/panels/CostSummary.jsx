import { useState } from 'react';
import {
  TANK_SIZES,
  SUBSTRATES,
  LIGHTS,
  FILTERS,
  HEATERS,
  DECORATIONS,
  FISH_DB,
} from '../../data/index.js';

// ============================================================================
// COST SUMMARY
// Collapsible inline cost bar — shows total, expands to breakdown on tap.
// Minimalist: one thin row when collapsed, compact breakdown when open.
// ============================================================================
export default function CostSummary({ state }) {
  const [open, setOpen] = useState(false);

  // ---- Calculate costs per category ----
  const tank = state.tankSize === "custom"
    ? { price: 0 }
    : TANK_SIZES.find(t => t.id === state.tankSize);
  const substrate = SUBSTRATES.find(s => s.id === state.substrate);
  const light = state.light === "custom"
    ? { price: 0 }
    : LIGHTS.find(l => l.id === state.light);
  const filter = FILTERS.find(f => f.id === state.filter);
  const heater = state.heater === "custom"
    ? { price: 0 }
    : HEATERS.find(h => h.id === state.heater);

  const equipCost = (tank?.price || 0)
    + (substrate?.price || 0)
    + (light?.price || 0)
    + (filter?.price || 0)
    + (heater?.price || 0);

  const decorCost = state.decorations.reduce((sum, d) => {
    const dec = DECORATIONS.find(dd => dd.id === d.id);
    return sum + (dec?.price || 0) * (d.count || 1);
  }, 0);

  const fishCost = state.fish.reduce((sum, f) => {
    const fd = FISH_DB.find(d => d.id === f.id);
    return sum + (fd?.price || 0) * f.count;
  }, 0);

  const total = equipCost + decorCost + fishCost;

  if (total === 0) return null;

  // ---- Breakdown rows (only shown when open) ----
  const rows = [];

  // Equipment breakdown
  if (tank?.price) rows.push({ label: tank.name || "Tank", cost: tank.price, icon: "🔲" });
  if (substrate?.price) rows.push({ label: substrate.name, cost: substrate.price, icon: "⬇" });
  if (light?.price) rows.push({ label: light.name, cost: light.price, icon: "💡" });
  if (filter?.price) rows.push({ label: filter.name, cost: filter.price, icon: "🌀" });
  if (heater?.price) rows.push({ label: heater.name, cost: heater.price, icon: "🌡" });

  // Decorations
  state.decorations.forEach(d => {
    const dec = DECORATIONS.find(dd => dd.id === d.id);
    if (!dec?.price) return;
    const cnt = d.count || 1;
    rows.push({
      label: dec.name + (cnt > 1 ? ` ×${cnt}` : ""),
      cost: dec.price * cnt,
      icon: dec.icon || (dec.isPlant ? "🌿" : "🪨"),
    });
  });

  // Fish
  state.fish.forEach(f => {
    const fd = FISH_DB.find(d => d.id === f.id);
    if (!fd?.price || !f.count) return;
    rows.push({
      label: fd.name + (f.count > 1 ? ` ×${f.count}` : ""),
      cost: fd.price * f.count,
      icon: "🐟",
    });
  });

  // Sort by cost descending
  rows.sort((a, b) => b.cost - a.cost);

  // Category totals for the summary chips
  const cats = [
    equipCost > 0 && { label: "Equip", cost: equipCost },
    decorCost > 0 && { label: "Decor", cost: decorCost },
    fishCost > 0 && { label: "Fish", cost: fishCost },
  ].filter(Boolean);

  return (
    <div style={{ padding: "0 20px 6px" }}>
      {/* Collapsed bar */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "7px 10px", borderRadius: 8,
          background: "rgba(80,250,123,0.04)",
          border: "1px solid rgba(80,250,123,0.1)",
          color: "#D0D8E4", cursor: "pointer",
          fontFamily: "inherit", fontSize: 11, transition: "all 0.15s",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, opacity: 0.35, letterSpacing: 1.5 }}>EST. COST</span>
          {!open && cats.map(c => (
            <span key={c.label} style={{ fontSize: 10, opacity: 0.3 }}>
              {c.label} ${c.cost}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#50FA7B", fontFamily: "'Space Grotesk',sans-serif" }}>
            ${total}
          </span>
          <span style={{ fontSize: 9, opacity: 0.3, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
        </div>
      </button>

      {/* Expanded breakdown */}
      {open && (
        <div style={{
          marginTop: 4, padding: "8px 10px", borderRadius: 8,
          background: "rgba(80,250,123,0.02)",
          border: "1px solid rgba(80,250,123,0.06)",
          animation: "fadeIn 0.2s ease",
        }}>
          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8, paddingBottom: 7, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {cats.map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 9, opacity: 0.35, letterSpacing: 0.5 }}>{c.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#8BDFAA" }}>${c.cost}</span>
              </div>
            ))}
          </div>

          {/* Line items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {rows.map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 10, padding: "2px 0",
              }}>
                <span style={{ opacity: 0.4 }}>
                  <span style={{ marginRight: 5 }}>{r.icon}</span>
                  {r.label}
                </span>
                <span style={{ opacity: 0.5, fontVariantNumeric: "tabular-nums" }}>${r.cost}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ fontSize: 9, opacity: 0.2, marginTop: 6, textAlign: "center", letterSpacing: 0.3 }}>
            approximate retail prices in USD
          </div>
        </div>
      )}
    </div>
  );
}
