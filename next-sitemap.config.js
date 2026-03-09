/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://worldofaquariums.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://worldofaquariums.com/sitemap-fish.xml',
      'https://worldofaquariums.com/sitemap-plants.xml',
      'https://worldofaquariums.com/sitemap-tank-sizes.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority based on path
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/calculators')) {
      priority = 0.9;
      changefreq = 'monthly';
    } else if (path.startsWith('/tank-sizes')) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path.startsWith('/fish/') || path.startsWith('/plants/')) {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path.startsWith('/equipment') || path.startsWith('/reviews')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
