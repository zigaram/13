'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

function NitrateGauge({ level, label }: { level: number; label: string }) {
  const pct = Math.min(level / 80, 1) * 100;
  const color = level > 40 ? '#ef4444' : level > 20 ? '#f59e0b' : level > 10 ? '#3b82f6' : '#22c55e';
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="relative w-16 h-32 mx-auto bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-700 ease-out"
          style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.7 }}
        />
        {/* Bubbles */}
        {level > 0 && [0,1,2].map(i => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
            style={{
              left: `${20 + i * 25}%`,
              animation: `rise ${2 + i * 0.7}s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: pct > 50 ? 'white' : color }}>
          {level}
        </span>
      </div>
      <p className="text-xs font-medium mt-1" style={{ color }}>ppm</p>
      <style jsx>{`
        @keyframes rise {
          0% { bottom: 5%; opacity: 0.6; }
          100% { bottom: 95%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function WaterDropSVG({ percentage }: { percentage: number }) {
  const freshPct = percentage;
  return (
    <svg viewBox="0 0 80 100" className="w-20 mx-auto">
      <defs>
        <clipPath id="dropClip">
          <path d="M40,5 Q40,5 55,40 C70,65 65,90 40,95 C15,90 10,65 25,40 Q40,5 40,5 Z" />
        </clipPath>
      </defs>
      <path d="M40,5 Q40,5 55,40 C70,65 65,90 40,95 C15,90 10,65 25,40 Q40,5 40,5 Z"
        fill="none" stroke="#93c5fd" strokeWidth="2" />
      <g clipPath="url(#dropClip)">
        <rect x="0" y={95 - freshPct * 0.9} width="80" height="100" fill="#3b82f6" opacity="0.3">
          <animate attributeName="y" values={`${95 - freshPct * 0.9};${93 - freshPct * 0.9};${95 - freshPct * 0.9}`} dur="2s" repeatCount="indefinite" />
        </rect>
      </g>
      <text x="40" y="60" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2563eb">{percentage}%</text>
    </svg>
  );
}

export default function WaterChangeCalculator() {
  const [tankGallons, setTankGallons] = useState(20);
  const [currentNitrate, setCurrentNitrate] = useState(40);
  const [targetNitrate, setTargetNitrate] = useState(10);
  const [tapNitrate, setTapNitrate] = useState(0);

  const result = useMemo(() => {
    if (currentNitrate <= targetNitrate) return { percentage: 0, gallons: 0, newNitrate: currentNitrate };
    // Formula: new_nitrate = current * (1 - pct/100) + tap * (pct/100)
    // Solve for pct: pct = (current - target) / (current - tap) * 100
    const denominator = currentNitrate - tapNitrate;
    if (denominator <= 0) return { percentage: 100, gallons: tankGallons, newNitrate: tapNitrate };
    const pct = Math.min(100, Math.max(0, ((currentNitrate - targetNitrate) / denominator) * 100));
    const gallons = Math.round(tankGallons * pct / 100 * 10) / 10;
    const newNitrate = Math.round(currentNitrate * (1 - pct / 100) + tapNitrate * (pct / 100));
    return { percentage: Math.round(pct), gallons, newNitrate };
  }, [tankGallons, currentNitrate, targetNitrate, tapNitrate]);

  // Schedule recommendation
  const schedule = useMemo(() => {
    if (currentNitrate <= 10) return { freq: 'Weekly', pct: '15-20%', note: 'Light stocking or well-planted tank. Maintenance changes only.' };
    if (currentNitrate <= 20) return { freq: 'Weekly', pct: '20-25%', note: 'Standard maintenance. Good water quality.' };
    if (currentNitrate <= 40) return { freq: 'Weekly', pct: '25-35%', note: 'Moderate nitrate. Consider reducing feeding or adding plants.' };
    if (currentNitrate <= 60) return { freq: 'Twice weekly', pct: '30-40%', note: 'High nitrate. Tank may be overstocked or underfiltrated.' };
    return { freq: 'Every 2-3 days', pct: '40-50%', note: 'Dangerously high nitrate! Immediate large water change needed. Check filtration and stocking.' };
  }, [currentNitrate]);

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Calculators', href: '/calculators' }, { name: 'Water Change', href: '/calculators/water-change' }]} />

      <header className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">Water Change Calculator</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">Calculate exactly how much water to change based on your current nitrate levels. Plus get a personalized maintenance schedule.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr,340px] gap-8">
        <div className="space-y-6">
          {/* Inputs */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Your Tank</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tank Size (gallons)</label>
                <input type="number" value={tankGallons} onChange={e => setTankGallons(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tap Water Nitrate (ppm)</label>
                <input type="number" value={tapNitrate} onChange={e => setTapNitrate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400" />
                <p className="text-xs text-gray-400 mt-1">Most tap water is 0-10 ppm. Test yours!</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Nitrate Levels</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Current Nitrate (ppm)</label>
                <input type="range" min="0" max="100" value={currentNitrate} onChange={e => setCurrentNitrate(Number(e.target.value))}
                  className="w-full accent-coral-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span className="font-bold text-lg" style={{ color: currentNitrate > 40 ? '#ef4444' : currentNitrate > 20 ? '#f59e0b' : '#22c55e' }}>{currentNitrate} ppm</span>
                  <span>100</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Target Nitrate (ppm)</label>
                <input type="range" min="0" max="40" value={targetNitrate} onChange={e => setTargetNitrate(Number(e.target.value))}
                  className="w-full accent-reef-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span className="font-bold text-lg text-reef-600">{targetNitrate} ppm</span>
                  <span>40</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`p-6 rounded-2xl border shadow-sm ${result.percentage > 50 ? 'bg-coral-50 border-coral-200' : result.percentage > 30 ? 'bg-amber-50 border-amber-200' : 'bg-reef-50 border-reef-200'}`}>
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Water Change Needed</h2>
            <div className="flex items-center gap-8">
              <WaterDropSVG percentage={result.percentage} />
              <div>
                <p className="text-3xl font-extrabold" style={{ color: result.percentage > 50 ? '#ef4444' : result.percentage > 30 ? '#f59e0b' : '#22c55e' }}>
                  {result.percentage}% water change
                </p>
                <p className="text-gray-600 mt-1">Remove <strong>{result.gallons} gallons</strong> and replace with <a href="/equipment/water-conditioners" className="text-ocean-600 hover:underline">conditioned</a> tap water.</p>
                <p className="text-sm text-gray-500 mt-1">Result: nitrate drops from {currentNitrate} → ~{result.newNitrate} ppm</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Recommended Schedule</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-ocean-100 flex items-center justify-center text-ocean-600 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800">{schedule.freq} — {schedule.pct}</p>
                <p className="text-sm text-gray-500 mt-1">{schedule.note}</p>
              </div>
            </div>
          </div>

          {/* SEO content */}
          <div className="article-content mt-8">
            <h2>How Water Changes Reduce Nitrate</h2>
            <p>Water changes are the primary method of removing nitrate from aquariums. Your <a href="/equipment/filters">biological filter</a> converts toxic ammonia → nitrite → nitrate through the <a href="/water-chemistry/how-to-cycle-fish-tank">nitrogen cycle</a>, but nitrate accumulates over time with no natural removal in most tanks. Only water changes (and live <a href="/plants">plants</a>) remove nitrate from the system.</p>
            <p>Target nitrate below 20 ppm for most freshwater fish, below 10 ppm for sensitive species like <a href="/fish/discus">discus</a> and <a href="/fish/cherry-shrimp">shrimp</a>. Use an <a href="/equipment/test-kits">API Freshwater Master Test Kit</a> to measure accurately — test strips are less reliable.</p>
            <h2>Water Change Tips</h2>
            <p>Use a <a href="/equipment/gravel-vacuums">gravel vacuum</a> during changes to remove debris. Always add <a href="/equipment/water-conditioners">water conditioner (Seachem Prime)</a> to new water. Match temperature within 2°F. For tanks over 20 gallons, a <a href="/equipment/gravel-vacuums">Python water changer</a> eliminates bucket carrying.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-display font-bold text-sm text-gray-600 mb-3 text-center">Before → After</h3>
            <div className="flex justify-center gap-6">
              <NitrateGauge level={currentNitrate} label="Current" />
              <div className="self-center text-gray-300 text-2xl">→</div>
              <NitrateGauge level={result.newNitrate} label="After" />
            </div>
          </div>

          <div className="p-5 bg-ocean-50/50 rounded-xl border border-ocean-100">
            <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">Nitrate Guide</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> 0-10 ppm — Excellent</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> 10-20 ppm — Good</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> 20-40 ppm — Acceptable</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> 40+ ppm — Danger zone</div>
            </div>
          </div>

          <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
            <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">Essential</p>
            <ul className="space-y-1.5">
              {[
                { href: '/equipment/test-kits', text: 'Water Test Kits' },
                { href: '/equipment/water-conditioners', text: 'Seachem Prime' },
                { href: '/equipment/gravel-vacuums', text: 'Gravel Vacuums' },
                { href: '/water-chemistry/how-to-cycle-fish-tank', text: 'Nitrogen Cycle' },
                { href: '/calculators/stocking', text: 'Stocking Calculator' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-ocean-600 hover:text-ocean-800">→ {l.text}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
