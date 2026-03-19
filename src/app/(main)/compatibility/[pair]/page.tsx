import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCompatibilityByPair, getCompatibilityPairSlugs, getFishBySlug } from '@/lib/data';
import { JsonLd, generateArticleSchema, getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

interface Props {
  params: { pair: string };
}

export async function generateStaticParams() {
  const slugs = await getCompatibilityPairSlugs();
  return slugs.map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const compat = await getCompatibilityByPair(params.pair);
  if (!compat) return {};

  const fishA = await getFishBySlug(compat.fishA);
  const fishB = await getFishBySlug(compat.fishB);
  if (!fishA || !fishB) return {};

  const status = compat.compatible === 'yes' ? 'Yes!' : compat.compatible === 'no' ? 'No' : 'With Caution';
  const title = `Can ${fishA.name} Live With ${fishB.name}? ${status} | World of Aquariums`;
  const desc = `Can ${fishA.name} and ${fishB.name} live together? ${compat.reason.substring(0, 140)}`;

  return {
    title,
    description: desc,
    alternates: { canonical: getCanonicalUrl(`/compatibility/${params.pair}`) },
    openGraph: { title, description: desc, url: getCanonicalUrl(`/compatibility/${params.pair}`) },
  };
}

export default async function CompatibilityPairPage({ params }: Props) {
  const compat = await getCompatibilityByPair(params.pair);
  if (!compat) notFound();

  const fishA = await getFishBySlug(compat.fishA);
  const fishB = await getFishBySlug(compat.fishB);
  if (!fishA || !fishB) notFound();

  const statusConfig = {
    yes: { label: 'Compatible', color: 'reef', bg: 'bg-reef-50', border: 'border-reef-200', text: 'text-reef-800', badge: 'spec-badge-easy', emoji: '✅' },
    caution: { label: 'Caution', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'spec-badge-moderate', emoji: '⚠️' },
    no: { label: 'Not Compatible', color: 'coral', bg: 'bg-coral-50', border: 'border-coral-200', text: 'text-coral-800', badge: 'spec-badge-hard', emoji: '❌' },
  };
  const cfg = statusConfig[compat.compatible as keyof typeof statusConfig];

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Compatibility', href: '/compatibility' },
    { name: `${fishA.name} & ${fishB.name}`, href: `/compatibility/${params.pair}` },
  ];

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: `Can ${fishA.name} Live With ${fishB.name}?`,
          description: compat.reason,
          url: getCanonicalUrl(`/compatibility/${params.pair}`),
          imageUrl: '/images/og-default.svg',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'World of Aquariums',
        })}
      />

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Main verdict */}
        <header className="mb-10">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
            Can {fishA.name} Live With {fishB.name}?
          </h1>

          <div className={`mt-6 p-6 ${cfg.bg} ${cfg.border} border rounded-2xl`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{cfg.emoji}</span>
              <span className={`spec-badge ${cfg.badge} text-lg`}>{cfg.label}</span>
            </div>
            <p className={`${cfg.text} text-base leading-relaxed`}>{compat.reason}</p>
            {compat.conditions && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                <strong>Conditions:</strong> {compat.conditions}
              </p>
            )}
          </div>
        </header>

        <div className="flex gap-12 lg:gap-16">
          <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
            <div className="ad-slot" data-ad-slot="compat-top">Ad</div>

            {/* Parameter comparison */}
            <section className="mb-10">
              <h2 className="font-display font-bold text-2xl text-ocean-900 mb-5">
                Parameter Comparison
              </h2>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="overflow-hidden rounded-2xl border border-gray-100 min-w-[480px] sm:min-w-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-display font-semibold text-gray-500 uppercase text-xs tracking-wider">Parameter</th>
                      <th className="text-center p-4 font-display font-semibold text-ocean-700">
                        <Link href={`/fish/${fishA.slug}`} className="hover:underline">{fishA.name}</Link>
                      </th>
                      <th className="text-center p-4 font-display font-semibold text-ocean-700">
                        <Link href={`/fish/${fishB.slug}`} className="hover:underline">{fishB.name}</Link>
                      </th>
                      <th className="text-center p-4 font-display font-semibold text-gray-500 uppercase text-xs">Overlap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Temperature</td>
                      <td className="p-4 text-center">{fishA.temperature.min}–{fishA.temperature.max}°F</td>
                      <td className="p-4 text-center">{fishB.temperature.min}–{fishB.temperature.max}°F</td>
                      <td className="p-4 text-center font-medium">
                        {compat.temperatureOverlap
                          ? <span className="text-reef-700">{compat.temperatureOverlap.min}–{compat.temperatureOverlap.max}°F ✓</span>
                          : <span className="text-coral-600">No overlap ✗</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700">pH Range</td>
                      <td className="p-4 text-center">{fishA.ph.min}–{fishA.ph.max}</td>
                      <td className="p-4 text-center">{fishB.ph.min}–{fishB.ph.max}</td>
                      <td className="p-4 text-center font-medium">
                        {compat.phOverlap
                          ? <span className="text-reef-700">{compat.phOverlap.min}–{compat.phOverlap.max} ✓</span>
                          : <span className="text-coral-600">No overlap ✗</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Temperament</td>
                      <td className="p-4 text-center capitalize">{fishA.temperament}</td>
                      <td className="p-4 text-center capitalize">{fishB.temperament}</td>
                      <td className="p-4 text-center font-medium">
                        {fishA.temperament === 'peaceful' && fishB.temperament === 'peaceful'
                          ? <span className="text-reef-700">Both peaceful ✓</span>
                          : fishA.temperament === 'aggressive' || fishB.temperament === 'aggressive'
                          ? <span className="text-coral-600">Aggression risk ✗</span>
                          : <span className="text-amber-600">Monitor ⚠</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Max Size</td>
                      <td className="p-4 text-center">{fishA.maxSize}&quot;</td>
                      <td className="p-4 text-center">{fishB.maxSize}&quot;</td>
                      <td className="p-4 text-center font-medium">
                        {Math.max(fishA.maxSize, fishB.maxSize) <= 3 * Math.min(fishA.maxSize, fishB.maxSize)
                          ? <span className="text-reef-700">Similar ✓</span>
                          : <span className="text-coral-600">Size mismatch ✗</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Min Tank Size</td>
                      <td className="p-4 text-center">{fishA.minTankSize} gal</td>
                      <td className="p-4 text-center">{fishB.minTankSize} gal</td>
                      <td className="p-4 text-center font-medium text-ocean-700">
                        {compat.minTankSize} gal minimum together
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Diet</td>
                      <td className="p-4 text-center text-xs">{fishA.diet.split('—')[0].trim()}</td>
                      <td className="p-4 text-center text-xs">{fishB.diet.split('—')[0].trim()}</td>
                      <td className="p-4 text-center text-gray-400 text-xs">—</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Care Level</td>
                      <td className="p-4 text-center capitalize">{fishA.careLevel}</td>
                      <td className="p-4 text-center capitalize">{fishB.careLevel}</td>
                      <td className="p-4 text-center text-gray-400 text-xs">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              </div>
            </section>

            {/* Tank size recommendation */}
            {compat.compatible !== 'no' && (
              <section className="mb-10 p-6 bg-ocean-50/50 rounded-2xl border border-ocean-100">
                <h2 className="font-display font-bold text-lg text-ocean-900 mb-3">
                  Tank Requirements for {fishA.name} + {fishB.name}
                </h2>
                <p className="text-gray-700">
                  To keep {fishA.name} and {fishB.name} together, you need at minimum a{' '}
                  <Link href={`/tank-sizes/${compat.minTankSize}-gallon-fish-tank`} className="font-semibold text-ocean-600 hover:underline">
                    {compat.minTankSize} gallon tank
                  </Link>.
                  {fishA.schooling && ` ${fishA.name} should be kept in a school of ${fishA.minSchoolSize || 6}+.`}
                  {fishB.schooling && ` ${fishB.name} should be kept in a school of ${fishB.minSchoolSize || 6}+.`}
                  {' '}Provide adequate <Link href="/equipment/filters" className="text-ocean-600 hover:underline">filtration</Link>,{' '}
                  stable temperature with a <Link href="/equipment/heaters" className="text-ocean-600 hover:underline">heater</Link>,{' '}
                  and hiding spots to reduce stress.
                </p>
              </section>
            )}

            {/* Species cards */}
            <section className="mb-10">
              <h2 className="font-display font-bold text-2xl text-ocean-900 mb-5">Species Profiles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[fishA, fishB].map((fish) => (
                  <Link
                    key={fish.slug}
                    href={`/fish/${fish.slug}`}
                    className="group block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-ocean-200 transition-all"
                  >
                    <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-ocean-700 transition-colors">
                      {fish.name}
                    </h3>
                    <p className="text-sm text-gray-400 italic">{fish.scientificName}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`spec-badge spec-badge-${fish.careLevel === 'beginner' ? 'easy' : fish.careLevel === 'intermediate' ? 'moderate' : 'hard'}`}>
                        {fish.careLevel}
                      </span>
                      <span className="spec-badge bg-gray-100 text-gray-600">{fish.temperament}</span>
                      <span className="spec-badge bg-gray-100 text-gray-600">{fish.minTankSize}+ gal</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">{fish.description}</p>
                    <span className="text-sm font-medium text-ocean-600 mt-2 inline-block group-hover:underline">
                      Full care guide →
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Other compatible species */}
            <section className="mb-10">
              <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">
                Other Compatible Tank Mates
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">For {fishA.name}:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {fishA.compatibleWith.filter((s: string) => s !== fishB.slug).slice(0, 6).map((slug: string) => (
                      <Link key={slug} href={`/fish/${slug}`} className="text-xs bg-reef-50 text-reef-700 px-2 py-1 rounded-lg hover:bg-reef-100 capitalize">
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">For {fishB.name}:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {fishB.compatibleWith.filter((s: string) => s !== fishA.slug).slice(0, 6).map((slug: string) => (
                      <Link key={slug} href={`/fish/${slug}`} className="text-xs bg-reef-50 text-reef-700 px-2 py-1 rounded-lg hover:bg-reef-100 capitalize">
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="ad-slot" data-ad-slot="compat-bottom">Ad</div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-6">
              <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
                <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">
                  Quick Links
                </p>
                <ul className="space-y-2">
                  <li><Link href={`/fish/${fishA.slug}`} className="text-sm text-ocean-600 hover:text-ocean-800 block">{fishA.name} Care Guide</Link></li>
                  <li><Link href={`/fish/${fishB.slug}`} className="text-sm text-ocean-600 hover:text-ocean-800 block">{fishB.name} Care Guide</Link></li>
                  <li><Link href="/compatibility" className="text-sm text-ocean-600 hover:text-ocean-800 block">Compatibility Checker</Link></li>
                  <li><Link href="/tank-sizes" className="text-sm text-ocean-600 hover:text-ocean-800 block">Tank Sizes Guide</Link></li>
                  <li><Link href="/equipment/filters" className="text-sm text-ocean-600 hover:text-ocean-800 block">Best Filters</Link></li>
                  <li><Link href="/equipment/heaters" className="text-sm text-ocean-600 hover:text-ocean-800 block">Best Heaters</Link></li>
                  <li><Link href="/diseases" className="text-sm text-ocean-600 hover:text-ocean-800 block">Fish Diseases</Link></li>
                </ul>
              </div>
              <div className="ad-slot-sidebar" data-ad-slot="compat-sidebar">Ad</div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
