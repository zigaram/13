// ============================================================================
// FISH COMPATIBILITY MATRIX
//
// Rule-based system that checks pairwise fish interactions.
// Each rule has: test function, severity (error/warning), message.
// Rules are checked for every unique pair of species in the tank.
// ============================================================================

// Trait tags for rule matching (derived from fish data)
const FIN_NIPPERS = ["serpae", "tiger_barb", "damsel"];
const LONG_FINNED = ["betta", "guppy", "endler", "congo", "angelfish"]; // flowing/fantail fins
const PREDATORS = ["oscar", "blue_lobster"]; // will eat tiny fish
const SHRIMP_UNSAFE = ["oscar", "angelfish", "dwarf_gourami", "pearl_gourami", "puffer_fresh", "betta", "ram", "apisto", "kribensis", "blue_lobster", "cpo_lobster", "clown_loach"]; // eat or harass shrimp
const SHRIMP_IDS = ["shrimp", "amano", "blue_shrimp", "bamboo_shrimp", "peppermint_shrimp", "cleaner_shrimp", "emerald_crab", "hermit_crab"];
const SNAIL_IDS = ["snail", "mystery_snail"];
const SNAIL_EATERS = ["assassin_snail", "puffer_fresh", "clown_loach", "cpo_lobster", "blue_lobster"];
const TERRITORIAL_BOTTOM = ["ram", "apisto", "kribensis", "cpo_lobster", "blue_lobster"];
const COLD_WATER = ["zebra_danio", "cpd", "axolotl"]; // prefer < 24°C
const HOT_WATER = ["discus", "ram"]; // need 26°C+

