// src/services/imageUploadService.js

import { supabase } from '../lib/supabaseClient';

/**
 * Uploads an image file to Supabase storage and returns its public URL.
 * @param {File} file - The image file to upload.
 * @param {string} userId - The ID of the user uploading the file.
 * @returns {Promise<string>} The public URL of the uploaded image.
 * @throws {Error} If the upload fails.
 */
export async function uploadImageToContentStorage(file, userId) {
  if (!file || !userId) {
    throw new Error('File and user ID are required for image upload.');
  }

  const fileExt = file.name.split('.').pop();
  // Generate a unique filename for the content image
  const fileName = `content/${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  // Using the 'product-gallery-images' bucket for consistency with product images
  const { error: uploadError } = await supabase.storage
    .from('product-gallery-images') 
    .upload(fileName, file);

  if (uploadError) {
    console.error('Supabase image upload error:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-gallery-images')
    .getPublicUrl(fileName);

  if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image.');
  }

  return publicUrl;
}