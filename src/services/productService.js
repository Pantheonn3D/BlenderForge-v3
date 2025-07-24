// src/services/productService.js (Modified)

import { supabase } from '../lib/supabaseClient';

// --- Fetches the list of official categories for dropdowns ---
export async function getMarketplaceCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching marketplace categories:", error);
    throw new Error("Could not fetch categories.");
  }
  return data;
}

// --- Generates a unique slug for a new product ---
const generateUniqueSlug = async (baseSlug) => {
  let finalSlug = baseSlug;
  let counter = 1;
  while (true) {
    const { data: existing } = await supabase.from('products').select('id').eq('slug', finalSlug).single();
    if (!existing) break;
    finalSlug = `${baseSlug}-${counter++}`;
  }
  return finalSlug;
};

// --- Creates a new product in the database ---
export async function createProduct(productData, thumbnailFile, productFile, userId) {
  if (!thumbnailFile || !productFile) {
    throw new Error('Thumbnail and product file are required.');
  }

  // Upload Thumbnail
  const thumbFileExt = thumbnailFile.name.split('.').pop();
  const thumbFileName = `public/${userId}-prod-thumb-${Date.now()}.${thumbFileExt}`;
  const { error: thumbUploadError } = await supabase.storage.from('product-thumbnails').upload(thumbFileName, thumbnailFile);
  if (thumbUploadError) throw new Error(`Thumbnail upload failed: ${thumbUploadError.message}`);
  const { data: thumbUrlData } = supabase.storage.from('product-thumbnails').getPublicUrl(thumbFileName);
  const thumbnailUrl = thumbUrlData.publicUrl;

  // Upload Product File
  const productFileExt = productFile.name.split('.').pop();
  const productFileName = `${userId}-prod-file-${Date.now()}.${productFileExt}`;
  const { error: productUploadError } = await supabase.storage.from('product-files').upload(productFileName, productFile);
  if (productUploadError) throw new Error(`Product file upload failed: ${productUploadError.message}`);
  const { data: productUrlData } = supabase.storage.from('product-files').getPublicUrl(productFileName);
  const downloadUrl = productUrlData.publicUrl;

  // Generate Slug
  const baseSlug = productData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const finalSlug = await generateUniqueSlug(baseSlug);

  // Prepare data for insertion
  const productToInsert = {
    ...productData,
    user_id: userId,
    slug: finalSlug,
    thumbnail_url: thumbnailUrl,
    download_url: downloadUrl,
    description: productData.description, // Pass the JSON object
    tags: productData.tags,
  };

  // Insert into database
  const { data, error: insertError } = await supabase.from('products').insert(productToInsert).select().single();
  if (insertError) throw new Error(`Product creation failed: ${insertError.message}`);

  return data;
}

// --- Fetches a list of products with filters ---
export async function getProducts({
  searchQuery = '',
  category = 'all',
  price = 'all',
  sort = 'newest',
  limit = null, // NEW: Add limit parameter
  orderBy = 'created_at', // NEW: Add orderBy parameter
  ascending = false, // NEW: Add ascending parameter
}) {
  let query = supabase
    .from('products_with_author')
    .select('*')
    .eq('is_published', true);

  if (category && category !== 'all') {
    query = query.eq('category_id', category);
  }

  if (price === 'free') {
    query = query.eq('price', 0);
  } else if (price === 'paid') {
    query = query.gt('price', 0);
  }

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  // MODIFIED: Apply general orderBy and ascending
  query = query.order(orderBy, { ascending: ascending });

  // Fallback to old sort logic if orderBy is not provided (shouldn't happen with new hook)
  // This switch block can largely be replaced by the new orderBy/ascending parameters,
  // but keeping it for now if 'sort' is still being used for specific predefined sorts.
  // For homepage featured products, we'll rely on orderBy directly.
  switch (sort) {
    case 'price_asc':
      // This will be handled by orderBy: 'price', ascending: true
      break;
    case 'price_desc':
      // This will be handled by orderBy: 'price', ascending: false
      break;
    case 'oldest':
      // This will be handled by orderBy: 'created_at', ascending: true
      break;
    case 'newest':
    default:
      // This will be handled by orderBy: 'created_at', ascending: false
      break;
  }

  if (limit) { // NEW: Apply limit
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products from view:', error);
    throw error;
  }

  return data;
}

