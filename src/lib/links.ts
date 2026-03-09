import type { FishSpecies, PlantSpecies, TankSize, Disease } from '@/types';

// ============================================================
// INTERNAL LINK STRUCTURE
// ============================================================

export interface InternalLink {
  href: string;
  text: string;
  title: string;
  type: 'fish' | 'plant' | 'tank-size' | 'disease' | 'guide' | 'calculator' | 'review';
}

// ============================================================
// RELATED CONTENT GENERATORS
// ============================================================

/**
 * Given a fish species page, generate related links for:
 * - Compatible tank mates
 * - Appropriate tank sizes
 * - Common diseases
 * - Relevant equipment (filter, heater by tank size)
 * - Related plants
 */
export function getFishRelatedLinks(fish: FishSpecies): InternalLink[] {
  const links: InternalLink[] = [];

  // Tank size recommendation
  const tankSizeSlug = `${fish.minTankSize}-gallon-fish-tank`;
  links.push({
    href: `/tank-sizes/${tankSizeSlug}`,
    text: `Best ${fish.minTankSize} Gallon Fish Tanks`,
    title: `${fish.minTankSize} Gallon Tank Guide`,
    type: 'tank-size',
  });

  // Equipment by tank size
  links.push({
    href: `/equipment/filters`,
    text: `Best Filter for ${fish.minTankSize} Gallon Tank`,
    title: `Filter recommendations for ${fish.name}`,
    type: 'review',
  });

  links.push({
    href: `/equipment/heaters`,
    text: `Best Heater for ${fish.name}`,
    title: `Heater guide for ${fish.name}`,
    type: 'review',
  });

  // Calculators
  links.push({
    href: '/calculators/stocking',
    text: 'Stocking Calculator',
    title: `Check if your tank can handle ${fish.name}`,
    type: 'calculator',
  });

  // Compatible species
  fish.compatibleWith.slice(0, 5).forEach((slug) => {
    links.push({
      href: `/fish/${slug}`,
      text: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      title: `${slug} care guide`,
      type: 'fish',
    });
  });

  return links;
}

/**
 * Given a tank size page, generate related links for:
 * - Fish that fit this tank
 * - Best filter for this size
 * - Best heater for this size
 * - Setup guide for this size
 */
export function getTankSizeRelatedLinks(tankSize: TankSize): InternalLink[] {
  const links: InternalLink[] = [];

  // Setup guide
  links.push({
    href: `/setup/${tankSize.gallons}-gallon-fish-tank-setup`,
    text: `${tankSize.gallons} Gallon Tank Setup Guide`,
    title: `How to set up a ${tankSize.gallons} gallon tank`,
    type: 'guide',
  });

  // Equipment
  links.push({
    href: `/equipment/filters`,
    text: `Best Filter for ${tankSize.gallons} Gallon Tank`,
    title: `Top filters for ${tankSize.gallons} gallon`,
    type: 'review',
  });

  links.push({
    href: `/equipment/heaters`,
    text: `Best Heater for ${tankSize.gallons} Gallon Tank`,
    title: `Heater sizing for ${tankSize.gallons} gallon`,
    type: 'review',
  });

  // Calculators
  links.push({
    href: '/calculators/tank-volume',
    text: 'Tank Volume Calculator',
    title: 'Calculate your tank volume',
    type: 'calculator',
  });

  links.push({
    href: '/calculators/stocking',
    text: 'Stocking Calculator',
    title: `How many fish in a ${tankSize.gallons} gallon tank`,
    type: 'calculator',
  });

  // Recommended fish
  tankSize.recommendedFish.slice(0, 6).forEach((slug) => {
    links.push({
      href: `/fish/${slug}`,
      text: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      title: `${slug} care guide`,
      type: 'fish',
    });
  });

  return links;
}

/**
 * Build breadcrumb navigation for any page
 */
export function buildBreadcrumbs(
  segments: { label: string; href: string }[]
): { name: string; href: string }[] {
  return [
    { name: 'Home', href: '/' },
    ...segments.map((s) => ({ name: s.label, href: s.href })),
  ];
}

// ============================================================
// PILLAR/CLUSTER URL MAPPING
// ============================================================

export const PILLAR_ROUTES: Record<string, string> = {
  'fish': '/fish',
  'plants': '/plants',
  'tank-sizes': '/tank-sizes',
  'equipment': '/equipment',
  'saltwater': '/saltwater',
  'freshwater': '/freshwater',
  'diseases': '/diseases',
  'water-chemistry': '/water-chemistry',
  'setup': '/setup',
  'maintenance': '/maintenance',
  'algae': '/algae',
  'calculators': '/calculators',
  'reviews': '/reviews',
  'guides': '/guides',
};

export const PILLAR_LABELS: Record<string, string> = {
  'fish': 'Fish & Species',
  'plants': 'Aquarium Plants',
  'tank-sizes': 'Tank Sizes',
  'equipment': 'Equipment',
  'saltwater': 'Saltwater & Reef',
  'freshwater': 'Freshwater',
  'diseases': 'Fish Health',
  'water-chemistry': 'Water Chemistry',
  'setup': 'Tank Setup',
  'maintenance': 'Maintenance',
  'algae': 'Algae Control',
  'calculators': 'Calculators',
  'reviews': 'Reviews',
  'guides': 'Guides',
};
