'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// ============================================================
// FISH DATABASE (embedded for client-side reactivity)
// ============================================================
interface FishEntry {
  slug: string;
  name: string;
  minTankSize: number;
  maxSize: number;
  temperature: { min: number; max: number };
  ph: { min: number; max: number };
  schooling: boolean;
  minSchoolSize?: number;
  temperament: 'peaceful' | 'semi-aggressive' | 'aggressive';
  type: string;
  category: string;
  bioloadFactor: number; // 1 = low, 2 = medium, 3 = high
}

const FISH_DB: FishEntry[] = [
  { slug: 'betta-fish', name: 'Betta Fish', minTankSize: 5, maxSize: 3, temperature: { min: 76, max: 82 }, ph: { min: 6.5, max: 7.5 }, schooling: false, temperament: 'semi-aggressive', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'neon-tetra', name: 'Neon Tetra', minTankSize: 10, maxSize: 1.5, temperature: { min: 70, max: 81 }, ph: { min: 6.0, max: 7.0 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'goldfish', name: 'Goldfish', minTankSize: 20, maxSize: 12, temperature: { min: 65, max: 75 }, ph: { min: 6.5, max: 7.5 }, schooling: false, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 3 },
  { slug: 'guppy', name: 'Guppy', minTankSize: 10, maxSize: 2.5, temperature: { min: 72, max: 82 }, ph: { min: 6.8, max: 7.8 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'cherry-shrimp', name: 'Cherry Shrimp', minTankSize: 5, maxSize: 1.5, temperature: { min: 65, max: 80 }, ph: { min: 6.5, max: 8.0 }, schooling: true, minSchoolSize: 5, temperament: 'peaceful', type: 'invertebrate', category: 'freshwater', bioloadFactor: 0.3 },
  { slug: 'corydoras-catfish', name: 'Corydoras Catfish', minTankSize: 10, maxSize: 2.5, temperature: { min: 72, max: 79 }, ph: { min: 6.0, max: 7.5 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'mystery-snail', name: 'Mystery Snail', minTankSize: 5, maxSize: 2, temperature: { min: 68, max: 82 }, ph: { min: 7.0, max: 8.0 }, schooling: false, temperament: 'peaceful', type: 'invertebrate', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'nerite-snail', name: 'Nerite Snail', minTankSize: 5, maxSize: 1, temperature: { min: 72, max: 78 }, ph: { min: 7.0, max: 8.5 }, schooling: false, temperament: 'peaceful', type: 'invertebrate', category: 'freshwater', bioloadFactor: 0.5 },
  { slug: 'otocinclus', name: 'Otocinclus Catfish', minTankSize: 10, maxSize: 2, temperature: { min: 72, max: 79 }, ph: { min: 6.0, max: 7.5 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 0.5 },
  { slug: 'bristlenose-pleco', name: 'Bristlenose Pleco', minTankSize: 20, maxSize: 5, temperature: { min: 73, max: 81 }, ph: { min: 6.5, max: 7.5 }, schooling: false, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 2 },
  { slug: 'harlequin-rasbora', name: 'Harlequin Rasbora', minTankSize: 10, maxSize: 2, temperature: { min: 73, max: 82 }, ph: { min: 6.0, max: 7.5 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'ember-tetra', name: 'Ember Tetra', minTankSize: 10, maxSize: 0.8, temperature: { min: 73, max: 84 }, ph: { min: 5.5, max: 7.0 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 0.5 },
  { slug: 'kuhli-loach', name: 'Kuhli Loach', minTankSize: 15, maxSize: 4, temperature: { min: 75, max: 86 }, ph: { min: 5.5, max: 6.5 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'angelfish', name: 'Angelfish', minTankSize: 29, maxSize: 6, temperature: { min: 76, max: 84 }, ph: { min: 6.0, max: 7.5 }, schooling: false, temperament: 'semi-aggressive', type: 'fish', category: 'freshwater', bioloadFactor: 2 },
  { slug: 'dwarf-gourami', name: 'Dwarf Gourami', minTankSize: 10, maxSize: 3.5, temperature: { min: 72, max: 82 }, ph: { min: 6.0, max: 7.5 }, schooling: false, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1.5 },
  { slug: 'platy', name: 'Platy', minTankSize: 10, maxSize: 2.5, temperature: { min: 70, max: 80 }, ph: { min: 7.0, max: 8.2 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'molly', name: 'Molly', minTankSize: 20, maxSize: 4.5, temperature: { min: 72, max: 82 }, ph: { min: 7.0, max: 8.5 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1.5 },
  { slug: 'cardinal-tetra', name: 'Cardinal Tetra', minTankSize: 10, maxSize: 2, temperature: { min: 73, max: 81 }, ph: { min: 5.5, max: 7.0 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'pea-puffer', name: 'Pea Puffer', minTankSize: 5, maxSize: 1, temperature: { min: 74, max: 82 }, ph: { min: 7.0, max: 8.0 }, schooling: false, temperament: 'semi-aggressive', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'amano-shrimp', name: 'Amano Shrimp', minTankSize: 10, maxSize: 2, temperature: { min: 70, max: 80 }, ph: { min: 6.5, max: 7.5 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'invertebrate', category: 'freshwater', bioloadFactor: 0.3 },
  { slug: 'german-blue-ram', name: 'German Blue Ram', minTankSize: 20, maxSize: 3, temperature: { min: 78, max: 85 }, ph: { min: 5.5, max: 7.0 }, schooling: false, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1.5 },
  { slug: 'oscar-fish', name: 'Oscar Fish', minTankSize: 55, maxSize: 14, temperature: { min: 74, max: 81 }, ph: { min: 6.0, max: 7.5 }, schooling: false, temperament: 'aggressive', type: 'fish', category: 'freshwater', bioloadFactor: 3 },
  { slug: 'honey-gourami', name: 'Honey Gourami', minTankSize: 10, maxSize: 2, temperature: { min: 72, max: 82 }, ph: { min: 6.0, max: 7.5 }, schooling: false, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'swordtail', name: 'Swordtail', minTankSize: 15, maxSize: 5, temperature: { min: 72, max: 82 }, ph: { min: 7.0, max: 8.4 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1.5 },
  { slug: 'endlers-livebearer', name: "Endler's Livebearer", minTankSize: 10, maxSize: 1.5, temperature: { min: 72, max: 82 }, ph: { min: 6.5, max: 8.0 }, schooling: true, minSchoolSize: 3, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 0.5 },
  { slug: 'cherry-barb', name: 'Cherry Barb', minTankSize: 20, maxSize: 2, temperature: { min: 73, max: 81 }, ph: { min: 6.0, max: 7.0 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'pearl-gourami', name: 'Pearl Gourami', minTankSize: 20, maxSize: 4.5, temperature: { min: 77, max: 82 }, ph: { min: 5.5, max: 7.5 }, schooling: false, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1.5 },
  { slug: 'zebra-danio', name: 'Zebra Danio', minTankSize: 10, maxSize: 2.5, temperature: { min: 64, max: 77 }, ph: { min: 6.5, max: 7.5 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 1 },
  { slug: 'celestial-pearl-danio', name: 'Celestial Pearl Danio', minTankSize: 10, maxSize: 1, temperature: { min: 72, max: 78 }, ph: { min: 6.5, max: 7.5 }, schooling: true, minSchoolSize: 6, temperament: 'peaceful', type: 'fish', category: 'freshwater', bioloadFactor: 0.5 },
  { slug: 'axolotl', name: 'Axolotl', minTankSize: 20, maxSize: 12, temperature: { min: 60, max: 68 }, ph: { min: 6.5, max: 8.0 }, schooling: false, temperament: 'peaceful', type: 'amphibian', category: 'freshwater', bioloadFactor: 3 },
];

interface StockedFish { slug: string; count: number; }
interface Warning { type: 'error' | 'warning' | 'info'; message: string; }

// ============================================================
// ANIMATED SVG TANK
// ============================================================
function AnimatedTank({ tankGallons, stocked, stockLevel }: { tankGallons: number; stocked: StockedFish[]; stockLevel: number }) {
  const totalFish = stocked.reduce((sum, s) => sum + s.count, 0);
  const waterColor = stockLevel > 100 ? '#fecaca' : stockLevel > 75 ? '#fef3c7' : '#dbeafe';
  const waterColorDark = stockLevel > 100 ? '#f87171' : stockLevel > 75 ? '#fbbf24' : '#60a5fa';

  // Generate fish positions
  const fishPositions = [];
  let idx = 0;
  for (const s of stocked) {
    const fishData = FISH_DB.find(f => f.slug === s.slug);
    if (!fishData) continue;
    for (let i = 0; i < Math.min(s.count, 12); i++) {
      fishPositions.push({
        x: 40 + ((idx * 73) % 220),
        y: 60 + ((idx * 47) % 100),
        size: Math.max(8, Math.min(20, fishData.maxSize * 4)),
        delay: idx * 0.3,
        speed: 3 + (idx % 3),
        isShrimp: fishData.type === 'invertebrate',
        color: fishData.temperament === 'aggressive' ? '#ef4444' : fishData.temperament === 'semi-aggressive' ? '#f59e0b' : '#3b82f6',
      });
      idx++;
    }
  }

  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-md mx-auto" role="img" aria-label={`Aquarium with ${totalFish} fish in a ${tankGallons} gallon tank`}>
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={waterColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={waterColorDark} stopOpacity="0.3" />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x="20" y="30" width="280" height="150" rx="4" />
        </clipPath>
      </defs>

      {/* Tank glass */}
      <rect x="18" y="28" width="284" height="154" rx="6" fill="none" stroke="#94a3b8" strokeWidth="3" />

      {/* Water */}
      <g clipPath="url(#tankClip)">
        <rect x="20" y="40" width="280" height="140" fill="url(#waterGrad)" />

        {/* Animated water surface wave */}
        <path d={`M20,45 Q80,${38 + Math.sin(0) * 4} 160,45 Q240,${52 - Math.sin(0) * 4} 300,45 L300,50 L20,50 Z`} fill={waterColorDark} opacity="0.15">
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values={`
            M20,45 Q80,38 160,45 Q240,52 300,45 L300,50 L20,50 Z;
            M20,45 Q80,52 160,45 Q240,38 300,45 L300,50 L20,50 Z;
            M20,45 Q80,38 160,45 Q240,52 300,45 L300,50 L20,50 Z
          `} />
        </path>

        {/* Substrate */}
        <ellipse cx="80" cy="178" rx="30" ry="6" fill="#d4a574" opacity="0.5" />
        <ellipse cx="200" cy="176" rx="45" ry="7" fill="#c49a6c" opacity="0.4" />
        <rect x="20" y="172" width="280" height="10" fill="#d4a574" opacity="0.3" />

        {/* Plant decorations */}
        <g opacity="0.6">
          {/* Left plant */}
          <path d="M55,172 Q50,140 58,110 Q52,115 48,140 Q45,135 40,120" stroke="#22c55e" strokeWidth="2" fill="none">
            <animate attributeName="d" dur="4s" repeatCount="indefinite" values="
              M55,172 Q50,140 58,110 Q52,115 48,140 Q45,135 40,120;
              M55,172 Q53,140 60,112 Q54,115 50,142 Q47,135 42,122;
              M55,172 Q50,140 58,110 Q52,115 48,140 Q45,135 40,120
            " />
          </path>
          {/* Right plant */}
          <path d="M250,172 Q255,130 245,95 Q258,120 260,140 Q265,110 270,100" stroke="#16a34a" strokeWidth="2.5" fill="none">
            <animate attributeName="d" dur="5s" repeatCount="indefinite" values="
              M250,172 Q255,130 245,95 Q258,120 260,140 Q265,110 270,100;
              M250,172 Q253,132 247,97 Q256,122 258,142 Q263,112 268,102;
              M250,172 Q255,130 245,95 Q258,120 260,140 Q265,110 270,100
            " />
          </path>
        </g>

        {/* Bubbles */}
        {[0, 1, 2].map(i => (
          <circle key={`bubble-${i}`} cx={80 + i * 90} r={2 + i} fill="white" opacity="0.4">
            <animate attributeName="cy" from="170" to="40" dur={`${3 + i}s`} repeatCount="indefinite" begin={`${i * 1.2}s`} />
            <animate attributeName="opacity" values="0.4;0.2;0" dur={`${3 + i}s`} repeatCount="indefinite" begin={`${i * 1.2}s`} />
          </circle>
        ))}

        {/* Fish */}
        {fishPositions.map((fp, i) => (
          <g key={i}>
            {fp.isShrimp ? (
              // Shrimp shape
              <g>
                <ellipse cx={0} cy={0} rx={fp.size * 0.7} ry={fp.size * 0.3} fill={fp.color} opacity="0.8">
                  <animateTransform attributeName="transform" type="translate" values={`${fp.x},${fp.y};${fp.x + 15},${fp.y - 5};${fp.x},${fp.y}`} dur={`${fp.speed + 2}s`} repeatCount="indefinite" begin={`${fp.delay}s`} />
                </ellipse>
              </g>
            ) : (
              // Fish shape
              <g>
                <path d={`M0,0 Q${fp.size},${-fp.size * 0.4} ${fp.size * 2},0 Q${fp.size},${fp.size * 0.4} 0,0 M${fp.size * 2},0 L${fp.size * 2.5},${-fp.size * 0.3} L${fp.size * 2.5},${fp.size * 0.3} Z`} fill={fp.color} opacity="0.7">
                  <animateTransform attributeName="transform" type="translate" values={`${fp.x},${fp.y};${fp.x + 30},${fp.y - 8};${fp.x + 10},${fp.y + 5};${fp.x},${fp.y}`} dur={`${fp.speed}s`} repeatCount="indefinite" begin={`${fp.delay}s`} />
                </path>
                {/* Eye */}
                <circle r="1.5" fill="white">
                  <animateTransform attributeName="transform" type="translate" values={`${fp.x + fp.size * 0.4},${fp.y - 1};${fp.x + 30 + fp.size * 0.4},${fp.y - 9};${fp.x + 10 + fp.size * 0.4},${fp.y + 4};${fp.x + fp.size * 0.4},${fp.y - 1}`} dur={`${fp.speed}s`} repeatCount="indefinite" begin={`${fp.delay}s`} />
                </circle>
              </g>
            )}
          </g>
        ))}
      </g>

      {/* Tank stand */}
      <rect x="15" y="182" width="290" height="8" rx="2" fill="#64748b" opacity="0.3" />

      {/* Empty tank message */}
      {totalFish === 0 && (
        <text x="160" y="115" textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="system-ui">
          Add fish to see them swim!
        </text>
      )}
    </svg>
  );
}

// ============================================================
// STOCKING LEVEL GAUGE
// ============================================================
function StockGauge({ level }: { level: number }) {
  const capped = Math.min(level, 150);
  const angle = -90 + (capped / 150) * 180;
  const color = level > 100 ? '#ef4444' : level > 75 ? '#f59e0b' : level > 50 ? '#3b82f6' : '#22c55e';
  const label = level > 100 ? 'Overstocked!' : level > 75 ? 'Heavy' : level > 50 ? 'Moderate' : level > 0 ? 'Light' : 'Empty';

  return (
    <div className="text-center">
      <svg viewBox="0 0 120 70" className="w-32 mx-auto">
        {/* Background arc */}
        <path d="M15,60 A45,45 0 0,1 105,60" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
        {/* Colored arc */}
        <path d="M15,60 A45,45 0 0,1 105,60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(capped / 150) * 141.4} 141.4`}
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
        />
        {/* Needle */}
        <line x1="60" y1="60" x2={60 + 35 * Math.cos((angle * Math.PI) / 180)} y2={60 + 35 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="2" strokeLinecap="round"
          style={{ transition: 'all 0.5s ease' }}
        />
        <circle cx="60" cy="60" r="3" fill={color} style={{ transition: 'fill 0.5s ease' }} />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="system-ui" style={{ transition: 'fill 0.5s ease' }}>
          {Math.round(level)}%
        </text>
      </svg>
      <p className="text-sm font-semibold mt-1" style={{ color, transition: 'color 0.5s ease' }}>{label}</p>
    </div>
  );
}

// ============================================================
// MAIN CALCULATOR
// ============================================================
export default function StockingCalculatorPage() {
  const [tankGallons, setTankGallons] = useState(10);
  const [planted, setPlanted] = useState(true);
  const [stocked, setStocked] = useState<StockedFish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const addFish = useCallback((slug: string) => {
    const fish = FISH_DB.find(f => f.slug === slug);
    if (!fish) return;
    setStocked(prev => {
      const existing = prev.find(s => s.slug === slug);
      if (existing) {
        return prev.map(s => s.slug === slug ? { ...s, count: s.count + 1 } : s);
      }
      const defaultCount = fish.schooling ? (fish.minSchoolSize || 6) : 1;
      return [...prev, { slug, count: defaultCount }];
    });
    setSearchQuery('');
  }, []);

  const updateCount = useCallback((slug: string, count: number) => {
    if (count <= 0) {
      setStocked(prev => prev.filter(s => s.slug !== slug));
    } else {
      setStocked(prev => prev.map(s => s.slug === slug ? { ...s, count } : s));
    }
  }, []);

  const removeFish = useCallback((slug: string) => {
    setStocked(prev => prev.filter(s => s.slug !== slug));
  }, []);

  // ========== ANALYSIS ==========
  const analysis = useMemo(() => {
    const warnings: Warning[] = [];
    let totalBioload = 0;
    let totalInches = 0;

    // Temperature & pH overlap
    let tempMin = 0, tempMax = 200, phMin = 0, phMax = 14;
    const stockedFish = stocked.map(s => ({ ...s, data: FISH_DB.find(f => f.slug === s.slug)! })).filter(s => s.data);

    for (const s of stockedFish) {
      tempMin = Math.max(tempMin, s.data.temperature.min);
      tempMax = Math.min(tempMax, s.data.temperature.max);
      phMin = Math.max(phMin, s.data.ph.min);
      phMax = Math.min(phMax, s.data.ph.max);
      totalBioload += s.count * s.data.bioloadFactor * s.data.maxSize;
      totalInches += s.count * s.data.maxSize;

      // Schooling check
      if (s.data.schooling && s.count < (s.data.minSchoolSize || 6)) {
        warnings.push({
          type: 'warning',
          message: `${s.data.name} is a schooling fish — keep at least ${s.data.minSchoolSize || 6} together. You have ${s.count}.`,
        });
      }

      // Min tank size check
      if (s.data.minTankSize > tankGallons) {
        warnings.push({
          type: 'error',
          message: `${s.data.name} needs at least a ${s.data.minTankSize} gallon tank. Your tank is ${tankGallons} gallons.`,
        });
      }
    }

    // Temperature overlap
    if (stockedFish.length > 1 && tempMax < tempMin) {
      warnings.push({
        type: 'error',
        message: `Temperature conflict! Your selected fish have no viable temperature overlap. Check species requirements.`,
      });
    }

    // pH overlap
    if (stockedFish.length > 1 && phMax < phMin) {
      warnings.push({
        type: 'error',
        message: `pH conflict! Your selected fish have incompatible pH ranges.`,
      });
    }

    // Temperament conflicts
    const hasAggressive = stockedFish.some(s => s.data.temperament === 'aggressive');
    const hasPeaceful = stockedFish.some(s => s.data.temperament === 'peaceful');
    const hasSmall = stockedFish.some(s => s.data.maxSize < 2);

    if (hasAggressive && hasPeaceful) {
      warnings.push({
        type: 'error',
        message: `Aggressive fish mixed with peaceful species — high risk of bullying or predation.`,
      });
    }

    if (hasAggressive && hasSmall) {
      warnings.push({
        type: 'error',
        message: `Aggressive fish with small species — predation risk. Small fish may be eaten.`,
      });
    }

    // Multiple bettas
    const bettas = stockedFish.find(s => s.slug === 'betta-fish');
    if (bettas && bettas.count > 1) {
      warnings.push({
        type: 'error',
        message: `Never keep multiple male bettas together — they will fight to the death.`,
      });
    }

    // Bioload calculation (capacity based on tank size, filtration bonus for planted)
    const plantedBonus = planted ? 1.25 : 1.0;
    const capacity = tankGallons * 1.5 * plantedBonus; // rough bioload capacity units
    const stockLevel = capacity > 0 ? (totalBioload / capacity) * 100 : 0;

    if (stockLevel > 100) {
      warnings.push({
        type: 'error',
        message: `Tank is overstocked (${Math.round(stockLevel)}% capacity). Reduce fish count or upgrade to a larger tank.`,
      });
    } else if (stockLevel > 75) {
      warnings.push({
        type: 'warning',
        message: `Tank is heavily stocked (${Math.round(stockLevel)}%). Ensure strong filtration and frequent water changes.`,
      });
    }

    // Positive feedback
    if (stockedFish.length > 0 && warnings.filter(w => w.type === 'error').length === 0) {
      if (stockLevel <= 75) {
        warnings.push({
          type: 'info',
          message: `Looking good! Your stocking is well-balanced for a ${tankGallons} gallon tank.`,
        });
      }
    }

    return {
      warnings,
      stockLevel,
      totalBioload,
      totalInches,
      tempOverlap: tempMax >= tempMin ? { min: tempMin, max: tempMax } : null,
      phOverlap: phMax >= phMin ? { min: phMin, max: phMax } : null,
      capacity,
    };
  }, [stocked, tankGallons, planted]);

  // Search filter
  const filteredFish = useMemo(() => {
    if (!searchQuery) return FISH_DB;
    const q = searchQuery.toLowerCase();
    return FISH_DB.filter(f => f.name.toLowerCase().includes(q) || f.slug.includes(q));
  }, [searchQuery]);

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Calculators', href: '/calculators/tank-volume' },
    { name: 'Stocking Calculator', href: '/calculators/stocking' },
  ];

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Aquarium Stocking Calculator
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Plan your community tank. Add fish and get real-time bioload analysis, compatibility checks, and schooling requirement warnings.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr,380px] gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Tank setup */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">1. Your Tank</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tank Size (gallons)</label>
                <select
                  value={tankGallons}
                  onChange={e => setTankGallons(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                >
                  {[3, 5, 10, 15, 20, 29, 30, 40, 55, 75, 90, 125].map(g => (
                    <option key={g} value={g}>{g} gallon</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Planted?</label>
                <div className="flex gap-2 mt-0.5">
                  <button
                    onClick={() => setPlanted(true)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${planted ? 'bg-reef-50 border-reef-300 text-reef-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    🌿 Yes
                  </button>
                  <button
                    onClick={() => setPlanted(false)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${!planted ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    No
                  </button>
                </div>
                {planted && <p className="text-xs text-reef-600 mt-1">+25% bioload capacity from plants</p>}
              </div>
            </div>
          </div>

          {/* Add fish */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">2. Add Fish</h2>
            <input
              type="text"
              placeholder="Search fish species..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent mb-3"
            />
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredFish
                .filter(f => f.category === 'freshwater')
                .map(fish => {
                  const isAdded = stocked.some(s => s.slug === fish.slug);
                  return (
                    <button
                      key={fish.slug}
                      onClick={() => addFish(fish.slug)}
                      disabled={isAdded}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        isAdded
                          ? 'bg-ocean-50 text-ocean-400 cursor-default'
                          : 'hover:bg-ocean-50 text-gray-700 hover:text-ocean-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{fish.type === 'invertebrate' ? '🦐' : fish.type === 'amphibian' ? '🦎' : '🐟'}</span>
                        <span className="font-medium">{fish.name}</span>
                        <span className="text-xs text-gray-400">{fish.maxSize}&quot; · {fish.minTankSize}g min</span>
                      </span>
                      {isAdded ? (
                        <span className="text-xs text-ocean-400">Added</span>
                      ) : (
                        <span className="text-xs text-ocean-500 font-medium">+ Add</span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Stocked fish list */}
          {stocked.length > 0 && (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">3. Your Fish</h2>
              <div className="space-y-3">
                {stocked.map(s => {
                  const fish = FISH_DB.find(f => f.slug === s.slug);
                  if (!fish) return null;
                  const schoolWarning = fish.schooling && s.count < (fish.minSchoolSize || 6);
                  return (
                    <div key={s.slug} className={`flex items-center gap-3 p-3 rounded-xl border ${schoolWarning ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
                      <Link href={`/fish/${fish.slug}`} className="font-medium text-sm text-gray-800 hover:text-ocean-600 flex-1 min-w-0 truncate">
                        {fish.type === 'invertebrate' ? '🦐' : '🐟'} {fish.name}
                        {fish.schooling && <span className="text-xs text-gray-400 ml-1">(school: {fish.minSchoolSize || 6}+)</span>}
                      </Link>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateCount(s.slug, s.count - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-bold transition-colors"
                        >−</button>
                        <span className="w-8 text-center text-sm font-bold text-gray-800">{s.count}</span>
                        <button
                          onClick={() => updateCount(s.slug, s.count + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-ocean-100 hover:bg-ocean-200 text-ocean-700 text-sm font-bold transition-colors"
                        >+</button>
                        <button
                          onClick={() => removeFish(s.slug)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-coral-100 text-gray-400 hover:text-coral-600 text-xs transition-colors ml-1"
                        >✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStocked([])}
                className="mt-4 text-xs text-gray-400 hover:text-coral-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* Animated Tank */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <AnimatedTank tankGallons={tankGallons} stocked={stocked} stockLevel={analysis.stockLevel} />
          </div>

          {/* Stock gauge */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-display font-bold text-sm text-gray-600 mb-3 text-center">Bioload Level</h3>
            <StockGauge level={analysis.stockLevel} />
            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-800">{stocked.reduce((s, f) => s + f.count, 0)}</p>
                <p className="text-gray-400">Total fish</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-800">{analysis.totalInches.toFixed(1)}&quot;</p>
                <p className="text-gray-400">Total inches</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-800">{tankGallons}g</p>
                <p className="text-gray-400">Tank size</p>
              </div>
            </div>
          </div>

          {/* Parameter overlap */}
          {stocked.length > 1 && (
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-sm text-gray-600 mb-3">Parameter Overlap</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Temperature</span>
                  {analysis.tempOverlap ? (
                    <span className="font-medium text-reef-700">{analysis.tempOverlap.min}–{analysis.tempOverlap.max}°F ✓</span>
                  ) : (
                    <span className="font-medium text-coral-600">No overlap ✗</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">pH Range</span>
                  {analysis.phOverlap ? (
                    <span className="font-medium text-reef-700">{analysis.phOverlap.min}–{analysis.phOverlap.max} ✓</span>
                  ) : (
                    <span className="font-medium text-coral-600">No overlap ✗</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="space-y-2">
              {analysis.warnings.map((w, i) => (
                <div key={i} className={`p-3 rounded-xl border text-sm ${
                  w.type === 'error' ? 'bg-coral-50 border-coral-200 text-coral-800' :
                  w.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-reef-50 border-reef-200 text-reef-800'
                }`}>
                  <span className="mr-1.5">
                    {w.type === 'error' ? '❌' : w.type === 'warning' ? '⚠️' : '✅'}
                  </span>
                  {w.message}
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
            <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">Resources</p>
            <ul className="space-y-1.5">
              {[
                { href: `/tank-sizes/${tankGallons}-gallon-fish-tank`, text: `${tankGallons} Gallon Tank Guide` },
                { href: '/equipment/filters', text: 'Best Filters' },
                { href: '/compatibility', text: 'Compatibility Checker' },
                { href: '/water-chemistry/how-to-cycle-fish-tank', text: 'Cycling Guide' },
                { href: '/guides/beginner-guide', text: 'Beginner Guide' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ocean-600 hover:text-ocean-800 transition-colors">→ {l.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SEO content below calculator */}
      <section className="mt-16 max-w-[var(--article-max)]">
        <div className="article-content">
          <h2>How the Stocking Calculator Works</h2>
          <p>This calculator analyzes your fish selection against your <a href="/tank-sizes">tank size</a> using several factors: bioload capacity (how much waste each species produces relative to tank volume), temperature and pH compatibility between all selected species, <a href="/compatibility">inter-species compatibility</a> (temperament conflicts), and schooling requirements for shoaling fish.</p>
          <p>The bioload gauge shows how full your tank's biological capacity is. Planted tanks get a 25% bonus because live <a href="/plants">plants</a> absorb ammonia and nitrate, effectively increasing your filtration capacity. For optimal fish health, aim to stay below 75% — this leaves room for growth and provides a buffer against <a href="/water-chemistry/how-to-cycle-fish-tank">water quality</a> issues.</p>
          <h2>General Stocking Guidelines</h2>
          <p>The old "one inch per gallon" rule is outdated and unreliable — a 10-inch <a href="/fish/oscar-fish">oscar</a> produces far more waste than ten 1-inch <a href="/fish/neon-tetra">neon tetras</a>. This calculator uses bioload factors that account for each species' actual waste production, body mass, and metabolic rate. Always pair adequate <a href="/equipment/filters">filtration</a> with your stocking level, and perform regular <a href="/equipment/gravel-vacuums">water changes</a> using <a href="/equipment/test-kits">test kit</a> readings as your guide.</p>
          <h2>Need Help Choosing Fish?</h2>
          <p>Browse our <a href="/fish">complete fish species guide</a> (53 species) for care requirements, or check our <a href="/compatibility">compatibility checker</a> for detailed pairing analysis. For your first tank, our <a href="/guides/beginner-guide">beginner guide</a> walks you through everything step by step.</p>
        </div>
      </section>
    </div>
  );
}
