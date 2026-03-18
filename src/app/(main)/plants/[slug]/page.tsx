import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlantBySlug, getPlantSlugs } from '@/lib/data';
import { JsonLd, generateArticleSchema, getCanonicalUrl } from '@/lib/seo';
import { getPlantRelatedLinks, getPlantSimilarSpecies, buildBreadcrumbs } from '@/lib/links';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { RelatedLinks, SimilarSpecies } from '@/components/content/RelatedLinks';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getPlantSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const plant = await getPlantBySlug(params.slug);
  if (!plant) return {};

  return {
    title: plant.metaTitle,
    description: plant.metaDescription,
    alternates: { canonical: getCanonicalUrl(`/plants/${plant.slug}`) },
    openGraph: {
      title: plant.metaTitle,
      description: plant.metaDescription,
      url: getCanonicalUrl(`/plants/${plant.slug}`),
      images: [{ url: plant.imageUrl }],
      type: 'article',
    },
  };
}

export default async function PlantSpeciesPage({ params }: Props) {
  const plant = await getPlantBySlug(params.slug);
  if (!plant) notFound();

  const relatedLinks = getPlantRelatedLinks(plant);
  const similarPlants = await getPlantSimilarSpecies(plant, 6);
  const breadcrumbs = buildBreadcrumbs([
    { label: 'Aquarium Plants', href: '/plants' },
    { label: plant.name, href: `/plants/${plant.slug}` },
  ]);

  const careLevelVariant =
    plant.careLevel === 'easy' ? 'easy' :
    plant.careLevel === 'moderate' ? 'moderate' : 'hard';

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: plant.metaTitle,
          description: plant.metaDescription,
          url: getCanonicalUrl(`/plants/${plant.slug}`),
          imageUrl: plant.imageUrl,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'World of Aquariums',
        })}
      />

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Plant header */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Image */}
            <div className="lg:w-2/5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-reef-50">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {/* Info */}
            <div className="lg:w-3/5">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
                {plant.name}
              </h1>
              <p className="text-lg text-gray-500 italic mt-1">{plant.scientificName}</p>

              {/* Quick spec badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`spec-badge spec-badge-${careLevelVariant}`}>
                  {plant.careLevel}
                </span>
                <span className="spec-badge bg-gray-100 text-gray-700">
                  {plant.lightRequirement} light
                </span>
                <span className="spec-badge bg-gray-100 text-gray-700">
                  {plant.growthRate} growth
                </span>
                {plant.co2Required && (
                  <span className="spec-badge bg-coral-100 text-coral-700">CO2 required</span>
                )}
                {!plant.co2Required && plant.co2Recommended && (
                  <span className="spec-badge bg-amber-100 text-amber-700">CO2 recommended</span>
                )}
                {!plant.co2Required && !plant.co2Recommended && (
                  <span className="spec-badge bg-reef-100 text-reef-700">No CO2 needed</span>
                )}
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <StatBox label="Category" value={plant.category} />
                <StatBox label="Placement" value={plant.placement} />
                <StatBox label="Temperature" value={`${plant.temperature.min}–${plant.temperature.max}°F`} />
                <StatBox label="pH Range" value={`${plant.ph.min}–${plant.ph.max}`} />
                <StatBox label="Propagation" value={plant.propagation.split('—')[0].trim()} />
                <StatBox label="Substrate" value={plant.substrate.split('—')[0].trim()} />
              </div>
            </div>
          </div>
        </header>

        {/* Content grid */}
        <div className="flex gap-12 lg:gap-16">
          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
            <div className="ad-slot" data-ad-slot="plant-top">Ad</div>

            <div className="article-content">
              {/* Render full care guide HTML from data */}
              <div dangerouslySetInnerHTML={{ __html: plant.careGuide }} />
            </div>

            <div className="ad-slot" data-ad-slot="plant-bottom">Ad</div>
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
                  {['Overview', 'Planting', 'Lighting', 'Water Parameters', 'CO2 & Fertilization', 'Propagation', 'Common Problems', 'FAQ'].map((section) => (
                    <li key={section}>
                      <a
                        href={`#${section.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                        className="text-gray-400 hover:text-ocean-600 block py-0.5 transition-colors"
                      >
                        {section}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Plant specs card */}
              <div className="p-4 bg-reef-50/50 rounded-xl border border-reef-100">
                <p className="font-display font-semibold text-xs text-reef-700 uppercase tracking-wider mb-3">
                  Quick Specs
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Light</dt>
                    <dd className="font-medium text-gray-700 capitalize">{plant.lightRequirement}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">CO2</dt>
                    <dd className="font-medium text-gray-700">
                      {plant.co2Required ? 'Required' : plant.co2Recommended ? 'Recommended' : 'Not needed'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Growth</dt>
                    <dd className="font-medium text-gray-700 capitalize">{plant.growthRate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Placement</dt>
                    <dd className="font-medium text-gray-700 capitalize">{plant.placement}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Difficulty</dt>
                    <dd className="font-medium text-gray-700 capitalize">{plant.careLevel}</dd>
                  </div>
                </dl>
              </div>

              {/* Similar plants with thumbnails */}
              <SimilarSpecies
                species={similarPlants}
                title="Similar Plants"
                imageBasePath="/images/plants"
              />

              {/* Related links */}
              <RelatedLinks
                links={relatedLinks}
                title="Related Resources"
                maxLinks={8}
                variant="reef"
              />

              <div className="ad-slot-sidebar" data-ad-slot="plant-sidebar">Ad</div>
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
      <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{value}</p>
    </div>
  );
}
