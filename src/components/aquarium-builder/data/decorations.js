// ============================================================================
// HARDSCAPE & DECORATIONS
// ============================================================================
export const HARDSCAPE = [
  // Natural
  { id: "driftwood", name: "Driftwood", size: 2, drawType: "driftwood", icon: "🪵", scale: 1.1, price: 25 },
  { id: "driftwood2", name: "Manzanita Wood", size: 2, drawType: "driftwood", icon: "🪵", scale: 0.85, price: 35 },
  { id: "rock", name: "Dragon Stone", size: 2, drawType: "rock", icon: "🪨", scale: 1.2, price: 18 },
  { id: "rock2", name: "Seiryu Stone", size: 2, drawType: "rock2", icon: "🪨", scale: 0.9, price: 15 },
  { id: "cave", name: "Cave/Hide", size: 2, drawType: "cave", icon: "🕳️", scale: 1.0, price: 12 },
  { id: "coconut", name: "Coconut Shell", size: 1, drawType: "coconut", icon: "🥥", scale: 0.55, price: 6 },
  { id: "slate", name: "Slate Stack", size: 2, drawType: "slate", icon: "🧱", scale: 0.8, price: 10 },
  { id: "branch", name: "Spider Wood", size: 2, drawType: "branch", icon: "🌳", scale: 1.3, price: 30 },
  { id: "bonsai", name: "Bonsai Tree", size: 2, drawType: "bonsai", icon: "🌳", scale: 1.0, price: 40 },
  { id: "arch", name: "Rock Arch", size: 2, drawType: "arch", icon: "⛩️", scale: 1.1, price: 22 },
  { id: "stump", name: "Tree Stump", size: 2, drawType: "stump", icon: "🪵", scale: 0.7, price: 15 },
  { id: "bamboo", name: "Bamboo Bundle", size: 2, drawType: "bamboo", icon: "🎋", scale: 0.9, price: 12 },
  { id: "terracotta", name: "Terracotta Pot", size: 1, drawType: "terracotta", icon: "🏺", scale: 0.6, price: 4 },
  { id: "reef_rock", name: "Reef Rock", size: 2, drawType: "reef_rock", icon: "🪸", scale: 1.0, price: 28 },
  // Classic decor
  { id: "treasure", name: "Treasure Chest", size: 2, drawType: "treasure", icon: "📦", scale: 0.7, price: 14 },
  { id: "ship", name: "Shipwreck", size: 3, drawType: "ship", icon: "⛵", scale: 1.4, price: 22 },
  { id: "skull", name: "Skull Decor", size: 2, drawType: "skull", icon: "💀", scale: 0.6, price: 10 },
  { id: "castle", name: "Castle Ruin", size: 3, drawType: "castle", icon: "🏰", scale: 1.5, price: 28 },
  { id: "column", name: "Roman Column", size: 2, drawType: "column", icon: "🏛️", scale: 1.1, price: 16 },
  { id: "bridge", name: "Stone Bridge", size: 2, drawType: "bridge", icon: "🌉", scale: 1.2, price: 18 },
  { id: "volcano", name: "Volcano Bubbler", size: 2, drawType: "volcano", icon: "🌋", scale: 1.1, price: 20 },
  // Funny / meme
  { id: "diver", name: "Mini Diver", size: 1, drawType: "diver", icon: "🤿", scale: 0.6, price: 8 },
  { id: "nofish", name: "No Fishing Sign", size: 1, drawType: "sign", icon: "🚫", scale: 0.55, price: 6 },
  { id: "toilet", name: "Tiny Toilet", size: 1, drawType: "toilet", icon: "🚽", scale: 0.4, price: 8 },
  { id: "duck", name: "Rubber Duck", size: 1, drawType: "duck", icon: "🦆", scale: 0.5, price: 3 },
  { id: "pineapple", name: "SpongeBob House", size: 2, drawType: "pineapple", icon: "🍍", scale: 1.2, price: 18 },
  { id: "ufo", name: "UFO Crash", size: 2, drawType: "ufo", icon: "🛸", scale: 0.8, price: 14 },
  { id: "gnome", name: "Garden Gnome", size: 1, drawType: "gnome", icon: "🧙", scale: 0.5, price: 9 },
  { id: "pizza", name: "Pizza Slice", size: 1, drawType: "pizza", icon: "🍕", scale: 0.4, price: 7 },
  { id: "tv", name: "Tiny TV", size: 1, drawType: "tv", icon: "📺", scale: 0.5, price: 12 },
  { id: "moai", name: "Easter Island Head", size: 2, drawType: "moai", icon: "🗿", scale: 1.3, price: 20 },
  { id: "lighthouse", name: "Lighthouse", size: 2, drawType: "lighthouse", icon: "🏠", scale: 1.2, price: 16 },
  // Equipment
  { id: "bubbler", name: "Air Stone", size: 1, drawType: "bubbler", icon: "🫧", scale: 0.3, price: 5 },
  { id: "thermometer", name: "Thermometer", size: 1, drawType: "thermometer", icon: "🌡️", scale: 0.7, price: 8 },
];

