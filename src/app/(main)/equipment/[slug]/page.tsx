import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEquipmentReviewBySlug, getAllEquipmentReviews } from '@/lib/data';
import { JsonLd, generateProductReviewSchema, generateFAQSchema, getCanonicalUrl } from '@/lib/seo';
import { buildBreadcrumbs } from '@/lib/links';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { RelatedLinks } from '@/components/content/RelatedLinks';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const reviews = await getAllEquipmentReviews();
  return reviews.map((r: any) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const review = await getEquipmentReviewBySlug(params.slug);
  if (!review) return {};

  return {
    title: review.metaTitle,
    description: review.metaDescription,
    alternates: { canonical: getCanonicalUrl(`/equipment/${review.slug}`) },
    openGraph: {
      title: review.metaTitle,
      description: review.metaDescription,
      url: getCanonicalUrl(`/equipment/${review.slug}`),
      type: 'article',
    },
  };
}

export default async function EquipmentReviewPage({ params }: Props) {
  const review = await getEquipmentReviewBySlug(params.slug);
  if (!review) notFound();

  const breadcrumbs = buildBreadcrumbs([
    { label: 'Equipment', href: '/equipment' },
    { label: review.title.replace(/Best |in 2025.*$/g, '').trim(), href: `/equipment/${review.slug}` },
  ]);

  const ratingVariant = (rating: number) =>
    rating >= 4.5 ? 'easy' : rating >= 4.0 ? 'moderate' : 'hard';

  return (
    <>
      {/* Product Review Schema */}
      <JsonLd
        data={generateProductReviewSchema({
          title: review.metaTitle,
          description: review.metaDescription,
          url: getCanonicalUrl(`/equipment/${review.slug}`),
          products: review.products.map((p: any) => ({
            name: p.name,
            rating: p.rating,
            price: p.price,
            description: p.description,
          })),
          publishedAt: review.publishedAt,
          updatedAt: review.updatedAt,
          author: 'World of Aquariums',
        })}
      />
      {/* FAQ Schema */}
      <JsonLd data={generateFAQSchema(review.faq)} />

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mb-10">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ocean-950">
            {review.title}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Updated {new Date(review.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {review.products.length} products reviewed
          </p>
        </header>

        <div className="flex gap-12 lg:gap-16">
          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
            {/* Quick picks summary */}
            <div className="p-6 bg-ocean-50/60 rounded-2xl border border-ocean-100 mb-10 not-prose">
              <h2 className="font-display font-bold text-lg text-ocean-900 mb-4">Our Top Picks</h2>
              <div className="space-y-3">
                {review.products.map((p: any) => (
                  <div key={p.slug} className="flex items-start gap-3">
                    <span className={`spec-badge spec-badge-${ratingVariant(p.rating)} shrink-0 mt-0.5`}>
                      {p.rating}/5
                    </span>
                    <div>
                      <a href={`#${p.slug}`} className="font-semibold text-ocean-800 hover:text-ocean-600 text-sm">
                        {p.name}
                      </a>
                      <p className="text-xs text-gray-500">{p.bestFor} · ${p.price.min}–${p.price.max}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ad-slot" data-ad-slot="equipment-top">Ad</div>

            {/* Main article content */}
            <div className="article-content">
              <div dangerouslySetInnerHTML={{ __html: review.introduction }} />
            </div>

            {/* Individual product reviews */}
            <div className="mt-12 space-y-10">
              <h2 className="font-display font-bold text-2xl text-ocean-900">
                Detailed Product Reviews
              </h2>

              {review.products.map((product: any, idx: number) => (
                <article
                  key={product.slug}
                  id={product.slug}
                  className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-50"
                        loading="lazy"
                      />
                      <div>
                      <span className="text-xs font-bold text-ocean-500 uppercase tracking-wider">
                        #{idx + 1} Pick
                      </span>
                      <h3 className="font-display font-bold text-xl text-gray-900 mt-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400">{product.brand} · {product.subcategory}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`spec-badge spec-badge-${ratingVariant(product.rating)} text-base`}>
                        {product.rating}/5
                      </span>
                      <p className="text-sm font-semibold text-gray-600 mt-1">
                        ${product.price.min}–${product.price.max}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="spec-badge bg-ocean-100 text-ocean-700">
                      {product.tankSizeRange.min}–{product.tankSizeRange.max} gal
                    </span>
                    <span className="spec-badge bg-reef-100 text-reef-700">
                      {product.bestFor.split('Best ')[1] || product.bestFor}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{product.description}</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-reef-600 uppercase tracking-wider mb-2">✓ Pros</p>
                      <ul className="space-y-1">
                        {product.pros.map((pro: string) => (
                          <li key={pro} className="text-sm text-gray-600 flex items-start gap-1.5">
                            <span className="text-reef-500 shrink-0">+</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-coral-600 uppercase tracking-wider mb-2">✗ Cons</p>
                      <ul className="space-y-1">
                        {product.cons.map((con: string) => (
                          <li key={con} className="text-sm text-gray-600 flex items-start gap-1.5">
                            <span className="text-coral-500 shrink-0">−</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="ad-slot" data-ad-slot="equipment-bottom">Ad</div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-6">
              <nav className="p-4 bg-gray-50 rounded-xl">
                <p className="font-display font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">
                  On This Page
                </p>
                <ul className="space-y-1 text-sm">
                  <li><a href="#top-picks" className="text-gray-400 hover:text-ocean-600 block py-0.5">Top Picks</a></li>
                  {review.products.map((p: any) => (
                    <li key={p.slug}>
                      <a href={`#${p.slug}`} className="text-gray-400 hover:text-ocean-600 block py-0.5 truncate">
                        {p.name.split('(')[0].trim()}
                      </a>
                    </li>
                  ))}
                  <li><a href="#faq" className="text-gray-400 hover:text-ocean-600 block py-0.5">FAQ</a></li>
                </ul>
              </nav>

              <div className="p-4 bg-ocean-50/50 rounded-xl border border-ocean-100">
              <RelatedLinks
                links={[
                  { href: '/fish', text: 'Fish & Species Guide', title: 'Browse all fish species', type: 'fish' as const },
                  { href: '/plants', text: 'Aquarium Plants', title: 'Browse all plants', type: 'plant' as const },
                  { href: '/tank-sizes', text: 'Tank Sizes Guide', title: 'Find the right tank', type: 'tank-size' as const },
                  { href: '/guides/beginner-guide', text: 'Beginner Guide', title: 'Start your first tank', type: 'guide' as const },
                  { href: '/calculators/stocking', text: 'Stocking Calculator', title: 'Check fish capacity', type: 'calculator' as const },
                  { href: '/calculators/tank-volume', text: 'Tank Volume Calculator', title: 'Calculate gallons', type: 'calculator' as const },
                  { href: '/calculators/heater-size', text: 'Heater Size Calculator', title: 'Find the right wattage', type: 'calculator' as const },
                  { href: '/diseases', text: 'Fish Disease Guide', title: 'Identify and treat diseases', type: 'disease' as const },
                ]}
                title="Related Guides"
                maxLinks={8}
                variant="ocean"
              />
              </div>

              <div className="ad-slot-sidebar" data-ad-slot="equipment-sidebar">Ad</div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
