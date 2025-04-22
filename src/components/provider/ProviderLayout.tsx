
import React, { ReactNode } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  List, 
  Plus, 
  Inbox, 
  BarChart2, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar className="border-r border-r-brand-100 dark:border-r-slate-800 bg-white dark:bg-slate-950">
          <SidebarHeader className="border-b border-brand-100 dark:border-slate-800 p-4">
            <div className="flex items-center space-x-2 px-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="font-bold text-white">PS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">Provider Portal</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarMenu>
              <div className="px-3 py-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Dashboard</h3>
              </div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="px-3 py-2 mt-4">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Services</h3>
              </div>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/services" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <List className="h-5 w-5" />
                    <span>My Services</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/add" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Service</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="px-3 py-2 mt-4">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Business</h3>
              </div>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/bookings" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Inbox className="h-5 w-5" />
                    <div className="flex items-center justify-between w-full">
                      <span>Booking Requests</span>
                      <Badge className="bg-brand-500 text-white ml-2 text-xs">3</Badge>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/earnings" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <BarChart2 className="h-5 w-5" />
                    <span>Earnings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/messages" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="px-3 py-2 mt-4">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Account</h3>
              </div>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/profile" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/provider/settings" 
                    className={({isActive}) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-brand-100 dark:border-slate-800 p-4 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="border-2 border-brand-200 dark:border-brand-800">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {user?.name ? getInitials(user.name) : "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || "Provider"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1">
          <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center">
                <SidebarTrigger className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </SidebarTrigger>
                <div className="ml-4 text-lg font-medium">Welcome, {user?.name?.split(' ')[0] || 'Provider'}</div>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-500 text-xs text-white flex items-center justify-center">
                        3
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        <div className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 p-3 cursor-pointer transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium">New booking request</p>
                              <p className="text-xs text-muted-foreground mt-1">John D. requested lawn mowing service</p>
                              <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 p-3 cursor-pointer transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium">New message from client</p>
                              <p className="text-xs text-muted-foreground mt-1">Sarah M. sent you a message about your services</p>
                              <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 p-3 cursor-pointer transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium">Payment received</p>
                              <p className="text-xs text-muted-foreground mt-1">You received $120 for house cleaning service</p>
                              <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                      <Button variant="ghost" size="sm" className="w-full text-sm text-brand-600 dark:text-brand-400">View all notifications</Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          <main className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
