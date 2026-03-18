import { siteConfig, type BreadcrumbItem, type FAQ, type ArticleSchema } from '@/types';

// ============================================================
// CANONICAL URL
// ============================================================
export function getCanonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}

// ============================================================
// JSON-LD GENERATORS
// ============================================================
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    sameAs: [],
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

export function generateProductReviewSchema(review: {
  title: string;
  description: string;
  url: string;
  products: {
    name: string;
    rating: number;
    price: { min: number; max: number };
    description: string;
  }[];
  publishedAt: string;
  updatedAt: string;
  author: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: review.title,
    description: review.description,
    url: review.url,
    datePublished: review.publishedAt,
    dateModified: review.updatedAt,
    author: { '@type': 'Person', name: review.author },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    about: review.products.map((p) => ({
      '@type': 'Product',
      name: p.name,
      description: p.description,
      review: {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: p.rating,
          bestRating: 5,
        },
        author: { '@type': 'Person', name: review.author },
      },
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: p.price.min,
        highPrice: p.price.max,
        priceCurrency: 'USD',
      },
    })),
  };
}

export function generateFAQSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateHowToSchema(howTo: {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g., "PT30M"
  steps: { name: string; text: string; imageUrl?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    totalTime: howTo.totalTime,
    step: howTo.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      image: step.imageUrl,
    })),
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${siteConfig.url}${item.href}`,
    })),
  };
}

// ============================================================
// SCHEMA SCRIPT COMPONENT
// ============================================================
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