// --- Fetches a single product by its slug ---
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products_with_author')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST204') return null;
    console.error('Error fetching single product:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  return data;
}

// --- Updates an existing product ---
export async function updateProduct(slug, productData, thumbnailFile, productFile) {
  let thumbnailUrl = productData.thumbnail_url;
  let downloadUrl = productData.download_url;

  if (thumbnailFile) {
    const thumbFileExt = thumbnailFile.name.split('.').pop();
    const thumbFileName = `public/${productData.user_id}-prod-thumb-${Date.now()}.${thumbFileExt}`;
    const { error: thumbUploadError } = await supabase.storage.from('product-thumbnails').upload(thumbFileName, thumbnailFile, { upsert: true });
    if (thumbUploadError) throw new Error(`Thumbnail update failed: ${thumbUploadError.message}`);
    const { data: thumbUrlData } = supabase.storage.from('product-thumbnails').getPublicUrl(thumbFileName);
    thumbnailUrl = thumbUrlData.publicUrl;
  }

  if (productFile) {
    const productFileExt = productFile.name.split('.').pop();
    const productFileName = `${productData.user_id}-prod-file-${Date.now()}.${productFileExt}`;
    const { error: productUploadError } = await supabase.storage.from('product-files').upload(productFileName, productFile, { upsert: true });
    if (productUploadError) throw new Error(`Product file update failed: ${productFileExt.message}`);
    const { data: productUrlData } = supabase.storage.from('product-files').getPublicUrl(productFileName);
    downloadUrl = productUrlData.publicUrl;
  }

  const productToUpdate = {
    name: productData.name,
    description: productData.description, // Pass the JSON object
    price: productData.price,
    category_id: productData.category_id,
    tags: productData.tags,
    version: productData.version,
    blender_version_min: productData.blender_version_min,
    thumbnail_url: thumbnailUrl,
    download_url: downloadUrl,
    updated_at: new Date().toISOString(),
  };

  const { data, error: updateError } = await supabase
    .from('products')
    .update(productToUpdate)
    .eq('slug', slug)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Product update failed: ${updateError.message}`);
  }

  return data;
}

// --- Deletes a product ---
export async function deleteProduct(slug, userId) {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('user_id')
    .eq('slug', slug)
    .single();

  if (fetchError || !product) throw new Error('Product not found.');
  if (product.user_id !== userId) throw new Error('You are not authorized to delete this product.');

  const { error: deleteError } = await supabase.from('products').delete().eq('slug', slug);
  if (deleteError) throw new Error(`Failed to delete product: ${deleteError.message}`);

  return true;
}

// --- Fetches reviews for a product ---
export async function getReviewsByProductId(productId) {
  const { data, error } = await supabase
    .from('reviews_with_author')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    throw new Error('Could not load reviews.');
  }
  return data;
}

// --- Submits a new review ---
export async function submitReview({ productId, rating, comment }) {
  if (!rating) throw new Error('Rating is required.');
  const { error } = await supabase.rpc('submit_review_and_update_ratings', {
    product_id_arg: productId,
    rating_arg: rating,
    comment_arg: comment
  });
  if (error) {
    console.error('Error submitting review via RPC:', error);
    throw new Error(error.message || 'Failed to submit review.');
  }
  return true;
}

// --- Deletes a review ---
export async function deleteReview(reviewId) {
  const { error } = await supabase.rpc('delete_review_and_update_ratings', {
    review_id_arg: reviewId
  });
  if (error) {
    console.error('Error deleting review via RPC:', error);
    throw new Error(error.message || 'Failed to delete review.');
  }
  return true;
}