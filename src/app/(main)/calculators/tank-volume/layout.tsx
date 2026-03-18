import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Aquarium Volume Calculator — Gallons & Liters',
  description: 'Free aquarium volume calculator. Enter your tank dimensions to calculate water volume in gallons and liters. Works for rectangular, cylindrical, bowfront, and hexagonal tanks.',
  alternates: { canonical: getCanonicalUrl('/calculators/tank-volume') },
  openGraph: {
    title: 'Aquarium Volume Calculator — Gallons & Liters',
    description: 'Calculate your fish tank water volume instantly. Enter dimensions for any tank shape.',
    type: 'website',
  },
};

export { default } from './page';
