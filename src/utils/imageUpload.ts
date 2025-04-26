
import { supabase } from "@/integrations/supabase/client";

export const uploadImage = async (file: File, bucket: string, folderPath?: string): Promise<string | null> => {
  try {
    if (!file) return null;
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
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
