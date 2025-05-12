
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function ServiceCard({ service, className, showProvider = true }: ServiceCardProps) {
  // Use the first image or a placeholder
  const mainImage = service.images && service.images.length > 0 
    ? service.images[0] 
    : "/placeholder.svg";
    
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col cursor-pointer transition-all hover:shadow-md", className)}>
      <Link to={`/services/${service.id}`} className="block h-full">
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
      
        <CardHeader className="px-2 py-2">
          <div className="flex justify-between items-start gap-1">
            <CardTitle className="line-clamp-2 text-xs sm:text-sm">
              {service.title}
            </CardTitle>
            <Badge variant="outline" className="bg-secondary/50 whitespace-nowrap text-[0.65rem] px-1">
              {service.category}
            </Badge>
          </div>
          
          {service.rating > 0 && (
            <div className="flex items-center mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-xs">{service.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({service.reviewCount})
              </span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="px-2 py-1 pb-2 flex-grow">
          <div className="flex justify-between items-center mt-auto">
            <p className="font-semibold text-xs sm:text-sm">₹{service.price}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{service.duration} hr</span>
            </div>
          </div>
          
          {showProvider && (
            <div className="flex items-center mt-2">
              <Avatar className="h-4 w-4 mr-1">
                <AvatarImage src={service.providerImage || ""} />
                <AvatarFallback className="text-[0.5rem]">
                  {service.providerName ? service.providerName.substring(0, 2) : "P"}
                </AvatarFallback>
              </Avatar>
              <span className="text-[0.65rem] text-muted-foreground truncate">
                {service.providerName}
              </span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