// ============================================================================
// PAIRWISE COMPATIBILITY RULES
// Each rule: { test(a, b, aData, bData) => bool, severity, msg(a,b) }
// a,b are fish state entries, aData/bData are FISH_DB entries
// ============================================================================
export const COMPAT_RULES = [
  // --- Predation ---
  {
    test: (a, b, ad, bd) => PREDATORS.includes(ad.id) && bd.size === "tiny",
    severity: "error",
    msg: (ad, bd) => `${ad.name} will eat ${bd.name}`,
    fix: "Don't mix large predators with tiny fish",
  },
  {
    test: (a, b, ad, bd) => ad.aggressive === "predator" && (bd.size === "tiny" || bd.size === "small"),
    severity: "error",
    msg: (ad, bd) => `${ad.name} is a predator — ${bd.name} is at risk`,
    fix: "Remove the predator or the small fish",
  },

  // --- Betta aggression ---
  {
    test: (a, b, ad, bd) => ad.id === "betta" && bd.id === "betta",
    severity: "error",
    msg: () => "Multiple Bettas will fight to the death",
    fix: "Keep only 1 Betta",
  },
  {
    test: (a, b, ad, bd) => ad.id === "betta" && bd.id === "dwarf_gourami",
    severity: "error",
    msg: () => "Bettas and Gouramis are both labyrinth fish — they fight",
    fix: "Choose one or the other",
  },
  {
    test: (a, b, ad, bd) => ad.id === "betta" && (bd.finStyle === "fantail" || bd.id === "guppy" || bd.id === "endler"),
    severity: "warning",
    msg: (ad, bd) => `Betta may attack ${bd.name} — colorful fins trigger aggression`,
    fix: "Monitor closely or separate",
  },

  // --- Fin nipping ---
  {
    test: (a, b, ad, bd) => FIN_NIPPERS.includes(ad.id) && LONG_FINNED.includes(bd.id),
    severity: "warning",
    msg: (ad, bd) => `${ad.name} are fin nippers — will damage ${bd.name}'s fins`,
    fix: "Avoid mixing fin nippers with long-finned fish",
  },
  {
    test: (a, b, ad, bd) => ad.id === "serpae" && bd.peaceful && bd.size === "tiny",
    severity: "warning",
    msg: (ad, bd) => `Serpae Tetras nip at slow/small fish like ${bd.name}`,
    fix: "Keep Serpaes in a large school (8+) to reduce nipping",
  },

  // --- Shrimp predation ---
  {
    test: (a, b, ad, bd) => SHRIMP_UNSAFE.includes(ad.id) && SHRIMP_IDS.includes(bd.id) && bd.size === "tiny",
    severity: "warning",
    msg: (ad, bd) => `${ad.name} will eat or harass ${bd.name}`,
    fix: "Small shrimp need a fish-free or nano-fish-only tank",
  },
  {
    test: (a, b, ad, bd) => ad.id === "puffer_fresh" && SHRIMP_IDS.includes(bd.id),
    severity: "error",
    msg: (ad, bd) => `Pea Puffers hunt and eat ${bd.name}`,
    fix: "Puffers are best kept species-only",
  },

  // --- Snail eaters ---
  {
    test: (a, b, ad, bd) => SNAIL_EATERS.includes(ad.id) && SNAIL_IDS.includes(bd.id),
    severity: "warning",
    msg: (ad, bd) => `${ad.name} will eat ${bd.name}`,
    fix: "Don't mix snail-eaters with pet snails",
  },
  {
    test: (a, b, ad, bd) => ad.id === "assassin_snail" && SNAIL_IDS.includes(bd.id),
    severity: "error",
    msg: (ad, bd) => `Assassin Snails hunt and kill ${bd.name}`,
    fix: "Assassins are for pest snails, not pet snails",
  },

  // --- Lobster / crayfish conflicts ---
  {
    test: (a, b, ad, bd) => (ad.id === "blue_lobster" || ad.id === "cpo_lobster") && bd.level === "bottom" && bd.size !== "large",
    severity: "warning",
    msg: (ad, bd) => `${ad.name} is territorial — may grab ${bd.name} at night`,
    fix: "Crayfish are safest with fast mid-water fish only",
  },
  {
    test: (a, b, ad, bd) => ad.id === "blue_lobster" && bd.id === "axolotl",
    severity: "error",
    msg: () => "Blue Crayfish will attack and injure Axolotl gills",
    fix: "Never mix crayfish with axolotls",
  },

  // --- Axolotl incompatibilities ---
  {
    test: (a, b, ad, bd) => ad.id === "axolotl" && bd.size === "tiny",
    severity: "warning",
    msg: (ad, bd) => `Axolotl may eat small ${bd.name}`,
    fix: "Axolotls do best species-only or with large snails",
  },
  {
    test: (a, b, ad, bd) => ad.id === "axolotl" && bd.tempMin > 24,
    severity: "error",
    msg: (ad, bd) => `Axolotl needs cold water (16-22°C) — ${bd.name} needs ${bd.tempMin}°C+`,
    fix: "Temperature ranges don't overlap",
  },

  // --- Territorial bottom dwellers ---
  {
    test: (a, b, ad, bd) => TERRITORIAL_BOTTOM.includes(ad.id) && TERRITORIAL_BOTTOM.includes(bd.id) && ad.id !== bd.id,
    severity: "warning",
    msg: (ad, bd) => `${ad.name} and ${bd.name} are both territorial bottom dwellers`,
    fix: "Provide lots of caves/hides or choose one species",
  },

  // --- Temperature mismatches ---
  {
    test: (a, b, ad, bd) => ad.tempMin > bd.tempMax,
    severity: "error",
    msg: (ad, bd) => `${ad.name} (${ad.tempMin}-${ad.tempMax}°C) too warm for ${bd.name} (${bd.tempMin}-${bd.tempMax}°C)`,
    fix: "Temperature ranges don't overlap",
  },
  {
    test: (a, b, ad, bd) => {
      // Only warn if overlap is very narrow (≤2°C)
      const overlap = Math.min(ad.tempMax, bd.tempMax) - Math.max(ad.tempMin, bd.tempMin);
      return overlap > 0 && overlap <= 2;
    },
    severity: "warning",
    msg: (ad, bd) => `${ad.name} and ${bd.name} have only narrow temp overlap`,
    fix: "Set heater to the overlap zone — monitor closely",
  },

  // --- Cichlid size mismatches ---
  {
    test: (a, b, ad, bd) => ad.group === "Cichlids" && !ad.peaceful && bd.size === "tiny" && bd.peaceful,
    severity: "warning",
    msg: (ad, bd) => `${ad.name} (cichlid) may bully tiny ${bd.name}`,
    fix: "Cichlids do best with similar-sized fish",
  },

  // --- Discus sensitivity ---
  {
    test: (a, b, ad, bd) => ad.id === "discus" && !bd.peaceful,
    severity: "warning",
    msg: (ad, bd) => `Discus are sensitive — ${bd.name} may stress them`,
    fix: "Discus need calm, peaceful tankmates only",
  },

  // --- Puffer species-only ---
  {
    test: (a, b, ad, bd) => ad.id === "puffer_fresh" && bd.id !== "puffer_fresh" && !SNAIL_IDS.includes(bd.id),
    severity: "warning",
    msg: (ad, bd) => `Pea Puffers are nippy — may harass ${bd.name}`,
    fix: "Puffers do best species-only or with fast fish and lots of cover",
  },

  // --- Angelfish eat tiny fish ---
  {
    test: (a, b, ad, bd) => ad.id === "angelfish" && bd.size === "tiny" && bd.bodyShape !== "snail",
    severity: "warning",
    msg: (ad, bd) => `Adult Angelfish may eat small ${bd.name}`,
    fix: "Add Angelfish young so they grow up with tankmates",
  },

  // --- Damselfish aggression (saltwater) ---
  {
    test: (a, b, ad, bd) => ad.id === "damsel" && bd.peaceful && bd.water === "salt",
    severity: "warning",
    msg: (ad, bd) => `Damselfish are aggressive — will harass ${bd.name}`,
    fix: "Add Damsels last, or avoid in peaceful reef tanks",
  },

  // --- Wrasse aggression (saltwater) ---
  {
    test: (a, b, ad, bd) => ad.id === "wrasse" && bd.id === "wrasse",
    severity: "error",
    msg: () => "Multiple Six Line Wrasses will fight viciously",
    fix: "Keep only 1 Six Line Wrasse per tank",
  },
  {
    test: (a, b, ad, bd) => ad.id === "wrasse" && (bd.size === "tiny" || bd.id === "firefish"),
    severity: "warning",
    msg: (ad, bd) => `Six Line Wrasse may bully ${bd.name}`,
    fix: "Add the Wrasse last to reduce territorial aggression",
  },
];

