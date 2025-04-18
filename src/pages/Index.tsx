
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/ui/service-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES, SERVICES } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, CheckCircle, Star, Zap, ShieldCheck } from "lucide-react";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const featuredServices = SERVICES.filter(service => service.featured).slice(0, 3);
  const popularServices = [...SERVICES]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-brand-700 to-brand-500 text-white">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container relative z-10 py-20 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Find Trusted Service Professionals Near You</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl text-white/90">
            Book top-rated service providers for all your home and personal needs, all in one place.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-lg relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="What service do you need?"
              className="w-full pl-10 pr-32 h-12 bg-white/95 text-foreground border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
            >
              Search
            </Button>
          </form>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <p className="text-sm text-white/90 mr-2">Popular:</p>
            {CATEGORIES.slice(0, 5).map(category => (
              <Link key={category.id} to={`/services?category=${encodeURIComponent(category.name)}`}>
                <Badge variant="secondary" className="hover:bg-white hover:text-primary transition-colors">
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20 bg-secondary/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Popular Service Categories</h2>
              <p className="text-muted-foreground mt-2">Browse our most requested service categories</p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0" onClick={() => navigate("/services")}>
              View all categories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {CATEGORIES.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                to={`/services?category=${encodeURIComponent(category.name)}`}
                className="group bg-background rounded-lg p-6 border hover:border-primary hover:shadow-md transition-all text-center flex flex-col items-center"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary group-hover:text-primary text-xl font-semibold">{category.icon.charAt(0)}</span>
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Services</h2>
              <p className="text-muted-foreground mt-2">Top-rated services in your area</p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0" onClick={() => navigate("/services")}>
              View all services <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">How ServeBay Works</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Book your service in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">1. Find a Service</h3>
              <p className="text-muted-foreground">
                Search or browse through our wide range of professional services in your area.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">2. Book Instantly</h3>
              <p className="text-muted-foreground">
                Select your preferred date and time, and book your service instantly.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">3. Enjoy & Review</h3>
              <p className="text-muted-foreground">
                Receive quality service from verified professionals, then share your experience.
              </p>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Button size="lg" onClick={() => navigate("/services")}>
              Explore Services
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="ml-4" onClick={() => navigate("/register")}>
                Join Now
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Popular Services</h2>
              <p className="text-muted-foreground mt-2">Highest-rated services by our customers</p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0" onClick={() => navigate("/services")}>
              View all services <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-20 bg-brand-700 text-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Why Choose ServeBay</h2>
            <p className="text-white/80 mt-2 max-w-2xl mx-auto">
              We're committed to providing you with the best service experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2">Trusted Professionals</h3>
              <p className="text-white/80">
                All our service providers are verified, background-checked, and reviewed by customers.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2">Quick & Convenient</h3>
              <p className="text-white/80">
                Book services with just a few clicks, choose your time, and get instant confirmation.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2">Satisfaction Guaranteed</h3>
              <p className="text-white/80">
                We stand behind the quality of our services with customer satisfaction guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of satisfied customers who use ServeBay every day to find trusted service professionals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/services")}>
                Find a Service
              </Button>
              {!isAuthenticated ? (
                <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                  Create an Account
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={() => navigate("/become-provider")}>
                  Become a Provider
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
