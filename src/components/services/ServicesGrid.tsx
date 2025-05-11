
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "@/components/ui/service-card";
import { Service } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServicesGridProps {
  providerId?: string;
  category?: string;
  limit?: number;
  showEmpty?: boolean;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableOnly?: boolean;
}

export function ServicesGrid({ 
  providerId, 
  category, 
  limit, 
  showEmpty = true, 
  searchTerm,
  minPrice,
  maxPrice,
  minRating,
  availableOnly
}: ServicesGridProps) {
  const isMobile = useIsMobile();
  
  console.log("ServicesGrid rendering with filters:", { 
    providerId, category, searchTerm, minPrice, maxPrice, minRating, availableOnly 
  });

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', providerId, category, limit, searchTerm, minPrice, maxPrice, minRating, availableOnly],
    queryFn: async () => {
      console.log("Fetching services with params:", { 
        providerId, category, searchTerm, minPrice, maxPrice, minRating, availableOnly, limit 
      });
      
      try {
        // Check if the provider_services table exists and has data
        const { count, error: checkError } = await supabase
          .from('provider_services')
          .select('*', { count: 'exact', head: true });
        
        if (checkError) {
          console.error('Error checking provider_services table:', checkError);
          toast.error("Error checking services table");
          throw checkError;
        }
        
        console.log(`Total services in database: ${count}`);
        
        // Query the provider_services table
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
          console.log("No services found in database");
          return [];
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

        // Apply rating and availability filters on the client side 
        // (since we don't have these in database yet)
        let filteredServices = formattedServices;
        
        if (minRating !== undefined && minRating > 0) {
          filteredServices = filteredServices.filter(service => service.rating >= minRating);
        }
        
        if (availableOnly) {
          filteredServices = filteredServices.filter(service => service.available);
        }

        console.log("Formatted and filtered services:", filteredServices);
        return filteredServices;
      } catch (err) {
        console.error("Unexpected error in service fetch:", err);
        toast.error("Failed to load services data");
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry failed requests 2 times
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading services...</span>
      </div>
    );
  }

  if (error) {
    console.error("Error loading services:", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading services. Please try again.</p>
        <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    if (!showEmpty) return null;
    
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
