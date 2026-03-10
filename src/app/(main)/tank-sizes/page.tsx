import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTankSizes } from '@/lib/data';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Fish Tank Sizes Guide — Dimensions, Weight & Stocking Ideas',
  description: 'Complete guide to every popular aquarium size from 3 to 125 gallons. Dimensions, weight, best fish, equipment recommendations, and setup guides for each tank size.',
  alternates: { canonical: getCanonicalUrl('/tank-sizes') },
};

export default async function TankSizesIndexPage() {
  const allTanks = await getAllTankSizes();

  const nano = allTanks.filter((t) => t.gallons <= 10);
  const medium = allTanks.filter((t) => t.gallons > 10 && t.gallons <= 40);
  const large = allTanks.filter((t) => t.gallons > 40);

  const sections = [
    { title: 'Nano & Small Tanks (3–10 Gallons)', emoji: '🐟', items: nano, description: 'Perfect for bettas, shrimp, and small nano communities. Desktop-friendly sizes.' },
    { title: 'Medium Tanks (15–40 Gallons)', emoji: '🐠', items: medium, description: 'The sweet spot for community tanks, planted aquascapes, and growing collections.' },
    { title: 'Large Tanks (55–125+ Gallons)', emoji: '🐋', items: large, description: 'Showpiece aquariums for oscars, discus, large communities, and dream builds.' },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Tank Sizes', href: '/tank-sizes' },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Fish Tank Sizes Guide
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Dimensions, weight, best fish, equipment, and setup guides for every popular aquarium
          size. Find the perfect tank for your space and fish.
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
            {section.items.map((tank) => (
              <Link
                key={tank.slug}
                href={`/tank-sizes/${tank.slug}`}
                className="group block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-ocean-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-gray-900 group-hover:text-ocean-700 transition-colors">
                      {tank.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {tank.dimensions[0].length}&quot; × {tank.dimensions[0].width}&quot; × {tank.dimensions[0].height}&quot;
                      {tank.dimensions[0].label !== 'Standard' && ` (${tank.dimensions[0].label})`}
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-ocean-200 shrink-0">
                    {tank.gallons}g
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="spec-badge bg-ocean-100 text-ocean-700">
                    {tank.weight.filled} lbs filled
                  </span>
                  {tank.dimensions.length > 1 && (
                    <span className="spec-badge bg-gray-100 text-gray-600">
                      {tank.dimensions.length} variants
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                  {tank.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tank.idealFor.slice(0, 3).map((use) => (
                    <span key={use} className="text-xs text-gray-400">
                      • {use}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16 p-8 bg-ocean-50/50 rounded-2xl border border-ocean-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">
          Helpful Tools & Guides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
            { label: 'Stocking Calculator', href: '/calculators/stocking' },
            { label: 'Fish & Species Guide', href: '/fish' },
            { label: 'Aquarium Plants Guide', href: '/plants' },
            { label: 'Best Aquarium Filters', href: '/equipment/filters' },
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
