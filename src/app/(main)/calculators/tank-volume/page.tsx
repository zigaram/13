'use client';

import { useState, useMemo } from 'react';
import { calculateTankVolume, gallonsToLiters } from '@/lib/calculators';
import type { TankVolumeInput } from '@/types';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const PRESETS = [
  { label: '5 gal', length: 16, width: 8, height: 10 },
  { label: '10 gal', length: 20, width: 10, height: 12 },
  { label: '20 gal', length: 24, width: 12, height: 16 },
  { label: '20L', length: 30, width: 12, height: 12 },
  { label: '29 gal', length: 30, width: 12, height: 18 },
  { label: '40B', length: 36, width: 18, height: 16 },
  { label: '55 gal', length: 48, width: 12, height: 21 },
  { label: '75 gal', length: 48, width: 18, height: 21 },
];

export default function TankVolumeCalculator() {
  const [shape, setShape] = useState<TankVolumeInput['shape']>('rectangular');
  const [unit, setUnit] = useState<TankVolumeInput['unit']>('inches');
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(12);

  const result = useMemo(() => {
    if (length <= 0 || width <= 0 || height <= 0) return null;
    return calculateTankVolume({ shape, unit, length, width, height });
  }, [shape, unit, length, width, height]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setLength(preset.length);
    setWidth(preset.width);
    setHeight(preset.height);
    setShape('rectangular');
    setUnit('inches');
  };

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Calculators', href: '/calculators' },
          { name: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
        ]}
      />

      <div className="max-w-3xl">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950 mb-3">
          Aquarium Volume Calculator
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Calculate the exact water volume of your fish tank in gallons and liters.
          Enter your tank dimensions or select a standard size below.
        </p>

        {/* Quick presets */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-600 mb-2">Standard tank sizes:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-ocean-300 hover:text-ocean-600 hover:bg-ocean-50 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Input form */}
          <div className="space-y-5">
            {/* Shape */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tank Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as TankVolumeInput['shape'])}
                className="calc-select"
              >
                <option value="rectangular">Rectangular</option>
                <option value="cylindrical">Cylindrical</option>
                <option value="bowfront">Bowfront</option>
                <option value="hexagonal">Hexagonal</option>
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Units</label>
              <div className="flex gap-2">
                {(['inches', 'cm'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                      unit === u
                        ? 'bg-ocean-600 text-white border-ocean-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-ocean-300'
                    }`}
                  >
                    {u === 'inches' ? 'Inches' : 'Centimeters'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {shape === 'cylindrical' ? 'Diameter' : 'Length'} ({unit})
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="calc-input"
                min={0}
                step={0.5}
              />
            </div>

            {shape !== 'cylindrical' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Width ({unit})
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="calc-input"
                  min={0}
                  step={0.5}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Height ({unit})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="calc-input"
                min={0}
                step={0.5}
              />
            </div>
          </div>

          {/* Result */}
          <div>
            {result && (
              <div className="calc-result">
                <p className="text-sm font-medium text-ocean-700 uppercase tracking-wider mb-4">
                  Tank Volume
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-display font-extrabold text-ocean-900">
                      {result.gallons.toFixed(1)}
                    </p>
                    <p className="text-sm text-ocean-600 font-medium">US Gallons</p>
                  </div>

                  <div className="h-px bg-ocean-200/50" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-display font-bold text-ocean-800">
                        {result.liters.toFixed(1)}
                      </p>
                      <p className="text-xs text-ocean-500">Liters</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-ocean-800">
                        {result.cubicInches.toLocaleString()}
                      </p>
                      <p className="text-xs text-ocean-500">Cubic Inches</p>
                    </div>
                  </div>

                  <div className="h-px bg-ocean-200/50" />

                  {/* Practical info */}
                  <div className="space-y-2 text-sm text-ocean-700">
                    <p>
                      <strong>Weight (filled):</strong> ~{Math.round(result.gallons * 8.34)} lbs
                    </p>
                    <p>
                      <strong>25% water change:</strong> {(result.gallons * 0.25).toFixed(1)} gal
                    </p>
                    <p>
                      <strong>Suggested heater:</strong> {Math.round(result.gallons * 3.5)}–{Math.round(result.gallons * 5)}W
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Internal links */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-2">Related Tools</p>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <a href="/calculators/stocking" className="text-ocean-600 hover:text-ocean-800">
                    → Stocking Calculator
                  </a>
                </li>
                <li>
                  <a href="/calculators/heater-size" className="text-ocean-600 hover:text-ocean-800">
                    → Heater Size Calculator
                  </a>
                </li>
                <li>
                  <a href="/tank-sizes" className="text-ocean-600 hover:text-ocean-800">
                    → All Tank Sizes & Dimensions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO content below calculator */}
        <div className="article-content mt-12">
          <div className="ad-slot" data-ad-slot="calc-mid">Ad</div>

          <h2 id="how-to-use">How to Calculate Aquarium Volume</h2>
          <p>
            To find your aquarium&apos;s volume, measure the internal dimensions of your tank
            (length × width × height) in inches or centimeters. Our calculator automatically
            converts to US gallons and liters.
          </p>
          <p>
            For rectangular tanks, the formula is simple: <strong>Length × Width × Height ÷ 231 = Gallons</strong>.
            For bowfront, cylindrical, and hexagonal tanks, the calculator applies the correct geometric formula.
          </p>

          <h2 id="why-volume-matters">Why Tank Volume Matters</h2>
          <p>
            Knowing your exact tank volume is essential for dosing medications, adding water conditioner,
            calculating heater wattage, and determining how many fish your tank can support.
            Overestimating volume can lead to under-dosing treatments, while underestimating can cause overdoses.
          </p>

          <h2 id="standard-sizes">Standard Aquarium Sizes</h2>
          <p>
            Most aquariums follow standard sizes: 5, 10, 20, 20 long, 29, 40 breeder, 55, 75,
            90, 100, 125, and 150 gallons. Check our complete tank size guide for exact dimensions
            and weight information for each standard size.
          </p>

          <div className="ad-slot" data-ad-slot="calc-bottom">Ad</div>
        </div>
      </div>
    </div>
  );
}
