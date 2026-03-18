'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

function ThermometerSVG({ watts, maxWatts }: { watts: number; maxWatts: number }) {
  const pct = Math.min(watts / Math.max(maxWatts, 1), 1) * 100;
  const color = watts > 300 ? '#ef4444' : watts > 150 ? '#f59e0b' : watts > 50 ? '#3b82f6' : '#22c55e';
  return (
    <svg viewBox="0 0 60 140" className="w-14 mx-auto">
      {/* Thermometer body */}
      <rect x="20" y="10" width="20" height="95" rx="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
      {/* Bulb */}
      <circle cx="30" cy="118" r="18" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
      {/* Mercury */}
      <rect x="24" y={105 - pct * 0.9} width="12" height={pct * 0.9 + 10} rx="6" fill={color} style={{ transition: 'all 0.6s ease' }}>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      </rect>
      <circle cx="30" cy="118" r="14" fill={color} style={{ transition: 'fill 0.6s ease' }} />
      {/* Text */}
      <text x="30" y="122" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">{watts}W</text>
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map(t => (
        <line key={t} x1="42" y1={105 - t * 0.9} x2="48" y2={105 - t * 0.9} stroke="#94a3b8" strokeWidth="1" />
      ))}
    </svg>
  );
}

const HEATER_PRODUCTS = [
  { watts: 25, name: 'Fluval M25', tanks: '2-5 gal', price: '$18-22' },
  { watts: 50, name: 'Cobalt Neo-Therm 50W', tanks: '5-15 gal', price: '$30-38' },
  { watts: 100, name: 'Eheim Jager 100W', tanks: '15-30 gal', price: '$22-30' },
  { watts: 150, name: 'Eheim Jager 150W', tanks: '25-40 gal', price: '$25-35' },
  { watts: 200, name: 'Fluval E200', tanks: '40-65 gal', price: '$40-55' },
  { watts: 300, name: 'Eheim Jager 300W', tanks: '65-100 gal', price: '$30-40' },
];

export default function HeaterSizeCalculator() {
  const [tankGallons, setTankGallons] = useState(20);
  const [roomTempF, setRoomTempF] = useState(70);
  const [targetTempF, setTargetTempF] = useState(78);

  const result = useMemo(() => {
    const tempDiff = Math.max(0, targetTempF - roomTempF);
    // Rule of thumb: ~5 watts per gallon per 10°F difference, minimum 25W
    const rawWatts = tankGallons * tempDiff * 0.5;
    // Round up to nearest common wattage
    const common = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500];
    const recommended = common.find(w => w >= rawWatts) || common[common.length - 1];
    const product = HEATER_PRODUCTS.find(p => p.watts >= recommended) || HEATER_PRODUCTS[HEATER_PRODUCTS.length - 1];

    return {
      rawWatts: Math.round(rawWatts),
      recommended,
      tempDiff,
      product,
      dualHeater: recommended >= 200,
    };
  }, [tankGallons, roomTempF, targetTempF]);

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Calculators', href: '/calculators' }, { name: 'Heater Size', href: '/calculators/heater-size' }]} />

      <header className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">Aquarium Heater Size Calculator</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">Find the right wattage heater for your tank based on size, room temperature, and target temperature.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr,300px] gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Your Setup</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tank Size (gallons)</label>
                <input type="number" value={tankGallons} onChange={e => setTankGallons(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Room Temp (°F)</label>
                <input type="number" value={roomTempF} onChange={e => setRoomTempF(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Target Temp (°F)</label>
                <input type="number" value={targetTempF} onChange={e => setTargetTempF(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="p-6 bg-ocean-50 rounded-2xl border border-ocean-200 shadow-sm">
            <div className="flex items-center gap-6">
              <ThermometerSVG watts={result.recommended} maxWatts={400} />
              <div>
                <p className="text-sm text-gray-500">You need to heat {result.tempDiff}°F above room temperature</p>
                <p className="text-3xl font-extrabold text-ocean-800 mt-1">{result.recommended}W heater</p>
                {result.dualHeater && (
                  <p className="text-sm text-amber-600 mt-1">💡 For large tanks, consider 2× {result.recommended / 2}W heaters for redundancy.</p>
                )}
                {result.product && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-ocean-100">
                    <p className="text-sm font-semibold text-gray-800">Recommended: <Link href="/equipment/heaters" className="text-ocean-600 hover:underline">{result.product.name}</Link></p>
                    <p className="text-xs text-gray-500">For {result.product.tanks} · {result.product.price}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick reference table */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Quick Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Tank</th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">5°F diff</th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">10°F diff</th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">15°F diff</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {[5, 10, 20, 29, 40, 55, 75].map(gal => (
                    <tr key={gal} className={gal === tankGallons ? 'bg-ocean-50' : ''}>
                      <td className="p-3 font-medium"><Link href={`/tank-sizes/${gal}-gallon-fish-tank`} className="text-ocean-600 hover:underline">{gal} gal</Link></td>
                      {[5, 10, 15].map(diff => {
                        const w = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500].find(w => w >= gal * diff * 0.5) || 500;
                        return <td key={diff} className="p-3 text-center">{w}W</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="article-content mt-8">
            <h2>How Heater Sizing Works</h2>
            <p>The wattage you need depends on two factors: tank volume and the temperature difference between your room and your target water temperature. Tropical fish like <a href="/fish/betta-fish">bettas</a> and <a href="/fish/neon-tetra">tetras</a> need 76-82°F, which requires significant heating in cooler rooms. See our <a href="/equipment/heaters">complete heater guide</a> for product reviews.</p>
            <p>For tanks over 40 gallons, using two smaller heaters instead of one large one provides redundancy — if one fails, the other prevents catastrophic temperature drops. Always use a separate thermometer to verify <a href="/equipment/heaters">heater</a> accuracy.</p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
            <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">Related</p>
            <ul className="space-y-1.5">
              {[
                { href: '/equipment/heaters', text: 'Best Heaters Reviewed' },
                { href: '/tank-sizes', text: 'Tank Sizes Guide' },
                { href: '/calculators/stocking', text: 'Stocking Calculator' },
                { href: '/calculators/water-change', text: 'Water Change Calculator' },
                { href: '/guides/beginner-guide', text: 'Beginner Guide' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-ocean-600 hover:text-ocean-800">→ {l.text}</Link></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
