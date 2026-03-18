import type { FishSpecies, PlantSpecies, TankSize, Disease } from '@/types';

// ============================================================
// INTERNAL LINK TYPES
// ============================================================

export interface InternalLink {
  href: string;
  text: string;
  title: string;
  type: 'fish' | 'plant' | 'tank-size' | 'disease' | 'guide' | 'calculator' | 'review' | 'compatibility';
}

// ============================================================
// DATA ACCESS (lazy-loaded, cached)
// ============================================================

let _fishCache: any[] | null = null;
let _plantCache: any[] | null = null;
let _tankCache: any[] | null = null;
let _diseaseCache: any[] | null = null;

async function getAllFishData(): Promise<any[]> {
  if (!_fishCache) {
    try { _fishCache = (await import('@/data/fish.json')).default as any[]; }
    catch { _fishCache = []; }
  }
  return _fishCache;
}

async function getAllPlantData(): Promise<any[]> {
  if (!_plantCache) {
    try { _plantCache = (await import('@/data/plants.json')).default as any[]; }
    catch { _plantCache = []; }
  }
  return _plantCache;
}

async function getAllTankData(): Promise<any[]> {
  if (!_tankCache) {
    try { _tankCache = (await import('@/data/tank-sizes.json')).default as any[]; }
    catch { _tankCache = []; }
  }
  return _tankCache;
}

async function getAllDiseaseData(): Promise<any[]> {
  if (!_diseaseCache) {
    try { _diseaseCache = (await import('@/data/diseases.json')).default as any[]; }
    catch { _diseaseCache = []; }
  }
  return _diseaseCache;
}

function slugToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ============================================================
// FISH RELATED LINKS
// ============================================================

export function getFishRelatedLinks(fish: FishSpecies): InternalLink[] {
  const links: InternalLink[] = [];

  // Compatible tank mates (most valuable internal links)
  fish.compatibleWith.slice(0, 4).forEach((slug) => {
    links.push({
      href: `/fish/${slug}`,
      text: `${slugToName(slug)} Care Guide`,
      title: `Can ${fish.name} live with ${slugToName(slug)}?`,
      type: 'fish',
    });
  });

  // Compatibility checker for this fish
  if (fish.compatibleWith.length > 0) {
    links.push({
      href: `/compatibility`,
      text: `${fish.name} Compatibility Checker`,
      title: `Check ${fish.name} tank mates`,
      type: 'compatibility',
    });
  }

  // Best tank size for this fish
  const tankSizes = [3, 5, 10, 15, 20, 29, 30, 40, 55, 75, 125];
  const bestTank = tankSizes.find(g => g >= fish.minTankSize) || tankSizes[tankSizes.length - 1];
  links.push({
    href: `/tank-sizes/${bestTank}-gallon-fish-tank`,
    text: `Best ${bestTank} Gallon Fish Tanks`,
    title: `${bestTank} gallon tank guide for ${fish.name}`,
    type: 'tank-size',
  });

  // Equipment by tank size
  links.push({
    href: '/equipment/filters',
    text: `Best Filters for ${fish.name}`,
    title: `Filter guide for ${fish.minTankSize}+ gallon tanks`,
    type: 'review',
  });

  links.push({
    href: '/equipment/heaters',
    text: `Best Heaters for ${fish.name}`,
    title: `Heater sizing for ${fish.name}`,
    type: 'review',
  });

  // Disease prevention
  links.push({
    href: '/diseases',
    text: 'Common Fish Diseases',
    title: 'Identify and treat fish diseases',
    type: 'disease',
  });

  // Calculators
  links.push({
    href: '/calculators/stocking',
    text: 'Stocking Calculator',
    title: `Check stocking levels for ${fish.name}`,
    type: 'calculator',
  });

  links.push({
    href: '/calculators/heater-size',
    text: 'Heater Size Calculator',
    title: `Calculate heater wattage for ${fish.name}`,
    type: 'calculator',
  });

  return links;
}

// ============================================================
// FISH — "YOU MIGHT ALSO LIKE" (similar species)
// ============================================================

