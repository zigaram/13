// ============================================================================
// BACKGROUNDS
// ============================================================================
export const BACKGROUNDS = [
  { id: "none", name: "None", icon: "∅", colors: null },
  // Solid/Simple
  { id: "black", name: "Solid Black", icon: "⬛", colors: ["#050505", "#0A0A0A"] },
  { id: "deep_blue", name: "Deep Blue", icon: "🌊", colors: ["#020B18", "#061E38"] },
  { id: "dark_green", name: "Dark Forest", icon: "🌲", colors: ["#051208", "#0A2A15"] },
  { id: "blue_poster", name: "Blue Poster", icon: "🟦", colors: ["#0A2050", "#081840"] },
  { id: "white_frost", name: "Frosted White", icon: "⬜", colors: ["#2A3040", "#252D3A"] },
  { id: "forest_green", name: "Forest Green", icon: "🟩", colors: ["#0A1A0A", "#081608"] },
  // Tropical
  { id: "trop_green", name: "Tropical Green", icon: "🌿", colors: ["#08200E", "#0A3518"], accent: { r: 40, g: 180, b: 60, spots: true } },
  { id: "trop_green_light", name: "Tropical Lime", icon: "💚", colors: ["#102A10", "#184020"], accent: { r: 80, g: 200, b: 80, spots: false } },
  { id: "trop_blue", name: "Tropical Blue", icon: "🐟", colors: ["#061828", "#0A3050"], accent: { r: 20, g: 150, b: 220, spots: true } },
  { id: "trop_blue_light", name: "Caribbean Blue", icon: "💎", colors: ["#082838", "#0E4060"], accent: { r: 40, g: 200, b: 240, spots: true } },
  { id: "trop_teal", name: "Tropical Teal", icon: "🌴", colors: ["#061A1A", "#0A3030"], accent: { r: 30, g: 180, b: 170, spots: true } },
  // Photo-style
  { id: "tropical_reef", name: "Tropical Reef", icon: "🐠", colors: ["#0A2840", "#06253B"], accent: { r: 0, g: 180, b: 220, spots: true } },
  { id: "amazon_river", name: "Amazon River", icon: "🏞️", colors: ["#1A1A08", "#152008"], accent: { r: 80, g: 100, b: 40, spots: true } },
  { id: "rocky_lake", name: "Rocky Lake", icon: "🪨", colors: ["#18181A", "#14161A"], accent: { r: 100, g: 95, b: 85, spots: true } },
  { id: "coral_lagoon", name: "Coral Lagoon", icon: "🪸", colors: ["#08182A", "#08203A"], accent: { r: 40, g: 160, b: 200, spots: true } },
  // Mood
  { id: "misty_stream", name: "Misty Stream", icon: "🌫️", colors: ["#141820", "#101418"], accent: { r: 140, g: 160, b: 170, spots: false } },
  { id: "sunset_pond", name: "Sunset Pond", icon: "🌅", colors: ["#1A1008", "#181008"], accent: { r: 180, g: 100, b: 40, spots: false } },
  { id: "moonlit", name: "Moonlit", icon: "🌙", colors: ["#0A0E18", "#080C14"], accent: { r: 100, g: 130, b: 200, spots: false } },
  // Center gradient (radial from center)
  { id: "center_blue", name: "Blue Glow", icon: "🔵", colors: ["#0C2850", "#040E20"], gradient: "center" },
  { id: "center_green", name: "Green Glow", icon: "🟢", colors: ["#0C3018", "#041208"], gradient: "center" },
  { id: "center_teal", name: "Teal Glow", icon: "🔷", colors: ["#0A2828", "#041414"], gradient: "center" },
  { id: "center_warm", name: "Warm Glow", icon: "🟠", colors: ["#281808", "#140A04"], gradient: "center" },
  { id: "center_purple", name: "Purple Glow", icon: "🟣", colors: ["#180C30", "#0A0618"], gradient: "center" },
];

// ============================================================================
// TANK SIZES
// ============================================================================
export const TANK_SIZES = [
  { id: "nano", name: "Nano", liters: 20, width: 30, height: 25, depth: 20, price: 45 },
  { id: "small", name: "Small", liters: 54, width: 60, height: 30, depth: 30, price: 89 },
  { id: "medium", name: "Medium", liters: 112, width: 80, height: 35, depth: 40, price: 159 },
  { id: "large", name: "Large", liters: 200, width: 100, height: 40, depth: 50, price: 249 },
  { id: "xl", name: "XL", liters: 350, width: 120, height: 50, depth: 60, price: 399 },
  { id: "xxl", name: "XXL", liters: 500, width: 150, height: 55, depth: 60, price: 599 },
];

