
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch unique categories from actual services data
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('provider_services')
        .select('category')
        .order('category');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      if (data) {
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be applied through the searchTerm state
    console.log("Searching for:", searchTerm);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <ServicesGrid 
              category={selectedCategory || undefined} 
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
