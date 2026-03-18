'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchModal from '@/components/search/SearchModal';

const NAV_ITEMS = [
  {
    label: 'Fish & Species',
    href: '/fish',
    children: [
      { label: 'Betta Fish', href: '/fish/betta-fish' },
      { label: 'Goldfish', href: '/fish/goldfish' },
      { label: 'Neon Tetra', href: '/fish/neon-tetra' },
      { label: 'Guppy', href: '/fish/guppy' },
      { label: 'Cherry Shrimp', href: '/fish/cherry-shrimp' },
      { label: 'Angelfish', href: '/fish/angelfish' },
      { label: 'All Fish & Species →', href: '/fish' },
    ],
  },
  {
    label: 'Plants',
    href: '/plants',
    children: [
      { label: 'Java Fern', href: '/plants/java-fern' },
      { label: 'Anubias', href: '/plants/anubias' },
      { label: 'Java Moss', href: '/plants/java-moss' },
      { label: 'Amazon Sword', href: '/plants/amazon-sword' },
      { label: 'Monte Carlo', href: '/plants/monte-carlo' },
      { label: 'Aquascaping Guide', href: '/guides/aquascaping-guide' },
      { label: 'All Plants →', href: '/plants' },
    ],
  },
  {
    label: 'Equipment',
    href: '/equipment',
    children: [
      { label: 'Filters', href: '/equipment/filters' },
      { label: 'Heaters', href: '/equipment/heaters' },
      { label: 'Lights', href: '/equipment/lights' },
      { label: 'Substrate', href: '/equipment/substrate' },
      { label: 'CO2 Systems', href: '/equipment/co2' },
      { label: 'Test Kits', href: '/equipment/test-kits' },
      { label: 'Air Pumps', href: '/equipment/air-pumps' },
      { label: 'All Equipment →', href: '/equipment' },
    ],
  },
  {
    label: 'Tank Sizes',
    href: '/tank-sizes',
    children: [
      { label: '5 Gallon', href: '/tank-sizes/5-gallon-fish-tank' },
      { label: '10 Gallon', href: '/tank-sizes/10-gallon-fish-tank' },
      { label: '20 Gallon', href: '/tank-sizes/20-gallon-fish-tank' },
      { label: '40 Gallon Breeder', href: '/tank-sizes/40-gallon-fish-tank' },
      { label: '55 Gallon', href: '/tank-sizes/55-gallon-fish-tank' },
      { label: '75 Gallon', href: '/tank-sizes/75-gallon-fish-tank' },
      { label: 'All Sizes →', href: '/tank-sizes' },
    ],
  },
  {
    label: 'Guides',
    href: '/guides/beginner-guide',
    children: [
      { label: 'Beginner Guide', href: '/guides/beginner-guide' },
      { label: 'Betta Tank Setup', href: '/setup/betta-fish-tank-setup' },
      { label: 'How to Cycle a Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
      { label: 'Aquascaping Guide', href: '/guides/aquascaping-guide' },
      { label: 'Fish Diseases', href: '/diseases' },
      { label: 'Algae Control', href: '/algae' },
      { label: 'Cloudy Water Fix', href: '/maintenance/cloudy-water' },
      { label: 'Fish Compatibility', href: '/compatibility' },
    ],
  },
  {
    label: 'Calculators',
    href: '/calculators',
    children: [
      { label: 'Stocking Calculator', href: '/calculators/stocking' },
      { label: 'Water Change Calculator', href: '/calculators/water-change' },
      { label: 'Heater Size Calculator', href: '/calculators/heater-size' },
      { label: 'Substrate Calculator', href: '/calculators/substrate' },
      { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-reef-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3c-1.5 2-4.5 3.5-7 4 1 2.5 1.5 5.5 0 8 3 0 5.5 2 7 5 1.5-3 4-5 7-5-1.5-2.5-1-5.5 0-8-2.5-.5-5.5-2-7-4z" />
                <circle cx="8.5" cy="10.5" r="1" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-ocean-900 hidden sm:block">
              World of Aquariums
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-ocean-600 rounded-lg hover:bg-ocean-50/50 transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-ocean-700 hover:bg-ocean-50/50 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-ocean-600 rounded-lg hover:bg-ocean-50/50 transition-colors border border-gray-200 hover:border-ocean-200"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline text-sm text-gray-400">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                ⌘K
              </kbd>
            </button>
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-ocean-600"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="max-w-[var(--content-max)] mx-auto px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-3 py-2.5 text-base font-medium text-gray-800 hover:text-ocean-600 hover:bg-ocean-50/50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-6 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-1.5 text-sm text-gray-500 hover:text-ocean-600"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
