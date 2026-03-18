import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllFish, getAllCompatibilityPairs } from '@/lib/data';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Fish Compatibility Checker: Can They Live Together? | World of Aquariums',
  description: 'Check if your fish are compatible tank mates. 1,378 species combinations with temperature, pH, and temperament analysis. Find safe community tank combinations.',
  alternates: { canonical: getCanonicalUrl('/compatibility') },
};

export default async function CompatibilityIndexPage() {
  const allFish = await getAllFish();
  const allPairs = await getAllCompatibilityPairs();

  // Group popular combos
  const popularFish = ['betta-fish', 'neon-tetra', 'goldfish', 'guppy', 'cherry-shrimp', 'corydoras-catfish', 'angelfish', 'oscar-fish'];

  const popularPairs = allPairs
    .filter((p: any) => popularFish.includes(p.fishA) || popularFish.includes(p.fishB))
    .sort((a: any, b: any) => {
      // Sort: yes first, then caution, then no
      const order = { yes: 0, caution: 1, no: 2 };
      return (order[a.compatible as keyof typeof order] || 0) - (order[b.compatible as keyof typeof order] || 0);
    })
    .slice(0, 30);

  const fishMap = Object.fromEntries(allFish.map((f) => [f.slug, f]));

  const statusEmoji = { yes: '✅', caution: '⚠️', no: '❌' };
  const statusBg = { yes: 'bg-reef-50 border-reef-100', caution: 'bg-amber-50 border-amber-100', no: 'bg-coral-50 border-coral-100' };

  // Stats
  const yesCount = allPairs.filter((p: any) => p.compatible === 'yes').length;
  const cautionCount = allPairs.filter((p: any) => p.compatible === 'caution').length;
  const noCount = allPairs.filter((p: any) => p.compatible === 'no').length;

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Compatibility', href: '/compatibility' }]} />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Fish Compatibility Checker
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Check if your fish can live together safely. {allPairs.length.toLocaleString()} species
          combinations analyzed for temperature, pH, temperament, and size compatibility.
        </p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-reef-500"></span> {yesCount} compatible</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> {cautionCount} caution</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-coral-500"></span> {noCount} incompatible</span>
        </div>
      </header>

      {/* Browse by species */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-2xl text-ocean-900 mb-5">Browse by Species</h2>
        <p className="text-sm text-gray-500 mb-4">Select a fish to see all its compatible and incompatible tank mates.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allFish
            .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
            .slice(0, 24)
            .map((fish) => {
              const pairsForFish = allPairs.filter((p: any) => p.fishA === fish.slug || p.fishB === fish.slug);
              const yesForFish = pairsForFish.filter((p: any) => p.compatible === 'yes').length;
              return (
                <div key={fish.slug} className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                  <Link href={`/fish/${fish.slug}`} className="font-display font-bold text-sm text-gray-900 hover:text-ocean-700 block">
                    {fish.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{yesForFish} compatible species</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pairsForFish
                      .filter((p: any) => p.compatible === 'yes')
                      .slice(0, 3)
                      .map((p: any) => {
                        const mate = p.fishA === fish.slug ? p.fishB : p.fishA;
                        return (
                          <Link
                            key={mate}
                            href={`/compatibility/${[fish.slug, mate].sort().join('-and-')}`}
                            className="text-xs text-reef-600 hover:text-reef-800 capitalize"
                          >
                            {mate.replace(/-/g, ' ')}
                          </Link>
                        );
                      })}
                    {yesForFish > 3 && <span className="text-xs text-gray-400">+{yesForFish - 3} more</span>}
                  </div>
                </div>
              );
            })}
        </div>
        <div className="text-center mt-6">
          <Link href="/fish" className="text-sm font-medium text-ocean-600 hover:text-ocean-800">
            View all 53 species →
          </Link>
        </div>
      </section>

      {/* Popular combinations */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-2xl text-ocean-900 mb-5">Popular Combinations</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularPairs.map((pair: any) => {
            const fA = fishMap[pair.fishA];
            const fB = fishMap[pair.fishB];
            if (!fA || !fB) return null;
            const bg = statusBg[pair.compatible as keyof typeof statusBg];
            return (
              <Link
                key={`${pair.fishA}-${pair.fishB}`}
                href={`/compatibility/${pair.fishA}-and-${pair.fishB}`}
                className={`group block p-4 rounded-xl border ${bg} hover:shadow-sm transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-ocean-700">
                      {fA.name} + {fB.name}
                    </span>
                  </div>
                  <span className="text-lg shrink-0 ml-2">
                    {statusEmoji[pair.compatible as keyof typeof statusEmoji]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pair.reason.split('.')[0]}.</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SEO internal linking */}
      <section className="p-8 bg-ocean-50/50 rounded-2xl border border-ocean-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">Related Resources</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Fish & Species Guide', href: '/fish' },
            { label: 'Tank Sizes Guide', href: '/tank-sizes' },
            { label: 'Best Aquarium Filters', href: '/equipment/filters' },
            { label: 'Best Aquarium Heaters', href: '/equipment/heaters' },
            { label: 'Fish Diseases Guide', href: '/diseases' },
            { label: 'Beginner Guide', href: '/guides/beginner-guide' },
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
