
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
import { List, BarChart2, HandCoins } from "lucide-react";

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.servicesCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active service listings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.bookingsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                All-time bookings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalEarnings.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time revenue
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Bookings</CardTitle>
              <CardDescription>
                Number of bookings over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lastWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
              <CardDescription>
                Revenue generated over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Booking Activity</CardTitle>
            <CardDescription>
              Your most recent service bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{booking.service}</p>
                    <p className="text-sm text-muted-foreground">
                      Booked by {booking.user} · {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}>
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
