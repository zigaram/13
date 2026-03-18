'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { searchIndex, type SearchItem } from '@/lib/search-data';

// ============================================================
// FLEXSEARCH - lightweight client-side full-text search
// ============================================================
// We use a simple scoring approach since FlexSearch's Document
// index has module-format issues with Next.js bundling.
// This trie-free approach is fast enough for <250 items.
// ============================================================

function fuzzySearch(query: string, items: SearchItem[], limit = 12): SearchItem[] {
  if (!query.trim()) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const scored = items.map((item) => {
    const titleLower = item.title.toLowerCase();
    const subtitleLower = (item.subtitle || '').toLowerCase();
    const keywordsLower = (item.keywords || '').toLowerCase();
    const descLower = (item.description || '').toLowerCase();

    let score = 0;

    for (const term of terms) {
      // Exact title match (highest weight)
      if (titleLower === term) {
        score += 100;
      } else if (titleLower.startsWith(term)) {
        score += 60;
      } else if (titleLower.includes(term)) {
        score += 40;
      }

      // Subtitle match
      if (subtitleLower.includes(term)) {
        score += 20;
      }

      // Keywords match
      if (keywordsLower.includes(term)) {
        score += 15;
      }

      // Description match
      if (descLower.includes(term)) {
        score += 5;
      }
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

// ============================================================
// CATEGORY LABELS & COLORS
// ============================================================
const CATEGORY_META: Record<
  SearchItem['category'],
  { label: string; color: string; bg: string }
> = {
  fish: { label: 'Fish', color: 'text-ocean-700', bg: 'bg-ocean-100' },
  plant: { label: 'Plant', color: 'text-reef-700', bg: 'bg-reef-100' },
  equipment: { label: 'Equipment', color: 'text-gray-700', bg: 'bg-gray-100' },
  'tank-size': { label: 'Tank', color: 'text-ocean-700', bg: 'bg-ocean-100' },
  disease: { label: 'Disease', color: 'text-coral-700', bg: 'bg-coral-100' },
  calculator: { label: 'Calculator', color: 'text-sand-700', bg: 'bg-sand-100' },
  guide: { label: 'Guide', color: 'text-reef-700', bg: 'bg-reef-100' },
};

// ============================================================
// SEARCH MODAL
// ============================================================
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search results
  const results = useMemo(() => fuzzySearch(query, searchIndex), [query]);

  // Popular items shown when query is empty
  const popular = useMemo(
    () =>
      searchIndex
        .filter((item) =>
          [
            'fish-betta-fish',
            'fish-neon-tetra',
            'fish-goldfish',
            'plant-java-fern',
            'calc-stocking',
            'calc-tank-volume',
            'article-beginner-guide',
            'page-compatibility',
          ].includes(item.id)
        )
        .slice(0, 8),
    []
  );

  const displayItems = query.trim() ? results : popular;

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure the modal is rendered
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, displayItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            window.location.href = displayItems[selectedIndex].href;
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [displayItems, selectedIndex, onClose]
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-0 z-[101] flex justify-center px-4 pt-[12vh] sm:pt-[15vh]">
        <div
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <svg
              className="w-5 h-5 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search fish, plants, equipment, guides..."
              className="flex-1 text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-2xs font-medium text-gray-400 bg-gray-100 rounded-md border border-gray-200">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain">
            {/* Section label */}
            <div className="px-5 pt-3 pb-1.5">
              <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400">
                {query.trim()
                  ? results.length > 0
                    ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                    : 'No results'
                  : 'Popular'}
              </p>
            </div>

            {displayItems.length === 0 && query.trim() && (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 text-sm">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Try searching for fish names, equipment, or topics
                </p>
              </div>
            )}

            {displayItems.map((item, i) => {
              const meta = CATEGORY_META[item.category];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  data-selected={i === selectedIndex}
                  className={`flex items-center gap-3.5 px-5 py-3 transition-colors ${
                    i === selectedIndex
                      ? 'bg-ocean-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Thumbnail */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-ocean-50 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-ocean-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {item.title}
                      </span>
                      <span
                        className={`shrink-0 text-2xs font-medium px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Arrow indicator for selected */}
                  {i === selectedIndex && (
                    <svg
                      className="w-4 h-4 text-ocean-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer hints */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 text-2xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">
                  ↵
                </kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">
                  esc
                </kbd>
                close
              </span>
            </div>
            <span className="text-2xs text-gray-300">
              {searchIndex.length} items indexed
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
