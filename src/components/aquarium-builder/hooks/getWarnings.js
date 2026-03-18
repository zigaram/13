import { TANK_SIZES, FILTERS, HEATERS, LIGHTS, SUBSTRATES, DECORATIONS, FISH_DB, checkCompatibility } from '../data/index.js';

// ============================================================================
// COMPATIBILITY WARNINGS
// Checks for fishkeeping mistakes: overstocking, incompatibilities, etc.
// ============================================================================
export function getWarnings(state) {
  const w = [];
  const tank = state.tankSize === "custom"
    ? { id: "custom", liters: Math.round(state.customTank.width * state.customTank.height * state.customTank.depth / 1000) }
    : TANK_SIZES.find(t => t.id === state.tankSize);
  const filter = FILTERS.find(f => f.id === state.filter);
  const heater = state.heater === "custom"
    ? { watts: state.customHeater.watts, maxLiters: Math.round(state.customHeater.watts * 1.5) }
    : HEATERS.find(h => h.id === state.heater);
  const light = state.light === "custom"
    ? { intensity: state.customLight.intensity }
    : LIGHTS.find(l => l.id === state.light);
  const substrate = SUBSTRATES.find(s => s.id === state.substrate);
  if (!tank || !filter || !heater || !light) return w;
  const totalBio = state.fish.reduce((sum, f) => { const fd = FISH_DB.find(d => d.id === f.id); return sum + (fd ? fd.bio * f.count : 0); }, 0);
  const totalFish = state.fish.reduce((s, f) => s + f.count, 0);

  // Equipment warnings
  if (filter.capacity === 0 && totalFish > 0) w.push({ type: "error", msg: "No filter — fish won't survive", fix: "Add a sponge filter", goTo: 4 });
  else if (filter.capacity < tank.liters * 0.8 && totalFish > 0) { const n = FILTERS.find(f => f.capacity >= tank.liters); w.push({ type: "warning", msg: `Filter underpowered for ${tank.liters}L`, fix: n ? `Upgrade to ${n.name}` : "Stronger filtration", goTo: 4 }); }
  if (state.fish.some(f => { const fd = FISH_DB.find(d => d.id === f.id); return fd && fd.tempMin >= 24; }) && heater.watts === 0) w.push({ type: "error", msg: "Tropical fish need a heater", fix: "Add heater for tank size", goTo: 4 });
  if (heater.watts > 0 && heater.maxLiters && heater.maxLiters < tank.liters * 0.7) w.push({ type: "warning", msg: `Heater underpowered for ${tank.liters}L`, fix: "Upgrade wattage", goTo: 4 });

  // Water type mismatch
  const fresh = state.fish.filter(f => FISH_DB.find(d => d.id === f.id)?.water === "fresh");
  const salt = state.fish.filter(f => FISH_DB.find(d => d.id === f.id)?.water === "salt");
  if (fresh.length > 0 && salt.length > 0) w.push({ type: "error", msg: "Mixing fresh & saltwater fish!", fix: "Pick one", goTo: 7 });
  if (salt.length > 0 && state.waterType === "fresh") w.push({ type: "error", msg: "Saltwater fish in freshwater!", fix: "Switch water type", goTo: 2 });
  if (fresh.length > 0 && state.waterType === "salt") w.push({ type: "error", msg: "Freshwater fish in saltwater!", fix: "Switch water type", goTo: 2 });

  // Stocking level
  const sp = (totalBio / (tank.liters / 5)) * 100;
  if (sp > 120) w.push({ type: "error", msg: `Overstocked (${Math.round(sp)}%)`, fix: "Remove fish or bigger tank", goTo: 1 });
  else if (sp > 85) w.push({ type: "warning", msg: `Heavy stocking (${Math.round(sp)}%)`, fix: "Consider larger tank", goTo: 1 });

  // Schooling requirements
  state.fish.forEach(f => { const fd = FISH_DB.find(d => d.id === f.id); if (fd?.schooling && f.count < fd.minSchool && f.count > 0) w.push({ type: "warning", msg: `${fd.name} need ${fd.minSchool}+ (have ${f.count})`, fix: `Add ${fd.minSchool - f.count} more`, goTo: 7 }); });

  // ---- FISH COMPATIBILITY MATRIX ----
  // Replaces old hardcoded betta/oscar checks with 20+ pairwise rules
  if (state.fish.length > 1 || state.fish.some(f => f.count > 1)) {
    const compatIssues = checkCompatibility(state.fish, FISH_DB);
    // Cap at 5 compatibility warnings to avoid wall of text
    const capped = compatIssues.slice(0, 5);
    w.push(...capped);
    if (compatIssues.length > 5) {
      w.push({ type: "warning", msg: `+${compatIssues.length - 5} more compatibility issues`, fix: "Review fish selection", goTo: 7 });
    }
  }

  // Plant/substrate warnings
  if (state.decorations.some(d => { const dc = DECORATIONS.find(dd => dd.id === d.id); return dc?.isPlant && dc?.needsLight; }) && light.intensity < 2) w.push({ type: "warning", msg: "Plants need better lighting", fix: "Upgrade to Full Spectrum+", goTo: 4 });
  if (state.decorations.some(d => { const dc = DECORATIONS.find(dd => dd.id === d.id); return dc?.isPlant && dc?.needsSubstrate; }) && substrate && !substrate.plantFriendly) w.push({ type: "warning", msg: "Carpet plants need rich substrate", fix: "Switch to ADA Amazonia", goTo: 3 });
  if (substrate?.type === "alkaline" && state.fish.some(f => ["neon", "discus", "corydoras"].includes(f.id) && f.count > 0)) w.push({ type: "warning", msg: "Coral raises pH — bad for soft-water fish", fix: "Change substrate", goTo: 3 });
  return w;
}
