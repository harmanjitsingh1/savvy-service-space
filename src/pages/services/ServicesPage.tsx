import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ServiceCard } from "@/components/ui/service-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { CATEGORIES, SERVICES, filterServices } from "@/services/mockData";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Service } from "@/types";

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Apply filters and update results
  useEffect(() => {
    const params: any = {};
    if (searchQuery) params.searchTerm = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (location) params.location = location;
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 200) params.maxPrice = priceRange[1];
    if (minRating > 0) params.minRating = minRating;

    // Get filtered results
    let results = filterServices(params);

    // Apply sorting
    switch (sortBy) {
      case "price_low":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      // For 'relevance', keep the default order
    }

    setFilteredServices(results);
  }, [searchQuery, selectedCategory, location, priceRange, minRating, sortBy]);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The searchQuery state and effect will handle the filtering
  };

  // Reset all filters
  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setLocation("");
    setPriceRange([0, 200]);
    setMinRating(0);
    setSortBy("relevance");
    setSearchParams({});
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Filters sidebar for desktop */}
          <aside className={`md:block ${isFilterOpen ? 'block' : 'hidden'} w-full md:w-64 shrink-0 bg-background p-4 rounded-lg border`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </h2>
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs">
                Reset all
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsFilterOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category filter */}
              <div>
                <Label className="mb-2 block">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location filter */}
              <div>
                <Label htmlFor="location" className="mb-2 block">Location</Label>
                <Input
                  id="location"
                  placeholder="Any location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Price range filter */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Price Range ($/hr)</Label>
                  <span className="text-sm text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 200]}
                  max={200}
                  step={5}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="my-6"
                />
              </div>

              {/* Rating filter */}
              <div>
                <Label className="mb-2 block">Minimum Rating</Label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={minRating === rating}
                        onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                      />
                      <Label htmlFor={`rating-${rating}`} className="ml-2 cursor-pointer">
                        {rating}+ stars
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Search and sort header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search services..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="md:hidden flex-1"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Active filters */}
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedCategory("")}
                  >
                    {selectedCategory} <X className="h-3 w-3 ml-1" />
                  </Button>
                )}
                {location && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setLocation("")}
                  >
                    {location} <X className="h-3 w-3 ml-1" />
                  </Button>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 200) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setPriceRange([0, 200])}
                  >
                    ${priceRange[0]}-${priceRange[1]} <X className="h-3 w-3 ml-1" />
                  </Button>
                )}
                {minRating > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMinRating(0)}
                  >
                    {minRating}+ stars <X className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search results */}
            {filteredServices.length > 0 ? (
              <div>
                <p className="text-muted-foreground mb-4">
                  Showing {filteredServices.length} services
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={handleReset}>Clear filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
