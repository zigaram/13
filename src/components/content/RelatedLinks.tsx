import Link from 'next/link';
import type { InternalLink } from '@/lib/links';

// ============================================================
// TYPE ICONS — small colored indicators per link type
// ============================================================
const TYPE_STYLES: Record<InternalLink['type'], { icon: string; color: string }> = {
  fish: { icon: '🐠', color: 'text-ocean-600' },
  plant: { icon: '🌿', color: 'text-reef-600' },
  'tank-size': { icon: '📐', color: 'text-ocean-600' },
  disease: { icon: '💊', color: 'text-coral-600' },
  guide: { icon: '📘', color: 'text-ocean-600' },
  calculator: { icon: '🔢', color: 'text-sand-600' },
  review: { icon: '⚙️', color: 'text-gray-600' },
  compatibility: { icon: '🤝', color: 'text-reef-600' },
};

// ============================================================
// RELATED LINKS SIDEBAR BLOCK
// ============================================================
interface RelatedLinksProps {
  links: InternalLink[];
  title?: string;
  maxLinks?: number;
  variant?: 'ocean' | 'reef' | 'coral' | 'gray';
}

export function RelatedLinks({
  links,
  title = 'Related',
  maxLinks = 8,
  variant = 'ocean',
}: RelatedLinksProps) {
  if (links.length === 0) return null;

  const variantStyles = {
    ocean: 'bg-ocean-50/50 border-ocean-100',
    reef: 'bg-reef-50/50 border-reef-100',
    coral: 'bg-coral-50/50 border-coral-100',
    gray: 'bg-gray-50 border-gray-100',
  };

  const titleColors = {
    ocean: 'text-ocean-700',
    reef: 'text-reef-700',
    coral: 'text-coral-700',
    gray: 'text-gray-500',
  };

  return (
    <div className={`p-4 rounded-xl border ${variantStyles[variant]}`}>
      <p className={`font-display font-semibold text-xs uppercase tracking-wider mb-3 ${titleColors[variant]}`}>
        {title}
      </p>
      <ul className="space-y-2">
        {links.slice(0, maxLinks).map((link) => {
          const style = TYPE_STYLES[link.type];
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                title={link.title}
                className="flex items-start gap-2 text-sm text-gray-600 hover:text-ocean-700 transition-colors group"
              >
                <span className="text-xs mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  {style.icon}
                </span>
                <span className="leading-snug">{link.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================================================
// SIMILAR SPECIES GRID — with thumbnails
// ============================================================
interface SimilarSpeciesProps {
  species: InternalLink[];
  title?: string;
  imageBasePath?: string;
}

export function SimilarSpecies({
  species,
  title = 'Similar Species',
  imageBasePath = '/images/fish',
}: SimilarSpeciesProps) {
  if (species.length === 0) return null;

  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <p className="font-display font-semibold text-xs text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {species.map((s) => {
          const slug = s.href.split('/').pop() || '';
          const imgSrc = `${imageBasePath}/${slug}.svg`;
          return (
            <Link
              key={s.href}
              href={s.href}
              title={s.title}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white transition-colors group"
            >
              <img
                src={imgSrc}
                alt=""
                className="w-9 h-9 rounded-lg object-cover bg-white shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 group-hover:text-ocean-700 truncate transition-colors">
                  {s.text}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// IN-CONTENT RELATED BOX — placed between article sections
// ============================================================
interface InContentRelatedProps {
  links: InternalLink[];
  title?: string;
}

export function InContentRelated({
  links,
  title = 'Related Resources',
}: InContentRelatedProps) {
  if (links.length === 0) return null;

  return (
    <div className="my-8 p-5 bg-gradient-to-br from-ocean-50 to-reef-50 rounded-2xl border border-ocean-100 not-prose">
      <p className="font-display font-bold text-sm text-ocean-800 mb-3">
        {title}
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {links.slice(0, 6).map((link) => {
          const style = TYPE_STYLES[link.type];
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.title}
              className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
            >
              <span className="text-sm shrink-0">{style.icon}</span>
              <span className="text-sm text-gray-600 group-hover:text-ocean-700 truncate transition-colors">
                {link.text}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
