
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "@/components/ui/service-card";
import { Service } from "@/types";
import { Loader2 } from "lucide-react";

interface ServicesGridProps {
  providerId?: string;
  category?: string;
  limit?: number;
  showEmpty?: boolean;
  searchTerm?: string;
}

export function ServicesGrid({ providerId, category, limit, showEmpty = true, searchTerm }: ServicesGridProps) {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', providerId, category, limit, searchTerm],
    queryFn: async () => {
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
        `)
        .order('created_at', { ascending: false });

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: servicesData, error } = await query;
      
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      // Fetch provider profiles separately to avoid the relation issue
      const providerIds = [...new Set(servicesData.map(service => service.provider_id))];
      
      let providerProfiles: Record<string, { name: string, image?: string }> = {};
      
      if (providerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, image')
          .in('id', providerIds);
          
        if (profilesError) {
          console.error('Error fetching provider profiles:', profilesError);
        } else if (profiles) {
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

      return formattedServices;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading services. Please try again.</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    if (!showEmpty) return null;
    
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No services found</h3>
        <p className="text-muted-foreground mt-2">
          {providerId 
            ? "This provider hasn't listed any services yet." 
            : searchTerm 
              ? "No services match your search criteria." 
              : category 
                ? `No services found in the ${category} category.`
                : "No services available at the moment."
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