export async function getFishSimilarSpecies(fish: FishSpecies, limit = 6): Promise<InternalLink[]> {
  const allFish = await getAllFishData();
  
  const scored = allFish
    .filter(f => f.slug !== fish.slug)
    .map(f => {
      let score = 0;
      // Same care level = strong match
      if (f.careLevel === fish.careLevel) score += 3;
      // Same temperament
      if (f.temperament === fish.temperament) score += 3;
      // Same category (freshwater/saltwater)
      if (f.category === fish.category) score += 2;
      // Overlapping temperature range
      if (f.temperature.min <= fish.temperature.max && f.temperature.max >= fish.temperature.min) score += 2;
      // Similar tank size (within 10 gallons)
      if (Math.abs(f.minTankSize - fish.minTankSize) <= 10) score += 2;
      // Compatible with this fish
      if (fish.compatibleWith.includes(f.slug)) score += 4;
      // Same family
      if (f.family === fish.family) score += 2;
      // Same type (fish/invertebrate/amphibian)
      if (f.type === fish.type) score += 1;
      return { fish: f, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => ({
    href: `/fish/${s.fish.slug}`,
    text: s.fish.name,
    title: `${s.fish.name} — ${s.fish.careLevel} · ${s.fish.temperament}`,
    type: 'fish' as const,
  }));
}

// ============================================================
// PLANT RELATED LINKS
// ============================================================

export function getPlantRelatedLinks(plant: PlantSpecies): InternalLink[] {
  const links: InternalLink[] = [];

  // Lighting guide based on plant requirements
  const lightLabel = plant.lightRequirement === 'high' ? 'High' : plant.lightRequirement === 'medium' ? 'Medium' : 'Low';
  links.push({
    href: '/equipment/lights',
    text: `Best ${lightLabel} Light Aquarium LEDs`,
    title: `Lighting for ${plant.name}`,
    type: 'review',
  });

  // CO2 if needed
  if (plant.co2Required || plant.co2Recommended) {
    links.push({
      href: '/equipment/co2',
      text: plant.co2Required ? 'CO2 Systems (Required)' : 'CO2 Systems (Recommended)',
      title: `CO2 guide for ${plant.name}`,
      type: 'review',
    });
  }

  // Substrate
  links.push({
    href: '/equipment/substrate',
    text: 'Best Planted Tank Substrates',
    title: `Substrate for ${plant.name}`,
    type: 'review',
  });

  // Aquascaping guide
  links.push({
    href: '/guides/aquascaping-guide',
    text: 'Aquascaping Guide',
    title: 'Design your planted tank layout',
    type: 'guide',
  });

  // Calculators
  links.push({
    href: '/calculators/substrate',
    text: 'Substrate Calculator',
    title: 'Calculate substrate needed',
    type: 'calculator',
  });

  links.push({
    href: '/calculators/tank-volume',
    text: 'Tank Volume Calculator',
    title: 'Calculate your tank volume',
    type: 'calculator',
  });

  // Beginner guide if easy plant
  if (plant.careLevel === 'easy') {
    links.push({
      href: '/guides/beginner-guide',
      text: 'Beginner Guide',
      title: 'Start your first aquarium',
      type: 'guide',
    });
  }

  // Algae control
  links.push({
    href: '/algae',
    text: 'Algae Control Guide',
    title: 'Prevent algae in planted tanks',
    type: 'guide',
  });

  return links;
}

// ============================================================
// PLANT — SIMILAR PLANTS
// ============================================================

export async function getPlantSimilarSpecies(plant: PlantSpecies, limit = 6): Promise<InternalLink[]> {
  const allPlants = await getAllPlantData();
  
  const scored = allPlants
    .filter(p => p.slug !== plant.slug)
    .map(p => {
      let score = 0;
      if (p.placement === plant.placement) score += 3;
      if (p.careLevel === plant.careLevel) score += 3;
      if (p.lightRequirement === plant.lightRequirement) score += 2;
      if (p.category === plant.category) score += 2;
      if (p.co2Required === plant.co2Required) score += 1;
      if (p.growthRate === plant.growthRate) score += 1;
      return { plant: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => ({
    href: `/plants/${s.plant.slug}`,
    text: s.plant.name,
    title: `${s.plant.name} — ${s.plant.careLevel} · ${s.plant.lightRequirement} light`,
    type: 'plant' as const,
  }));
}

// ============================================================
// TANK SIZE RELATED LINKS
// ============================================================

export function getTankSizeRelatedLinks(tankSize: TankSize): InternalLink[] {
  const links: InternalLink[] = [];

  // Recommended fish for this tank
  tankSize.recommendedFish.slice(0, 5).forEach((slug) => {
    links.push({
      href: `/fish/${slug}`,
      text: `${slugToName(slug)} Care Guide`,
      title: `${slugToName(slug)} in a ${tankSize.gallons} gallon tank`,
      type: 'fish',
    });
  });

  // Equipment
  links.push({
    href: '/equipment/filters',
    text: `Best Filters for ${tankSize.gallons} Gallons`,
    title: `Filter guide for ${tankSize.gallons}g`,
    type: 'review',
  });

  links.push({
    href: '/equipment/heaters',
    text: `Best Heaters for ${tankSize.gallons} Gallons`,
    title: `Heater sizing for ${tankSize.gallons}g`,
    type: 'review',
  });

  links.push({
    href: '/equipment/lights',
    text: `Best Lights for ${tankSize.gallons} Gallons`,
    title: `LED light guide for ${tankSize.gallons}g`,
    type: 'review',
  });

  // Calculators
  links.push({
    href: '/calculators/stocking',
    text: 'Stocking Calculator',
    title: `How many fish in ${tankSize.gallons} gallons?`,
    type: 'calculator',
  });

  links.push({
    href: '/calculators/heater-size',
    text: 'Heater Size Calculator',
    title: `Heater wattage for ${tankSize.gallons}g`,
    type: 'calculator',
  });

  links.push({
    href: '/calculators/substrate',
    text: 'Substrate Calculator',
    title: `Substrate for ${tankSize.gallons}g`,
    type: 'calculator',
  });

  // Beginner guide for small tanks
  if (tankSize.gallons <= 20) {
    links.push({
      href: '/guides/beginner-guide',
      text: 'Beginner Guide',
      title: 'Set up your first tank',
      type: 'guide',
    });
  }

  // Compatibility
  links.push({
    href: '/compatibility',
    text: 'Fish Compatibility Checker',
    title: 'Check which fish can live together',
    type: 'compatibility',
  });

  return links;
}

// ============================================================
// TANK SIZE — ADJACENT SIZES
// ============================================================

export async function getAdjacentTankSizes(tankSize: TankSize, limit = 4): Promise<InternalLink[]> {
  const allTanks = await getAllTankData();
  
  return allTanks
    .filter(t => t.slug !== tankSize.slug)
    .sort((a, b) => Math.abs(a.gallons - tankSize.gallons) - Math.abs(b.gallons - tankSize.gallons))
    .slice(0, limit)
    .map(t => ({
      href: `/tank-sizes/${t.slug}`,
      text: t.name,
      title: `${t.gallons} gallon tank guide`,
      type: 'tank-size' as const,
    }));
}

// ============================================================
// DISEASE RELATED LINKS
// ============================================================

export function getDiseaseRelatedLinks(disease: Disease): InternalLink[] {
  const links: InternalLink[] = [];

  // Treatment equipment
  links.push({
    href: '/equipment/test-kits',
    text: 'Water Test Kits',
    title: 'Test water parameters for disease diagnosis',
    type: 'review',
  });

  links.push({
    href: '/equipment/water-conditioners',
    text: 'Water Conditioners',
    title: 'Detoxify ammonia during treatment',
    type: 'review',
  });

  links.push({
    href: '/equipment/heaters',
    text: 'Aquarium Heaters',
    title: 'Maintain stable temp during treatment',
    type: 'review',
  });

  // Salt guide if relevant
  if (disease.slug !== 'aquarium-salt-guide') {
    links.push({
      href: '/diseases/aquarium-salt-guide',
      text: 'Aquarium Salt Treatment Guide',
      title: 'Using salt to treat fish diseases',
      type: 'disease',
    });
  }

  // Water change calculator
  links.push({
    href: '/calculators/water-change',
    text: 'Water Change Calculator',
    title: 'Schedule water changes during treatment',
    type: 'calculator',
  });

  // Water chemistry
  links.push({
    href: '/water-chemistry/how-to-cycle-fish-tank',
    text: 'How to Cycle a Fish Tank',
    title: 'The nitrogen cycle explained',
    type: 'guide',
  });

  // Algae (common during treatment)
  links.push({
    href: '/algae',
    text: 'Algae Control Guide',
    title: 'Manage algae during recovery',
    type: 'guide',
  });

  return links;
}

// ============================================================
// DISEASE — RELATED DISEASES
// ============================================================

export async function getRelatedDiseases(disease: Disease, limit = 4): Promise<InternalLink[]> {
  const allDiseases = await getAllDiseaseData();
  
  return allDiseases
    .filter(d => d.slug !== disease.slug)
    .sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      if (a.type === disease.type) scoreA += 3;
      if (b.type === disease.type) scoreB += 3;
      if (a.severity === disease.severity) scoreA += 1;
      if (b.severity === disease.severity) scoreB += 1;
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map(d => ({
      href: `/diseases/${d.slug}`,
      text: d.name,
      title: `${d.name} — ${d.type} · ${d.severity}`,
      type: 'disease' as const,
    }));
}

// ============================================================
// CONTEXTUAL INLINE LINKS (for article body content)
// ============================================================

export interface InlineLink {
  keyword: string;
  href: string;
  title: string;
}

export async function getInlineLinks(): Promise<InlineLink[]> {
  const [fish, plants, tanks, diseases] = await Promise.all([
    getAllFishData(), getAllPlantData(), getAllTankData(), getAllDiseaseData(),
  ]);

  const links: InlineLink[] = [];

  fish.forEach(f => {
    links.push({ keyword: f.name, href: `/fish/${f.slug}`, title: `${f.name} care guide` });
    if (f.scientificName) {
      links.push({ keyword: f.scientificName, href: `/fish/${f.slug}`, title: `${f.name} care guide` });
    }
  });

  plants.forEach(p => {
    links.push({ keyword: p.name, href: `/plants/${p.slug}`, title: `${p.name} care guide` });
  });

  tanks.forEach(t => {
    links.push({ keyword: `${t.gallons} gallon`, href: `/tank-sizes/${t.slug}`, title: `${t.gallons} gallon tank guide` });
    links.push({ keyword: `${t.gallons}-gallon`, href: `/tank-sizes/${t.slug}`, title: `${t.gallons} gallon tank guide` });
  });

  diseases.forEach(d => {
    links.push({ keyword: d.name, href: `/diseases/${d.slug}`, title: `${d.name} — symptoms & treatment` });
  });

  // Sort by keyword length descending so longer matches take priority
  links.sort((a, b) => b.keyword.length - a.keyword.length);

  return links;
}

// ============================================================
// BREADCRUMBS
// ============================================================

export function buildBreadcrumbs(
  segments: { label: string; href: string }[]
): { name: string; href: string }[] {
  return [
    { name: 'Home', href: '/' },
    ...segments.map((s) => ({ name: s.label, href: s.href })),
  ];
}

// ============================================================
// PILLAR/CLUSTER ROUTING
// ============================================================

export const PILLAR_ROUTES: Record<string, string> = {
  'fish': '/fish', 'plants': '/plants', 'tank-sizes': '/tank-sizes',
  'equipment': '/equipment', 'saltwater': '/saltwater', 'freshwater': '/freshwater',
  'diseases': '/diseases', 'water-chemistry': '/water-chemistry', 'setup': '/setup',
  'maintenance': '/maintenance', 'algae': '/algae', 'calculators': '/calculators',
  'reviews': '/reviews', 'guides': '/guides',
};

export const PILLAR_LABELS: Record<string, string> = {
  'fish': 'Fish & Species', 'plants': 'Aquarium Plants', 'tank-sizes': 'Tank Sizes',
  'equipment': 'Equipment', 'saltwater': 'Saltwater & Reef', 'freshwater': 'Freshwater',
  'diseases': 'Fish Health', 'water-chemistry': 'Water Chemistry', 'setup': 'Tank Setup',
  'maintenance': 'Maintenance', 'algae': 'Algae Control', 'calculators': 'Calculators',
  'reviews': 'Reviews', 'guides': 'Guides',
};
