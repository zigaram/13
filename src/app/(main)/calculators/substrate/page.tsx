'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SUBSTRATES = [
  { id: 'gravel', name: 'Standard Gravel', density: 1.5, pricePerLb: 0.8, color: '#9ca3af', link: '/equipment/substrate' },
  { id: 'sand', name: 'Pool Filter Sand', density: 1.6, pricePerLb: 0.2, color: '#d4a574', link: '/equipment/substrate' },
  { id: 'aquasoil', name: 'Aquasoil (ADA Amazonia)', density: 0.9, pricePerLb: 3.5, color: '#4a3728', link: '/equipment/substrate' },
  { id: 'flourite', name: 'Seachem Flourite', density: 1.4, pricePerLb: 2.0, color: '#8b4513', link: '/equipment/substrate' },
  { id: 'eco-complete', name: 'Eco-Complete', density: 1.3, pricePerLb: 1.8, color: '#2d2d2d', link: '/equipment/substrate' },
  { id: 'controsoil', name: 'UNS Controsoil', density: 0.85, pricePerLb: 4.0, color: '#3d2b1f', link: '/equipment/substrate' },
  { id: 'black-sand', name: 'Black Sand (CaribSea)', density: 1.6, pricePerLb: 1.2, color: '#1a1a2e', link: '/equipment/substrate' },
];

function TankCrossSectionSVG({ depthInches, substrateColor, sloped }: { depthInches: number; substrateColor: string; sloped: boolean }) {
  const frontH = Math.min(depthInches * 10, 60);
  const backH = sloped ? Math.min(frontH * 2, 80) : frontH;
  
  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-xs mx-auto">
      {/* Tank walls */}
      <rect x="10" y="5" width="180" height="90" rx="3" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {/* Water */}
      <rect x="12" y="7" width="176" height={86 - Math.max(frontH, backH)} fill="#dbeafe" opacity="0.4" />
      {/* Substrate */}
      <path d={`M12,95 L12,${95 - backH} Q100,${95 - (frontH + backH) / 2} 188,${95 - frontH} L188,95 Z`}
        fill={substrateColor} opacity="0.8">
        <animate attributeName="opacity" values="0.7;0.85;0.7" dur="3s" repeatCount="indefinite" />
      </path>
      {/* Depth label */}
      <line x1="192" y1={95 - frontH} x2="192" y2="95" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
      <text x="198" y={95 - frontH / 2 + 4} fontSize="8" fill="#64748b">{depthInches}&quot;</text>
      {sloped && <>
        <line x1="5" y1={95 - backH} x2="5" y2="95" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
        <text x="0" y={95 - backH / 2 + 4} fontSize="7" fill="#64748b" textAnchor="end">{(depthInches * 2).toFixed(1)}&quot;</text>
      </>}
      {/* Plants in substrate */}
      <path d="M50,{95 - backH * 0.8} Q48,{95 - backH * 0.8 - 15} 55,{95 - backH * 0.8 - 25}" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.5">
        <animate attributeName="d" dur="4s" repeatCount="indefinite" 
          values={`M50,${95-backH*0.8} Q48,${95-backH*0.8-15} 55,${95-backH*0.8-25};M50,${95-backH*0.8} Q52,${95-backH*0.8-15} 53,${95-backH*0.8-25};M50,${95-backH*0.8} Q48,${95-backH*0.8-15} 55,${95-backH*0.8-25}`} />
      </path>
    </svg>
  );
}

