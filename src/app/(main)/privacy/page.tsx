import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/types';
import { getCanonicalUrl } from '@/lib/seo';

// ─────────────────────────────────────────────────────────────────────────────
// Last substantive update to this policy. Bump this whenever you change what
// you collect, add a new third-party tool (e.g. email signup, Raptive swap,
// affiliate tracking), or change how consent is handled.
// ─────────────────────────────────────────────────────────────────────────────
const LAST_UPDATED = 'April 21, 2026';
const CONTACT_EMAIL = '[CONTACT EMAIL]'; // TODO: replace before launch

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} collects, uses, and protects information about visitors. Covers analytics, advertising, cookies, and your rights under GDPR and US privacy laws.`,
  alternates: { canonical: getCanonicalUrl('/privacy') },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ocean-700">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700">Privacy Policy</li>
        </ol>
      </nav>

      <header className="max-w-[var(--article-max)] mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-ocean-950 leading-tight text-balance">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-500 mt-3 leading-relaxed">
          How we handle information about visitors to {siteConfig.name}.
        </p>
        <div className="text-sm text-gray-500 mt-5">
          <time dateTime={LAST_UPDATED}>Last updated: {LAST_UPDATED}</time>
        </div>
      </header>

      <article className="max-w-[var(--article-max)] prose prose-slate prose-headings:font-display prose-headings:text-ocean-950 prose-a:text-ocean-700 prose-a:no-underline hover:prose-a:underline">
        <p>
          This Privacy Policy explains what information we collect when you
          visit {siteConfig.url}, how we use it, who we share it with, and the
          rights you have over it. It applies to everyone who visits the site,
          with additional protections for visitors in the European Economic
          Area (EEA), the United Kingdom, and certain US states.
        </p>

        <p>
          <strong>Data controller:</strong> {siteConfig.name} is the data
          controller for personal information collected through this website.
          You can contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for any
          privacy-related questions or requests.
        </p>

        <h2 id="summary">Summary</h2>
        <p>
          We do not sell your personal information. We do not require an
          account to read the site. We use Google Analytics to understand how
          visitors find and use the site, and we display advertising
          (served by Raptive and its partners) to support the site. If you are
          in the EEA, UK, or a jurisdiction with similar rules, tracking
          cookies are off by default until you consent.
        </p>

        <h2 id="what-we-collect">What we collect</h2>

        <h3>Information collected automatically</h3>
        <p>
          When you visit any page on {siteConfig.domain}, our hosting provider
          and analytics tools automatically receive:
        </p>
        <ul>
          <li>Your IP address (used and then truncated by Google Analytics)</li>
          <li>Browser type, version, and language</li>
          <li>Operating system and device type (mobile, tablet, desktop)</li>
          <li>Screen resolution</li>
          <li>The page you requested and the page that referred you (if any)</li>
          <li>Date and time of the request</li>
          <li>Approximate geographic location (country, region, city) derived from IP</li>
        </ul>

        <h3>Information collected with cookies and similar technologies</h3>
        <p>
          With your consent where required, we and our partners set cookies
          and similar identifiers to measure how the site is used and to serve
          relevant advertising. See <a href="#cookies">Cookies and tracking</a>{' '}
          below for the full list.
        </p>

        <h3>Information you provide to us</h3>
        <p>
          {siteConfig.name} does not currently offer user accounts, newsletters,
          comments, or contact forms. If you email us directly, we will receive
          and store the content of your message along with your email address,
          used only to reply to you.
        </p>

        <h2 id="how-we-use">How we use information</h2>
        <ul>
          <li>
            <strong>To operate the site</strong> — serve pages, prevent abuse,
            and keep the service running (necessary for our legitimate interests
            in providing the site, and required to perform the service you
            requested).
          </li>
          <li>
            <strong>To measure and improve the site</strong> — understand which
            pages are popular, where visitors come from, how the site performs,
            and what needs fixing (with your consent where required; otherwise
            based on our legitimate interest in a functioning website, using
            cookieless measurement only).
          </li>
          <li>
            <strong>To show advertising</strong> — serve ads that help fund the
            site; with your consent, ads may be personalized based on data our
            ad partners collect (see <a href="#advertising">Advertising</a>).
          </li>
          <li>
            <strong>To comply with the law</strong> — respond to lawful
            requests, enforce our terms, and protect our rights and those of
            our visitors.
          </li>
        </ul>
        <p>
          We do not use the information we collect to build profiles for sale,
          and we do not use it for any automated decision-making that produces
          legal or similarly significant effects about you.
        </p>

        <h2 id="legal-basis">Legal basis for processing (EEA / UK visitors)</h2>
        <p>
          If you are in the EEA or UK, we process your personal data on the
          following bases under the GDPR / UK GDPR:
        </p>
        <ul>
          <li>
            <strong>Consent</strong> (Art. 6(1)(a)) — for analytics cookies,
            advertising cookies, and any similar tracking technologies. You can
            withdraw your consent at any time; see <a href="#your-rights">Your
            rights</a>.
          </li>
          <li>
            <strong>Legitimate interests</strong> (Art. 6(1)(f)) — for basic
            operation of the site, security, and cookieless aggregated
            measurement. Our legitimate interest is running and improving a
            free-to-read publication; we have balanced this against your rights
            and believe the impact is minimal.
          </li>
          <li>
            <strong>Legal obligation</strong> (Art. 6(1)(c)) — where we must
            process data to meet a legal requirement.
          </li>
        </ul>

        <h2 id="cookies">Cookies and tracking</h2>
        <p>
          A cookie is a small text file stored in your browser. We use cookies,
          local storage, and similar technologies for the purposes below. In
          the EEA, UK, and jurisdictions with similar rules, non-essential
          cookies are <strong>off by default</strong> until you accept them via
          our cookie banner. You can change your choice at any time by clearing
          the <code>woa_consent_v1</code> value from your browser&apos;s local
          storage, which will cause the banner to reappear.
        </p>

        <h3>Strictly necessary</h3>
        <p>
          We store your cookie choice in your browser&apos;s local storage
          under the key <code>woa_consent_v1</code>. This is required to
          remember whether you accepted or rejected non-essential cookies. It
          does not track you and does not require your consent.
        </p>

        <h3>Analytics</h3>
        <p>
          We use <strong>Google Analytics 4</strong> (provided by Google LLC
          and Google Ireland Ltd.) to measure site usage. Google Analytics may
          set the following cookies once you accept: <code>_ga</code>,{' '}
          <code>_ga_&lt;container-id&gt;</code>. These allow Google to
          distinguish unique visitors, measure sessions, and count pageviews.
        </p>
        <p>
          Before you accept (or if you reject), Google Analytics runs in
          &quot;Consent Mode&quot; and sends anonymous, cookieless pings with
          no identifiers. This gives us aggregated counts (for example, total
          pageviews) but does not track individual visitors across sessions.
        </p>
        <p>
          Google Analytics data is retained for 14 months, after which it is
          automatically deleted. Google may transfer data to the United States;
          we rely on the EU–US Data Privacy Framework and Standard Contractual
          Clauses as the legal transfer mechanism. You can read{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Privacy Policy
          </a>{' '}
          for more detail, and you can install the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Opt-out Browser Add-on
          </a>{' '}
          to opt out across all sites.
        </p>

        <h3 id="advertising">Advertising</h3>
        <p>
          We display advertising on {siteConfig.name} to support the cost of
          running the site. Ads are served through <strong>Raptive</strong>{' '}
          (a trading name of CAFE Media LLC) and its advertising partners,
          which may include Google, other supply-side platforms, and
          demand-side platforms.
        </p>
        <p>
          With your consent, these partners set their own cookies and
          identifiers to:
        </p>
        <ul>
          <li>Deliver ads and measure their performance</li>
          <li>Prevent the same ad from being shown too many times</li>
          <li>Detect invalid traffic and fraud</li>
          <li>Personalize ads based on inferred interests</li>
        </ul>
        <p>
          A full list of Raptive&apos;s advertising partners and their
          privacy practices is available in Raptive&apos;s{' '}
          <a
            href="https://raptive.com/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://raptive.com/advertising-partners/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Advertising Partners page
          </a>.
        </p>
        <p>
          If you reject advertising cookies (or if you are in a jurisdiction
          where they are off by default and you do not accept), you will still
          see ads, but they will not be personalized to you.
        </p>
        <p>
          You can also opt out of personalized advertising industry-wide at{' '}
          <a
            href="https://www.youronlinechoices.eu"
            target="_blank"
            rel="noopener noreferrer"
          >
            youronlinechoices.eu
          </a>{' '}
          (EU/UK) or{' '}
          <a
            href="https://optout.aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
          >
            optout.aboutads.info
          </a>{' '}
          (US).
        </p>

        <h2 id="sharing">Who we share information with</h2>
        <p>We share information only with:</p>
        <ul>
          <li>
            <strong>Our infrastructure providers</strong> — Vercel (hosting and
            CDN) and domain registrars, which receive request data (IP, user
            agent) as part of serving pages to you.
          </li>
          <li>
            <strong>Google LLC / Google Ireland Ltd.</strong> — as the provider
            of Google Analytics.
          </li>
          <li>
            <strong>Raptive (CAFE Media LLC) and its advertising partners</strong>{' '}
            — as described under <a href="#advertising">Advertising</a>.
          </li>
          <li>
            <strong>Law enforcement or courts</strong> — if we are legally
            required to do so, and only in response to a valid request.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal information</strong> for money.
          However, some US state privacy laws (notably California&apos;s CCPA /
          CPRA) define &quot;sale&quot; and &quot;sharing&quot; broadly enough
          that the use of third-party advertising cookies may qualify. See{' '}
          <a href="#us-state-rights">US state privacy rights</a> for your
          options.
        </p>

        <h2 id="retention">How long we keep information</h2>
        <ul>
          <li>
            <strong>Google Analytics data:</strong> 14 months, then
            automatically deleted.
          </li>
          <li>
            <strong>Server logs (Vercel):</strong> up to 30 days, used only for
            operational and security purposes.
          </li>
          <li>
            <strong>Your cookie consent choice:</strong> stored in your browser
            until you clear it.
          </li>
          <li>
            <strong>Emails you send us:</strong> kept as long as needed to
            answer your question, then deleted within a reasonable period
            unless we need them for legal or accounting reasons.
          </li>
        </ul>

        <h2 id="international">International data transfers</h2>
        <p>
          Some of our service providers (notably Google and Raptive) are based
          in the United States. When personal data is transferred outside the
          EEA or UK, we rely on the EU–US Data Privacy Framework (where
          applicable) and Standard Contractual Clauses approved by the European
          Commission as the legal transfer mechanism.
        </p>

        <h2 id="your-rights">Your rights</h2>

        <h3>Everyone</h3>
        <p>
          You can change or withdraw your cookie consent at any time by
          clearing the <code>woa_consent_v1</code> entry from your
          browser&apos;s local storage for this site — the consent banner will
          then reappear on your next visit, and you can make a new choice.
        </p>

        <h3>EEA and UK visitors</h3>
        <p>Under the GDPR and UK GDPR, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Ask us to correct inaccurate data</li>
          <li>Ask us to delete your data (right to erasure)</li>
          <li>Restrict how we process your data</li>
          <li>Object to processing based on legitimate interests</li>
          <li>Data portability, where applicable</li>
          <li>Withdraw consent at any time</li>
          <li>
            Lodge a complaint with your local supervisory authority — for
            example, the{' '}
            <a
              href="https://www.ip-rs.si/en/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Slovenian Information Commissioner
            </a>{' '}
            or any other EU/EEA data protection authority where you live, work,
            or believe a violation occurred.
          </li>
        </ul>

        <h3 id="us-state-rights">US state privacy rights</h3>
        <p>
          Residents of California, Colorado, Connecticut, Virginia, Utah, and
          other states with comprehensive privacy laws have rights that may
          include:
        </p>
        <ul>
          <li>The right to know what personal information we collect about you</li>
          <li>The right to request deletion of your personal information</li>
          <li>The right to correct inaccurate personal information</li>
          <li>The right to opt out of the &quot;sale&quot; or &quot;sharing&quot; of personal information for cross-context behavioral advertising</li>
          <li>The right not to be discriminated against for exercising these rights</li>
        </ul>
        <p>
          <strong>For California residents (CCPA/CPRA):</strong> You have the
          right to opt out of the sharing of personal information for
          cross-context behavioral advertising. You can exercise this right by
          rejecting advertising cookies in our consent banner, or by enabling a
          recognized opt-out signal such as{' '}
          <a
            href="https://globalprivacycontrol.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Global Privacy Control (GPC)
          </a>{' '}
          in your browser, which we honor as a valid opt-out request.
        </p>
        <p>
          To exercise any of these rights, email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will
          respond within the timeframes required by applicable law (generally
          45 days, extendable once where needed). We will not discriminate
          against you for exercising your rights.
        </p>

        <h2 id="children">Children</h2>
        <p>
          {siteConfig.name} is a general-audience publication about aquarium
          keeping and is not directed at children under 13 (or under 16 in the
          EEA/UK). We do not knowingly collect personal information from
          children. If you believe a child has provided us with personal
          information, please contact us and we will delete it.
        </p>

        <h2 id="security">Security</h2>
        <p>
          All traffic to {siteConfig.domain} is encrypted in transit using
          HTTPS. We rely on our infrastructure providers (Vercel, Google) to
          maintain appropriate technical and organizational safeguards for data
          at rest. No system is perfectly secure, but we apply reasonable
          measures to protect the limited information we collect.
        </p>

        <h2 id="changes">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time — for example, if
          we add a new feature, change advertising partners, or need to reflect
          a change in the law. The &quot;Last updated&quot; date at the top of
          this page will always show when it last changed. Material changes
          will be highlighted on the site or through the cookie banner.
        </p>

        <h2 id="contact">Contact us</h2>
        <p>
          For any privacy-related question, request, or complaint, email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to
          respond within 30 days, and always within the time required by
          applicable law.
        </p>
      </article>
    </main>
  );
}
