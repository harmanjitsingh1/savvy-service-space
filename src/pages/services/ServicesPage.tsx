
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Filter, X, Plus, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/services/mockData";

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const initialSearchTerm = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || null;
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice || 0, initialMaxPrice || 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasAnyServices, setHasAnyServices] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Check if there are any services at all in the database
  useEffect(() => {
    async function checkForServices() {
      try {
        const { count, error } = await supabase
          .from('provider_services')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking for services:', error);
          setUsingMockData(true);
          return;
        }
        
        console.log(`Total services in database: ${count}`);
        if (count === 0) {
          setUsingMockData(true);
        }
        setHasAnyServices(count > 0);
        setIsDataLoading(false);
      } catch (err) {
        console.error('Error in service check:', err);
        setUsingMockData(true);
        setIsDataLoading(false);
      }
    }
    
    checkForServices();
  }, []);
  
  // Use categories from mock data if none found in database
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
    
    // Only update if params have changed to avoid unnecessary history entries
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);
  
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPriceRange([0, 5000]);
    setSearchParams(new URLSearchParams());
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Available Services</h1>
          
          {isAuthenticated && (
            <Button 
              onClick={() => navigate("/provider/add-service")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          )}
        </div>
        
        {usingMockData && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center">
            <Info className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-800">
              Using demo data since no services were found in the database.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>
        
        {isDataLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Categories</CardTitle>
                    {selectedCategory && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingCategories ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <Button
                            key={category}
                            variant={category === selectedCategory ? "secondary" : "ghost"}
                            className="w-full justify-start"
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
              
              {showFilters && (
                <Card>
                  <CardHeader>
                    <CardTitle>Price Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
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
                          <Label>Min: ₹{priceRange[0]}</Label>
                        </div>
                        <div>
                          <Label>Max: ₹{priceRange[1]}</Label>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={clearFilters}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="md:col-span-3">
              <ServicesGrid 
                category={selectedCategory || undefined} 
                searchTerm={searchTerm}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
