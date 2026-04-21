# GA4 + Privacy Policy Integration for worldofaquariums.com

This archive contains everything needed to add Google Analytics 4 (with GDPR-compliant
Consent Mode v2) and a full Privacy Policy page to the site.

## Files in this archive

| File | Action | Purpose |
|------|--------|---------|
| `src/app/layout.tsx` | **REPLACE** | Adds GA4 script + renders consent banner |
| `src/app/(main)/privacy/page.tsx` | **NEW** | Privacy Policy page at `/privacy` |
| `src/components/ui/ConsentBanner.tsx` | **NEW** | GDPR cookie consent banner |
| `src/components/layout/Footer.tsx` | **REPLACE** | Adds Privacy Policy link to footer |
| `.env.local.example` | **NEW** (safe to commit) | Reference for env var setup |

Paths mirror your existing repo exactly — unzip at the project root and the files
drop straight into place.

## Before you push

### 1. Fill in the contact email in the privacy page

Open `src/app/(main)/privacy/page.tsx` and find this line near the top:

```tsx
const CONTACT_EMAIL = '[CONTACT EMAIL]'; // TODO: replace before launch
```

Replace `[CONTACT EMAIL]` with a real address you monitor (e.g. `privacy@worldofaquariums.com`
or `hello@worldofaquariums.com`). This is used in multiple places in the policy for
GDPR/CCPA contact requirements.

### 2. Set the env var in Vercel

- Project → Settings → Environment Variables
- **Name:** `NEXT_PUBLIC_GA_ID`
- **Value:** `G-SZNRTVMYEZ`
- **Environments:** ✅ Production  (✅ Preview optional)  (❌ Do NOT tick Development)

Setting it only in Production/Preview keeps localhost traffic out of your GA data.

### 3. Commit and push

```bash
git add src/app/layout.tsx \
        src/app/\(main\)/privacy/page.tsx \
        src/components/ui/ConsentBanner.tsx \
        src/components/layout/Footer.tsx \
        .env.local.example
git commit -m "Add GA4 with Consent Mode v2 and Privacy Policy"
git push
```

### 4. Verify after deploy

1. Open worldofaquariums.com in an **incognito** window
2. You should see the consent banner at the bottom
3. Click **Accept**
4. Go to GA4 → Reports → Realtime → your visit should appear within ~30 seconds
5. Confirm `/privacy` loads and the footer has a "Privacy Policy" link

## How the privacy policy was written

It accurately reflects what the site actually does today:

- **Google Analytics 4** with Consent Mode v2 (cookieless before consent, full tracking after)
- **Raptive advertising** (listed proactively so you don't have to update the policy
  when you flip it on — the commented-out script in `layout.tsx`)
- **Vercel hosting** server logs
- **No accounts, forms, comments, or newsletters** (currently)
- **LocalStorage** for the consent choice (`woa_consent_v1`)

It covers:

- **GDPR / UK GDPR** — legal bases, Art. 6 grounds, full rights list, Slovenian DPA
  contact, EU–US Data Privacy Framework disclosure
- **CCPA / CPRA** (California) — sale/share opt-out, Global Privacy Control (GPC) honor
- **Other US states** — Colorado, Connecticut, Virginia, Utah privacy rights
- **Retention periods** — GA 14 months, Vercel logs 30 days
- **Children** — COPPA (US, under 13) and GDPR (EEA/UK, under 16) stated
- **Third-party links** — Google Privacy Policy, GA opt-out, Raptive partners,
  AdChoices EU/US opt-out pages

## ⚠️ Legal disclaimer

I'm Claude (an AI), not a lawyer. This policy is accurate, comprehensive, and far better
than most templates — but for a production site running ads in the EU, it is worth having
a lawyer or a specialized service (Termly, iubenda, Usercentrics) review it before launch.

Specific places where a lawyer may want to tighten things:
- The "data controller" line names "World of Aquariums" rather than a registered legal
  entity. In the EU, regulators generally expect a registered legal name + address.
  If you'd like to use your d.o.o. later, update the "Data controller" paragraph and
  add the registered address.
- If you later add email newsletters, user accounts, comments, or affiliate tracking
  beyond basic referral links, the policy needs to be updated to disclose them.
- The retention periods reflect Google's default GA4 settings and Vercel's typical
  log retention. If you change GA4's data retention in the admin panel, update the
  policy to match.

## Rolling this out to your other sites

The architecture here is portable across your portfolio:

- `ConsentBanner.tsx` is self-contained — drop it in any Next.js App Router site
- `layout.tsx` integration is 3 lines (import + env check + component)
- The privacy policy page is pure TSX with no data dependencies — clone and change
  the site name/URL references (all pulled from `siteConfig`)

For each site you'd just need its own GA4 Measurement ID in Vercel env.
