
import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageBreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  const location = useLocation();
  const params = useParams();
  
  // Extract service ID if present
  const serviceIdMatch = location.pathname.match(/\/services\/([a-zA-Z0-9-]+)$/);
  const serviceId = serviceIdMatch ? serviceIdMatch[1] : params.id;
  
  // Fetch service name if we're on a service page
  const { data: serviceName } = useQuery({
    queryKey: ['service-name', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      
      const { data } = await supabase
        .from('provider_services')
        .select('title')
        .eq('id', serviceId)
        .single();
      
      return data?.title || 'Service Details';
    },
    enabled: !!serviceId && location.pathname.includes('/services/'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // If no items provided, generate from current path
  let breadcrumbItems = items || generateBreadcrumbItems(location.pathname, serviceName);
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={item.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.path || '#'}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper function to generate breadcrumb items from URL path
function generateBreadcrumbItems(path: string, serviceName?: string | null): BreadcrumbItem[] {
  // Skip empty segments and "home"
  const segments = path.split('/').filter(segment => segment && segment !== 'home');
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Build up breadcrumb items with paths
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // If this is a service ID and we have a service name, use the name
    if (
      segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) && 
      serviceName && 
      segments[index - 1] === 'services'
    ) {
      breadcrumbItems.push({
        label: serviceName,
        path: index < segments.length - 1 ? currentPath : undefined,
      });
      return;
    }
    
    // Convert kebab-case or snake_case to Title Case
    const label = segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      // Handle special cases for better labels
      .replace(/^Services$/, 'Services')
      .replace(/^Provider$/, 'Provider Dashboard');
    
    breadcrumbItems.push({
      label,
      path: index < segments.length - 1 ? currentPath : undefined,
    });
  });
  
  return breadcrumbItems;
}
