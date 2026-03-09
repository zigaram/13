import Link from 'next/link';
import { siteConfig } from '@/types';

const FOOTER_LINKS = {
  'Fish Species': [
    { label: 'Betta Fish', href: '/fish/betta-fish' },
    { label: 'Goldfish', href: '/fish/goldfish' },
    { label: 'Neon Tetra', href: '/fish/neon-tetra' },
    { label: 'Guppies', href: '/fish/guppy' },
    { label: 'Cherry Shrimp', href: '/fish/cherry-shrimp' },
    { label: 'Axolotl', href: '/fish/axolotl' },
    { label: 'Freshwater Fish', href: '/freshwater' },
    { label: 'Saltwater Fish', href: '/saltwater' },
  ],
  'Equipment': [
    { label: 'Best Aquarium Filters', href: '/equipment/filters' },
    { label: 'Best Aquarium Heaters', href: '/equipment/heaters' },
    { label: 'Best Aquarium Lights', href: '/equipment/lights' },
    { label: 'Best Substrate', href: '/equipment/substrate' },
    { label: 'CO2 Systems', href: '/equipment/co2' },
    { label: 'Air Pumps', href: '/equipment/pumps' },
    { label: 'Gravel Vacuums', href: '/reviews/best-gravel-vacuums' },
    { label: 'Test Kits', href: '/reviews/best-test-kits' },
  ],
  'Tank Sizes': [
    { label: '5 Gallon Fish Tank', href: '/tank-sizes/5-gallon-fish-tank' },
    { label: '10 Gallon Fish Tank', href: '/tank-sizes/10-gallon-fish-tank' },
    { label: '20 Gallon Fish Tank', href: '/tank-sizes/20-gallon-fish-tank' },
    { label: '29 Gallon Fish Tank', href: '/tank-sizes/29-gallon-fish-tank' },
    { label: '40 Gallon Fish Tank', href: '/tank-sizes/40-gallon-fish-tank' },
    { label: '55 Gallon Fish Tank', href: '/tank-sizes/55-gallon-fish-tank' },
    { label: '75 Gallon Fish Tank', href: '/tank-sizes/75-gallon-fish-tank' },
    { label: 'All Tank Sizes', href: '/tank-sizes' },
  ],
  'Guides & Tools': [
    { label: 'Tank Setup Guide', href: '/setup' },
    { label: 'Nitrogen Cycle', href: '/water-chemistry/nitrogen-cycle' },
    { label: 'Fish Diseases', href: '/diseases' },
    { label: 'Algae Control', href: '/algae' },
    { label: 'Aquarium Plants', href: '/plants' },
    { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
    { label: 'Stocking Calculator', href: '/calculators/stocking' },
    { label: 'Heater Size Calculator', href: '/calculators/heater-size' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ocean-950 text-white mt-auto">
      {/* Link columns */}
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-display font-semibold text-sm text-ocean-300 uppercase tracking-wider mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ocean-900">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ocean-500 to-reef-500" />
            <span className="font-display font-bold text-sm">{siteConfig.name}</span>
          </div>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            Affiliate links may earn commissions.
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
