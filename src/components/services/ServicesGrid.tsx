
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "@/components/ui/service-card";
import { Service } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SERVICES } from "@/services/mockData";

interface ServicesGridProps {
  providerId?: string;
  category?: string;
  limit?: number;
  showEmpty?: boolean;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function ServicesGrid({ 
  providerId, 
  category, 
  limit, 
  showEmpty = true, 
  searchTerm,
  minPrice,
  maxPrice 
}: ServicesGridProps) {
  const [hasDataChecked, setHasDataChecked] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // First, let's manually check if there's any data in the provider_services table
  useEffect(() => {
    async function checkForData() {
      try {
        const { count, error } = await supabase
          .from('provider_services')
          .select('*', { count: 'exact', head: true });
        
        console.log("Database check - Total records in provider_services:", count);
        
        if (error) {
          console.error("Error checking provider_services table:", error);
          setUseMockData(true);
        }

        // If there's no data at all, use mock data instead
        if (count === 0) {
          console.log("No records found in provider_services table. Using mock data instead.");
          setUseMockData(true);
        }
        
        setHasDataChecked(true);
      } catch (err) {
        console.error("Error in data check:", err);
        setUseMockData(true);
        setHasDataChecked(true);
      }
    }
    
    checkForData();
  }, []);

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', providerId, category, limit, searchTerm, minPrice, maxPrice, hasDataChecked, useMockData],
    queryFn: async () => {
      // If using mock data, filter the mock services
      if (useMockData) {
        console.log("Using mock data for services");
        
        let mockServices = [...SERVICES];
        
        // Apply filters to mock data
        if (providerId) {
          mockServices = mockServices.filter(service => service.providerId === providerId);
        }
        
        if (category) {
          mockServices = mockServices.filter(service => service.category === category);
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          mockServices = mockServices.filter(service => 
            service.title.toLowerCase().includes(searchLower) || 
            service.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (minPrice !== undefined) {
          mockServices = mockServices.filter(service => service.price >= minPrice);
        }
        
        if (maxPrice !== undefined) {
          mockServices = mockServices.filter(service => service.price <= maxPrice);
        }
        
        // Apply limit if provided
        if (limit) {
          mockServices = mockServices.slice(0, limit);
        }
        
        console.log("Filtered mock services:", mockServices);
        return mockServices;
      }
      
      console.log("Fetching services with params:", { providerId, category, searchTerm, minPrice, maxPrice, limit });
      
      // Add more detailed logging for debugging
      console.log("Supabase client status:", supabase ? "initialized" : "not initialized");
      
      try {
        let query = supabase
          .from('provider_services')
          .select(`
            id,
            title,
            description,
            price,
            category,
            duration,
            images,
            provider_id,
            created_at
          `);

        // Apply filters if provided
        if (providerId) {
          query = query.eq('provider_id', providerId);
        }

        if (category) {
          query = query.eq('category', category);
        }

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }
        
        if (minPrice !== undefined) {
          query = query.gte('price', minPrice);
        }
        
        if (maxPrice !== undefined) {
          query = query.lte('price', maxPrice);
        }

        // Order by latest first
        query = query.order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        console.log("Executing Supabase query...");
        const { data: servicesData, error } = await query;
        
        // Log the raw response for debugging
        console.log("Raw Supabase response:", { servicesData, error });
        
        if (error) {
          console.error('Error fetching services:', error);
          toast.error("Failed to load services");
          throw error;
        }
        
        console.log("Services data from DB:", servicesData);
        
        // If no services found, return empty array
        if (!servicesData || servicesData.length === 0) {
          console.log("No services found in database, falling back to mock data");
          return useMockData ? filterMockServices() : [];
        }

        // Fetch provider profiles separately
        const providerIds = [...new Set(servicesData.map(service => service.provider_id))];
        
        let providerProfiles: Record<string, { name: string, image?: string }> = {};
        
        if (providerIds.length > 0) {
          console.log("Fetching provider profiles for IDs:", providerIds);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, image')
            .in('id', providerIds);
            
          if (profilesError) {
            console.error('Error fetching provider profiles:', profilesError);
            toast.error("Could not load provider details");
          } else if (profiles) {
            console.log("Provider profiles fetched:", profiles);
            // Create a map of provider_id to provider profile
            providerProfiles = profiles.reduce((acc, profile) => {
              acc[profile.id] = { name: profile.name || 'Provider', image: profile.image };
              return acc;
            }, {} as Record<string, { name: string, image?: string }>);
          }
        }

        // Transform the data to match the Service type
        const formattedServices: Service[] = servicesData.map(service => {
          const providerProfile = providerProfiles[service.provider_id] || { name: 'Provider', image: undefined };
          
          return {
            id: service.id,
            title: service.title,
            description: service.description || '',
            price: Number(service.price),
            category: service.category,
            providerId: service.provider_id,
            providerName: providerProfile.name,
            providerImage: providerProfile.image,
            images: service.images || [],
            rating: 0, // Default rating since we don't have reviews yet
            reviewCount: 0, // Default review count
            location: 'Local Area', // Default location
            duration: service.duration,
            available: true,
            createdAt: service.created_at
          };
        });

        console.log("Formatted services:", formattedServices);
        return formattedServices;
      } catch (err) {
        console.error("Unexpected error in service fetch:", err);
        toast.error("Failed to load services data");
        
        if (useMockData) {
          console.log("Falling back to mock data due to error");
          return filterMockServices();
        }
        
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: hasDataChecked, // Only run query after we've checked the database
    retry: 2, // Retry failed requests 2 times
  });
  
  // Helper function to filter mock services based on current filters
  const filterMockServices = () => {
    let filteredServices = [...SERVICES];
    
    if (providerId) {
      filteredServices = filteredServices.filter(s => s.providerId === providerId);
    }
    
    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredServices = filteredServices.filter(s => 
        s.title.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term)
      );
    }
    
    if (minPrice !== undefined) {
      filteredServices = filteredServices.filter(s => s.price >= minPrice);
    }
    
    if (maxPrice !== undefined) {
      filteredServices = filteredServices.filter(s => s.price <= maxPrice);
    }
    
    if (limit) {
      filteredServices = filteredServices.slice(0, limit);
    }
    
    return filteredServices;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
  }

  if (error && !useMockData) {
    console.error("Error loading services:", error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading services. Please try again.</p>
        <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    if (!showEmpty) return null;
    
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-medium">No services found</h3>
        <p className="text-muted-foreground mt-2">
          {providerId 
            ? "This provider hasn't listed any services yet." 
            : searchTerm 
              ? "No services match your search criteria." 
              : category 
                ? `No services found in the ${category} category.`
                : "No services available at the moment. Please check back later."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