export default function SubstrateCalculator() {
  const [tankLength, setTankLength] = useState(24);
  const [tankWidth, setTankWidth] = useState(12);
  const [depthInches, setDepthInches] = useState(2);
  const [substrate, setSubstrate] = useState('gravel');
  const [sloped, setSloped] = useState(false);

  const sub = SUBSTRATES.find(s => s.id === substrate)!;

  const result = useMemo(() => {
    const avgDepth = sloped ? depthInches * 1.5 : depthInches;
    const cubicInches = tankLength * tankWidth * avgDepth;
    const liters = cubicInches * 0.016387;
    const lbs = liters * sub.density * 2.205; // liters × density(kg/L) × 2.205
    const cost = lbs * sub.pricePerLb;
    
    return {
      lbs: Math.round(lbs),
      kg: Math.round(lbs / 2.205),
      liters: Math.round(liters),
      cost: Math.round(cost),
      bags20lb: Math.ceil(lbs / 20),
    };
  }, [tankLength, tankWidth, depthInches, substrate, sloped, sub]);

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Calculators', href: '/calculators' }, { name: 'Substrate', href: '/calculators/substrate' }]} />

      <header className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">Substrate Calculator</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">Calculate exactly how much gravel, sand, or aquasoil you need for your tank. Supports sloped aquascaping layouts.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr,300px] gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Tank Dimensions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Length (inches)</label>
                <input type="number" value={tankLength} onChange={e => setTankLength(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Width (inches)</label>
                <input type="number" value={tankWidth} onChange={e => setTankWidth(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Depth (inches)</label>
                <input type="range" min="0.5" max="5" step="0.5" value={depthInches} onChange={e => setDepthInches(Number(e.target.value))}
                  className="w-full accent-ocean-500 mt-2" />
                <p className="text-center text-sm font-bold text-ocean-700">{depthInches}&quot;</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Substrate Type</label>
                <select value={substrate} onChange={e => setSubstrate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400">
                  {SUBSTRATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="sm:w-36">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Sloped?</label>
                <button onClick={() => setSloped(!sloped)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${sloped ? 'bg-reef-50 border-reef-300 text-reef-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {sloped ? '⛰️ Sloped' : 'Flat'}
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="p-6 bg-ocean-50 rounded-2xl border border-ocean-200 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">You Need</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-xl">
                <p className="text-2xl font-extrabold text-ocean-800">{result.lbs}</p>
                <p className="text-xs text-gray-500">pounds</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <p className="text-2xl font-extrabold text-ocean-800">{result.kg}</p>
                <p className="text-xs text-gray-500">kilograms</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <p className="text-2xl font-extrabold text-ocean-800">{result.liters}</p>
                <p className="text-xs text-gray-500">liters</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <p className="text-2xl font-extrabold text-amber-600">~${result.cost}</p>
                <p className="text-xs text-gray-500">est. cost</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              ≈ {result.bags20lb} × 20lb bag{result.bags20lb !== 1 ? 's' : ''} of <Link href="/equipment/substrate" className="text-ocean-600 hover:underline">{sub.name}</Link>
              {sloped && ' (sloped: 1.5× flat depth for back-to-front gradient)'}
            </p>
          </div>

          <div className="article-content mt-8">
            <h2>Substrate Depth Guide</h2>
            <p>Most aquariums need <strong>1.5-2.5 inches</strong> of substrate. For <a href="/guides/aquascaping-guide">aquascaping</a>, slope the substrate higher in back (3-4&quot;) and lower in front (1-1.5&quot;) to create depth perspective. <a href="/plants">Planted tanks</a> with root feeders (<a href="/plants/amazon-sword">Amazon Swords</a>, <a href="/plants/cryptocoryne-wendtii">Cryptocorynes</a>) benefit from 2.5-3&quot; of nutrient-rich <a href="/equipment/substrate">aquasoil or Eco-Complete</a>.</p>
            <p>See our <a href="/equipment/substrate">complete substrate guide</a> for detailed product comparisons.</p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-display font-bold text-sm text-gray-600 mb-3 text-center">Tank Cross-Section</h3>
            <TankCrossSectionSVG depthInches={depthInches} substrateColor={sub.color} sloped={sloped} />
            <p className="text-xs text-gray-400 text-center mt-2">
              {sloped ? `Front: ${depthInches}" · Back: ${(depthInches * 2).toFixed(1)}"` : `Uniform ${depthInches}" depth`}
            </p>
          </div>

          <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
            <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">Related</p>
            <ul className="space-y-1.5">
              {[
                { href: '/equipment/substrate', text: 'Substrate Reviews' },
                { href: '/guides/aquascaping-guide', text: 'Aquascaping Guide' },
                { href: '/calculators/tank-volume', text: 'Tank Volume Calculator' },
                { href: '/calculators/stocking', text: 'Stocking Calculator' },
                { href: '/plants', text: 'Aquarium Plants' },
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
