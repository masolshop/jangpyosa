import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'NaverBot',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://jangpyosa.com/sitemap.xml',
  }
}
