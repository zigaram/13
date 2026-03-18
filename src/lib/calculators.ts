import type { TankVolumeInput, StockingInput, HeaterSizeInput } from '@/types';

// ============================================================
// TANK VOLUME CALCULATOR
// ============================================================
export function calculateTankVolume(input: TankVolumeInput): {
  gallons: number;
  liters: number;
  cubicInches: number;
} {
  let { length, width, height, unit, shape } = input;

  // Convert cm to inches if needed
  if (unit === 'cm') {
    length /= 2.54;
    width /= 2.54;
    height /= 2.54;
  }

  let cubicInches: number;

  switch (shape) {
    case 'rectangular':
      cubicInches = length * width * height;
      break;
    case 'cylindrical':
      // length = diameter
      const radius = length / 2;
      cubicInches = Math.PI * radius * radius * height;
      break;
    case 'bowfront':
      // Approximate: standard rectangle + 15% for the bow
      cubicInches = length * width * height * 1.15;
      break;
    case 'hexagonal':
      // length = side length
      const area = (3 * Math.sqrt(3) / 2) * (length / 2) * (length / 2);
      cubicInches = area * height;
      break;
    default:
      cubicInches = length * width * height;
  }

  const gallons = cubicInches / 231; // 1 US gallon = 231 cubic inches
  const liters = gallons * 3.78541;

  return {
    gallons: Math.round(gallons * 10) / 10,
    liters: Math.round(liters * 10) / 10,
    cubicInches: Math.round(cubicInches),
  };
}

// ============================================================
// HEATER SIZE CALCULATOR
// ============================================================
export function calculateHeaterSize(input: HeaterSizeInput): {
  wattage: number;
  recommendation: string;
  options: { wattage: number; label: string }[];
} {
  const { tankGallons, roomTemperature, targetTemperature } = input;
  const tempDiff = targetTemperature - roomTemperature;

  // Rule of thumb: 3-5 watts per gallon, adjusted by temperature differential
  let wattsPerGallon: number;
  if (tempDiff <= 5) {
    wattsPerGallon = 2.5;
  } else if (tempDiff <= 10) {
    wattsPerGallon = 3.5;
  } else if (tempDiff <= 15) {
    wattsPerGallon = 5;
  } else {
    wattsPerGallon = 7;
  }

  const rawWattage = tankGallons * wattsPerGallon;

  // Round up to standard heater sizes
  const standardSizes = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500];
  const wattage = standardSizes.find((s) => s >= rawWattage) ?? standardSizes[standardSizes.length - 1];

  // For larger tanks, recommend two heaters
  let recommendation: string;
  const options: { wattage: number; label: string }[] = [];

  if (tankGallons > 60) {
    const halfWattage = standardSizes.find((s) => s >= rawWattage / 2) ?? 150;
    recommendation = `Use two ${halfWattage}W heaters (one on each side) for even heat distribution and redundancy.`;
    options.push({ wattage: halfWattage, label: `2x ${halfWattage}W (recommended)` });
    options.push({ wattage, label: `1x ${wattage}W (single heater)` });
  } else {
    recommendation = `A ${wattage}W heater is ideal for your ${tankGallons}-gallon tank.`;
    options.push({ wattage, label: `${wattage}W` });
  }

  return { wattage, recommendation, options };
}

// ============================================================
// STOCKING CALCULATOR
// ============================================================
export interface StockingResult {
  totalInches: number;
  maxInches: number;
  stockingPercent: number;
  status: 'understocked' | 'ideal' | 'moderate' | 'overstocked';
  statusLabel: string;
  warnings: string[];
  suggestions: string[];
}

export function calculateStocking(input: StockingInput): StockingResult {
  const { tankGallons, filterType, planted, fish } = input;

  // Base capacity: 1 inch of fish per gallon (conservative)
  let maxInches = tankGallons;

  // Filter bonus
  switch (filterType) {
    case 'canister':
      maxInches *= 1.3;
      break;
    case 'hob':
      maxInches *= 1.15;
      break;
    case 'sponge':
      maxInches *= 1.0;
      break;
    case 'none':
      maxInches *= 0.5;
      break;
  }

  // Planted tank bonus
  if (planted) {
    maxInches *= 1.2;
  }

  // Calculate total fish inches (would need fish data in real impl)
  // For now, use placeholder calculation
  const totalInches = fish.reduce((sum, f) => sum + f.count * 2, 0); // placeholder

  const stockingPercent = Math.round((totalInches / maxInches) * 100);

  let status: StockingResult['status'];
  let statusLabel: string;

  if (stockingPercent < 40) {
    status = 'understocked';
    statusLabel = 'Understocked — room for more fish';
  } else if (stockingPercent < 70) {
    status = 'ideal';
    statusLabel = 'Ideal stocking level';
  } else if (stockingPercent < 90) {
    status = 'moderate';
    statusLabel = 'Moderately stocked — monitor water quality';
  } else {
    status = 'overstocked';
    statusLabel = 'Overstocked — reduce fish or upgrade tank';
  }

  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (filterType === 'none') {
    warnings.push('No filter detected. A filter is essential for any stocked aquarium.');
  }

  if (stockingPercent > 90) {
    warnings.push('Tank is overstocked. This increases ammonia, nitrite, and disease risk.');
    suggestions.push('Consider upgrading to a larger tank or rehoming some fish.');
  }

  if (!planted && stockingPercent > 60) {
    suggestions.push('Adding live plants can increase your biological filtration capacity.');
  }

  return {
    totalInches: Math.round(totalInches * 10) / 10,
    maxInches: Math.round(maxInches * 10) / 10,
    stockingPercent,
    status,
    statusLabel,
    warnings,
    suggestions,
  };
}

// ============================================================
// WATER PARAMETER HELPERS
// ============================================================
export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export function gallonsToLiters(g: number): number {
  return Math.round(g * 3.78541 * 10) / 10;
}

export function litersToGallons(l: number): number {
  return Math.round((l / 3.78541) * 10) / 10;
}