// ============================================================================
// PLANTS
// ============================================================================
export const PLANTS = [
  { id: "plant_anubias", name: "Anubias", size: 1, isPlant: true, needsLight: false, drawType: "anubias", icon: "🌿", desc: "Low light, easy", scale: 0.6, price: 8 },
  { id: "plant_val", name: "Vallisneria", size: 1, isPlant: true, needsLight: true, drawType: "val", icon: "🌱", desc: "Background, tall", scale: 1.3, price: 5 },
  { id: "plant_carpet", name: "Dwarf Hairgrass", size: 1, isPlant: true, needsLight: true, needsSubstrate: true, drawType: "carpet", icon: "☘️", desc: "Carpet, high light", scale: 0.3, price: 7 },
  { id: "moss", name: "Java Moss", size: 1, isPlant: true, needsLight: false, drawType: "moss", icon: "🍀", desc: "Attach to wood/rock", scale: 0.4, price: 6 },
  { id: "plant_sword", name: "Amazon Sword", size: 2, isPlant: true, needsLight: true, drawType: "sword", icon: "🌿", desc: "Large centerpiece", scale: 1.5, price: 9 },
  { id: "plant_crypto", name: "Cryptocoryne", size: 1, isPlant: true, needsLight: false, drawType: "crypto", icon: "🌱", desc: "Mid-ground, easy", scale: 0.55, price: 6 },
  { id: "plant_frogbit", name: "Frogbit", size: 1, isPlant: true, needsLight: false, drawType: "frogbit", icon: "🍃", desc: "Floating, shade", scale: 0.5, price: 4 },
  { id: "plant_bucep", name: "Bucephalandra", size: 1, isPlant: true, needsLight: false, drawType: "bucep", icon: "🌿", desc: "Attach to hardscape", scale: 0.4, price: 12 },
  { id: "plant_rotala", name: "Rotala", size: 1, isPlant: true, needsLight: true, drawType: "rotala", icon: "🌺", desc: "Red stems, high light", scale: 1.0, price: 6 },
  { id: "plant_monte", name: "Monte Carlo", size: 1, isPlant: true, needsLight: true, needsSubstrate: true, drawType: "carpet", icon: "☘️", desc: "Carpet, medium light", scale: 0.25, price: 8 },
  { id: "plant_ludwigia", name: "Ludwigia Repens", size: 1, isPlant: true, needsLight: true, drawType: "ludwigia", icon: "🍂", desc: "Red/green, mid-ground", scale: 0.9, price: 5 },
  { id: "plant_hornwort", name: "Hornwort", size: 1, isPlant: true, needsLight: false, drawType: "hornwort", icon: "🌲", desc: "Floating or planted, fast", scale: 1.2, price: 4 },
  { id: "plant_javafern", name: "Java Fern", size: 1, isPlant: true, needsLight: false, drawType: "javafern", icon: "🌿", desc: "Attach to hardscape, easy", scale: 0.8, price: 7 },
  { id: "plant_dwarf_sag", name: "Dwarf Sagittaria", size: 1, isPlant: true, needsLight: true, needsSubstrate: true, drawType: "dwarfsag", icon: "🌾", desc: "Grass-like, foreground", scale: 0.4, price: 5 },
  { id: "plant_water_wist", name: "Water Wisteria", size: 1, isPlant: true, needsLight: true, drawType: "wisteria", icon: "🌿", desc: "Lacy leaves, fast grower", scale: 1.1, price: 5 },
  { id: "plant_red_tiger", name: "Red Tiger Lotus", size: 2, isPlant: true, needsLight: true, needsSubstrate: true, drawType: "lotus", icon: "🪷", desc: "Lily pads, stunning red", scale: 1.4, price: 14 },
  { id: "plant_salvinia", name: "Salvinia", size: 1, isPlant: true, needsLight: false, drawType: "salvinia", icon: "🍃", desc: "Floating, fast growing", scale: 0.35, price: 4 },
  { id: "plant_elodea", name: "Elodea / Anacharis", size: 1, isPlant: true, needsLight: false, drawType: "elodea", icon: "🌱", desc: "Background, oxygenator", scale: 1.1, price: 4 },
  { id: "plant_staurogyne", name: "Staurogyne Repens", size: 1, isPlant: true, needsLight: true, needsSubstrate: true, drawType: "staurogyne", icon: "☘️", desc: "Foreground, compact", scale: 0.35, price: 7 },
  { id: "plant_pogostemon", name: "Pogostemon Helferi", size: 1, isPlant: true, needsLight: true, needsSubstrate: true, drawType: "pogostemon", icon: "⭐", desc: "Star-shaped, foreground", scale: 0.35, price: 10 },
];

// ============================================================================
// COMBINED DECORATIONS (used throughout the app)
// ============================================================================
export const DECORATIONS = [...HARDSCAPE, ...PLANTS];
