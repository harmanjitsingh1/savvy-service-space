import React, { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  List,
  Calendar,
  IndianRupee,
  MessageSquare,
  User,
  Settings,
} from "lucide-react";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation();
  const currentRoute = location.pathname;
  
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 py-4">
        <div className="container flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">
            Service Marketplace
          </Link>
          <nav>
            {/* Add any global navigation items here if needed */}
          </nav>
        </div>
      </header>
      
      <div className="flex-1 container py-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-medium text-lg mb-4">Provider Portal</h3>
          <nav className="space-y-1">
            <Link 
              to="/provider" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider') && !currentRoute.includes('/provider/') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/provider/services" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider/services') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <List className="h-4 w-4" />
              <span>My Services</span>
            </Link>
            
            <Link 
              to="/provider/bookings" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider/bookings') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Booking Requests</span>
            </Link>
            
            <Link 
              to="/provider/earnings" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider/earnings') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <IndianRupee className="h-4 w-4" />
              <span>Earnings</span>
            </Link>
            
            <Link 
              to="/provider/messages" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider/messages') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </Link>
            
            <Link 
              to="/provider/profile" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider/profile') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Link 
              to="/provider/settings" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isActive('/provider/settings') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
        
        <main className="md:col-span-4">
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
