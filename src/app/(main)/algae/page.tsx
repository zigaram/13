import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Aquarium Algae Control: Types, Treatment & Prevention',
  description: 'Identify every type of aquarium algae and learn how to eliminate it. Complete guides for BBA, hair algae, diatoms, green water, cyanobacteria, and more.',
  alternates: { canonical: getCanonicalUrl('/algae') },
};

export default function AlgaeIndexPage() {
  const guides = [
    { title: 'Algae Control Master Guide', description: 'Identify every algae type by appearance. Causes, treatments, and prevention for each. The complete reference.', href: '/algae/algae-control-guide', emoji: '🧬', readTime: '15 min' },
    { title: 'Best Algae Eaters', description: 'Fish, shrimp, and snails that eat algae. Which eater for which algae type. Stocking guide by tank size.', href: '/algae/best-algae-eaters', emoji: '🦐', readTime: '12 min' },
  ];

  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Algae Control', href: '/algae' }]} />
      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">Aquarium Algae Control</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl">Identify, treat, and prevent every type of aquarium algae. From brown diatoms to black beard algae — we cover them all.</p>
      </header>
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {guides.map((g) => (
          <Link key={g.href} href={g.href} className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-reef-200 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{g.emoji}</span>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-900 group-hover:text-reef-700 transition-colors">{g.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{g.description}</p>
                <span className="text-xs text-gray-400 mt-2 inline-block">{g.readTime} read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <section className="p-8 bg-reef-50/50 rounded-2xl border border-reef-100">
        <h2 className="font-display font-bold text-xl text-ocean-900 mb-4">Related Guides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Cloudy Water Fix', href: '/maintenance/cloudy-water' },
            { label: 'Aquarium Lights Guide', href: '/equipment/lights' },
            { label: 'UV Sterilizers', href: '/equipment/uv-sterilizers' },
            { label: 'Aquarium Plants', href: '/plants' },
            { label: 'Nitrogen Cycle Guide', href: '/water-chemistry/how-to-cycle-fish-tank' },
            { label: 'Water Test Kits', href: '/equipment/test-kits' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-ocean-600 hover:text-ocean-800 font-medium">→ {link.label}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
