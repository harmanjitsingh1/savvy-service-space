
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Search, Bell, MessageSquare, User, LogOut, ChevronDown } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { SERVICES } from "@/services/mockData";
import { useOnClickOutside } from "@/hooks/use-click-outside";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useOnClickOutside(searchRef, () => {
    setShowSearchResults(false);
  });

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filteredResults = SERVICES.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleSearchResultClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleClickOutside = () => {
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-700">
              ServeBay
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 ml-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Services
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center px-2 max-w-md">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for services..."
              className="w-full pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleClickOutside}
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-50">
                {searchResults.map((service) => (
                  <div 
                    key={service.id}
                    className="p-2 hover:bg-muted cursor-pointer flex items-center"
                    onClick={() => handleSearchResultClick(service.id)}
                  >
                    <div className="h-10 w-10 mr-3 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={service.images?.[0] || "/placeholder.svg"} 
                        alt="" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{service.title}</div>
                      <div className="text-xs text-muted-foreground">{service.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-2">
          {isAuthenticated && user ? (
            <>
              <IconButton 
                variant="ghost" 
                size="icon"
                icon={<Bell className="h-5 w-5" />}
                aria-label="Notifications"
              />
              <IconButton 
                variant="ghost" 
                size="icon"
                icon={<MessageSquare className="h-5 w-5" />}
                aria-label="Messages"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  {user.role === "user" && (
                    <DropdownMenuItem onClick={() => navigate("/become-provider")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Become a Provider</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button onClick={() => navigate("/register")}>Sign up</Button>
            </>
          )}
        </div>
      </div>
      <div className="md:hidden container pb-2">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for services..."
            className="w-full pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-50">
              {searchResults.map((service) => (
                <div 
                  key={service.id}
                  className="p-2 hover:bg-muted cursor-pointer flex items-center"
                  onClick={() => handleSearchResultClick(service.id)}
                >
                  <div className="h-10 w-10 mr-3 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={service.images?.[0] || "/placeholder.svg"} 
                      alt="" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{service.title}</div>
                    <div className="text-xs text-muted-foreground">{service.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </header>
  );
}
