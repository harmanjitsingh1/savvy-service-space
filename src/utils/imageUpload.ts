
import { supabase } from "@/integrations/supabase/client";
import Compressor from 'compressorjs';

// Helper function to compress images before upload
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8, // 0.8 means 80% quality
      maxWidth: 1200,
      maxHeight: 1200,
      success(result) {
        // Create a new file from the compressed blob
        const compressedFile = new File([result], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      },
      error(err) {
        console.error('Image compression error:', err);
        reject(err);
      },
    });
  });
};

// Function to check if bucket exists, create if it doesn't
const ensureBucketExists = async (bucket: string): Promise<void> => {
  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error checking buckets:', listError);
    throw new Error(`Error checking if bucket exists: ${listError.message}`);
  }
  
  const bucketExists = buckets?.some(b => b.name === bucket);
  
  if (!bucketExists) {
    console.warn(`Bucket '${bucket}' not found, attempting to create it...`);
    try {
      // You can't create buckets client-side, so we'll throw an appropriate error
      throw new Error(`Bucket '${bucket}' does not exist. Please ensure the bucket is created in Supabase.`);
    } catch (error) {
      console.error('Error with bucket:', error);
      throw error;
    }
  }
};

export const uploadImage = async (file: File, bucket: string, folderPath?: string): Promise<string | null> => {
  try {
    if (!file) return null;
    
    // Ensure the bucket exists
    await ensureBucketExists(bucket);
    
    // Compress the image before upload
    const compressedFile = await compressImage(file);
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Upload compressed file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const deleteImage = async (url: string, bucket: string): Promise<void> => {
  try {
    // Extract path from URL
    const path = url.split(`${bucket}/`)[1];
    if (!path) return;
    
    // Delete file from Supabase storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};
