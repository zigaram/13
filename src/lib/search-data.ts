// ============================================================
// SEARCH INDEX — flat array of all searchable content
// Imported client-side by SearchModal to build FlexSearch index
// ============================================================

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  category: 'fish' | 'plant' | 'equipment' | 'tank-size' | 'disease' | 'calculator' | 'guide';
  imageUrl?: string;
  keywords: string;
}

// Fish data
import fishData from '@/data/fish.json';
// Plants data
import plantData from '@/data/plants.json';
// Diseases data
import diseaseData from '@/data/diseases.json';
// Tank sizes data
import tankData from '@/data/tank-sizes.json';
// Equipment reviews data
import equipData from '@/data/equipment-reviews.json';
// Articles index data
import articleData from '@/data/articles-index.json';

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // ---- Fish ----
  (fishData as any[]).forEach((fish) => {
    items.push({
      id: `fish-${fish.slug}`,
      title: fish.name,
      subtitle: fish.scientificName || '',
      description: (fish.description || '').slice(0, 120),
      href: `/fish/${fish.slug}`,
      category: 'fish',
      imageUrl: fish.imageUrl,
      keywords: [
        fish.name,
        fish.scientificName,
        fish.family,
        fish.category,
        fish.careLevel,
        fish.temperament,
        fish.diet,
        ...(fish.keywords || []),
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  // ---- Plants ----
  (plantData as any[]).forEach((plant) => {
    items.push({
      id: `plant-${plant.slug}`,
      title: plant.name,
      subtitle: plant.scientificName || '',
      description: (plant.description || '').slice(0, 120),
      href: `/plants/${plant.slug}`,
      category: 'plant',
      imageUrl: plant.imageUrl,
      keywords: [
        plant.name,
        plant.scientificName,
        plant.category,
        plant.careLevel,
        plant.lightRequirement,
        plant.placement,
        ...(plant.keywords || []),
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  // ---- Diseases ----
  (diseaseData as any[]).forEach((disease) => {
    items.push({
      id: `disease-${disease.slug}`,
      title: disease.name,
      subtitle: `${disease.type} · ${disease.severity}`,
      description: (disease.description || '').slice(0, 120),
      href: `/diseases/${disease.slug}`,
      category: 'disease',
      imageUrl: disease.imageUrl,
      keywords: [
        disease.name,
        disease.type,
        ...(disease.symptoms || []),
        ...(disease.medications || []),
        ...(disease.keywords || []),
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  // ---- Tank Sizes ----
  (tankData as any[]).forEach((tank) => {
    items.push({
      id: `tank-${tank.slug}`,
      title: tank.name,
      subtitle: `${tank.gallons} gallons`,
      description: (tank.description || '').slice(0, 120),
      href: `/tank-sizes/${tank.slug}`,
      category: 'tank-size',
      imageUrl: tank.imageUrl,
      keywords: [
        tank.name,
        `${tank.gallons} gallon`,
        ...(tank.recommendedFish || []),
        ...(tank.idealFor || []),
        ...(tank.keywords || []),
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  // ---- Equipment (products from reviews) ----
  const seenProducts = new Set<string>();
  (equipData as any[]).forEach((review) => {
    (review.products || []).forEach((product: any) => {
      if (seenProducts.has(product.slug)) return;
      seenProducts.add(product.slug);
      items.push({
        id: `equip-${product.slug}`,
        title: product.name,
        subtitle: `${product.brand} · $${product.price?.min}–$${product.price?.max}`,
        description: (product.description || '').slice(0, 120),
        href: `/equipment/${review.slug}#${product.slug}`,
        category: 'equipment',
        imageUrl: product.imageUrl,
        keywords: [
          product.name,
          product.brand,
          product.category,
          product.subcategory,
          product.bestFor,
        ]
          .filter(Boolean)
          .join(' '),
      });
    });

    // Also add the review page itself
    items.push({
      id: `review-${review.slug}`,
      title: review.title,
      subtitle: `${review.products?.length || 0} products reviewed`,
      description: (review.metaDescription || '').slice(0, 120),
      href: `/equipment/${review.slug}`,
      category: 'equipment',
      keywords: [
        review.title,
        review.category,
        ...(review.keywords || []),
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  // ---- Guides / Articles ----
  (articleData as any[]).forEach((article) => {
    items.push({
      id: `article-${article.slug}`,
      title: article.title,
      subtitle: article.pillar,
      description: (article.excerpt || '').slice(0, 120),
      href: `/${article.pillar}/${article.slug}`,
      category: 'guide',
      imageUrl: article.imageUrl,
      keywords: [
        article.title,
        article.primaryKeyword,
        ...(article.secondaryKeywords || []),
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  // ---- Calculators (static) ----
  const calculators = [
    {
      id: 'calc-stocking',
      title: 'Stocking Calculator',
      subtitle: 'How many fish can fit in your tank?',
      description: 'Calculate bioload, check compatibility, and get stocking recommendations for your aquarium.',
      href: '/calculators/stocking',
    },
    {
      id: 'calc-tank-volume',
      title: 'Tank Volume Calculator',
      subtitle: 'Calculate gallons and liters',
      description: 'Calculate the exact volume of rectangular, cylindrical, bowfront, and hexagonal tanks.',
      href: '/calculators/tank-volume',
    },
    {
      id: 'calc-heater-size',
      title: 'Heater Size Calculator',
      subtitle: 'What wattage heater do you need?',
      description: 'Find the right heater wattage based on your tank size, room temp, and target temperature.',
      href: '/calculators/heater-size',
    },
    {
      id: 'calc-substrate',
      title: 'Substrate Calculator',
      subtitle: 'How much substrate do you need?',
      description: 'Calculate substrate weight and bags needed for your tank dimensions and desired depth.',
      href: '/calculators/substrate',
    },
    {
      id: 'calc-water-change',
      title: 'Water Change Calculator',
      subtitle: 'Schedule and volume calculator',
      description: 'Calculate water change volume and frequency based on tank size and stocking level.',
      href: '/calculators/water-change',
    },
  ];
  calculators.forEach((calc) => {
    items.push({
      ...calc,
      category: 'calculator',
      keywords: calc.title + ' ' + calc.subtitle + ' ' + calc.description,
    });
  });

  // ---- Static pages ----
  items.push({
    id: 'page-compatibility',
    title: 'Fish Compatibility Checker',
    subtitle: 'Can these fish live together?',
    description: 'Check if two fish species are compatible for the same aquarium.',
    href: '/compatibility',
    category: 'fish',
    keywords: 'compatibility checker can fish live together compatible tank mates',
  });

  items.push({
    id: 'page-algae',
    title: 'Algae Types & Control Guide',
    subtitle: 'Identify and eliminate algae',
    description: 'Identify every type of aquarium algae and learn how to eliminate it.',
    href: '/algae',
    category: 'guide',
    keywords: 'algae green hair brown diatom black beard blue green cyanobacteria control',
  });

  return items;
}

export const searchIndex: SearchItem[] = buildSearchIndex();
