
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Filter, X } from "lucide-react";
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
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch unique categories from actual services data
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
          toast.error('Failed to load categories');
          return;
        }
        
        if (data) {
          // Extract unique categories
          const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
          console.log("Fetched categories:", uniqueCategories);
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error in category fetch operation:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
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
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Available Services</h1>
        
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
      </div>
    </MainLayout>
  );
}
