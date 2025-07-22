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

  // 2. DEFINE YOUR STATIC PAGES
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/knowledge-base', priority: '0.9', changefreq: 'weekly' },
    { url: '/support', priority: '0.7', changefreq: 'monthly' },
    { url: '/supporters', priority: '0.7', changefreq: 'monthly' },
    { url: '/login', priority: '0.5', changefreq: 'yearly' },
    { url: '/signup', priority: '0.5', changefreq: 'yearly' },
    { url: '/create', priority: '0.6', changefreq: 'monthly' },
  ];

  const baseUrl = 'https://blenderforge.com'; // Update this to your actual domain
  const today = new Date().toISOString().split('T')[0];

  // 3. FETCH DYNAMIC PAGES (ARTICLES) FROM SUPABASE
  const { data: articles, error } = await supabase
    .from('articles') 
    .select('slug, category, updated_at, created_at');

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles to include in sitemap`);

  // 4. FETCH USER PROFILES FOR PROFILE PAGES (Fixed column name)
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, updated_at'); // Changed from user_id to id

  if (profileError) {
    console.warn('Could not fetch profiles for sitemap:', profileError);
  } else {
    console.log(`Found ${profiles.length} profiles to include in sitemap`);
  }

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
    const categoryPath = article.category.toLowerCase();
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

  // 6. ENSURE PUBLIC DIRECTORY EXISTS
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  // 7. WRITE THE FILE TO THE /public FOLDER
  fs.writeFileSync('public/sitemap.xml', sitemapXml);
  console.log('Sitemap generated successfully at public/sitemap.xml');
  console.log(`Total URLs in sitemap: ${staticPages.length + articles.length + (profiles ? profiles.length : 0)}`);
};

// Run the generator
generateSitemap().catch(console.error);