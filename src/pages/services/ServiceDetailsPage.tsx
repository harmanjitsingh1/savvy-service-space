
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar, Clock, MessageSquare, Star, Loader2, Heart, MapPin, Shield, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) throw new Error('Service ID is required');
      
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
      
      // Fetch the provider profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, image, bio')
        .eq('id', serviceData.provider_id)
        .single();
      
      if (profileError) {
        console.error('Error fetching provider profile:', profileError);
        toast.error('Failed to load provider details');
      }
      
      const providerName = profileData?.name || 'Provider';
      const providerImage = profileData?.image;
      const providerBio = profileData?.bio || 'No information provided.';

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
        providerBio: providerBio,
        images: serviceData.images || [],
        rating: 4.7, // Mockup rating
        reviewCount: 125, // Mockup review count
        location: 'Local Area', // Default location
        duration: serviceData.duration,
        available: true,
        createdAt: serviceData.created_at,
        availabilitySchedule: 'Mon–Sat, 9AM–6PM',
        serviceableAreas: ['Downtown', 'Uptown', 'Midtown', 'Suburbs'],
        whatsIncluded: [
          'Professional cleaning service',
          'Eco-friendly cleaning products',
          'All equipment provided',
          'Interior windows cleaning'
        ],
        whatsNotIncluded: [
          'Exterior windows',
          'Moving heavy furniture',
          'Deep stain removal'
        ],
        faqs: [
          {
            question: 'Do I need to be home during the service?',
            answer: 'No, you can provide access instructions if you cannot be present.'
          },
          {
            question: 'What cleaning products do you use?',
            answer: 'We use eco-friendly, non-toxic cleaning products.'
          },
          {
            question: 'How do I reschedule my booking?',
            answer: 'You can reschedule through your account dashboard up to 24 hours before the scheduled service.'
          },
          {
            question: 'Do you bring your own equipment?',
            answer: 'Yes, we bring all necessary cleaning equipment and supplies.'
          }
        ],
        cancellationPolicy: 'Free cancellation up to 24 hours before the scheduled service. Late cancellations may be charged a fee of up to 50% of the service cost.',
        refundPolicy: 'Not satisfied? Report within 24 hours for a free reclean or partial refund.'
      };
      
      return transformedService;
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mock data for related services
  const relatedServices = [
    {
      id: "1",
      title: "Deep Home Cleaning",
      price: 699,
      category: "Cleaning",
      images: ["/placeholder.svg"],
      rating: 4.5,
      reviewCount: 89,
      duration: 3,
      providerName: "CleanPro Services"
    },
    {
      id: "2",
      title: "Quick Sanitization Service",
      price: 299,
      category: "Cleaning",
      images: ["/placeholder.svg"],
      rating: 4.2,
      reviewCount: 45,
      duration: 1,
      providerName: "Hygiene Experts"
    },
    {
      id: "3",
      title: "Carpet Deep Cleaning",
      price: 549,
      category: "Cleaning",
      images: ["/placeholder.svg"],
      rating: 4.7,
      reviewCount: 67,
      duration: 2,
      providerName: "Spotless Floors"
    },
    {
      id: "4",
      title: "Office Sanitization",
      price: 899,
      category: "Cleaning",
      images: ["/placeholder.svg"],
      rating: 4.8,
      reviewCount: 32,
      duration: 4,
      providerName: "Business Clean Co."
    }
  ];

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

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-4 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading service details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !service) {
    return (
      <MainLayout>
        <div className="container py-4">
          <Card>
            <CardContent className="py-6">
              <h2 className="text-xl font-bold mb-2">Service Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't load this service. It might have been removed or doesn't exist.
              </p>
              <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{service.title}</h1>
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

        <div className="flex items-center mb-4 gap-2 flex-wrap">
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            {service.category}
          </Badge>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{service.rating}</span>
            <span className="text-muted-foreground ml-1">({service.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center ml-2">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{service.location}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Service Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Service Image Carousel */}
            <div>
              {service.images && service.images.length > 0 ? (
                <Carousel className="w-full" value={activeImageIndex} onValueChange={setActiveImageIndex}>
                  <CarouselContent>
                    {service.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <AspectRatio ratio={16 / 9} className="bg-muted">
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
                  <CarouselPrevious className="left-2 carousel-button" />
                  <CarouselNext className="right-2 carousel-button" />
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

              {/* Thumbnails Row */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                {service.images?.slice(0, 5).map((image, index) => (
                  <div 
                    key={`thumb-${index}`} 
                    className={`rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity ${
                      activeImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-border'
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <AspectRatio ratio={1}>
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Description */}
            <div className="whitespace-pre-line">
              {service.description || "No description provided."}
            </div>

            {/* Mobile View - Price and Booking Card */}
            <Card className="md:hidden">
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold">₹{service.price}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.availabilitySchedule}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground pt-2">
                  {service.description.substring(0, 100)}
                  {service.description.length > 100 ? '...' : ''}
                </p>
                
                <div className="pt-2">
                  <Button asChild className="w-full">
                    <Link to={`/services/${service.id}/booking`}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Provider Information Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.providerImage || ""} />
                    <AvatarFallback>
                      {service.providerName ? service.providerName.substring(0, 2).toUpperCase() : "SP"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">Service by {service.providerName}</h3>
                      <Badge variant="outline" className="ml-2 text-xs px-2 py-0 bg-blue-50 text-blue-700 border-blue-200">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm">{service.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({service.reviewCount} reviews)
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Provider
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies & FAQs */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" /> Policies
                  </h2>
                  <div>
                    <h4 className="font-medium mb-1">Cancellation Policy</h4>
                    <p className="text-sm text-muted-foreground">{service.cancellationPolicy}</p>
                  </div>
                  
                  <h2 className="text-lg font-semibold mb-2 flex items-center pt-4 border-t">
                    <HelpCircle className="h-5 w-5 mr-2" /> Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {service.faqs?.map((faq, index) => (
                      <AccordionItem key={`faq-${index}`} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Info Card (Desktop Only) */}
          <div className="hidden md:block">
            <Card className="sticky top-20">
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold">₹{service.price}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.availabilitySchedule}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground pt-2">
                  {service.description.substring(0, 120)}
                  {service.description.length > 120 ? '...' : ''}
                </p>
                
                <div className="pt-2">
                  <Button asChild className="w-full">
                    <Link to={`/services/${service.id}/booking`}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Services Section - Horizontal Scrolling Carousel */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Similar Services</h2>
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {relatedServices.map((relatedService) => (
                  <CarouselItem key={relatedService.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Link 
                      to={`/services/${relatedService.id}`} 
                      className="block group h-full"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                        <AspectRatio ratio={4/3}>
                          <img 
                            src={relatedService.images[0]} 
                            alt={relatedService.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </AspectRatio>
                        <CardContent className="p-3">
                          <h3 className="font-semibold truncate group-hover:text-primary text-sm">{relatedService.title}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <p className="font-medium text-sm">₹{relatedService.price}</p>
                            <div className="flex items-center text-xs">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{relatedService.rating}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 carousel-button" />
              <CarouselNext className="right-2 carousel-button" />
            </Carousel>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
