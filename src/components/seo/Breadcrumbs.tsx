import Link from 'next/link';
import type { BreadcrumbItem } from '@/types';
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {i === items.length - 1 ? (
                <span className="text-gray-700 font-medium truncate max-w-[200px]">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-ocean-600 transition-colors truncate max-w-[200px]"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