// ============================================================================
// SUBSTRATES
// ============================================================================
export const SUBSTRATES = [
  { id: "gravel", name: "Fine Gravel", color: "#8B7355", accent: "#A0896B", darkColor: "#6B5A42", type: "neutral", plantFriendly: false, particleSize: 3, price: 12 },
  { id: "gravel_mixed", name: "Mixed River Gravel", color: "#7A8070", accent: "#909880", darkColor: "#5A6050", type: "neutral", plantFriendly: false, particleSize: 4, price: 15 },
  { id: "sand", name: "Sand", color: "#D2B48C", accent: "#E8D5B7", darkColor: "#B89B6F", type: "neutral", plantFriendly: false, particleSize: 1, price: 10 },
  { id: "black", name: "Black Sand", color: "#1A1A2E", accent: "#2D2D44", darkColor: "#0E0E1A", type: "neutral", plantFriendly: false, particleSize: 1, price: 18 },
  { id: "white_sand", name: "White Sand", color: "#F0EBE0", accent: "#FAF5EC", darkColor: "#D8D2C5", type: "neutral", plantFriendly: false, particleSize: 1, price: 14 },
  { id: "planted", name: "ADA Amazonia", color: "#3B2F2F", accent: "#4A3C3C", darkColor: "#2A2020", type: "active", plantFriendly: true, particleSize: 2, price: 45 },
  { id: "fluval", name: "Fluval Stratum", color: "#2E2E2E", accent: "#3A3A3A", darkColor: "#1A1A1A", type: "active", plantFriendly: true, particleSize: 3, price: 35 },
  { id: "eco_complete", name: "Eco-Complete", color: "#2B1F1F", accent: "#3D2D2D", darkColor: "#1A1212", type: "active", plantFriendly: true, particleSize: 3, price: 28 },
  { id: "laterite", name: "Laterite", color: "#8B4513", accent: "#A0582A", darkColor: "#6B3410", type: "active", plantFriendly: true, particleSize: 2, price: 20 },
  { id: "coral", name: "Crushed Coral", color: "#F5F0E8", accent: "#FFF8F0", darkColor: "#D8D0C0", type: "alkaline", plantFriendly: false, particleSize: 4, price: 16 },
  { id: "aragonite", name: "Aragonite", color: "#E8E0D0", accent: "#F5EDE0", darkColor: "#C8C0B0", type: "alkaline", plantFriendly: false, particleSize: 3, price: 22 },
  { id: "lava_rock", name: "Lava Rock Gravel", color: "#3A2828", accent: "#4D3535", darkColor: "#251818", type: "neutral", plantFriendly: false, particleSize: 5, price: 18 },
  { id: "fluorite", name: "Seachem Fluorite", color: "#6B3030", accent: "#7D4040", darkColor: "#4A2020", type: "active", plantFriendly: true, particleSize: 3, price: 32 },
  { id: "bare", name: "Bare Bottom", color: "#1A2030", accent: "#222838", darkColor: "#101520", type: "neutral", plantFriendly: false, particleSize: 0, price: 0 },
];

// ============================================================================
// LIGHTS
// ============================================================================
export const LIGHTS = [
  { id: "none", name: "No Light", intensity: 0, spectrum: "none", planted: false, price: 0 },
  { id: "basic", name: "Basic LED", intensity: 1, spectrum: "white", planted: false, price: 25, r: 255, g: 248, b: 220, strength: 0.15 },
  { id: "planted", name: "Full Spectrum", intensity: 2, spectrum: "full", planted: true, price: 79, r: 220, g: 255, b: 220, strength: 0.22 },
  { id: "rgb", name: "RGB Pro", intensity: 3, spectrum: "rgb", planted: true, price: 129, r: 200, g: 180, b: 255, strength: 0.25 },
  { id: "moonlight", name: "Moonlight Blue", intensity: 1, spectrum: "blue", planted: false, price: 35, r: 100, g: 140, b: 255, strength: 0.12 },
];

// ============================================================================
// FILTERS
// ============================================================================
export const FILTERS = [
  { id: "none", name: "No Filter", capacity: 0, price: 0 },
  { id: "sponge", name: "Sponge Filter", capacity: 40, price: 12 },
  { id: "hob", name: "HOB Filter", capacity: 120, price: 35 },
  { id: "canister", name: "Canister Filter", capacity: 300, price: 89 },
  { id: "sump", name: "Sump System", capacity: 600, price: 249 },
];

// ============================================================================
// HEATERS
// ============================================================================
export const HEATERS = [
  { id: "none", name: "No Heater", watts: 0, price: 0 },
  { id: "25w", name: "25W Heater", watts: 25, maxLiters: 30, price: 15 },
  { id: "50w", name: "50W Heater", watts: 50, maxLiters: 60, price: 22 },
  { id: "100w", name: "100W Heater", watts: 100, maxLiters: 120, price: 32 },
  { id: "200w", name: "200W Heater", watts: 200, maxLiters: 250, price: 45 },
  { id: "300w", name: "300W Heater", watts: 300, maxLiters: 500, price: 59 },
];
