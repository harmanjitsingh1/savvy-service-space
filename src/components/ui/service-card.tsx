
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Link } from "react-router-dom"
import { Service } from "@/types"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  service: Service
  className?: string
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  // Ensure we have a valid service ID to navigate to
  if (!service || !service.id) {
    console.error("Invalid service data", service);
    return null;
  }

  return (
    <Link to={`/services/${service.id}`} className="block">
      <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img 
            src={service.images?.[0] || "/placeholder.svg"} 
            alt={service.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <Badge className="absolute top-2 right-2">
            ₹{service.price}/hr
          </Badge>
        </div>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-secondary text-secondary-foreground">
              {service.category}
            </Badge>
            {service.rating > 0 && (
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{service.rating}</span>
                <span className="text-muted-foreground ml-1">({service.reviewCount})</span>
              </div>
            )}
          </div>
          <CardTitle className="text-lg mt-2">{service.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {service.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-7 w-7 mr-2">
              <AvatarImage src={service.providerImage || "/placeholder.svg"} />
              <AvatarFallback>{service.providerName ? service.providerName.substring(0, 2) : "NA"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{service.providerName}</span>
          </div>
          <span className="text-sm text-muted-foreground">{service.location}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
