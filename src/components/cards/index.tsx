import Link from 'next/link';

// ============================================================
// SPECIES CARD — used on fish index, plant index pages
// ============================================================
interface SpeciesCardProps {
  href: string;
  name: string;
  scientificName?: string;
  imageUrl: string;
  badges: { label: string; variant: 'easy' | 'moderate' | 'hard' }[];
  stats: { label: string; value: string }[];
}

export function SpeciesCard({ href, name, scientificName, imageUrl, badges, stats }: SpeciesCardProps) {
  return (
    <Link href={href} className="species-card group block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="font-display font-bold text-white text-lg">{name}</h3>
          {scientificName && (
            <p className="text-white/70 text-sm italic">{scientificName}</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`spec-badge ${
                badge.variant === 'easy'
                  ? 'spec-badge-easy'
                  : badge.variant === 'moderate'
                  ? 'spec-badge-moderate'
                  : 'spec-badge-hard'
              }`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// PRODUCT CARD — used on review/equipment pages
// ============================================================
interface ProductCardProps {
  name: string;
  brand: string;
  imageUrl: string;
  rating: number;
  price: string;
  bestFor: string;
  affiliateUrl: string;
  editorsChoice?: boolean;
  rank?: number;
}

export function ProductCard({
  name,
  brand,
  imageUrl,
  rating,
  price,
  bestFor,
  affiliateUrl,
  editorsChoice,
  rank,
}: ProductCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl border ${editorsChoice ? 'border-sand-300 ring-2 ring-sand-200' : 'border-gray-100'} p-5 hover:shadow-md transition-shadow`}>
      {/* Rank badge */}
      {rank && (
        <div className="absolute -top-3 -left-2 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
          {rank}
        </div>
      )}

      {/* Editor's choice badge */}
      {editorsChoice && (
        <div className="absolute -top-3 right-4 bg-sand-500 text-white text-2xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
          Editor&apos;s Choice
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Image */}
        <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto sm:h-40 rounded-xl overflow-hidden bg-gray-50 shrink-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ocean-600 uppercase tracking-wider">{brand}</p>
          <h3 className="font-display font-bold text-gray-900 text-lg mt-0.5">{name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= rating ? 'text-sand-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">{bestFor}</p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-lg font-bold text-gray-900">{price}</span>
            <a
              href={affiliateUrl}
              target="_blank"
              rel="nofollow noopener sponsored"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ocean-600 text-white text-sm font-medium rounded-lg hover:bg-ocean-700 transition-colors"
            >
              Check Price
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ARTICLE CARD — used on index pages, related articles
// ============================================================
interface ArticleCardProps {
  href: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  readingTime: number;
}

export function ArticleCard({ href, title, excerpt, imageUrl, category, readingTime }: ArticleCardProps) {
  return (
    <Link href={href} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ocean-600">{category}</span>
          <span className="text-gray-300">·</span>
          <span className="text-2xs text-gray-400">{readingTime} min read</span>
        </div>
        <h3 className="font-display font-bold text-gray-900 group-hover:text-ocean-700 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{excerpt}</p>
      </div>
    </Link>
  );
}

// ============================================================
// CALCULATOR CARD — used on calculators index
// ============================================================
interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CalculatorCard({ href, title, description, icon }: CalculatorCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-gradient-to-br from-ocean-50 to-reef-50 rounded-2xl border border-ocean-100 hover:shadow-md hover:border-ocean-200 transition-all"
    >
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-ocean-600 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-display font-bold text-ocean-900 text-lg">{title}</h3>
      <p className="text-sm text-gray-600 mt-1.5">{description}</p>
    </Link>
  );
}
