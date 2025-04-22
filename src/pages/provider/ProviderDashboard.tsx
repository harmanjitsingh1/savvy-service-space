
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart2, HandCoins, List, Calendar, Users, Clock } from "lucide-react";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["providerStats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch services count
      const { data: services, error: servicesError } = await supabase
        .from("provider_services")
        .select("*", { count: "exact" })
        .eq("provider_id", user.id);
        
      if (servicesError) console.error("Error fetching services:", servicesError);
      
      // Fetch bookings count
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*", { count: "exact" })
        .eq("provider_id", user.id);
        
      if (bookingsError) console.error("Error fetching bookings:", bookingsError);
      
      // Fetch earnings total
      const { data: earnings, error: earningsError } = await supabase
        .from("provider_earnings")
        .select("amount")
        .eq("provider_id", user.id);
        
      if (earningsError) console.error("Error fetching earnings:", earningsError);
      
      const totalEarnings = earnings?.reduce(
        (sum, earning) => sum + (earning.amount || 0),
        0
      ) || 0;
      
      return {
        servicesCount: services?.length || 0,
        bookingsCount: bookings?.length || 0,
        totalEarnings,
      };
    },
    enabled: !!user,
  });
  
  // Example data for charts
  const lastWeekData = [
    { name: "Mon", bookings: 4, revenue: 120 },
    { name: "Tue", bookings: 3, revenue: 90 },
    { name: "Wed", bookings: 5, revenue: 150 },
    { name: "Thu", bookings: 2, revenue: 60 },
    { name: "Fri", bookings: 6, revenue: 180 },
    { name: "Sat", bookings: 8, revenue: 240 },
    { name: "Sun", bookings: 7, revenue: 210 },
  ];
  
  // Recent bookings data
  const recentBookings = [
    { id: 1, service: "Lawn Mowing", user: "John Doe", status: "confirmed", date: "2023-06-01" },
    { id: 2, service: "House Cleaning", user: "Jane Smith", status: "pending", date: "2023-06-03" },
    { id: 3, service: "Plumbing", user: "Mike Johnson", status: "completed", date: "2023-05-28" },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
          <div className="flex gap-2">
            <div className="bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 px-3 py-1 rounded-md text-brand-700 dark:text-brand-300 text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> 
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <List className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.servicesCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active service listings
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <BarChart2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.bookingsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time bookings
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <HandCoins className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${stats?.totalEarnings.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time revenue
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Happy Clients</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                24
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Satisfied customers
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 pb-2 border-b border-brand-100 dark:border-slate-800">
              <CardTitle className="text-gray-900 dark:text-gray-100">Weekly Bookings</CardTitle>
              <CardDescription>
                Number of bookings over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lastWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 pb-2 border-b border-brand-100 dark:border-slate-800">
              <CardTitle className="text-gray-900 dark:text-gray-100">Weekly Revenue</CardTitle>
              <CardDescription>
                Revenue generated over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#8B5CF6' }}
                    activeDot={{ r: 6, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 pb-2 border-b border-brand-100 dark:border-slate-800">
            <CardTitle className="text-gray-900 dark:text-gray-100">Recent Booking Activity</CardTitle>
            <CardDescription>
              Your most recent service bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b border-brand-100 dark:border-slate-800 pb-4 last:border-0">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{booking.service}</p>
                      <p className="text-sm text-muted-foreground">
                        Booked by {booking.user} · {new Date(booking.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
}
