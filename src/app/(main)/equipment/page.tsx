import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEquipmentReviews } from '@/lib/data';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Aquarium Equipment Reviews & Buyer\'s Guides | World of Aquariums',
  description: 'In-depth reviews and buyer\'s guides for aquarium filters, heaters, lights, substrates, CO2 systems, and more. Find the best equipment for your tank size and budget.',
  alternates: { canonical: getCanonicalUrl('/equipment') },
};

export default async function EquipmentIndexPage() {
  const reviews = await getAllEquipmentReviews();

  const allCategories = [
    { slug: 'filters', name: 'Aquarium Filters', emoji: '🔄', description: 'HOB, canister, sponge, and internal filters compared by tank size.' },
    { slug: 'heaters', name: 'Aquarium Heaters', emoji: '🌡️', description: 'Sizing guide and reviews for every tank from 5 to 125+ gallons.' },
    { slug: 'lights', name: 'Aquarium Lights', emoji: '💡', description: 'Best LED lights for planted tanks, fish-only setups, and reef tanks.' },
    { slug: 'substrate', name: 'Aquarium Substrate', emoji: '🪨', description: 'Gravel, sand, and soil compared. Best substrates for planted tanks.' },
    { slug: 'test-kits', name: 'Water Test Kits', emoji: '🧪', description: 'API Master Kit vs strips. How to test ammonia, nitrite, nitrate, and pH.' },
    { slug: 'air-pumps', name: 'Air Pumps & Airstones', emoji: '🫧', description: 'Quiet air pumps for sponge filters and aeration.' },
    { slug: 'co2', name: 'CO2 Systems', emoji: '🧬', description: 'Pressurized, paintball, and DIY CO2 for planted tanks.' },
    { slug: 'uv-sterilizers', name: 'UV Sterilizers', emoji: '☀️', description: 'When and how to use UV sterilizers for algae and disease control.' },
    { slug: 'gravel-vacuums', name: 'Gravel Vacuums & Water Changers', emoji: '🚿', description: 'Python water changers and manual siphons by tank size.' },
    { slug: 'water-conditioners', name: 'Water Conditioners', emoji: '💧', description: 'Seachem Prime and dechlorinator comparison.' },
  ];

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Equipment', href: '/equipment' },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Aquarium Equipment Reviews
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          In-depth reviews and buyer&apos;s guides for every piece of aquarium equipment.
          Find the best gear for your tank size and budget.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCategories.map((cat) => {
          const hasReview = reviews.some((r: any) => r.slug === cat.slug);
          return (
            <Link
              key={cat.slug}
              href={`/equipment/${cat.slug}`}
              className={`group block p-5 bg-white rounded-2xl border transition-all ${
                hasReview
                  ? 'border-gray-100 hover:shadow-md hover:border-ocean-200'
                  : 'border-dashed border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <h2 className="font-display font-bold text-gray-900 group-hover:text-ocean-700 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                  {!hasReview && (
                    <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-16 p-8 bg-ocean-50/50 rounded-2xl border border-ocean-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">
          More Aquarium Guides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Fish & Species Guide', href: '/fish' },
            { label: 'Aquarium Plants Guide', href: '/plants' },
            { label: 'Tank Sizes Guide', href: '/tank-sizes' },
            { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
            { label: 'Stocking Calculator', href: '/calculators/stocking' },
            { label: 'Compatibility Checker', href: '/compatibility' },
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
