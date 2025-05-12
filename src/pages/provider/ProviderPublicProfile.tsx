
import React from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MessageSquare, MapPin, User, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function ProviderPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Fetch provider profile
  const { data: provider, isLoading: loadingProvider } = useQuery({
    queryKey: ['provider-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('Provider ID is required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching provider profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });
  
  // Fetch provider services
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['provider-services', id],
    queryFn: async () => {
      if (!id) throw new Error('Provider ID is required');
      
      const { data, error } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', id);
        
      if (error) {
        console.error('Error fetching provider services:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });

  if (loadingProvider || loadingServices) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading provider information...</span>
        </div>
      </MainLayout>
    );
  }
  
  if (!provider) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-6">
              <h2 className="text-xl font-bold mb-2">Provider Not Found</h2>
              <p className="text-muted-foreground">The provider you're looking for doesn't exist or has been removed.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/services">Browse Services</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const formattedAddress = [provider.address, provider.city, provider.state]
    .filter(Boolean)
    .join(', ');
  
  return (
    <MainLayout>
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={provider.image || ""} alt={provider.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <h1 className="text-2xl font-bold">{provider.name}</h1>
                  <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                    Verified Provider
                  </Badge>
                  
                  {formattedAddress && (
                    <div className="flex items-center justify-center mt-4">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">{formattedAddress}</span>
                    </div>
                  )}
                  
                  {user && user.id !== id && (
                    <Link to={`/chat/${id}`} className="w-full mt-6">
                      <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Provider
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services ({services?.length || 0})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {provider.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {provider.bio || `${provider.name} has not added a bio yet.`}
                      </p>
                      
                      {provider.phone && (
                        <>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Contact Information</span>
                            <span className="text-muted-foreground">{provider.phone}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="services">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services && services.length > 0 ? (
                    services.map((service) => (
                      <Link 
                        key={service.id} 
                        to={`/services/${service.id}`} 
                        className="block group"
                      >
                        <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                          <div className="relative">
                            <AspectRatio ratio={4/3}>
                              <img 
                                src={service.images?.[0] || "/placeholder.svg"} 
                                alt={service.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </AspectRatio>
                            <Badge 
                              className="absolute top-2 right-2 bg-secondary text-secondary-foreground"
                            >
                              {service.category}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary truncate">
                              {service.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="font-bold">₹{service.price}</p>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm">4.8</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {service.description || "No description available"}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">This provider has not published any services yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews available yet.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
