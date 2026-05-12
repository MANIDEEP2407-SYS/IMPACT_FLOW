/**
 * SEO.jsx — Reusable helmet component for all pages
 * Uses react-helmet-async for Vite compatibility
 */
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'ImpactFlow';
const DEFAULT_DESC = 'ImpactFlow — The academic group project management platform where faculty track contributions and students ship real work.';
const DEFAULT_KEYWORDS = 'college project management, capstone project tracking, group project contribution, faculty project dashboard, student team management, academic task tracking, project based learning';
const DEFAULT_IMAGE = 'https://impactflow.vercel.app/og-image.png';
const SITE_URL = 'https://impactflow.vercel.app';

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords    = DEFAULT_KEYWORDS,
  ogImage     = DEFAULT_IMAGE,
  path        = '',
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Stop Guessing. Start Measuring What Matters.`;
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description"   content={description} />
      <meta name="keywords"      content={keywords} />
      <meta name="author"        content="Team ImpactFlow" />
      <link rel="canonical"      href={canonical} />

      {/* ── Open Graph (Facebook / LinkedIn) ── */}
      <meta property="og:type"        content="website" />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* ── Technical ── */}
      <meta name="robots"   content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
    </Helmet>
  );
}
