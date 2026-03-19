import Link from 'next/link';
import { siteConfig } from '@/types';

const FOOTER_LINKS = {
  'Fish Species': [
    { label: 'Betta Fish', href: '/fish/betta-fish' },
    { label: 'Goldfish', href: '/fish/goldfish' },
    { label: 'Neon Tetra', href: '/fish/neon-tetra' },
    { label: 'Guppy', href: '/fish/guppy' },
    { label: 'Cherry Shrimp', href: '/fish/cherry-shrimp' },
    { label: 'Axolotl', href: '/fish/axolotl' },
    { label: 'Oscar Fish', href: '/fish/oscar-fish' },
    { label: 'All Fish →', href: '/fish' },
  ],
  'Equipment': [
    { label: 'Aquarium Filters', href: '/equipment/filters' },
    { label: 'Aquarium Heaters', href: '/equipment/heaters' },
    { label: 'Aquarium Lights', href: '/equipment/lights' },
    { label: 'Substrate Guide', href: '/equipment/substrate' },
    { label: 'CO2 Systems', href: '/equipment/co2' },
    { label: 'Water Test Kits', href: '/equipment/test-kits' },
    { label: 'Air Pumps', href: '/equipment/air-pumps' },
    { label: 'Gravel Vacuums', href: '/equipment/gravel-vacuums' },
    { label: 'UV Sterilizers', href: '/equipment/uv-sterilizers' },
    { label: 'Water Conditioners', href: '/equipment/water-conditioners' },
  ],
  'Tank Sizes': [
    { label: '5 Gallon Fish Tank', href: '/tank-sizes/5-gallon-fish-tank' },
    { label: '10 Gallon Fish Tank', href: '/tank-sizes/10-gallon-fish-tank' },
    { label: '20 Gallon Fish Tank', href: '/tank-sizes/20-gallon-fish-tank' },
    { label: '29 Gallon Fish Tank', href: '/tank-sizes/29-gallon-fish-tank' },
    { label: '40 Gallon Breeder', href: '/tank-sizes/40-gallon-fish-tank' },
    { label: '55 Gallon Fish Tank', href: '/tank-sizes/55-gallon-fish-tank' },
    { label: '75 Gallon Fish Tank', href: '/tank-sizes/75-gallon-fish-tank' },
    { label: '125 Gallon Fish Tank', href: '/tank-sizes/125-gallon-fish-tank' },
    { label: 'All Tank Sizes →', href: '/tank-sizes' },
  ],
  'Guides & Resources': [
    { label: 'Beginner Guide', href: '/guides/beginner-guide' },
    { label: 'Betta Tank Setup', href: '/setup/betta-fish-tank-setup' },
    { label: 'How to Cycle a Tank', href: '/water-chemistry/how-to-cycle-fish-tank' },
    { label: 'Aquascaping Guide', href: '/guides/aquascaping-guide' },
    { label: 'Fish Diseases', href: '/diseases' },
    { label: 'Algae Control', href: '/algae' },
    { label: 'Cloudy Water Fix', href: '/maintenance/cloudy-water' },
    { label: 'Aquarium Plants', href: '/plants' },
    { label: 'Fish Compatibility Checker', href: '/compatibility' },
    { label: 'Tank Volume Calculator', href: '/calculators/tank-volume' },
    { label: 'Stocking Calculator', href: '/calculators/stocking' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ocean-950 text-white mt-auto">
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

      <div className="border-t border-ocean-900">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ocean-500 to-reef-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3c-1.5 2-4.5 3.5-7 4 1 2.5 1.5 5.5 0 8 3 0 5.5 2 7 5 1.5-3 4-5 7-5-1.5-2.5-1-5.5 0-8-2.5-.5-5.5-2-7-4z" />
                <circle cx="8.5" cy="10.5" r="1" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className="font-display font-bold text-sm">{siteConfig.name}</span>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            Affiliate links may earn commissions.
          </p>
        </div>
      </div>
    </footer>
  );
}
