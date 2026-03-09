import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFishBySlug, getFishSlugs } from '@/lib/data';
import { JsonLd, generateArticleSchema, getCanonicalUrl } from '@/lib/seo';
import { getFishRelatedLinks, buildBreadcrumbs } from '@/lib/links';
import { siteConfig } from '@/types';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getFishSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fish = await getFishBySlug(params.slug);
  if (!fish) return {};

  return {
    title: fish.metaTitle,
    description: fish.metaDescription,
    alternates: { canonical: getCanonicalUrl(`/fish/${fish.slug}`) },
    openGraph: {
      title: fish.metaTitle,
      description: fish.metaDescription,
      url: getCanonicalUrl(`/fish/${fish.slug}`),
      images: [{ url: fish.imageUrl }],
      type: 'article',
    },
  };
}

export default async function FishSpeciesPage({ params }: Props) {
  const fish = await getFishBySlug(params.slug);
  if (!fish) notFound();

  const relatedLinks = getFishRelatedLinks(fish);
  const breadcrumbs = buildBreadcrumbs([
    { label: 'Fish & Species', href: '/fish' },
    { label: fish.name, href: `/fish/${fish.slug}` },
  ]);

  const careLevelVariant =
    fish.careLevel === 'beginner' ? 'easy' :
    fish.careLevel === 'intermediate' ? 'moderate' : 'hard';

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: fish.metaTitle,
          description: fish.metaDescription,
          url: getCanonicalUrl(`/fish/${fish.slug}`),
          imageUrl: fish.imageUrl,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'World of Aquariums',
        })}
      />

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Species header */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Image */}
            <div className="lg:w-2/5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ocean-50">
                {/* Image component would go here */}
                <div className="absolute inset-0 flex items-center justify-center text-ocean-300 text-6xl">
                  🐠
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="lg:w-3/5">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
                {fish.name}
              </h1>
              <p className="text-lg text-gray-500 italic mt-1">{fish.scientificName}</p>

              {/* Quick spec badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`spec-badge spec-badge-${careLevelVariant}`}>
                  {fish.careLevel}
                </span>
                <span className="spec-badge bg-gray-100 text-gray-700">
                  {fish.temperament}
                </span>
                <span className="spec-badge bg-ocean-100 text-ocean-700">
                  {fish.category}
                </span>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <StatBox label="Min Tank Size" value={`${fish.minTankSize} gal`} />
                <StatBox label="Max Size" value={`${fish.maxSize}"`} />
                <StatBox label="Temperature" value={`${fish.temperature.min}–${fish.temperature.max}°F`} />
                <StatBox label="pH Range" value={`${fish.ph.min}–${fish.ph.max}`} />
                <StatBox label="Lifespan" value={fish.lifespan} />
                <StatBox label="Diet" value={fish.diet} />
              </div>
            </div>
          </div>
        </header>

        {/* Content grid */}
        <div className="flex gap-12 lg:gap-16">
          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
            <div className="ad-slot" data-ad-slot="species-top">Ad</div>

            <div className="article-content">
              {/* Render full care guide HTML from data */}
              <div dangerouslySetInnerHTML={{ __html: fish.careGuide }} />

              {/* Tank mates section (always show, with internal links) */}
              {fish.compatibleWith.length > 0 && (
                <>
                  <h2 id="compatible-tank-mates">Compatible Tank Mates</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 not-prose">
                    {fish.compatibleWith.map((slug) => (
                      <Link
                        key={slug}
                        href={`/fish/${slug}`}
                        className="p-3 rounded-lg border border-reef-100 bg-reef-50/50 text-sm font-medium text-reef-700 hover:bg-reef-100 transition-colors capitalize"
                      >
                        ✓ {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {fish.incompatibleWith.length > 0 && (
                <>
                  <h3>Avoid Keeping With</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 not-prose">
                    {fish.incompatibleWith.map((slug) => (
                      <Link
                        key={slug}
                        href={`/fish/${slug}`}
                        className="p-3 rounded-lg border border-coral-100 bg-coral-50/50 text-sm font-medium text-coral-700 hover:bg-coral-100 transition-colors capitalize"
                      >
                        ✗ {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="ad-slot" data-ad-slot="species-bottom">Ad</div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Quick nav */}
              <nav className="p-4 bg-gray-50 rounded-xl">
                <p className="font-display font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">
                  On This Page
                </p>
                <ul className="space-y-1 text-sm">
                  {['Overview', 'Tank Requirements', 'Water Parameters', 'Tank Mates', 'Care Guide'].map((section) => (
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

              {/* Related links */}
              <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
                <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">
                  Related
                </p>
                <ul className="space-y-2">
                  {relatedLinks.slice(0, 6).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ocean-600 hover:text-ocean-800 transition-colors block"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ad-slot-sidebar" data-ad-slot="species-sidebar">Ad</div>
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
