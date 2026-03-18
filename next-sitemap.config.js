/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://worldofaquariums.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
  },

  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = 'weekly';

    // Homepage
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Calculators — high-engagement interactive tools
    else if (path.startsWith('/calculators')) {
      priority = 0.9;
      changefreq = 'monthly';
    }
    // Hub/index pages
    else if (
      path === '/fish' ||
      path === '/plants' ||
      path === '/equipment' ||
      path === '/tank-sizes' ||
      path === '/diseases' ||
      path === '/compatibility' ||
      path === '/algae'
    ) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    // Equipment reviews — updated frequently with pricing
    else if (path.startsWith('/equipment/')) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    // Tank sizes — evergreen reference
    else if (path.startsWith('/tank-sizes/')) {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Fish and plant species pages
    else if (path.startsWith('/fish/') || path.startsWith('/plants/')) {
      priority = 0.7;
      changefreq = 'monthly';
    }
    // Guides and editorial content
    else if (
      path.startsWith('/guides/') ||
      path.startsWith('/setup/') ||
      path.startsWith('/water-chemistry/') ||
      path.startsWith('/maintenance/')
    ) {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Disease pages
    else if (path.startsWith('/diseases/')) {
      priority = 0.6;
      changefreq = 'monthly';
    }
    // Compatibility pairs — programmatic, lower priority
    else if (path.startsWith('/compatibility/')) {
      priority = 0.5;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
