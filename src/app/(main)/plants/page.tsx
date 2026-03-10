import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPlants } from '@/lib/data';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Aquarium Plants Guide — Care, Planting & Propagation',
  description: 'Complete care guides for 50+ aquarium plants. Discover the best plants for your tank — from easy beginner species to advanced carpet plants for aquascaping.',
  alternates: { canonical: getCanonicalUrl('/plants') },
};

export default async function PlantsIndexPage() {
  const allPlants = await getAllPlants();

  // Group by category
  const rhizome = allPlants.filter((p) => p.category === 'rhizome');
  const stem = allPlants.filter((p) => p.category === 'stem');
  const rosette = allPlants.filter((p) => p.category === 'rosette');
  const carpet = allPlants.filter((p) => p.category === 'carpet');
  const floating = allPlants.filter((p) => p.category === 'floating');
  const moss = allPlants.filter((p) => p.category === 'moss');
  const bulb = allPlants.filter((p) => p.category === 'bulb');

  const sections = [
    { title: 'Rhizome Plants', emoji: '🌿', items: rhizome, description: 'Epiphytic plants that attach to driftwood and rocks — no substrate needed.' },
    { title: 'Rosette Plants', emoji: '🌱', items: rosette, description: 'Root-feeding plants with leaves growing from a central crown.' },
    { title: 'Stem Plants', emoji: '🪴', items: stem, description: 'Fast-growing column feeders — great for backgrounds and water purification.' },
    { title: 'Carpet Plants', emoji: '🟢', items: carpet, description: 'Low-growing species that create lush foreground carpets for aquascaping.' },
    { title: 'Floating Plants', emoji: '🍃', items: floating, description: 'Surface-dwelling plants that provide shade, absorb nutrients, and reduce algae.' },
    { title: 'Mosses', emoji: '🌳', items: moss, description: 'Versatile mosses for walls, trees, carpets, and breeding tanks.' },
    { title: 'Bulb Plants', emoji: '🌸', items: bulb, description: 'Bulb-based plants with dramatic growth from dormant bulbs.' },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Aquarium Plants', href: '/plants' },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Aquarium Plants Guide
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Complete care guides with lighting requirements, CO2 needs, propagation methods, and
          planting instructions for every species.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="mb-12">
          <div className="mb-5">
            <h2 className="font-display font-bold text-2xl text-ocean-900">
              {section.emoji} {section.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{section.description}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items
              .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
              .map((plant) => {
                const careLevelVariant =
                  plant.careLevel === 'easy' ? 'easy' :
                  plant.careLevel === 'moderate' ? 'moderate' : 'hard';

                return (
                  <Link
                    key={plant.slug}
                    href={`/plants/${plant.slug}`}
                    className="group block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-reef-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-gray-900 group-hover:text-reef-700 transition-colors">
                          {plant.name}
                        </h3>
                        <p className="text-sm text-gray-400 italic truncate">
                          {plant.scientificName}
                        </p>
                      </div>
                      <span className="text-2xl shrink-0">🌿</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`spec-badge spec-badge-${careLevelVariant}`}>
                        {plant.careLevel}
                      </span>
                      <span className="spec-badge bg-gray-100 text-gray-600">
                        {plant.lightRequirement} light
                      </span>
                      {plant.co2Required && (
                        <span className="spec-badge bg-coral-100 text-coral-700">
                          CO2 required
                        </span>
                      )}
                      {!plant.co2Required && plant.co2Recommended && (
                        <span className="spec-badge bg-amber-100 text-amber-700">
                          CO2 recommended
                        </span>
                      )}
                      {!plant.co2Required && !plant.co2Recommended && (
                        <span className="spec-badge bg-reef-100 text-reef-700">
                          No CO2 needed
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                      {plant.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{plant.placement}</span>
                      <span>·</span>
                      <span>{plant.growthRate} growth</span>
                      <span>·</span>
                      <span>{plant.temperature.min}–{plant.temperature.max}°F</span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}

      {/* Internal linking for SEO */}
      <section className="mt-16 p-8 bg-reef-50/50 rounded-2xl border border-reef-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">
          More Aquarium Guides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Fish & Species Guide', href: '/fish' },
            { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
            { label: 'Stocking Calculator', href: '/calculators/stocking' },
            { label: 'Best Aquarium Filters', href: '/equipment/filters' },
            { label: 'Best Aquarium Lights', href: '/equipment/lights' },
            { label: 'How to Cycle a Fish Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
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
