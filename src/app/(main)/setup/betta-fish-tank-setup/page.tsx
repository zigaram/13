import type { Metadata } from 'next';
import { getArticleBySlug } from '@/lib/data';
import { JsonLd, generateArticleSchema, getCanonicalUrl } from '@/lib/seo';
import { buildBreadcrumbs } from '@/lib/links';
import ArticleLayout from '@/components/content/ArticleLayout';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const article = await getArticleBySlug('betta-fish-tank-setup');
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: getCanonicalUrl(`/${article.pillar}/${article.slug}`) },
  };
}

export default async function Page() {
  const article = await getArticleBySlug('betta-fish-tank-setup');
  if (!article) notFound();

  const breadcrumbs = buildBreadcrumbs([
    { label: 'Tank Setup', href: '/setup' },
    { label: 'Betta Tank Setup', href: `/${article.pillar}/${article.slug}` },
  ]);

  return (
    <>
      <JsonLd data={generateArticleSchema({ title: article.metaTitle, description: article.metaDescription, url: getCanonicalUrl(`/${article.pillar}/${article.slug}`), imageUrl: article.imageUrl, publishedAt: article.publishedAt, updatedAt: article.updatedAt, author: article.author })} />
      <ArticleLayout breadcrumbs={breadcrumbs} title={article.title} subtitle={article.excerpt} author={article.author} publishedAt={article.publishedAt} updatedAt={article.updatedAt} readingTime={article.readingTime} toc={article.toc}>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </ArticleLayout>
    </>
  );
}
