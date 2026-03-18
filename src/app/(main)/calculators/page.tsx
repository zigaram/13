import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Free Aquarium Calculators: Stocking, Tank Volume & More | World of Aquariums',
  description: 'Free interactive aquarium calculators. Stocking calculator, tank volume calculator, heater size guide. Plan your perfect tank setup.',
  alternates: { canonical: getCanonicalUrl('/calculators') },
};

const CALCULATORS = [
  {
    title: 'Stocking Calculator',
    description: 'How many fish can your tank handle? Add species and get real-time bioload analysis, compatibility checks, and schooling warnings.',
    href: '/calculators/stocking',
    emoji: '🐟',
    badge: 'Most Popular',
  },
  {
    title: 'Water Change Calculator',
    description: 'Calculate exact water change percentage based on nitrate levels. Includes personalized maintenance schedule and before/after visualization.',
    href: '/calculators/water-change',
    emoji: '💧',
    badge: 'New',
  },
  {
    title: 'Heater Size Calculator',
    description: 'Find the right wattage heater based on tank size, room temperature, and target temperature. Product recommendations included.',
    href: '/calculators/heater-size',
    emoji: '🌡️',
    badge: null,
  },
  {
    title: 'Substrate Calculator',
    description: 'How much gravel, sand, or aquasoil do you need? Supports sloped aquascaping layouts. Cost estimates included.',
    href: '/calculators/substrate',
    emoji: '⛰️',
    badge: null,
  },
  {
    title: 'Tank Volume Calculator',
    description: 'Calculate gallons and liters for rectangular, bowfront, cylinder, and hexagonal tanks. Common tank size presets.',
    href: '/calculators/tank-volume',
    emoji: '📐',
    badge: null,
  },
];

export default function CalculatorsIndexPage() {
  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Calculators', href: '/calculators' }]} />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Free Aquarium Calculators
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Interactive tools to help you plan and maintain the perfect aquarium. All free, no sign-up required.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group block p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-ocean-200 transition-all relative"
          >
            {calc.badge && (
              <span className="absolute top-4 right-4 px-2.5 py-1 bg-ocean-100 text-ocean-700 text-xs font-semibold rounded-full">
                {calc.badge}
              </span>
            )}
            <span className="text-4xl block mb-4">{calc.emoji}</span>
            <h2 className="font-display font-bold text-xl text-gray-900 group-hover:text-ocean-700 transition-colors">
              {calc.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {calc.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-ocean-600 mt-4 group-hover:gap-2 transition-all">
              Open Calculator
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      {/* Related resources */}
      <section className="p-8 bg-ocean-50/50 rounded-2xl border border-ocean-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">Planning Your Tank?</h2>
        <p className="text-sm text-gray-600 mb-4">Our calculators work best alongside these guides:</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Beginner Guide', href: '/guides/beginner-guide' },
            { label: 'Tank Sizes Guide', href: '/tank-sizes' },
            { label: 'Fish Compatibility Checker', href: '/compatibility' },
            { label: 'Best Aquarium Filters', href: '/equipment/filters' },
            { label: 'How to Cycle a Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
            { label: 'All Fish Species', href: '/fish' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-ocean-600 hover:text-ocean-800 font-medium">
              → {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
