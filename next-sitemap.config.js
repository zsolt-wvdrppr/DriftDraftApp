module.exports = {
  siteUrl: process.env.SITE_URL || "https://driftdraft.app", // Replace with your site's URL
  generateRobotsTxt: true, // (Optional) Generate robots.txt alongside the sitemap
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [], // (Optional) Exclude specific pages
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
