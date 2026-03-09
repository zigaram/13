import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllFish } from '@/lib/data';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Aquarium Fish & Species Guide — Freshwater & Saltwater',
  description: 'Complete care guides for 200+ aquarium fish and invertebrates. Find tank size, water parameters, diet, and compatible tank mates for every species.',
  alternates: { canonical: getCanonicalUrl('/fish') },
};

export default async function FishIndexPage() {
  const allFish = await getAllFish();

  // Group by type
  const freshwater = allFish.filter((f) => f.category === 'freshwater' && f.type === 'fish');
  const invertebrates = allFish.filter((f) => f.type === 'invertebrate');
  const amphibians = allFish.filter((f) => f.type === 'amphibian' || f.type === 'reptile');

  const sections = [
    { title: 'Freshwater Fish', items: freshwater },
    { title: 'Shrimp, Snails & Invertebrates', items: invertebrates },
    { title: 'Axolotls & Amphibians', items: amphibians },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Fish & Species', href: '/fish' },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Aquarium Fish & Species Guide
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Complete care guides with tank size requirements, water parameters, diet, and
          compatible tank mates for every species.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="mb-12">
          <h2 className="font-display font-bold text-2xl text-ocean-900 mb-5">
            {section.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items
              .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
              .map((fish) => {
                const careLevelVariant =
                  fish.careLevel === 'beginner' ? 'easy' :
                  fish.careLevel === 'intermediate' ? 'moderate' : 'hard';

                return (
                  <Link
                    key={fish.slug}
                    href={`/fish/${fish.slug}`}
                    className="group block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-ocean-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-gray-900 group-hover:text-ocean-700 transition-colors">
                          {fish.name}
                        </h3>
                        <p className="text-sm text-gray-400 italic truncate">
                          {fish.scientificName}
                        </p>
                      </div>
                      <span className="text-2xl shrink-0">
                        {fish.type === 'invertebrate' ? '🦐' : fish.type === 'amphibian' ? '🦎' : '🐠'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`spec-badge spec-badge-${careLevelVariant}`}>
                        {fish.careLevel}
                      </span>
                      <span className="spec-badge bg-gray-100 text-gray-600">
                        {fish.minTankSize}+ gal
                      </span>
                      <span className="spec-badge bg-gray-100 text-gray-600">
                        {fish.temperament}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                      {fish.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{fish.temperature.min}–{fish.temperature.max}°F</span>
                      <span>·</span>
                      <span>pH {fish.ph.min}–{fish.ph.max}</span>
                      <span>·</span>
                      <span>Up to {fish.maxSize}&quot;</span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}

      {/* Internal linking for SEO */}
      <section className="mt-16 p-8 bg-ocean-50/50 rounded-2xl border border-ocean-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">
          More Aquarium Guides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
            { label: 'Stocking Calculator', href: '/calculators/stocking' },
            { label: 'Best Aquarium Filters', href: '/equipment/filters' },
            { label: 'Best Aquarium Heaters', href: '/equipment/heaters' },
            { label: 'How to Cycle a Fish Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
            { label: 'Aquarium Plants Guide', href: '/plants' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ocean-600 hover:text-ocean-800 font-medium"
            >
              → {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
