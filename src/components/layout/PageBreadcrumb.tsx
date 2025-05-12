
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageBreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  const location = useLocation();
  
  // If no items provided, generate from current path
  const breadcrumbItems = items || generateBreadcrumbItems(location.pathname);
  
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
function generateBreadcrumbItems(path: string): BreadcrumbItem[] {
  // Skip empty segments and "home"
  const segments = path.split('/').filter(segment => segment && segment !== 'home');
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Build up breadcrumb items with paths
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
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
