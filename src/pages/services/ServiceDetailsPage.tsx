
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar, Clock, MessageSquare, Star, Loader2, Heart, HeartOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) throw new Error('Service ID is required');
      
      console.log("Fetching service with ID:", id);
      
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
      
      console.log("Transformed service:", transformedService);
      return transformedService;
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleSaveToWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please login to save services to your wishlist");
      return;
    }

    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success("Service added to your wishlist");
    } else {
      toast.info("Service removed from your wishlist");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading service details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !service) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                We couldn't load this service. It might have been removed or doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{service.title}</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSaveToWishlist}
                  className="text-muted-foreground hover:text-primary"
                  title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isSaved ? 
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" /> : 
                    <Heart className="h-5 w-5" />
                  }
                </Button>
              </div>
              <div className="flex items-center mt-2 space-x-2">
                <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                  {service.category}
                </Badge>
                {service.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{service.rating}</span>
                    <span className="text-muted-foreground ml-1">({service.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>

            {service.images && service.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {service.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <AspectRatio ratio={16 / 9}>
                        <img 
                          src={image} 
                          alt={`${service.title} - image ${index + 1}`}
                          className="rounded-md object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="bg-muted rounded-md">
                <AspectRatio ratio={16 / 9}>
                  <div className="flex items-center justify-center h-full">
                    No images available
                  </div>
                </AspectRatio>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">About this service</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {service.description || "No description provided."}
              </p>
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Service Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.providerImage || ""} />
                    <AvatarFallback>
                      {service.providerName ? service.providerName.substring(0, 2).toUpperCase() : "SP"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{service.providerName}</h3>
                    <p className="text-sm text-muted-foreground">Service Provider</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="py-4">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Provider
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {service.reviewCount > 0 ? (
                  <div className="space-y-4">
                    {/* Reviews would be displayed here */}
                    <p className="text-muted-foreground">This service has {service.reviewCount} reviews.</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this service.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Book this service</CardTitle>
                <CardDescription>
                  Get your service scheduled today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold">₹{service.price}</span>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Service details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Available for booking</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/services/${service.id}/booking`}>
                    Book Now
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
