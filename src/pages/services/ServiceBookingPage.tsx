
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Calendar, Clock, MapPin, IndianRupee } from "lucide-react";
import { BookingForm } from "@/components/booking/BookingForm";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ServiceBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) throw new Error('Service ID is required');
      
      console.log("Fetching service with ID for booking page:", id);
      
      // First, fetch the service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('provider_services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (serviceError) {
        console.error('Error fetching service:', serviceError);
        toast.error('Failed to load service details');
        throw serviceError;
      }

      console.log("Fetched service data:", serviceData);
      
      // Fetch the provider profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, image')
        .eq('id', serviceData.provider_id)
        .single();
      
      if (profileError) {
        console.error('Error fetching provider profile:', profileError);
        toast.error('Failed to load provider details');
      }
      
      const providerName = profileData?.name || 'Provider';
      const providerImage = profileData?.image;

      // Transform to Service type
      const transformedService: Service = {
        id: serviceData.id,
        title: serviceData.title,
        description: serviceData.description || '',
        price: Number(serviceData.price),
        category: serviceData.category,
        providerId: serviceData.provider_id,
        providerName: providerName,
        providerImage: providerImage,
        images: serviceData.images || [],
        rating: 0, // Default rating 
        reviewCount: 0, // Default review count
        location: 'Local Area', // Default location
        duration: serviceData.duration,
        available: true,
        createdAt: serviceData.created_at
      };
      
      return transformedService;
    },
    enabled: !!id,
    retry: 1,
  });

  const handleBookingSuccess = () => {
    toast.success("Booking successful!");
    navigate('/user/dashboard');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading service details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !service) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                We couldn't load this service. It might have been removed or doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/services')}>
                Browse other services
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-4 md:py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Book Service</h1>
              <p className="text-muted-foreground mt-1">{service.title}</p>
            </div>

            {service.images && service.images.length > 0 ? (
              <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
                <img 
                  src={service.images[0]} 
                  alt={service.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </AspectRatio>
            ) : (
              <div className="bg-muted rounded-md">
                <AspectRatio ratio={16 / 9}>
                  <div className="flex items-center justify-center h-full">
                    No image available
                  </div>
                </AspectRatio>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold text-xl">₹{service.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">per session</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
                    <p className="text-muted-foreground text-sm">Service duration</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">{service.location}</span>
                    <p className="text-muted-foreground text-sm">Service location</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line text-sm">
                    {service.description || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Complete Your Booking</CardTitle>
                <CardDescription>
                  Select date and time for your appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm service={service} onSuccess={handleBookingSuccess} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
