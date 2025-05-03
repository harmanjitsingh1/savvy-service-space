import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, X, Plus, Image } from 'lucide-react';
import { uploadImage } from '@/utils/imageUpload';

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 5;

// Categories for the dropdown
const SERVICE_CATEGORIES = [
  'Cleaning',
  'Home Repair',
  'Plumbing',
  'Electrical',
  'Gardening',
  'Tutoring',
  'Pet Care',
  'Beauty',
  'Health',
  'Technology',
  'Transportation',
  'Event Planning',
  'Other'
];

// Day options for availability
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Validation schema
const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Price must be a positive whole number',
  }),
  duration: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Duration must be a positive number',
  }),
  location: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
});

type ServiceFormProps = {
  serviceId?: string;
  onSuccess?: () => void;
};

export function ServiceForm({ serviceId, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState<boolean>(false);

  // Check if the bucket exists
  useEffect(() => {
    const checkBucketExists = async () => {
      try {
        // Try to list items in the bucket to see if it exists and we have access
        const { data, error } = await supabase.storage
          .from('services')
          .list();
        
        if (error) {
          console.error('Error checking bucket:', error);
          setBucketExists(false);
          setImageLoadError('Services storage bucket is not accessible. Please try again later or contact support.');
          return;
        }
        
        setBucketExists(true);
        setImageLoadError(null);
      } catch (error: any) {
        console.error('Error checking bucket exists:', error);
        setBucketExists(false);
        setImageLoadError('Error checking storage bucket. Please try again later.');
      }
    };
    
    checkBucketExists();
  }, []);

  // Initialize form with default values
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      tags: '',
      price: '',
      duration: '1',
      location: '',
      availableDays: [],
    },
  });

  // Fetch service data if in edit mode
  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        try {
          const { data, error } = await supabase
            .from('provider_services')
            .select('*')
            .eq('id', serviceId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Parse tags from the database
            const tagsString = data.availability && typeof data.availability === 'object' && 'tags' in data.availability 
              ? (data.availability as any).tags?.join(', ') || ''
              : '';
            
            // Parse location from the database
            const location = data.availability && typeof data.availability === 'object' && 'location' in data.availability
              ? (data.availability as any).location || ''
              : '';

            // Populate form with existing data
            form.reset({
              title: data.title,
              category: data.category,
              description: data.description || '',
              tags: tagsString,
              price: Math.round(data.price).toString(), // Convert to integer
              duration: data.duration.toString(),
              location: location,
              availableDays: [],
            });

            // Set uploaded images
            if (data.images && Array.isArray(data.images)) {
              setUploadedImages(data.images);
            }
            
            // Set selected days from availability if it exists
            if (data.availability && 
                typeof data.availability === 'object' && 
                'days' in data.availability &&
                Array.isArray((data.availability as any).days)) {
              setSelectedDays((data.availability as any).days);
            }
          }
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to load service details',
            variant: 'destructive',
          });
        }
      };

      fetchService();
    }
  }, [serviceId, form, toast]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Check if maximum images reached
    if (uploadedImages.length >= MAX_IMAGES) {
      toast({
        title: 'Maximum images reached',
        description: `You can upload a maximum of ${MAX_IMAGES} images`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPEG, PNG and WebP images are allowed',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setImageLoadError(null);
      
      // Upload the image directly to the bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `service_images/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      // First compress the image
      const compressedFile = await new Promise<File>((resolve, reject) => {
        new Compressor(file, {
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1200,
          success(result) {
            const compressedFile = new File([result], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          error(err) {
            reject(err);
          },
        });
      });
      
      // Upload directly to Supabase storage
      const { data, error } = await supabase.storage
        .from('services')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('services')
        .getPublicUrl(data!.path);
      
      setUploadedImages((prev) => [...prev, publicUrl]);
      
      toast({
        title: 'Image uploaded successfully',
        description: 'Your image has been uploaded and compressed for better performance',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setImageLoadError(error.message);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Clear the input value so the same file can be uploaded again if needed
      if (e.target.value) e.target.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    setSelectedDays((prev) => 
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof serviceSchema>) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Parse tags into array
      const tagsArray = values.tags 
        ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

      // Create availability object with both days and tags
      const availability = {
        days: selectedDays,
        tags: tagsArray,
        location: values.location
      };

      const serviceData = {
        title: values.title,
        description: values.description,
        category: values.category,
        price: parseInt(values.price), // Store as integer
        duration: parseInt(values.duration),
        provider_id: user.id,
        availability,
        images: uploadedImages.length > 0 ? uploadedImages : null,
        updated_at: new Date().toISOString(),
      };

      if (serviceId) {
        // Update existing service
        const { error } = await supabase
          .from('provider_services')
          .update(serviceData)
          .eq('id', serviceId)
          .eq('provider_id', user.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Service updated successfully',
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('provider_services')
          .insert({
            ...serviceData,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Service created successfully',
        });
      }

      // Call onSuccess callback or navigate back
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/provider/services');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Processing...</span>
      </div>
    );
  }
  
  // Display error if there's an issue with the bucket
  if (imageLoadError && !bucketExists) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Storage Setup Incomplete</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{imageLoadError}</p>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Service Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Professional House Cleaning" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your service in detail..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. cleaning, home, professional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price* (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="999" 
                          type="number" 
                          step="1" 
                          min="0" 
                          {...field}
                          onChange={(e) => {
                            // Only allow integer values
                            const value = e.target.value;
                            const intValue = parseInt(value);
                            if (!isNaN(intValue)) {
                              field.onChange(intValue.toString());
                            } else if (value === '') {
                              field.onChange('');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration* (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Online or specific location"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              {/* Service Images */}
              <div className="space-y-4">
                <FormLabel>Service Images (Max {MAX_IMAGES})</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group rounded-md overflow-hidden border aspect-square">
                      <img
                        src={url}
                        alt={`Service ${index + 1}`}
                        className="object-cover w-full h-full"
                        loading="lazy" // For better performance
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {uploadedImages.length < MAX_IMAGES && (
                    <div className="border rounded-md border-dashed flex flex-col items-center justify-center p-4 aspect-square">
                      <label
                        htmlFor="service-image"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                      >
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <>
                            <Image className="mb-2 h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Upload Image
                            </span>
                          </>
                        )}
                        <Input
                          id="service-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading || !bucketExists}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to {MAX_IMAGES} images. Images help clients understand your service better.
                </p>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <FormLabel>Availability</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(day) ? 'default' : 'outline'}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Service Preview */}
              <Card className="mt-6 border-dashed">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Service Preview</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Title:</span>
                      <p className="font-medium">{form.watch('title') || 'No title provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <p>{form.watch('category') || 'No category selected'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <p>₹{form.watch('price') || '0'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <p>{form.watch('duration') || '0'} hour(s)</p>
                    </div>
                    {selectedDays.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Available on:</span>
                        <p>{selectedDays.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/provider/services')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploading || !bucketExists}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {serviceId ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
