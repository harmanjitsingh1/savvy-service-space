
import Compressor from 'compressorjs';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

/**
 * Compress an image file before uploading
 * @param file The image file to compress
 * @returns A Promise that resolves to the compressed file
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      success: (result) => {
        const compressedFile = new File([result], file.name, {
          type: result.type,
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      },
      error: (err) => {
        console.error('Image compression error:', err);
        // If compression fails, return the original file
        resolve(file);
      },
    });
  });
};

/**
 * Check if the bucket exists in Supabase storage and create it if it doesn't
 * @param bucketName The name of the bucket to check and possibly create
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket '${bucketName}' not found. Please ensure it exists in your Supabase project.`);
      toast.error(`Storage bucket '${bucketName}' not found. Please contact your administrator.`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    toast.error("Error checking storage bucket. Please try again later.");
    return false;
  }
};

/**
 * Upload an image to Supabase storage
 * @param file The file to upload
 * @param bucketName The name of the bucket to upload to
 * @returns A Promise that resolves to the URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucketName: string = 'services'
): Promise<string | null> => {
  try {
    // First, ensure the bucket exists
    const bucketExists = await ensureBucketExists(bucketName);
    if (!bucketExists) {
      return null;
    }
    
    // Compress the image before uploading
    const compressedFile = await compressImage(file);
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, compressedFile);
    
    if (error) {
      console.error('Image upload error:', error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    }
    
    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error("An unexpected error occurred while uploading your image.");
    return null;
  }
};

/**
 * Upload multiple images to Supabase storage
 * @param files The array of files to upload
 * @param bucketName The name of the bucket to upload to
 * @returns A Promise that resolves to an array of URLs of the uploaded images
 */
export const uploadMultipleImages = async (
  files: File[],
  bucketName: string = 'services'
): Promise<string[]> => {
  // Ensure the bucket exists before attempting uploads
  const bucketExists = await ensureBucketExists(bucketName);
  if (!bucketExists) {
    return [];
  }
  
  const uploadPromises = files.map(file => uploadImage(file, bucketName));
  const results = await Promise.all(uploadPromises);
  
  // Filter out any null values (failed uploads)
  return results.filter((url): url is string => url !== null);
};
