import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllDiseases } from '@/lib/data';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Aquarium Fish Diseases: Symptoms, Treatment & Prevention',
  description: 'Identify and treat common aquarium fish diseases including ich, fin rot, dropsy, swim bladder disease, and velvet. Step-by-step treatment guides with medication recommendations.',
  alternates: { canonical: getCanonicalUrl('/diseases') },
};

export default async function DiseasesIndexPage() {
  const allDiseases = await getAllDiseases();

  const parasitic = allDiseases.filter((d) => d.type === 'parasitic');
  const bacterial = allDiseases.filter((d) => d.type === 'bacterial');
  const environmental = allDiseases.filter((d) => d.type === 'environmental');
  const fungal = allDiseases.filter((d) => d.type === 'fungal');

  const sections = [
    { title: 'Parasitic Diseases', emoji: '🦠', items: parasitic },
    { title: 'Bacterial Infections', emoji: '🧫', items: bacterial },
    { title: 'Environmental & Nutritional', emoji: '⚠️', items: environmental },
    { title: 'Fungal Infections', emoji: '🍄', items: fungal },
  ].filter((s) => s.items.length > 0);

  const severityVariant = (severity: string) =>
    severity === 'mild' ? 'easy' :
    severity === 'moderate' ? 'moderate' :
    severity === 'severe' ? 'hard' : 'hard';

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Fish Diseases', href: '/diseases' },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
          Aquarium Fish Diseases
        </h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">
          Identify symptoms, understand causes, and follow step-by-step treatment guides
          for every common aquarium disease. Early detection saves lives.
        </p>
      </header>

      {/* Emergency banner */}
      <div className="p-5 bg-coral-50 border border-coral-200 rounded-2xl mb-10">
        <p className="font-display font-bold text-coral-800 mb-2">🚨 Fish Emergency?</p>
        <p className="text-sm text-coral-700">
          If your fish is showing symptoms right now: <strong>1)</strong> Test your water immediately
          with a <Link href="/equipment/test-kits" className="underline">test kit</Link>. <strong>2)</strong> Perform
          a 50% water change with <Link href="/equipment/water-conditioners" className="underline">conditioned water</Link>.
          <strong>3)</strong> Find your disease below for specific treatment. Poor water quality is the
          #1 cause of fish disease.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="mb-12">
          <h2 className="font-display font-bold text-2xl text-ocean-900 mb-5">
            {section.emoji} {section.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items
              .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
              .map((disease) => (
                <Link
                  key={disease.slug}
                  href={`/diseases/${disease.slug}`}
                  className="group block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-coral-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-bold text-gray-900 group-hover:text-coral-700 transition-colors">
                      {disease.name}
                    </h3>
                    <span className={`spec-badge spec-badge-${severityVariant(disease.severity)} shrink-0`}>
                      {disease.severity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="spec-badge bg-gray-100 text-gray-600">
                      {disease.type}
                    </span>
                    <span className="spec-badge bg-gray-100 text-gray-600">
                      {disease.affectedSpecies}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {disease.description}
                  </p>

                  {disease.symptoms.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      Key symptoms: {disease.symptoms.slice(0, 2).map(s =>
                        s.split(' — ')[0].split('(')[0].trim().toLowerCase()
                      ).join(', ')}
                    </div>
                  )}
                </Link>
              ))}
          </div>
        </section>
      ))}

      <section className="mt-16 p-8 bg-ocean-50/50 rounded-2xl border border-ocean-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">
          Prevention Is the Best Medicine
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Water Test Kits', href: '/equipment/test-kits' },
            { label: 'Aquarium Filters', href: '/equipment/filters' },
            { label: 'Water Conditioners', href: '/equipment/water-conditioners' },
            { label: 'Fish & Species Guide', href: '/fish' },
            { label: 'Tank Sizes Guide', href: '/tank-sizes' },
            { label: 'UV Sterilizers', href: '/equipment/uv-sterilizers' },
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
