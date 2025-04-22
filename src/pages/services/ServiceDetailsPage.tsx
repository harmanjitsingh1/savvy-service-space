
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getServiceById, getReviewsForService } from "@/services/mockData";
import { Service, Review } from "@/types";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Share2, 
  Heart,
  Calendar,
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { cn } from "@/lib/utils";

const createProperUuid = (id: string | undefined): string => {
  if (!id) return "";
  
  if (id.includes('-')) return id;
  
  return `00000000-0000-0000-0000-${id.padStart(12, '0')}`;
};

export default function ServiceDetailsPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const formattedServiceId = serviceId ? createProperUuid(serviceId) : undefined;

  useEffect(() => {
    if (serviceId) {
      const fetchedService = getServiceById(serviceId);
      if (fetchedService) {
        setService(fetchedService);
        setReviews(getReviewsForService(serviceId));
      }
      setIsLoading(false);
    }
  }, [serviceId]);

  const { data: isSaved } = useQuery({
    queryKey: ["savedService", formattedServiceId, user?.id],
    queryFn: async () => {
      if (!user || !formattedServiceId) return false;
      
      console.log("Checking if service is saved:", { serviceId: formattedServiceId, userId: user.id });
      try {
        const { data, error } = await supabase
          .from("saved_services")
          .select()
          .eq("user_id", user.id)
          .eq("service_id", formattedServiceId);
          
        if (error) {
          console.error("Error checking saved status:", error);
          return false;
        }
        
        return data && data.length > 0;
      } catch (error) {
        console.error("Exception checking saved status:", error);
        return false;
      }
    },
    enabled: !!user && !!formattedServiceId,
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Toggling save for service:", { serviceId: formattedServiceId, isSaved });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      // Instead of trying to directly set data, invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["savedService", formattedServiceId, user?.id] });
      
      // Or we can use local state until the query refetches
      queryClient.setQueryData(["savedService", formattedServiceId, user?.id], !isSaved);
      
      toast({
        title: isSaved ? "Service removed from saved" : "Service saved",
        description: isSaved 
          ? "The service has been removed from your saved list" 
          : "The service has been added to your saved list",
      });
    },
    onError: (error) => {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to book this service",
        action: (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        ),
      });
      return;
    }
    navigate(`/booking/${serviceId}`);
  };

  const handleSaveService = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to save services",
      });
      return;
    }
    toggleSave.mutate();
  };

  const handleContactProvider = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to contact providers",
      });
      return;
    }
    navigate(`/messages/${service?.providerId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Service not found</h2>
          <p className="mb-8 text-muted-foreground">
            The service you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => navigate("/services")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Browse Services
          </Button>
        </div>
      </MainLayout>
    );
  }

  const serviceWithFormattedIds = service ? {
    ...service,
    id: formattedServiceId || service.id,
    providerId: service.providerId ? createProperUuid(service.providerId) : service.providerId
  } : null;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link to="/services" className="text-muted-foreground hover:text-primary">Services</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link to={`/services?category=${encodeURIComponent(service?.category || '')}`} className="text-muted-foreground hover:text-primary">
            {service?.category}
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium">{service?.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{service.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                {service.category}
              </Badge>
              
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{service.rating}</span>
                <span className="text-muted-foreground ml-1">({service.reviewCount} reviews)</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{service.location}</span>
              </div>
            </div>

            <Carousel className="mb-8">
              <CarouselContent>
                {service.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${service.title} - image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>

            <Tabs defaultValue="description" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="provider">Provider</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="pt-4">
                <h3 className="text-lg font-medium mb-2">Service Details</h3>
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{service.duration} hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">₹{service.price}/hr</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="pt-4">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b last:border-b-0">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={review.userImage} alt={review.userName} />
                              <AvatarFallback>{review.userName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="font-medium mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">
                      Be the first one to review this service
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="provider" className="pt-4">
                <div className="flex items-start">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src={service.providerImage} alt={service.providerName} />
                    <AvatarFallback>{service.providerName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{service.providerName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Service Provider</p>
                    <div className="flex items-center mb-4">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-muted-foreground ml-1">({service.reviewCount} reviews)</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleContactProvider}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Contact Provider
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Contact via messaging</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Contact via messaging</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/provider/${service.providerId}`)}>
                    <ExternalLink className="h-4 w-4 mr-2" /> View Provider Profile
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <div className="bg-background rounded-lg border p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Book This Service</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per hour</span>
                  <span className="font-medium flex items-center">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    {service?.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated duration</span>
                  <span className="font-medium">{service?.duration} hours</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total estimate</span>
                  <span className="font-bold flex items-center">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    {service?.price ? service.price * service.duration : 0}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {serviceWithFormattedIds && <BookingDialog service={serviceWithFormattedIds} />}
              
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleContactProvider}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Message
                  </Button>
                  <Button 
                    variant={isSaved ? "default" : "outline"}
                    className="flex-1" 
                    onClick={handleSaveService}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 mr-2",
                        isSaved && "fill-white text-white"
                      )} 
                    /> 
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>
              
                <div className="mt-2">
                  {serviceId && <ShareDialog serviceId={serviceId} serviceTitle={service?.title || ""} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