// ============================================================================
// CHECK ALL PAIRS
// Returns array of { severity, msg, fix } for the current fish list
// ============================================================================
export function checkCompatibility(fishList, fishDB) {
  const issues = [];
  const seen = new Set(); // deduplicate A→B and B→A

  for (let i = 0; i < fishList.length; i++) {
    const a = fishList[i];
    if (a.count <= 0) continue;
    const ad = fishDB.find(f => f.id === a.id);
    if (!ad) continue;

    for (let j = 0; j < fishList.length; j++) {
      const b = fishList[j];
      if (b.count <= 0) continue;
      const bd = fishDB.find(f => f.id === b.id);
      if (!bd) continue;

      // Skip self-pairs unless it's a same-species rule (like multiple bettas)
      if (i === j && ad.id === bd.id) {
        // Only check same-species rules when count > 1
        if (a.count <= 1) continue;
      }
      if (i > j && ad.id !== bd.id) continue; // skip B→A if we already did A→B

      const pairKey = [ad.id, bd.id].sort().join(":");

      for (const rule of COMPAT_RULES) {
        if (rule.test(a, b, ad, bd)) {
          const msgKey = pairKey + ":" + rule.msg(ad, bd);
          if (seen.has(msgKey)) continue;
          seen.add(msgKey);
          issues.push({
            type: rule.severity,
            msg: rule.msg(ad, bd),
            fix: rule.fix,
            goTo: 7,
          });
        }
      }
    }
  }

  return issues;
}
