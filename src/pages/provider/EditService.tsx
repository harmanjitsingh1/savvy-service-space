
import React, { useEffect, useState } from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Image, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/utils/imageUpload";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  category: z.string().min(1, {
    message: "Please select a category",
  }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  duration: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Duration must be a positive number",
  }),
});

export default function EditServicePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      duration: "",
    },
  });
  
  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID is required");
      
      const { data, error } = await supabase
        .from("provider_services")
        .select("*")
        .eq("id", id)
        .eq("provider_id", user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
  
  useEffect(() => {
    if (service) {
      form.reset({
        title: service.title,
        description: service.description,
        category: service.category,
        price: String(service.price),
        duration: String(service.duration),
      });
      
      if (service.images && Array.isArray(service.images)) {
        setUploadedImages(service.images);
      }
    }
  }, [service, form]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      const imageUrl = await uploadImage(file, 'services', 'service_images');
      
      if (imageUrl) {
        setUploadedImages((prev) => [...prev, imageUrl]);
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !id) return;
    
    try {
      const { error } = await supabase
        .from("provider_services")
        .update({
          title: values.title,
          description: values.description,
          category: values.category,
          price: parseFloat(values.price),
          duration: parseInt(values.duration),
          updated_at: new Date().toISOString(),
          images: uploadedImages.length > 0 ? uploadedImages : null,
        })
        .eq("id", id)
        .eq("provider_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      
      navigate("/provider/services");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!user || !id) return;
    
    try {
      // If service has images, delete them from storage
      if (uploadedImages.length > 0) {
        // Extract image paths from URLs
        const imagePaths = uploadedImages.map(url => {
          const parts = url.split('services/');
          return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean);
        
        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase
            .storage
            .from('services')
            .remove(imagePaths as string[]);
          
          if (storageError) {
            console.error('Error deleting service images:', storageError);
          }
        }
      }
      
      // Delete the service
      const { error } = await supabase
        .from("provider_services")
        .delete()
        .eq("id", id)
        .eq("provider_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      
      navigate("/provider/services");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading service...</p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Update your service listing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Professional House Cleaning" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
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
                
                <div className="space-y-4">
                  <FormLabel>Service Images</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group rounded-md overflow-hidden border aspect-square">
                        <img 
                          src={url} 
                          alt={`Service ${index + 1}`} 
                          className="object-cover w-full h-full"
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
                    
                    {uploadedImages.length < 4 && (
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
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add up to 4 images for your service listing. Images help clients understand your service better.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cleaning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="29.99" {...field} />
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
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="destructive" 
                    type="button"
                    onClick={handleDelete}
                  >
                    Delete Service
                  </Button>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => navigate("/provider/services")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Service</Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        isDangerous={true}
      />
    </ProviderLayout>
  );
}
