// scripts/generate-sitemap.js

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const generateSitemap = async () => {
  console.log('Generating sitemap...');

  // 1. SETUP SUPABASE CLIENT
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing. Check your .env file.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. DEFINE YOUR STATIC PAGES (from App.jsx, excluding dynamic/user-specific/disallowed pages)
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/knowledge-base', priority: '0.9', changefreq: 'weekly' },
    { url: '/marketplace', priority: '0.9', changefreq: 'weekly' },
    { url: '/support', priority: '0.7', changefreq: 'monthly' },
    { url: '/supporters', priority: '0.7', changefreq: 'monthly' },
    { url: '/create', priority: '0.6', changefreq: 'monthly' }, // Article creation page
    { url: '/marketplace/upload', priority: '0.6', changefreq: 'monthly' }, // Product upload page
    { url: '/purchase-success', priority: '0.5', changefreq: 'never' }, // Success/Cancel pages usually don't need frequent re-indexing
    { url: '/purchase-cancel', priority: '0.5', changefreq: 'never' },
  ];

  const baseUrl = 'https://blenderforge.com'; // Update this to your actual domain
  const today = new Date().toISOString().split('T')[0];

  // 3. FETCH DYNAMIC PAGES (ARTICLES) FROM SUPABASE
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('slug, category, updated_at, created_at')
    .eq('is_published', true); // Only include published articles

  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
    return;
  }

  console.log(`Found ${articles.length} published articles to include in sitemap`);

  // 4. FETCH DYNAMIC PAGES (PRODUCTS) FROM SUPABASE
  const { data: products, error: productsError } = await supabase
    .from('products') // Assuming 'is_published' is on 'products' table
    .select('slug, category_id, updated_at, created_at')
    .eq('is_published', true); // Only include published products

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }

  console.log(`Found ${products.length} published products to include in sitemap`);

  // 5. Fetch categories for product URLs (if needed, otherwise rely on product_with_author view)
  // Re-checking the 'products_with_author' view in previous context, it provides 'category_name'.
  // So we don't need a separate categories fetch here if we fetch from that view.
  // Let's adjust product fetch to use products_with_author view again for category_name.
  const { data: productsWithCategory, error: productsWithCategoryError } = await supabase
    .from('products_with_author') // Use the view that includes category_name
    .select('slug, category_name, updated_at, created_at')
    .eq('is_published', true); // Ensure only published products are included

  if (productsWithCategoryError) {
    console.error('Error fetching products with category names:', productsWithCategoryError);
    return;
  }
  console.log(`Found ${productsWithCategory.length} published products with category names to include.`);


  // 6. Profiles are excluded based on robots.txt and previous logic.
  const profiles = [];

  // 7. GENERATE THE XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${articles.map(article => {
    const categoryPath = article.category.toLowerCase(); // Assuming category is already slug-ready
    const lastMod = article.updated_at || article.created_at;
    const formattedDate = lastMod ? new Date(lastMod).toISOString().split('T')[0] : today;

    return `
  <url>
    <loc>${baseUrl}/knowledge-base/${categoryPath}/${article.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
  ${productsWithCategory.map(product => { // Use productsWithCategory for correct paths
    // Ensure category_name is slugified for the URL if it contains spaces or special characters
    const categoryPath = product.category_name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const lastMod = product.updated_at || product.created_at;
    const formattedDate = lastMod ? new Date(lastMod).toISOString().split('T')[0] : today;

    return `
  <url>
    <loc>${baseUrl}/marketplace/${product.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
  ${profiles && profiles.length > 0 ? profiles.map(profile => {
    const lastMod = profile.updated_at ? new Date(profile.updated_at).toISOString().split('T')[0] : today;
    return `
  <url>
    <loc>${baseUrl}/profile/${profile.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('') : ''}
</urlset>`;

  // 8. ENSURE PUBLIC DIRECTORY EXISTS
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  // 9. WRITE THE FILE TO THE /public FOLDER
  fs.writeFileSync('public/sitemap.xml', sitemapXml);
  console.log('Sitemap generated successfully at public/sitemap.xml');
  console.log(`Total URLs in sitemap: ${staticPages.length + articles.length + productsWithCategory.length}`);
};

// Run the generator
generateSitemap().catch(console.error);