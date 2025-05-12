
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formatPath = (path: string) => {
  return path
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function PageBreadcrumb() {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  
  // Fetch service details if on a service detail page
  const { data: service } = useQuery({
    queryKey: ['service-breadcrumb', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('provider_services')
        .select('title')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching service title:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!id && location.pathname.includes('/services/'),
  });
  
  // Create path parts for the breadcrumb
  const pathParts = location.pathname.split('/').filter(p => p);

  if (pathParts.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link to="/" className="flex items-center">
            <Home className="h-4 w-4" />
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      
      {pathParts.map((part, index) => {
        // Create the path up to this part
        const path = `/${pathParts.slice(0, index + 1).join('/')}`;
        
        // Generate display text
        let displayText = part;
        
        // If this is the service ID and we have service data, use the title
        if (part === id && service?.title) {
          displayText = service.title;
        } 
        // If it's a provider ID, we could fetch provider name here
        else if (path.includes('/provider/') && part.length > 10) {
          displayText = "Provider";
        }
        // For other parts, format them nicely
        else if (!part.includes('-')) {
          displayText = formatPath(part);
        }
        
        return (
          <React.Fragment key={path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === pathParts.length - 1 ? (
                <span className="font-medium truncate max-w-[200px]">{displayText}</span>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={path}>{displayText}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
    </Breadcrumb>
  );
}
