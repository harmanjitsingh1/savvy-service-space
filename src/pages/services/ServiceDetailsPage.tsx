
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
import { Calendar, Clock, MessageSquare, Star, Loader2, Heart, HeartOff, Check, X, MapPin, Shield, Tag, HelpCircle, ExternalLink, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      
      console.log("Transformed service:", transformedService);
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
      title: "Office Cleaning",
      price: 999,
      category: "Cleaning",
      images: ["/placeholder.svg"],
      rating: 4.8,
      reviewCount: 102,
      duration: 4,
      providerName: "CleanPro Services"
    }
  ];

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      userName: "Jane Smith",
      userImage: "/placeholder.svg",
      rating: 5,
      date: "2023-05-10",
      comment: "Exceptional service! The cleaner was thorough and professional. My house has never looked better."
    },
    {
      id: "2",
      userName: "John Doe",
      userImage: "/placeholder.svg",
      rating: 4,
      date: "2023-04-28",
      comment: "Very good service overall. Missed a few spots under the furniture but otherwise excellent."
    },
    {
      id: "3",
      userName: "Sarah Johnson",
      userImage: "/placeholder.svg",
      rating: 5,
      date: "2023-04-15",
      comment: "Fantastic job! Very detail-oriented and efficient. Will definitely book again."
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

  // Calculate rating distribution
  const ratingDistribution = [
    { rating: 5, percentage: 70 },
    { rating: 4, percentage: 20 },
    { rating: 3, percentage: 5 },
    { rating: 2, percentage: 3 },
    { rating: 1, percentage: 2 }
  ];

  return (
    <MainLayout>
      <div className="container py-4 md:py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/services">Services</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/services?category=${service.category}`}>{service.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{service.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
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

        <div className="flex items-center mb-6 gap-2 flex-wrap">
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            <Tag className="h-3.5 w-3.5 mr-1" />
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

        {/* Hero Section with Left-Right Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Left Column - Service Image Carousel */}
          <div className="md:col-span-2">
            {service.images && service.images.length > 0 ? (
              <Carousel className="w-full">
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
                <CarouselPrevious className="-left-4 md:-left-6" />
                <CarouselNext className="-right-4 md:-right-6" />
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

            {/* Thumbnails Row (Desktop Only) */}
            <div className="hidden md:grid grid-cols-5 gap-2 mt-2">
              {service.images?.slice(0, 5).map((image, index) => (
                <div key={`thumb-${index}`} className="rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity">
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

          {/* Right Column - Quick Info Card */}
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
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{service.availabilitySchedule}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="line-clamp-1">
                      Available in {service.serviceableAreas?.slice(0, 2).join(', ')}
                      {service.serviceableAreas && service.serviceableAreas.length > 2 ? ' & more' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
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

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-8">
            {/* Service Description Section */}
            <Card>
              <CardHeader>
                <CardTitle>About this service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="whitespace-pre-line mb-4">
                    {service.description || "No description provided."}
                  </p>
                </div>

                <Tabs defaultValue="included">
                  <TabsList className="mb-2">
                    <TabsTrigger value="included">What's Included</TabsTrigger>
                    <TabsTrigger value="not-included">What's Not Included</TabsTrigger>
                  </TabsList>
                  <TabsContent value="included" className="space-y-2">
                    <ul className="space-y-1">
                      {service.whatsIncluded?.map((item, index) => (
                        <li key={`included-${index}`} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="not-included" className="space-y-2">
                    <ul className="space-y-1">
                      {service.whatsNotIncluded?.map((item, index) => (
                        <li key={`not-included-${index}`} className="flex items-start">
                          <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Provider Information Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Service Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.providerImage || ""} />
                    <AvatarFallback>
                      {service.providerName ? service.providerName.substring(0, 2).toUpperCase() : "SP"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{service.providerName}</h3>
                      <Badge variant="outline" className="ml-2 text-xs px-2 py-0 bg-blue-50 text-blue-700 border-blue-200">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1 mb-2">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm">{service.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({service.reviewCount} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.providerBio}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2 text-sm">Other services by this provider</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {relatedServices.slice(0, 2).map((relatedService) => (
                      <Link 
                        key={relatedService.id} 
                        to={`/services/${relatedService.id}`}
                        className="block group"
                      >
                        <div className="aspect-video rounded-md overflow-hidden bg-muted">
                          <img 
                            src={relatedService.images[0]} 
                            alt={relatedService.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="mt-1">
                          <h5 className="text-sm font-medium group-hover:text-primary truncate">{relatedService.title}</h5>
                          <p className="text-xs text-muted-foreground">₹{relatedService.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Provider
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ratings & Reviews Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{service.rating}</span>
                      <span className="text-lg text-muted-foreground ml-2">out of 5</span>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`h-5 w-5 ${star <= Math.floor(service.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{service.reviewCount} total reviews</p>
                  </div>
                  <div className="space-y-1.5">
                    {ratingDistribution.map((item) => (
                      <div key={item.rating} className="flex items-center gap-2">
                        <div className="flex items-center w-12">
                          <span className="mr-1">{item.rating}</span>
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Customer Reviews</h3>
                    <Button variant="outline" size="sm">
                      Write a Review
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.userImage || ""} />
                            <AvatarFallback>{review.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{review.userName}</h4>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex mt-1 mb-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={`review-${review.id}-star-${star}`} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {service.reviewCount > reviews.length && (
                    <div className="flex justify-center mt-4">
                      <Button variant="outline">View All Reviews</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Location / Coverage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Service Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-md p-4 mb-4">
                  <h4 className="font-medium mb-2">Serviceable Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.serviceableAreas?.map((area, index) => (
                      <Badge key={`area-${index}`} variant="outline" className="bg-muted-foreground/10">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This provider offers on-site services in the locations listed above. Please confirm your location during booking.
                </p>
              </CardContent>
            </Card>

            {/* FAQs Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Policies Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Cancellation Policy</h4>
                  <p className="text-sm text-muted-foreground">{service.cancellationPolicy}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Refund Policy</h4>
                  <p className="text-sm text-muted-foreground">{service.refundPolicy}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="hidden md:block">
            {/* This is intentionally left empty as the booking card is sticky at the top */}
          </div>
        </div>

        {/* Related Services Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Similar Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedServices.map((relatedService) => (
              <Link 
                key={relatedService.id}
                to={`/services/${relatedService.id}`} 
                className="block group"
              >
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
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
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-secondary/80 backdrop-blur-sm">{relatedService.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold truncate group-hover:text-primary">{relatedService.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-medium">₹{relatedService.price}</p>
                      <div className="flex items-center text-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{relatedService.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{relatedService.duration} hr</span>
                      <span className="mx-1">•</span>
                      <span className="truncate">{relatedService.providerName}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 mb-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Ready to book this service?</h3>
          <p className="text-muted-foreground mb-4">Professional service with satisfaction guarantee</p>
          <Button asChild size="lg" className="px-8">
            <Link to={`/services/${service.id}/booking`}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
