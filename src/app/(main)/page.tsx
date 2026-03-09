import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/types';
import { JsonLd, generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

const PILLARS = [
  {
    title: 'Freshwater Fish',
    description: 'Care guides for bettas, goldfish, tetras, cichlids, and 200+ species.',
    href: '/freshwater',
    icon: '🐠',
    color: 'from-ocean-500 to-ocean-600',
  },
  {
    title: 'Saltwater & Reef',
    description: 'Reef tank setup, coral care, marine fish, and equipment guides.',
    href: '/saltwater',
    icon: '🐙',
    color: 'from-ocean-600 to-ocean-800',
  },
  {
    title: 'Aquarium Plants',
    description: 'Java fern, anubias, carpet plants, and complete aquascaping guides.',
    href: '/plants',
    icon: '🌿',
    color: 'from-reef-500 to-reef-700',
  },
  {
    title: 'Equipment Reviews',
    description: 'Filters, heaters, lights, and CO2 systems — tested and compared.',
    href: '/equipment',
    icon: '⚙️',
    color: 'from-gray-600 to-gray-800',
  },
  {
    title: 'Tank Sizes',
    description: 'Find the perfect tank — dimensions, stocking, and top picks by gallon.',
    href: '/tank-sizes',
    icon: '📐',
    color: 'from-sand-500 to-sand-700',
  },
  {
    title: 'Fish Health',
    description: 'Identify and treat ich, fin rot, cloudy water, algae, and more.',
    href: '/diseases',
    icon: '💊',
    color: 'from-coral-500 to-coral-700',
  },
];

const CALCULATORS = [
  {
    title: 'Tank Volume Calculator',
    description: 'Calculate gallons & liters for any tank shape.',
    href: '/calculators/tank-volume',
  },
  {
    title: 'Stocking Calculator',
    description: 'How many fish can your tank handle?',
    href: '/calculators/stocking',
  },
  {
    title: 'Heater Size Calculator',
    description: 'Find the right wattage for your tank.',
    href: '/calculators/heater-size',
  },
];

const POPULAR_GUIDES = [
  { title: 'How to Cycle a Fish Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
  { title: 'Betta Fish Care Guide', href: '/fish/betta-fish' },
  { title: 'Best 10 Gallon Fish Tanks', href: '/tank-sizes/10-gallon-fish-tank' },
  { title: 'Best Aquarium Filters', href: '/equipment/filters' },
  { title: 'Nitrogen Cycle Explained', href: '/water-chemistry/nitrogen-cycle' },
  { title: 'Cloudy Fish Tank Water: Fixes', href: '/diseases/cloudy-fish-tank' },
  { title: 'Best Plants for Beginners', href: '/guides/best-aquarium-plants-beginners' },
  { title: 'Aquascaping for Beginners', href: '/guides/aquascaping-beginners' },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={generateWebsiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800">
        {/* Subtle wave pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path
              d="M0,300 C360,150 720,450 1080,250 C1260,190 1380,350 1440,300 L1440,600 L0,600 Z"
              fill="currentColor"
              className="text-ocean-400"
            />
            <path
              d="M0,350 C240,250 480,450 720,350 C960,250 1200,400 1440,350 L1440,600 L0,600 Z"
              fill="currentColor"
              className="text-ocean-500"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="relative max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight">
              Your Complete Guide to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-reef-300 to-ocean-300">
                Aquarium Keeping
              </span>
            </h1>
            <p className="mt-5 text-lg text-ocean-200 leading-relaxed max-w-xl">
              Fish care guides, equipment reviews, interactive calculators, and expert advice
              for freshwater and saltwater aquariums.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/setup"
                className="px-6 py-3 bg-white text-ocean-800 font-semibold rounded-xl hover:bg-ocean-50 transition-colors shadow-lg shadow-black/10"
              >
                Start Your First Tank →
              </Link>
              <Link
                href="/calculators/tank-volume"
                className="px-6 py-3 bg-ocean-700/50 text-white font-semibold rounded-xl hover:bg-ocean-700/70 transition-colors border border-ocean-600/30"
              >
                Try Our Calculators
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTENT PILLARS ========== */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-ocean-950">
            Explore by Topic
          </h2>
          <p className="text-gray-500 mt-2">Everything you need to build and maintain a thriving aquarium.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.href}
              href={pillar.href}
              className="group relative p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-gray-200 transition-all"
            >
              <span className="text-3xl mb-3 block">{pillar.icon}</span>
              <h3 className="font-display font-bold text-xl text-gray-900 group-hover:text-ocean-700 transition-colors">
                {pillar.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                {pillar.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-ocean-600 mt-3 group-hover:gap-2 transition-all">
                Explore
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== CALCULATORS ========== */}
      <section className="bg-gradient-to-br from-ocean-50 to-reef-50 border-y border-ocean-100">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-ocean-950">
              Free Aquarium Calculators
            </h2>
            <p className="text-gray-500 mt-2">Interactive tools to help you plan the perfect aquarium.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {CALCULATORS.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group p-6 bg-white/80 backdrop-blur rounded-2xl border border-ocean-100 hover:shadow-md hover:bg-white transition-all"
              >
                <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center text-ocean-600 mb-3 group-hover:bg-ocean-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-gray-900">{calc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{calc.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR GUIDES ========== */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-display font-bold text-3xl text-ocean-950 mb-8">
          Popular Guides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-ocean-200 hover:bg-ocean-50/30 transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-ocean-400 shrink-0 group-hover:bg-ocean-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-ocean-700 transition-colors">
                {guide.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-ocean-950 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            New to Fishkeeping?
          </h2>
          <p className="text-ocean-300 mt-2 max-w-lg mx-auto">
            Our step-by-step beginner guide covers everything from choosing your first tank
            to adding fish — no experience needed.
          </p>
          <Link
            href="/setup/beginner-fish-tank-guide"
            className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-ocean-800 font-semibold rounded-xl hover:bg-ocean-50 transition-colors"
          >
            Read the Beginner Guide
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
