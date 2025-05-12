
import { useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Bell, MessageSquare, User, LogOut, ChevronDown, UserRound } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useOnClickOutside } from "@/hooks/use-click-outside";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export function Navbar() {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useOnClickOutside(searchRef, () => {
    setShowSearchResults(false);
  });

  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Services", path: "/services" },
    { title: "About", path: "/about" },
    { title: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu trigger using Sheet component */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm font-medium transition-colors hover:text-primary py-2"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-700">
              ServeBay
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 ml-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Empty div to maintain layout without search bar */}
        <div className="hidden md:flex flex-1 items-center justify-center"></div>

        <div className="flex items-center space-x-2">
          {/* Theme Switcher for desktop */}
          <ThemeSwitcher className="hidden md:flex" />
          
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
              
              {/* Add Provider Profile shortcut button */}
              {user.role === "provider" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/provider/profile")}
                  title="Provider Profile"
                  className="relative"
                >
                  <UserRound className="h-5 w-5" />
                </Button>
              )}
              
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
    </header>
  );
}
