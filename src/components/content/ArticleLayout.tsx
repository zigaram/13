import type { TOCItem, BreadcrumbItem } from '@/types';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

interface ArticleLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  toc: TOCItem[];
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function ArticleLayout({
  breadcrumbs,
  title,
  subtitle,
  author,
  publishedAt,
  updatedAt,
  readingTime,
  toc,
  children,
  sidebar,
}: ArticleLayoutProps) {
  return (
    <article className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Article header */}
      <header className="max-w-[var(--article-max)] mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-ocean-950 leading-tight text-balance">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg text-gray-500 mt-3 leading-relaxed">{subtitle}</p>
        )}

        <div className="flex items-center gap-4 mt-5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{author}</span>
          <span>·</span>
          <time dateTime={updatedAt}>
            Updated {new Date(updatedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </header>

      {/* Content grid: article + sidebar */}
      <div className="flex gap-12 lg:gap-16">
        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-[var(--article-max)]">
          {/* Table of Contents (in-article, mobile-friendly) */}
          {toc.length > 0 && (
            <nav className="mb-10 p-5 bg-ocean-50/50 rounded-xl border border-ocean-100">
              <p className="font-display font-semibold text-sm text-ocean-800 uppercase tracking-wider mb-3">
                In This Article
              </p>
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li
                    key={item.id}
                    style={{ paddingLeft: `${(item.level - 2) * 16}px` }}
                  >
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-gray-600 hover:text-ocean-600 transition-colors block py-0.5"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Ad slot: top of article */}
          <div className="ad-slot" data-ad-slot="article-top">Ad</div>

          {/* Article body */}
          <div className="article-content">
            {children}
          </div>

          {/* Ad slot: bottom of article */}
          <div className="ad-slot" data-ad-slot="article-bottom">Ad</div>
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          {/* Sticky TOC for desktop */}
          {toc.length > 0 && (
            <nav className="sticky top-20 mb-8">
              <p className="font-display font-semibold text-xs text-ocean-700 uppercase tracking-wider mb-3">
                On This Page
              </p>
              <ul className="space-y-1 border-l-2 border-gray-100">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block pl-3 py-1 text-xs text-gray-400 hover:text-ocean-600 hover:border-l-ocean-500 transition-colors"
                      style={{ paddingLeft: `${12 + (item.level - 2) * 12}px` }}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Sidebar content (related articles, ads, etc.) */}
          {sidebar}

          {/* Sidebar ad slot */}
          <div className="ad-slot-sidebar" data-ad-slot="sidebar">Ad</div>
        </aside>
      </div>
    </article>
  );
}
