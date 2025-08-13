// scripts/generate-sitemap.js

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' }); // Explicitly set path for clarity

// --- NEW: Reusable slugify function ---
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
};

const generateSitemap = async () => {
  console.log('Generating sitemap...');

  // 1. SETUP SUPABASE CLIENT
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing. Check your .env file.');
    process.exit(1); // Exit with error
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. DEFINE YOUR STATIC PAGES (from App.jsx, excluding disallowed pages)
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/knowledge-base', priority: '0.9', changefreq: 'daily' },
    { url: '/marketplace', priority: '0.9', changefreq: 'daily' },
    { url: '/support', priority: '0.7', changefreq: 'monthly' },
    { url: '/supporters', priority: '0.7', changefreq: 'monthly' },
    // --- UPDATED: Added new info pages ---
    { url: '/about', priority: '0.5', changefreq: 'yearly' },
    { url: '/contact', priority: '0.5', changefreq: 'yearly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
  ];
  // --- REMOVED disallowed pages: /create, /marketplace/upload, purchase pages ---

  const baseUrl = 'https://blenderforge.com';
  const today = new Date().toISOString().split('T')[0];

  // 3. FETCH DYNAMIC PAGES (ARTICLES) FROM SUPABASE
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('slug, category, updated_at, created_at')
    .eq('is_published', true);

  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
    return;
  }
  console.log(`Found ${articles.length} published articles.`);

  // 4. FETCH DYNAMIC PAGES (PRODUCTS) FROM SUPABASE
  // --- UPDATED: Removed redundant fetch, using only one correct fetch ---
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')
    .eq('is_published', true);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }
  console.log(`Found ${products.length} published products.`);


  // 5. GENERATE THE XML
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
    // --- UPDATED: Using the new robust slugify function ---
    const categoryPath = slugify(article.category);
    const lastMod = article.updated_at || article.created_at;
    const formattedDate = lastMod ? new Date(lastMod).toISOString().split('T')[0] : today;

    return `
  <url>
    <loc>${baseUrl}/knowledge-base/${categoryPath}/${article.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
  ${products.map(product => {
    const lastMod = product.updated_at || product.created_at;
    const formattedDate = lastMod ? new Date(lastMod).toISOString().split('T')[0] : today;

    // --- UPDATED: Corrected product URL structure to match App.jsx ---
    return `
  <url>
    <loc>${baseUrl}/marketplace/${product.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
</urlset>`;

  // 6. WRITE THE FILE TO THE /public FOLDER
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  fs.writeFileSync('public/sitemap.xml', sitemapXml);
  
  console.log('Sitemap generated successfully at public/sitemap.xml');
  console.log(`Total URLs in sitemap: ${staticPages.length + articles.length + products.length}`);
};

// Run the generator
generateSitemap().catch(console.error);