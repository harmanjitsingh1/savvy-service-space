
import React, { useEffect } from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { ServiceForm } from "@/components/provider/ServiceForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Check if storage bucket exists on component mount
  useEffect(() => {
    const checkStorageBucket = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking storage buckets:', error);
          return;
        }
        
        const servicesBucketExists = buckets?.some(b => b.name === 'services');
        
        if (!servicesBucketExists) {
          toast({
            title: 'Storage Setup Incomplete',
            description: 'The services storage bucket does not exist. Some features may not work correctly.',
            variant: 'destructive',
            duration: 5000,
          });
        }
      } catch (err) {
        console.error('Failed to check storage buckets:', err);
      }
    };
    
    checkStorageBucket();
  }, [toast]);
  
  if (!id) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p>Service ID is missing. Please go back and try again.</p>
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
            <ServiceForm serviceId={id} />
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
}
