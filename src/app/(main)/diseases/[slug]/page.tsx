import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDiseaseBySlug, getAllDiseases } from '@/lib/data';
import { JsonLd, generateArticleSchema, generateFAQSchema, getCanonicalUrl } from '@/lib/seo';
import { buildBreadcrumbs } from '@/lib/links';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const diseases = await getAllDiseases();
  return diseases.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const disease = await getDiseaseBySlug(params.slug);
  if (!disease) return {};

  return {
    title: disease.metaTitle,
    description: disease.metaDescription,
    alternates: { canonical: getCanonicalUrl(`/diseases/${disease.slug}`) },
    openGraph: {
      title: disease.metaTitle,
      description: disease.metaDescription,
      url: getCanonicalUrl(`/diseases/${disease.slug}`),
      type: 'article',
    },
  };
}

export default async function DiseasePage({ params }: Props) {
  const disease = await getDiseaseBySlug(params.slug);
  if (!disease) notFound();

  const breadcrumbs = buildBreadcrumbs([
    { label: 'Fish Diseases', href: '/diseases' },
    { label: disease.name, href: `/diseases/${disease.slug}` },
  ]);

  const severityVariant =
    disease.severity === 'mild' ? 'easy' :
    disease.severity === 'moderate' ? 'moderate' : 'hard';

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: disease.metaTitle,
          description: disease.metaDescription,
          url: getCanonicalUrl(`/diseases/${disease.slug}`),
          imageUrl: disease.imageUrl,
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
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-coral-50">
                <div className="absolute inset-0 flex items-center justify-center text-coral-300 text-6xl">
                  🩺
                </div>
              </div>
            </div>

            <div className="lg:w-3/5">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
                {disease.name}
              </h1>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`spec-badge spec-badge-${severityVariant}`}>
                  {disease.severity} severity
                </span>
                <span className="spec-badge bg-gray-100 text-gray-700">
                  {disease.type}
                </span>
                <span className="spec-badge bg-gray-100 text-gray-700">
                  {disease.affectedSpecies === 'both' ? 'freshwater & saltwater' : disease.affectedSpecies}
                </span>
                {disease.quarantineDays > 0 && (
                  <span className="spec-badge bg-amber-100 text-amber-700">
                    {disease.quarantineDays}-day treatment
                  </span>
                )}
              </div>

              <p className="text-gray-600 mt-4">{disease.description}</p>

              {/* Quick symptoms */}
              {disease.symptoms.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-coral-600 uppercase tracking-wider mb-2">Key Symptoms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {disease.symptoms.slice(0, 5).map((s) => (
                      <span key={s} className="text-xs bg-coral-50 text-coral-700 px-2 py-1 rounded-lg">
                        {s.split(' — ')[0].split('(')[0].trim().length > 50
                          ? s.split(' — ')[0].split('(')[0].trim().substring(0, 47) + '...'
                          : s.split(' — ')[0].split('(')[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex gap-12 lg:gap-16">
          <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
            <div className="ad-slot" data-ad-slot="disease-top">Ad</div>

            {/* Symptoms detail */}
            {disease.symptoms.length > 0 && (
              <div className="mb-8 p-6 bg-coral-50/50 rounded-2xl border border-coral-100">
                <h2 className="font-display font-bold text-lg text-coral-900 mb-3">Symptoms to Watch For</h2>
                <ul className="space-y-2">
                  {disease.symptoms.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-coral-800">
                      <span className="text-coral-500 shrink-0 mt-0.5">●</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Causes */}
            {disease.causes.length > 0 && (
              <div className="mb-8 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                <h2 className="font-display font-bold text-lg text-amber-900 mb-3">Common Causes</h2>
                <ul className="space-y-2">
                  {disease.causes.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-amber-800">
                      <span className="text-amber-500 shrink-0 mt-0.5">▸</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main treatment content */}
            <div className="article-content">
              <div dangerouslySetInnerHTML={{ __html: disease.treatment }} />
            </div>

            {/* Medications summary */}
            {disease.medications.length > 0 && (
              <div className="mt-8 p-6 bg-ocean-50/50 rounded-2xl border border-ocean-100 not-prose">
                <h2 className="font-display font-bold text-lg text-ocean-900 mb-3">Medications & Treatments</h2>
                <div className="flex flex-wrap gap-2">
                  {disease.medications.map((m) => (
                    <span key={m} className="text-sm bg-white border border-ocean-200 text-ocean-700 px-3 py-1.5 rounded-lg">
                      💊 {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prevention */}
            {disease.prevention.length > 0 && (
              <div className="mt-8 p-6 bg-reef-50/50 rounded-2xl border border-reef-100 not-prose">
                <h2 className="font-display font-bold text-lg text-reef-900 mb-3">Prevention Checklist</h2>
                <ul className="space-y-2">
                  {disease.prevention.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-reef-800">
                      <span className="text-reef-500 shrink-0">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="ad-slot" data-ad-slot="disease-bottom">Ad</div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-6">
              <div className="p-4 bg-coral-50 rounded-xl border border-coral-100">
                <p className="font-display font-semibold text-xs text-coral-700 uppercase tracking-wider mb-2">
                  Quick Facts
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Type</dt>
                    <dd className="font-medium text-gray-700 capitalize">{disease.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Severity</dt>
                    <dd className="font-medium text-gray-700 capitalize">{disease.severity}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Treatment</dt>
                    <dd className="font-medium text-gray-700">{disease.quarantineDays} days</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Affects</dt>
                    <dd className="font-medium text-gray-700 capitalize">{disease.affectedSpecies}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
                <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-2">
                  Essential Equipment
                </p>
                <ul className="space-y-2">
                  {[
                    { href: '/equipment/test-kits', text: 'Water Test Kits' },
                    { href: '/equipment/water-conditioners', text: 'Water Conditioners' },
                    { href: '/equipment/filters', text: 'Aquarium Filters' },
                    { href: '/equipment/heaters', text: 'Aquarium Heaters' },
                    { href: '/equipment/uv-sterilizers', text: 'UV Sterilizers' },
                    { href: '/equipment/air-pumps', text: 'Air Pumps' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-ocean-600 hover:text-ocean-800 transition-colors block">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ad-slot-sidebar" data-ad-slot="disease-sidebar">Ad</div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
