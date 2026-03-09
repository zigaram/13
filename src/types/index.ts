// ============================================================
// FISH & SPECIES
// ============================================================
export interface FishSpecies {
  slug: string;
  name: string;
  scientificName: string;
  family: string;
  category: 'freshwater' | 'saltwater' | 'brackish';
  type: 'fish' | 'invertebrate' | 'amphibian' | 'reptile';
  careLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  temperament: 'peaceful' | 'semi-aggressive' | 'aggressive';
  diet: string;
  minTankSize: number; // gallons
  maxSize: number; // inches
  temperature: { min: number; max: number }; // °F
  ph: { min: number; max: number };
  lifespan: string;
  schooling: boolean;
  minSchoolSize?: number;
  compatibleWith: string[]; // slugs
  incompatibleWith: string[]; // slugs
  description: string;
  careGuide: string; // MDX content path
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  searchVolume?: number;
}

// ============================================================
// PLANTS
// ============================================================
export interface PlantSpecies {
  slug: string;
  name: string;
  scientificName: string;
  category: 'stem' | 'rosette' | 'rhizome' | 'floating' | 'carpet' | 'moss' | 'bulb';
  careLevel: 'easy' | 'moderate' | 'demanding';
  lightRequirement: 'low' | 'medium' | 'high';
  co2Required: boolean;
  co2Recommended: boolean;
  growthRate: 'slow' | 'moderate' | 'fast';
  placement: 'foreground' | 'midground' | 'background' | 'floating' | 'any';
  propagation: string;
  substrate: string;
  temperature: { min: number; max: number };
  ph: { min: number; max: number };
  description: string;
  careGuide: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  searchVolume?: number;
}

// ============================================================
// TANK SIZES
// ============================================================
export interface TankSize {
  slug: string;
  gallons: number;
  name: string; // e.g., "10 Gallon Fish Tank"
  dimensions: TankDimension[];
  weight: { empty: number; filled: number }; // lbs
  recommendedFish: string[];
  recommendedFilter: string;
  recommendedHeater: string;
  idealFor: string[];
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  searchVolume?: number;
}

export interface TankDimension {
  label: string; // e.g., "Standard", "Long", "Breeder"
  length: number;
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}

// ============================================================
// EQUIPMENT
// ============================================================
export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: 'filter' | 'heater' | 'light' | 'substrate' | 'co2' | 'pump' | 'skimmer' | 'accessory' | 'test-kit' | 'food' | 'conditioner';
  subcategory?: string; // e.g., 'canister', 'hob', 'sponge'
  price: { min: number; max: number };
  rating: number; // 1-5
  tankSizeRange: { min: number; max: number }; // gallons
  pros: string[];
  cons: string[];
  bestFor: string;
  affiliateUrl: string;
  imageUrl: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
}

export interface ProductReview {
  slug: string;
  title: string;
  category: string;
  products: Product[];
  introduction: string;
  buyersGuide: string;
  faq: FAQ[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
}

// ============================================================
// DISEASES
// ============================================================
export interface Disease {
  slug: string;
  name: string;
  type: 'bacterial' | 'fungal' | 'parasitic' | 'viral' | 'environmental';
  affectedSpecies: 'freshwater' | 'saltwater' | 'both';
  symptoms: string[];
  causes: string[];
  treatment: string;
  prevention: string[];
  medications: string[];
  quarantineDays: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  searchVolume?: number;
}

// ============================================================
// COMPATIBILITY
// ============================================================
export interface CompatibilityResult {
  fishA: string;
  fishB: string;
  compatible: 'yes' | 'caution' | 'no';
  reason: string;
  conditions?: string;
  minTankSize: number;
  temperatureOverlap: { min: number; max: number } | null;
  phOverlap: { min: number; max: number } | null;
}

// ============================================================
// CALCULATORS
// ============================================================
export interface TankVolumeInput {
  shape: 'rectangular' | 'cylindrical' | 'bowfront' | 'hexagonal';
  length: number;
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}

export interface StockingInput {
  tankGallons: number;
  filterType: 'sponge' | 'hob' | 'canister' | 'none';
  planted: boolean;
  fish: { slug: string; count: number }[];
}

export interface HeaterSizeInput {
  tankGallons: number;
  roomTemperature: number;
  targetTemperature: number;
}

// ============================================================
// CONTENT / ARTICLES
// ============================================================
export interface Article {
  slug: string;
  title: string;
  pillar: string;
  subCluster: string;
  type: 'informational' | 'product-review' | 'guide' | 'calculator' | 'comparison';
  excerpt: string;
  content: string; // MDX path
  primaryKeyword: string;
  secondaryKeywords: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  readingTime: number;
  toc: TOCItem[];
  relatedArticles: string[];
  metaTitle: string;
  metaDescription: string;
  schema: ArticleSchema;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

// ============================================================
// SEO / SCHEMA
// ============================================================
export interface ArticleSchema {
  '@type': 'Article' | 'HowTo' | 'FAQPage' | 'Product' | 'Review';
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  image?: string;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

// ============================================================
// SITE CONFIG
// ============================================================
export interface SiteConfig {
  name: string;
  domain: string;
  url: string;
  description: string;
  defaultTitle: string;
  titleTemplate: string;
  ogImage: string;
  twitterHandle: string;
  locale: string;
}

export const siteConfig: SiteConfig = {
  name: 'World of Aquariums',
  domain: 'worldofaquariums.com',
  url: 'https://worldofaquariums.com',
  description: 'Your complete guide to freshwater & saltwater aquariums. Fish care, tank setup, equipment reviews, plant guides & interactive tools.',
  defaultTitle: 'World of Aquariums — Fish Tanks, Care Guides & Equipment Reviews',
  titleTemplate: '%s | World of Aquariums',
  ogImage: 'https://worldofaquariums.com/images/og-default.jpg',
  twitterHandle: '@worldofaquariums',
  locale: 'en_US',
};
