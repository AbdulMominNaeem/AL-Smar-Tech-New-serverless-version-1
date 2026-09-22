import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';
import { prisma } from '@/lib/prisma';
import { redactCompanyPin } from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

type SiteData = {
  company?: {
    name?: string;
    tagline?: string;
    heroSub?: string;
    email?: string;
    phone?: string;
    social?: Record<string, string>;
  };
  [key: string]: unknown;
};

async function loadSiteData(): Promise<SiteData> {
  const defaultsRaw = await fs.readFile(path.join(process.cwd(), 'public/site-data.json'), 'utf8');
  const defaults = JSON.parse(defaultsRaw) as SiteData;
  try {
    const row = await prisma.siteData.findUnique({ where: { id: 1 } });
    const saved = row?.data as SiteData | undefined;
    if (saved && saved.company) return saved;
  } catch {
    // Database unreachable — fall back to the shipped defaults so the page still renders.
  }
  return defaults;

  
}

/** Escapes "</script" so embedded JSON can't break out of its script tag. */
function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/<\/script/gi, '<\\/script');
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteData();
  const c = data.company || {};
  const title = c.name || 'Lumen Marketing';
  const description = c.heroSub || c.tagline || 'Marketing and development studio.';
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: { title, description, siteName: title, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export default async function Home() {
  const data = await loadSiteData();
  const publicData = redactCompanyPin(data);
  const c = data.company || {};

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: c.name,
    description: c.heroSub || c.tagline,
    email: c.email,
    telephone: c.phone,
    sameAs: Object.values(c.social || {}).filter((v) => typeof v === 'string' && /^https?:\/\//.test(v)),
  };

  return (
    <>
      <link rel="stylesheet" href="/style.css" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonForScript(jsonLd) }} />
      <canvas id="neuralCanvas" aria-hidden="true" />
      <div id="app" />
      <script id="siteData" type="application/json" dangerouslySetInnerHTML={{ __html: safeJsonForScript(publicData) }} />
      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
