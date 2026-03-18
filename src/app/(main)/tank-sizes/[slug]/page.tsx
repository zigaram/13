import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTankSizeBySlug, getAllTankSizes } from '@/lib/data';
import { JsonLd, generateArticleSchema, getCanonicalUrl } from '@/lib/seo';
import { getTankSizeRelatedLinks, getAdjacentTankSizes, buildBreadcrumbs } from '@/lib/links';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { RelatedLinks } from '@/components/content/RelatedLinks';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const tanks = await getAllTankSizes();
  return tanks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tank = await getTankSizeBySlug(params.slug);
  if (!tank) return {};

  return {
    title: tank.metaTitle,
    description: tank.metaDescription,
    alternates: { canonical: getCanonicalUrl(`/tank-sizes/${tank.slug}`) },
    openGraph: {
      title: tank.metaTitle,
      description: tank.metaDescription,
      url: getCanonicalUrl(`/tank-sizes/${tank.slug}`),
      type: 'article',
    },
  };
}

export default async function TankSizePage({ params }: Props) {
  const tank = await getTankSizeBySlug(params.slug);
  if (!tank) notFound();

  const relatedLinks = getTankSizeRelatedLinks(tank);
  const adjacentTanks = await getAdjacentTankSizes(tank, 4);
  const breadcrumbs = buildBreadcrumbs([
    { label: 'Tank Sizes', href: '/tank-sizes' },
    { label: tank.name, href: `/tank-sizes/${tank.slug}` },
  ]);

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: tank.metaTitle,
          description: tank.metaDescription,
          url: getCanonicalUrl(`/tank-sizes/${tank.slug}`),
          imageUrl: `/images/tanks/${tank.slug}.svg`,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'World of Aquariums',
        })}
      />

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mb-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ocean-50">
                <img
                  src={`/images/tanks/${tank.slug}.svg`}
                  alt={tank.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            <div className="lg:w-3/5">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
                {tank.name}
              </h1>

              {/* Dimensions table */}
              <div className="mt-4 space-y-2">
                {tank.dimensions.map((dim) => (
                  <div key={dim.label} className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">{dim.label}:</span>
                    <span className="text-gray-800">
                      {dim.length}&quot; × {dim.width}&quot; × {dim.height}&quot;
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <StatBox label="Volume" value={`${tank.gallons} gallons`} />
                <StatBox label="Empty Weight" value={`${tank.weight.empty} lbs`} />
                <StatBox label="Filled Weight" value={`${tank.weight.filled} lbs`} />
                <StatBox label="Filter" value={tank.recommendedFilter.split('(')[0].trim()} />
                <StatBox label="Heater" value={tank.recommendedHeater.split('(')[0].trim()} />
                <StatBox label="Ideal For" value={tank.idealFor[0]} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex gap-12 lg:gap-16">
          <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
            <div className="ad-slot" data-ad-slot="tank-top">Ad</div>

            <div className="article-content">
              <div dangerouslySetInnerHTML={{ __html: tank.careGuide }} />

              {/* Recommended fish with internal links */}
              {tank.recommendedFish.length > 0 && (
                <>
                  <h2 id="recommended-species">Recommended Species</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 not-prose">
                    {tank.recommendedFish.map((slug) => (
                      <Link
                        key={slug}
                        href={`/fish/${slug}`}
                        className="p-3 rounded-lg border border-ocean-100 bg-ocean-50/50 text-sm font-medium text-ocean-700 hover:bg-ocean-100 transition-colors capitalize"
                      >
                        🐟 {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="ad-slot" data-ad-slot="tank-bottom">Ad</div>
          </div>

          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-6">
              <nav className="p-4 bg-gray-50 rounded-xl">
                <p className="font-display font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">
                  On This Page
                </p>
                <ul className="space-y-1 text-sm">
                  {['Overview', 'Best Fish', 'Equipment', 'Setup', 'Maintenance', 'FAQ'].map((section) => (
                    <li key={section}>
                      <a
                        href={`#${section.toLowerCase().replace(/ /g, '-')}`}
                        className="text-gray-400 hover:text-ocean-600 block py-0.5 transition-colors"
                      >
                        {section}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Adjacent tank sizes */}
              <RelatedLinks
                links={adjacentTanks}
                title="Other Tank Sizes"
                maxLinks={4}
                variant="gray"
              />

              {/* Related resources */}
              <RelatedLinks
                links={relatedLinks}
                title="Related Resources"
                maxLinks={8}
                variant="ocean"
              />

              <div className="ad-slot-sidebar" data-ad-slot="tank-sidebar">Ad</div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl">
      <p className="text-2xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
