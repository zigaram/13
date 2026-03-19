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
    title: 'Fish & Species',
    description: 'Care guides for bettas, goldfish, tetras, cichlids, shrimp, snails, and 50+ species.',
    href: '/fish',
    icon: '🐠',
  },
  {
    title: 'Aquarium Plants',
    description: 'Java fern, anubias, carpet plants, floating plants, and 29 species with full care guides.',
    href: '/plants',
    icon: '🌿',
  },
  {
    title: 'Equipment Reviews',
    description: 'Filters, heaters, lights, substrate, CO2, test kits — 41 products reviewed.',
    href: '/equipment',
    icon: '⚙️',
  },
  {
    title: 'Tank Sizes',
    description: 'Dimensions, stocking, and setup guides for every tank from 3 to 125 gallons.',
    href: '/tank-sizes',
    icon: '📐',
  },
  {
    title: 'Fish Health & Diseases',
    description: 'Identify and treat ich, fin rot, dropsy, swim bladder, velvet, and more.',
    href: '/diseases',
    icon: '💊',
  },
  {
    title: 'Algae Control',
    description: 'Every algae type identified with causes, fixes, and best algae eaters.',
    href: '/algae',
    icon: '🧬',
  },
];

const POPULAR_GUIDES = [
  { title: 'Beginner Guide: Your First Tank', href: '/guides/beginner-guide' },
  { title: 'Betta Fish Tank Setup', href: '/setup/betta-fish-tank-setup' },
  { title: 'How to Cycle a Fish Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
  { title: 'Aquascaping for Beginners', href: '/guides/aquascaping-guide' },
  { title: 'Betta Fish Care Guide', href: '/fish/betta-fish' },
  { title: 'Best 10 Gallon Fish Tanks', href: '/tank-sizes/10-gallon-fish-tank' },
  { title: 'Best Aquarium Filters', href: '/equipment/filters' },
  { title: 'Cloudy Water: Causes & Fixes', href: '/maintenance/cloudy-water' },
  { title: 'Best Algae Eaters', href: '/algae/best-algae-eaters' },
  { title: 'Aquarium Salt Guide', href: '/diseases/aquarium-salt-guide' },
  { title: 'Java Fern Care Guide', href: '/plants/java-fern' },
  { title: 'Best Aquarium Substrate', href: '/equipment/substrate' },
  { title: 'Stocking Calculator', href: '/calculators/stocking' },
];

const POPULAR_FISH = [
  { name: 'Betta Fish', href: '/fish/betta-fish', emoji: '🐟' },
  { name: 'Neon Tetra', href: '/fish/neon-tetra', emoji: '🐟' },
  { name: 'Goldfish', href: '/fish/goldfish', emoji: '🐟' },
  { name: 'Guppy', href: '/fish/guppy', emoji: '🐟' },
  { name: 'Cherry Shrimp', href: '/fish/cherry-shrimp', emoji: '🦐' },
  { name: 'Corydoras', href: '/fish/corydoras-catfish', emoji: '🐟' },
  { name: 'Angelfish', href: '/fish/angelfish', emoji: '🐟' },
  { name: 'Oscar Fish', href: '/fish/oscar-fish', emoji: '🐟' },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={generateWebsiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path d="M0,300 C360,150 720,450 1080,250 C1260,190 1380,350 1440,300 L1440,600 L0,600 Z" fill="currentColor" className="text-ocean-400" />
            <path d="M0,350 C240,250 480,450 720,350 C960,250 1200,400 1440,350 L1440,600 L0,600 Z" fill="currentColor" className="text-ocean-500" opacity="0.5" />
          </svg>
        </div>
        <div className="relative max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight">
              Everything You Need for a{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-reef-300 to-ocean-300">
                Thriving Aquarium
              </span>
            </h1>
            <p className="mt-5 text-lg text-ocean-200 leading-relaxed max-w-xl">
              569 species guides, 41 equipment reviews, interactive calculators, and expert advice
              for freshwater aquariums — all free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/guides/beginner-guide"
                className="px-6 py-3 bg-white text-ocean-800 font-semibold rounded-xl hover:bg-ocean-50 transition-colors shadow-lg shadow-black/10"
              >
                Start Your First Tank →
              </Link>
              <Link
                href="/calculators/tank-volume"
                className="px-6 py-3 bg-ocean-700/50 text-white font-semibold rounded-xl hover:bg-ocean-700/70 transition-colors border border-ocean-600/30"
              >
                Tank Volume Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTENT PILLARS ========== */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-ocean-950">Explore by Topic</h2>
          <p className="text-gray-500 mt-2">Everything you need to build and maintain a thriving aquarium.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((pillar) => (
            <Link key={pillar.href} href={pillar.href} className="group relative p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-gray-200 transition-all">
              <span className="text-3xl mb-3 block">{pillar.icon}</span>
              <h3 className="font-display font-bold text-xl text-gray-900 group-hover:text-ocean-700 transition-colors">{pillar.title}</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{pillar.description}</p>
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

      {/* ========== POPULAR GUIDES ========== */}
      <section className="bg-gradient-to-br from-ocean-50 to-reef-50 border-y border-ocean-100">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display font-bold text-3xl text-ocean-950 mb-8">Popular Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_GUIDES.map((guide) => (
              <Link key={guide.href} href={guide.href} className="group flex items-center gap-3 p-4 bg-white/80 rounded-xl border border-ocean-100 hover:border-ocean-200 hover:bg-white hover:shadow-sm transition-all">
                <div className="w-2 h-2 rounded-full bg-ocean-400 shrink-0 group-hover:bg-ocean-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-ocean-700 transition-colors">{guide.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR FISH ========== */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-display font-bold text-3xl text-ocean-950 mb-2">Popular Fish Species</h2>
        <p className="text-gray-500 mb-8">Quick links to our most-read care guides.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_FISH.map((fish) => (
            <Link key={fish.href} href={fish.href} className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-ocean-200 hover:shadow-sm transition-all text-center">
              <span className="text-2xl block mb-1">{fish.emoji}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-ocean-700">{fish.name}</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/fish" className="text-sm font-medium text-ocean-600 hover:text-ocean-800">
            View all 569 species →
          </Link>
        </div>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-ocean-950 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">New to Fishkeeping?</h2>
          <p className="text-ocean-300 mt-2 max-w-lg mx-auto">
            Our step-by-step beginner guide covers everything from choosing your first tank
            to adding fish — no experience needed.
          </p>
          <Link
            href="/guides/beginner-guide"
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
