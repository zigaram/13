'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * GA4 Consent Mode v2 banner.
 *
 * Behavior:
 * - Before any user choice: all consent signals default to "denied" (required
 *   for EU/EEA/UK; safe for US). GA still loads and sends cookieless pings so
 *   you get modeled conversions + basic traffic counts.
 * - User clicks Accept: consent is updated to "granted" and full tracking
 *   (cookies, identifiers, ads personalization) kicks in.
 * - User clicks Reject: consent stays "denied" — GA keeps running in
 *   cookieless mode only.
 * - Choice is stored in localStorage so the banner appears once per browser.
 */

const STORAGE_KEY = 'woa_consent_v1';

type ConsentState = 'granted' | 'denied' | null;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
    setConsent(stored);

    // If user previously granted consent, push the update immediately.
    if (stored === 'granted' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
  }, []);

  const updateConsent = (value: 'granted' | 'denied') => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value,
      });
    }
  };

  return (
    <>
      {/* Set defaults BEFORE GA loads. Runs in <head> via beforeInteractive. */}
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>

      {mounted && consent === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-lg sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">
              We use cookies to understand how visitors use our site and improve
              your experience. You can accept all or reject non-essential
              cookies.{' '}
              <a href="/privacy" className="underline hover:text-slate-900">
                Learn more
              </a>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => updateConsent('denied')}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => updateConsent('granted')}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
