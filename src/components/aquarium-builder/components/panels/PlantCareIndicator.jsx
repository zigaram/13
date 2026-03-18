import { PLANTS, SUBSTRATES, LIGHTS } from '../../data/index.js';

// ============================================================================
// PLANT CARE INDICATOR
// Analyses the current plant selection, lighting, and substrate to determine
// CO2 injection needs, fertilizer regime, and overall difficulty level.
// Shows actionable recommendations for planted tank success.
// ============================================================================

// Plant CO2 demand classification
const HIGH_CO2 = ["plant_carpet", "plant_monte", "plant_rotala", "plant_ludwigia", "plant_red_tiger", "plant_staurogyne", "plant_pogostemon", "plant_dwarf_sag"];
const MEDIUM_CO2 = ["plant_val", "plant_sword", "plant_water_wist", "plant_elodea"];
const LOW_CO2 = ["plant_anubias", "moss", "plant_crypto", "plant_frogbit", "plant_bucep", "plant_hornwort", "plant_javafern", "plant_salvinia"];

// Heavy root feeders (need rich substrate + root tabs)
const ROOT_FEEDERS = ["plant_sword", "plant_val", "plant_red_tiger", "plant_crypto", "plant_carpet", "plant_monte", "plant_dwarf_sag", "plant_staurogyne", "plant_pogostemon"];
// Column feeders (absorb from water — need liquid ferts)
const COLUMN_FEEDERS = ["plant_rotala", "plant_ludwigia", "plant_water_wist", "plant_hornwort", "plant_elodea", "plant_frogbit", "plant_salvinia", "moss", "plant_anubias", "plant_javafern", "plant_bucep"];

// Red/colored plants that need iron
const NEEDS_IRON = ["plant_rotala", "plant_ludwigia", "plant_red_tiger"];

