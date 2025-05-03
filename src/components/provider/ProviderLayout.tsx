
import React, { ReactNode, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  List,
  Calendar,
  IndianRupee,
  MessageSquare,
  User,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation();
  const currentRoute = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Function to check if a route is active
  const isActive = (path: string) => {
    if (path === '/provider' && currentRoute === '/provider') {
      return true;
    }
    if (path !== '/provider' && currentRoute.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  const navLinks = [
    { path: '/provider', name: 'Dashboard', icon: Home },
    { path: '/provider/services', name: 'My Services', icon: List },
    { path: '/provider/bookings', name: 'Booking Requests', icon: Calendar },
    { path: '/provider/earnings', name: 'Earnings', icon: IndianRupee },
    { path: '/provider/messages', name: 'Messages', icon: MessageSquare },
    { path: '/provider/profile', name: 'Profile', icon: User },
    { path: '/provider/settings', name: 'Settings', icon: Settings }
  ];

  const NavLinks = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isActive(link.path) 
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent/50'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <link.icon className="h-4 w-4" />
          <span>{link.name}</span>
        </Link>
      ))}
    </>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 py-4 sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg">Provider Portal</h2>
                      <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    <NavLinks />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-bold text-xl">
              Service Marketplace
            </Link>
          </div>
          <nav className="hidden md:block">
            {/* Add any global navigation items here if needed */}
          </nav>
        </div>
      </header>
      
      <div className="flex-1 container py-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="hidden md:block md:col-span-1 space-y-4">
          <h3 className="font-medium text-lg mb-4">Provider Portal</h3>
          <nav className="space-y-1">
            <NavLinks />
          </nav>
        </div>
        
        <main className="md:col-span-4 col-span-1">
          {children}
        </main>
      </div>
      
      <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Service Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
