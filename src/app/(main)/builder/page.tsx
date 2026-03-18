import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import dynamic from 'next/dynamic';

const AquariumBuilder = dynamic(
  () => import('@/components/aquarium-builder/index.js'),
  { ssr: false, loading: () => <BuilderSkeleton /> }
);

export const metadata: Metadata = {
  title: 'Aquarium Builder — Design Your Dream Fish Tank',
  description:
    'Interactive aquarium builder tool. Choose your tank size, fish, plants, substrate, equipment & decorations. See a live preview, get compatibility warnings, and export your build.',
  alternates: { canonical: getCanonicalUrl('/builder') },
  openGraph: {
    title: 'Aquarium Builder — Design Your Dream Fish Tank',
    description:
      'Interactive aquarium builder tool. Choose your tank, fish, plants & equipment — see a live animated preview.',
    url: getCanonicalUrl('/builder'),
    type: 'website',
  },
};

function BuilderSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-ocean-100 animate-pulse" />
        <p className="text-sm text-gray-400">Loading Aquarium Builder…</p>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <AquariumBuilder />
    </div>
  );
}
