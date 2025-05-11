
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
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
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
      
      <CardHeader className="px-4 py-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-2 text-base sm:text-lg">
            <Link to={`/services/${service.id}`} className="hover:underline">
              {service.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="bg-secondary/50 whitespace-nowrap text-xs">
            {service.category}
          </Badge>
        </div>
        
        {service.rating > 0 && (
          <div className="flex items-center mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs">{service.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({service.reviewCount} {service.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-4 py-2 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
          {service.description || 'No description provided.'}
        </p>
        
        <div className="flex justify-between items-center">
          <p className="font-semibold text-base sm:text-lg">₹{service.price}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{service.duration} hr</span>
          </div>
        </div>
        
        {showProvider && (
          <div className="flex items-center mt-3">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={service.providerImage || ""} />
              <AvatarFallback>
                {service.providerName ? service.providerName.substring(0, 2) : "P"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {service.providerName}
            </span>
          </div>
        )}
      </CardContent>
      
      {!hideBooking && (
        <CardFooter className="px-4 py-3 mt-auto">
          <Button asChild className="w-full" size="sm">
            <Link to={`/services/${service.id}/booking`}>
              Book Service
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
