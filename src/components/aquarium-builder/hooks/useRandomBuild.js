import { TANK_SIZES, SUBSTRATES, LIGHTS, FILTERS, HEATERS, FISH_DB, PLANTS, HARDSCAPE } from '../data/index.js';
import { layoutPreset } from './usePlacement.js';

// ============================================================================
// RANDOM AQUARIUM GENERATOR
// Builds a coherent random aquarium — not just random values but a
// biologically plausible setup with compatible species, appropriate
// equipment, and matching aesthetics.
// ============================================================================

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

const FRESH_TANKS = ["nano", "small", "medium", "large", "xl", "xxl"];
const SALT_TANKS = ["medium", "large", "xl", "xxl"];

const BACKGROUNDS = [
  "none", "deep_blue", "dark_green", "black", "trop_green", "trop_blue",
  "trop_teal", "misty_stream", "sunset_pond", "moonlit",
  "center_blue", "center_green", "center_teal",
];

export function generateRandomBuild() {
  // 1. Water type — 75% freshwater, 25% saltwater
  const waterType = Math.random() < 0.75 ? "fresh" : "salt";

  // 2. Tank size — weighted toward medium/large
  const tankOptions = waterType === "salt" ? SALT_TANKS : FRESH_TANKS;
  const tankWeights = waterType === "salt"
    ? [0, 0, 0.2, 0.35, 0.3, 0.15]
    : [0.08, 0.12, 0.25, 0.3, 0.15, 0.1];
  let r = Math.random(), tankSize = tankOptions[tankOptions.length - 1];
  let cum = 0;
  for (let i = 0; i < tankOptions.length; i++) {
    cum += tankWeights[i];
    if (r < cum) { tankSize = tankOptions[i]; break; }
  }
  const tank = TANK_SIZES.find(t => t.id === tankSize);
  const liters = tank ? tank.liters : 100;

  // 3. Substrate — match water type
  const freshSubstrates = ["gravel", "sand", "black", "planted", "eco_complete", "laterite"];
  const saltSubstrates = ["aragonite", "sand", "reef_sand"];
  const subOptions = waterType === "salt" ? saltSubstrates : freshSubstrates;
  const substrate = pick(subOptions.filter(s => SUBSTRATES.find(ss => ss.id === s)));

  // 4. Light — random but weighted toward planted
  const lightOptions = ["basic", "planted", "rgb", "moonlight"];
  const lightWeights = [0.2, 0.35, 0.3, 0.15];
  r = Math.random(); let light = "basic"; cum = 0;
  for (let i = 0; i < lightOptions.length; i++) {
    cum += lightWeights[i];
    if (r < cum) { light = lightOptions[i]; break; }
  }

  // 5. Filter — appropriate for tank size
  const filterOptions = FILTERS.filter(f => f.capacity >= liters * 0.7 && f.id !== "none");
  const filter = filterOptions.length > 0 ? pick(filterOptions).id : "hob";

  // 6. Heater — match tank
  const heaterOptions = HEATERS.filter(h => h.maxLiters >= liters * 0.6 && h.id !== "none");
  const heater = heaterOptions.length > 0 ? pick(heaterOptions).id : "100w";

  // 7. Fish — pick 2-5 compatible species
  const availFish = FISH_DB.filter(f => f.water === waterType);
  const fishCount = 2 + Math.floor(Math.random() * 4); // 2-5 species
  const selectedFish = [];
  const usedGroups = new Set();

  // Try to get variety across groups
  const shuffledFish = [...availFish].sort(() => Math.random() - 0.5);
  for (const f of shuffledFish) {
    if (selectedFish.length >= fishCount) break;
    // Skip if tank too small
    if (f.litersPerFish * (f.minSchool || 1) > liters * 0.4) continue;
    // Skip predators with tiny fish already selected
    if (f.aggressive === "predator" && selectedFish.some(s => s.size === "tiny")) continue;
    // Skip tiny if predator already selected
    if (f.size === "tiny" && selectedFish.some(s => s.aggressive === "predator")) continue;
    // Prefer group variety
    if (usedGroups.has(f.group) && Math.random() < 0.6) continue;
    selectedFish.push(f);
    usedGroups.add(f.group);
  }

  const fish = selectedFish.map(f => ({
    id: f.id,
    count: f.schooling ? f.minSchool : (f.minSchool || 1),
  }));

  // 8. Decorations — 1-4 hardscape pieces
  const decorCount = 1 + Math.floor(Math.random() * 4);
  const hardscapeIds = HARDSCAPE.map(h => h.id);
  const naturalIds = ["driftwood", "driftwood2", "rock", "rock2", "cave", "coconut", "slate", "branch", "bonsai", "arch", "stump", "bamboo", "terracotta", "reef_rock"];
  const funIds = ["treasure", "ship", "skull", "castle", "column", "bridge", "volcano", "diver", "nofish", "toilet", "duck", "pineapple", "ufo", "gnome", "pizza", "tv", "moai"];

  // 70% natural, 30% fun
  const decorPool = Math.random() < 0.7 ? naturalIds : funIds;
  const decor = pickN(decorPool.filter(id => hardscapeIds.includes(id)), decorCount);

  // 9. Plants — 0-6 species (salt = no plants, fresh = random)
  let plants = [];
  if (waterType === "fresh") {
    const plantCount = Math.floor(Math.random() * 7); // 0-6
    const plantIds = PLANTS.map(p => p.id);
    plants = pickN(plantIds, plantCount);
  }

  // 10. Background
  const background = pick(BACKGROUNDS);

  // 11. Build the preset object and use layoutPreset for smart placement
  const preset = { decor, plants };
  const decorations = layoutPreset(preset);

  // 12. Cabinet — random
  const cabStyles = ["none", "none", "none", "classic", "handleless", "open", "floating"];
  const cabMaterials = ["wood", "matte", "gloss", "metal"];
  const cabColors = ["#2C2218", "#1A1A1A", "#3B2F2F", "#F5F0E8", "#1E3A5F", "#2D4A2E"];

  return {
    tankSize: tankSize,
    waterType,
    substrate,
    substrateDepth: substrate === "bare" ? 1 : 8 + Math.floor(Math.random() * 10),
    light,
    filter,
    heater,
    fish,
    decorations,
    background: { id: background, brightness: 0.7 + Math.random() * 0.3 },
    cabinet: {
      style: pick(cabStyles),
      material: pick(cabMaterials),
      color: pick(cabColors),
    },
    customTank: { width: 60, height: 35, depth: 30 },
    customLight: { intensity: 2, r: 220, g: 255, b: 220, strength: 0.22 },
    customHeater: { watts: 100 },
  };
}