export default function PlantCareIndicator({ state, light }) {
  // Collect plants in tank
  const plantsInTank = state.decorations
    .filter(d => PLANTS.some(p => p.id === d.id))
    .map(d => ({ ...d, data: PLANTS.find(p => p.id === d.id) }))
    .filter(d => d.data);

  if (plantsInTank.length === 0) return null;

  const totalPlants = plantsInTank.reduce((s, d) => s + (d.count || 1), 0);
  const substrate = SUBSTRATES.find(s => s.id === state.substrate);
  const lightIntensity = light?.intensity || 0;

  // Analyze CO2 demand
  const highCO2Count = plantsInTank.filter(p => HIGH_CO2.includes(p.id)).reduce((s, d) => s + (d.count || 1), 0);
  const medCO2Count = plantsInTank.filter(p => MEDIUM_CO2.includes(p.id)).reduce((s, d) => s + (d.count || 1), 0);
  const lowCO2Count = plantsInTank.filter(p => LOW_CO2.includes(p.id)).reduce((s, d) => s + (d.count || 1), 0);

  // CO2 level: determined by most demanding plants + light intensity
  let co2Level = "none"; // none, low, medium, high
  let co2Label = "Not needed";
  let co2Color = "#50FA7B";

  if (highCO2Count > 0 && lightIntensity >= 2) {
    co2Level = "high"; co2Label = "Injection recommended"; co2Color = "#FF8888";
  } else if (highCO2Count > 0 || (medCO2Count > 2 && lightIntensity >= 2)) {
    co2Level = "medium"; co2Label = "Liquid CO2 or injection"; co2Color = "#FFB86C";
  } else if (medCO2Count > 0 && lightIntensity >= 2) {
    co2Level = "low"; co2Label = "Liquid CO2 helpful"; co2Color = "#FFD700";
  } else if (lightIntensity >= 3 && totalPlants > 3) {
    co2Level = "low"; co2Label = "Helpful with high light"; co2Color = "#FFD700";
  }

  // Analyze fertilizer needs
  const rootFeederCount = plantsInTank.filter(p => ROOT_FEEDERS.includes(p.id)).reduce((s, d) => s + (d.count || 1), 0);
  const columnFeederCount = plantsInTank.filter(p => COLUMN_FEEDERS.includes(p.id)).reduce((s, d) => s + (d.count || 1), 0);
  const needsIronCount = plantsInTank.filter(p => NEEDS_IRON.includes(p.id)).reduce((s, d) => s + (d.count || 1), 0);
  const hasRichSubstrate = substrate?.plantFriendly;

  // Difficulty rating
  let difficulty = "Easy";
  let diffColor = "#50FA7B";
  if (co2Level === "high") { difficulty = "Advanced"; diffColor = "#FF8888"; }
  else if (co2Level === "medium" || (highCO2Count > 0)) { difficulty = "Intermediate"; diffColor = "#FFB86C"; }
  else if (medCO2Count > 2) { difficulty = "Moderate"; diffColor = "#FFD700"; }

  // Build recommendations
  const tips = [];

  if (co2Level === "high") {
    tips.push({ icon: "💨", text: "CO2 injection system needed for carpet/red plants at this light level", type: "error" });
  } else if (co2Level === "medium") {
    tips.push({ icon: "💨", text: "Liquid carbon (Seachem Excel) or CO2 injection will boost growth", type: "warning" });
  } else if (co2Level === "low") {
    tips.push({ icon: "💨", text: "Liquid carbon helpful but not essential", type: "info" });
  }

  if (rootFeederCount > 0 && !hasRichSubstrate) {
    tips.push({ icon: "💊", text: `${rootFeederCount} root-feeding plant${rootFeederCount > 1 ? 's' : ''} — add root tabs or switch to nutrient substrate`, type: "warning" });
  } else if (rootFeederCount > 3 && hasRichSubstrate) {
    tips.push({ icon: "💊", text: "Heavy root feeders — substrate nutrients will deplete in 12-18 months, plan to add root tabs", type: "info" });
  }

  if (columnFeederCount > 2) {
    tips.push({ icon: "🧪", text: "Dose liquid fertilizer (all-in-one like Tropica or APT) weekly for water-column feeders", type: "info" });
  }

  if (needsIronCount > 0) {
    tips.push({ icon: "🔴", text: `Red/colored plants (${plantsInTank.filter(p => NEEDS_IRON.includes(p.id)).map(p => p.data.name).join(', ')}) need extra iron supplementation`, type: "warning" });
  }

  if (lightIntensity < 2 && plantsInTank.some(p => p.data.needsLight)) {
    tips.push({ icon: "☀️", text: "Some plants need Full Spectrum+ lighting to thrive", type: "warning" });
  }

  if (lightIntensity >= 3 && co2Level !== "high" && totalPlants > 4) {
    tips.push({ icon: "🌿", text: "High light without CO2 = algae risk. Consider reducing light period to 6-7 hours", type: "warning" });
  }

  // Floating plants reducing light
  const floaterCount = plantsInTank.filter(p => ["frogbit", "salvinia"].includes(p.data.drawType)).reduce((s, d) => s + (d.count || 1), 0);
  if (floaterCount > 3 && plantsInTank.some(p => p.data.needsLight)) {
    tips.push({ icon: "🍃", text: "Dense floaters shade plants below — thin regularly or create open patches", type: "info" });
  }

  const barWidth = co2Level === "high" ? 90 : co2Level === "medium" ? 60 : co2Level === "low" ? 35 : 10;

  return (
    <div style={{
      marginTop: 10, padding: "12px", borderRadius: 10,
      background: "rgba(80,250,123,0.03)", border: "1px solid rgba(80,250,123,0.08)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5 }}>PLANT CARE ANALYSIS</span>
        <span style={{
          fontSize: 9, padding: "2px 8px", borderRadius: 10,
          background: `${diffColor}18`, border: `1px solid ${diffColor}33`,
          color: diffColor, fontWeight: 600,
        }}>
          {difficulty}
        </span>
      </div>

      {/* Gauges row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {/* CO2 gauge */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3 }}>
            <span style={{ opacity: 0.4 }}>💨 CO2</span>
            <span style={{ color: co2Color, fontWeight: 600 }}>{co2Label}</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${barWidth}%`, borderRadius: 2,
              background: co2Color, transition: "width 0.4s, background 0.4s",
            }} />
          </div>
        </div>

        {/* Fert gauge */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3 }}>
            <span style={{ opacity: 0.4 }}>🧪 Ferts</span>
            <span style={{ color: rootFeederCount + columnFeederCount > 5 ? "#FFB86C" : rootFeederCount + columnFeederCount > 2 ? "#FFD700" : "#50FA7B", fontWeight: 600 }}>
              {rootFeederCount + columnFeederCount > 5 ? "Heavy" : rootFeederCount + columnFeederCount > 2 ? "Regular" : "Light"}
            </span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, transition: "width 0.4s",
              width: `${Math.min(100, (rootFeederCount + columnFeederCount) * 12)}%`,
              background: rootFeederCount + columnFeederCount > 5 ? "#FFB86C" : rootFeederCount + columnFeederCount > 2 ? "#FFD700" : "#50FA7B",
            }} />
          </div>
        </div>
      </div>

      {/* Plant breakdown mini stats */}
      <div style={{ display: "flex", gap: 6, marginBottom: tips.length > 0 ? 10 : 0, flexWrap: "wrap" }}>
        {rootFeederCount > 0 && (
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#AAC8FF" }}>
            🌱 {rootFeederCount} root feeder{rootFeederCount > 1 ? 's' : ''}
          </span>
        )}
        {columnFeederCount > 0 && (
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#AAC8FF" }}>
            💧 {columnFeederCount} column feeder{columnFeederCount > 1 ? 's' : ''}
          </span>
        )}
        {needsIronCount > 0 && (
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.12)", color: "#FF9999" }}>
            🔴 {needsIronCount} need iron
          </span>
        )}
        {highCO2Count > 0 && (
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(255,180,80,0.06)", border: "1px solid rgba(255,180,80,0.12)", color: "#FFB86C" }}>
            💨 {highCO2Count} high CO2
          </span>
        )}
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{
              display: "flex", gap: 6, alignItems: "flex-start",
              padding: "5px 8px", borderRadius: 6,
              background: tip.type === "error" ? "rgba(255,60,60,0.05)" : tip.type === "warning" ? "rgba(255,180,80,0.04)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${tip.type === "error" ? "rgba(255,80,80,0.12)" : tip.type === "warning" ? "rgba(255,180,80,0.08)" : "rgba(255,255,255,0.04)"}`,
            }}>
              <span style={{ fontSize: 11, flexShrink: 0, lineHeight: "16px" }}>{tip.icon}</span>
              <span style={{
                fontSize: 10, lineHeight: 1.4,
                color: tip.type === "error" ? "#FF9999" : tip.type === "warning" ? "#FFCC88" : "rgba(255,255,255,0.5)",
              }}>{tip.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
