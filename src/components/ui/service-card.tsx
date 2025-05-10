
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";
import { Service } from "@/types";
import { Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  className?: string;
  showProvider?: boolean;
  hideBooking?: boolean;
}

export function ServiceCard({ service, className, showProvider = true, hideBooking = false }: ServiceCardProps) {
  // Use the first image or a placeholder
  const mainImage = service.images && service.images.length > 0 
    ? service.images[0] 
    : "/placeholder.svg";
    
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <Link to={`/services/${service.id}`} className="block">
        <AspectRatio ratio={16 / 9}>
          <img 
            src={mainImage} 
            alt={service.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </AspectRatio>
      </Link>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">
            <Link to={`/services/${service.id}`} className="hover:underline">
              {service.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="bg-secondary/50">
            {service.category}
          </Badge>
        </div>
        
        {service.rating > 0 && (
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm">{service.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({service.reviewCount} {service.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {service.description || 'No description provided.'}
        </p>
        
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg">₹{service.price}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {showProvider && (
          <div className="flex items-center mt-4">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={service.providerImage || ""} />
              <AvatarFallback>
                {service.providerName ? service.providerName.substring(0, 2) : "P"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {service.providerName}
            </span>
          </div>
        )}
      </CardContent>
      
      {!hideBooking && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link to={`/services/${service.id}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
