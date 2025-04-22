import React, { useEffect } from "react";
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
    }
  }, [service, form]);
  
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
    if (!user || !id) return;
    
    try {
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
    </ProviderLayout>
  );
}
