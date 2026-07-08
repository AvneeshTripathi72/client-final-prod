
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.magnevents.in';

  

  const staticRoutes = [
    '',
    '/about',
    '/artists',
    '/gallery',
    '/services',
    '/pricing',
    '/how-to-book',
    '/testimonials',
    '/why-choose',
    '/singers-in-delhi',
    '/book-top-singers',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...staticRoutes];
}
