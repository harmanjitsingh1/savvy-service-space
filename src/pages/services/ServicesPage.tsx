
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, Star, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/services/mockData";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const initialSearchTerm = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || null;
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const initialMinRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
  const initialAvailableOnly = searchParams.get("availableOnly") === "true";
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice || 0, initialMaxPrice || 5000]);
  const [minRating, setMinRating] = useState<number | undefined>(initialMinRating);
  const [availableOnly, setAvailableOnly] = useState<boolean>(initialAvailableOnly);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasAnyServices, setHasAnyServices] = useState(false);
  
  // Check if there are any services at all in the database
  useEffect(() => {
    async function checkForServices() {
      try {
        const { count, error } = await supabase
          .from('provider_services')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking for services:', error);
          return;
        }
        
        console.log(`Total services in database: ${count}`);
        setHasAnyServices(count > 0);
        setIsDataLoading(false);
      } catch (err) {
        console.error('Error in service check:', err);
        setIsDataLoading(false);
      }
    }
    
    checkForServices();
  }, []);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('provider_services')
          .select('category')
          .order('category');
        
        if (error) {
          console.error('Error fetching categories:', error);
          // Use mock categories instead
          const mockCategories = CATEGORIES.map(cat => cat.name);
          setCategories(mockCategories);
          return;
        }
        
        if (data && data.length > 0) {
          // Extract unique categories
          const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
          console.log("Fetched categories:", uniqueCategories);
          setCategories(uniqueCategories);
        } else {
          // Use mock categories if none found in database
          const mockCategories = CATEGORIES.map(cat => cat.name);
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error('Error in category fetch operation:', error);
        // Use mock categories on error
        const mockCategories = CATEGORIES.map(cat => cat.name);
        setCategories(mockCategories);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    if (minRating !== undefined) params.set("minRating", minRating.toString());
    if (availableOnly) params.set("availableOnly", "true");
    
    // Only update if params have changed to avoid unnecessary history entries
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice, minRating, availableOnly]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // The search will be applied through the searchTerm state
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setMinPrice(values[0]);
    setMaxPrice(values[1]);
  };

  const handleRatingChange = (rating: string) => {
    setMinRating(rating === "any" ? undefined : Number(rating));
  };

  const toggleAvailabilityFilter = (checked: boolean) => {
    setAvailableOnly(checked);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPriceRange([0, 5000]);
    setMinRating(undefined);
    setAvailableOnly(false);
    setSearchParams(new URLSearchParams());
  };

  const renderFilters = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Categories</CardTitle>
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-0">
          {isLoadingCategories ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === selectedCategory ? "secondary" : "ghost"}
                    className="w-full justify-start h-8 text-sm px-3"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No categories available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider 
              defaultValue={[0, 5000]} 
              min={0} 
              max={5000} 
              step={100}
              value={priceRange}
              onValueChange={handlePriceChange}
            />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs">Min: ₹{priceRange[0]}</Label>
              </div>
              <div>
                <Label className="text-xs">Max: ₹{priceRange[1]}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={minRating?.toString() || "any"} 
            onValueChange={handleRatingChange}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any rating</SelectItem>
              <SelectItem value="5">5 stars <Star className="inline h-3 w-3 ml-1 text-yellow-400" /></SelectItem>
              <SelectItem value="4">4+ stars <Star className="inline h-3 w-3 ml-1 text-yellow-400" /></SelectItem>
              <SelectItem value="3">3+ stars <Star className="inline h-3 w-3 ml-1 text-yellow-400" /></SelectItem>
              <SelectItem value="2">2+ stars <Star className="inline h-3 w-3 ml-1 text-yellow-400" /></SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="availableOnly" 
              checked={availableOnly}
              onCheckedChange={toggleAvailabilityFilter}
            />
            <Label htmlFor="availableOnly" className="text-sm">Show only available services</Label>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full" 
        onClick={clearFilters}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="container py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-0">Available Services</h1>
        </div>
        
        <div className="mb-4">
          <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size={isMobile ? "sm" : "default"}>
              <Search className="h-4 w-4" />
              {!isMobile && <span className="ml-2">Search</span>}
            </Button>
            
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:w-[350px] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  {renderFilters()}
                </SheetContent>
              </Sheet>
            )}
          </form>
        </div>
        
        {isDataLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {!isMobile && (
              <div className="md:col-span-1 space-y-4">
                {renderFilters()}
              </div>
            )}
            
            <div className="md:col-span-3">
              <ServicesGrid 
                category={selectedCategory || undefined} 
                searchTerm={searchTerm}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minRating={minRating}
                availableOnly={availableOnly}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
